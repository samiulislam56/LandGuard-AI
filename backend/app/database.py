# ---------------------------------------------------------------------------
# LandGuard AI — Persistent Review Case & Audit Database
# Dual-Engine: SQLite (Persistent Disk / Local) & PostgreSQL (Cloud / DATABASE_URL)
# Password KDF: Argon2id (RFC 9106) via argon2-cffi
# ---------------------------------------------------------------------------
import os
import sqlite3
import logging
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, InvalidHashError

logger = logging.getLogger("landguard.database")

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

# Check persistent storage location (e.g. Render Persistent Disk mount at /data or local data dir)
PERSISTENT_DIR = Path(os.getenv("PERSISTENT_DATA_PATH") or os.getenv("RENDER_DISK_PATH") or DATA_DIR)
DB_PATH = PERSISTENT_DIR / "landguard_reviews.db"
DATABASE_URL = os.getenv("DATABASE_URL")

# Initialize Argon2id Hasher
_hasher = PasswordHasher(
    time_cost=3,
    memory_cost=65536,
    parallelism=4,
    hash_len=32,
    salt_len=16
)


def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    """Hashes password using Argon2id. Salt is embedded inside the Argon2 format."""
    hashed = _hasher.hash(password)
    # Return (hashed, "") for compatibility with existing caller signatures
    return hashed, ""


def verify_password(password: str, hashed: str, salt: Optional[str] = None) -> bool:
    """Verifies a password against an Argon2id hash with fallback for legacy hashes."""
    if not hashed:
        return False
    if hashed.startswith("$argon2"):
        try:
            return _hasher.verify(hashed, password)
        except (VerifyMismatchError, InvalidHashError):
            return False
    # Legacy salted SHA-256 fallback (for transitional databases)
    import hashlib
    import secrets
    if salt:
        expected = hashlib.sha256((salt + password).encode("utf-8")).hexdigest()
        return secrets.compare_digest(expected, hashed)
    return False


class PostgresCursorWrapper:
    """Wraps a psycopg2 cursor to translate SQLite '?' placeholders to PostgreSQL '%s'."""
    def __init__(self, raw_cursor):
        self.cursor = raw_cursor

    def execute(self, query: str, params: Any = None):
        if params is not None:
            # Replace '?' with '%s' safely
            pg_query = query.replace("?", "%s")
            return self.cursor.execute(pg_query, params)
        return self.cursor.execute(query)

    def executemany(self, query: str, seq_of_params: Any):
        pg_query = query.replace("?", "%s")
        return self.cursor.executemany(pg_query, seq_of_params)

    def fetchone(self):
        row = self.cursor.fetchone()
        return dict(row) if row is not None else None

    def fetchall(self):
        rows = self.cursor.fetchall()
        return [dict(r) for r in rows]

    @property
    def rowcount(self):
        return self.cursor.rowcount

    def close(self):
        self.cursor.close()


class PostgresConnectionWrapper:
    """Wraps a psycopg2 connection to provide a unified interface matching SQLite."""
    def __init__(self, raw_conn):
        self.conn = raw_conn

    def cursor(self):
        import psycopg2.extras
        raw_cur = self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        return PostgresCursorWrapper(raw_cur)

    def commit(self):
        self.conn.commit()

    def rollback(self):
        self.conn.rollback()

    def close(self):
        self.conn.close()


def get_db_connection():
    """Returns a unified database connection for PostgreSQL (if DATABASE_URL) or SQLite."""
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        import psycopg2
        # Render specifies postgres:// which psycopg2 prefers as postgresql://
        if db_url.startswith("postgres://"):
            db_url = "postgresql://" + db_url[len("postgres://"):]
        raw_conn = psycopg2.connect(db_url)
        return PostgresConnectionWrapper(raw_conn)

    PERSISTENT_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """
    Initializes database tables, provisions administrators via environment variables,
    and seeds synthetic baseline review cases without modifying original CSV files.
    """
    PERSISTENT_DIR.mkdir(parents=True, exist_ok=True)
    conn = get_db_connection()
    cursor = conn.cursor()
    is_postgres = bool(os.getenv("DATABASE_URL"))

    # 1. Review Cases Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS review_cases (
            case_id TEXT PRIMARY KEY,
            transaction_id TEXT NOT NULL,
            parcel_id TEXT NOT NULL,
            flagged_scenario TEXT NOT NULL,
            review_status TEXT NOT NULL DEFAULT 'UNREVIEWED',
            reviewer_notes TEXT DEFAULT '',
            assigned_reviewer TEXT DEFAULT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)

    # 2. Audit Trail History Table
    if is_postgres:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS review_audit_log (
                id SERIAL PRIMARY KEY,
                case_id TEXT NOT NULL,
                previous_status TEXT,
                new_status TEXT NOT NULL,
                changed_by TEXT NOT NULL,
                notes TEXT,
                timestamp TEXT NOT NULL,
                FOREIGN KEY (case_id) REFERENCES review_cases(case_id)
            )
        """)
    else:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS review_audit_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                case_id TEXT NOT NULL,
                previous_status TEXT,
                new_status TEXT NOT NULL,
                changed_by TEXT NOT NULL,
                notes TEXT,
                timestamp TEXT NOT NULL,
                FOREIGN KEY (case_id) REFERENCES review_cases(case_id)
            )
        """)

    # 3. Users Table (Argon2id password hashes)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            hashed_password TEXT NOT NULL,
            salt TEXT NOT NULL DEFAULT '',
            role TEXT NOT NULL DEFAULT 'viewer',
            full_name TEXT DEFAULT '',
            email TEXT DEFAULT '',
            created_at TEXT NOT NULL
        )
    """)
    for col in ("full_name", "email"):
        try:
            cursor.execute(f"ALTER TABLE users ADD COLUMN {col} TEXT DEFAULT ''")
        except Exception:
            pass

    # 4. Active Sessions Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            username TEXT NOT NULL,
            role TEXT NOT NULL,
            created_at TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            FOREIGN KEY (username) REFERENCES users(username)
        )
    """)

    conn.commit()

    # 5. User Provisioning (Environment Secrets & Production Security)
    now = datetime.now(timezone.utc).isoformat()
    is_production = (
        os.getenv("RENDER") == "true"
        or os.getenv("ENVIRONMENT", "").strip().lower() in ("production", "prod")
    )

    admin_user = os.getenv("ADMIN_USERNAME", "admin").strip()
    admin_pass = os.getenv("ADMIN_PASSWORD")
    reviewer_user = os.getenv("REVIEWER_USERNAME", "reviewer").strip()
    reviewer_pass = os.getenv("REVIEWER_PASSWORD")

    if is_production:
        # Production Mode:
        # 1. Purge all demonstration credentials and their active sessions
        known_demo_passwords = ["ReviewerPass2026!", "AdminPass2026!", "reviewer123", "admin123"]
        cursor.execute("SELECT username, hashed_password, salt FROM users")
        existing_users = cursor.fetchall()
        for u in existing_users:
            uname = u["username"]
            hpass = u["hashed_password"]
            usalt = u.get("salt", "")
            is_demo_pass = any(verify_password(p, hpass, usalt) for p in known_demo_passwords)
            if is_demo_pass or (uname in ("reviewer", "admin") and not (
                (uname == admin_user and admin_pass) or (uname == reviewer_user and reviewer_pass)
            )):
                cursor.execute("DELETE FROM sessions WHERE username = ?", (uname,))
                cursor.execute("DELETE FROM users WHERE username = ?", (uname,))
                logger.warning(f"Production Security: Revoked exposed demonstration account '{uname}'.")

        # 2. Provision secure administrator if configured via environment variables
        if admin_pass:
            h_adm, _ = hash_password(admin_pass)
            cursor.execute(
                """INSERT INTO users (username, hashed_password, salt, role, created_at)
                   VALUES (?, ?, ?, 'admin', ?)
                   ON CONFLICT(username) DO UPDATE SET hashed_password = excluded.hashed_password""",
                (admin_user, h_adm, "", now)
            )
            logger.info(f"Production Security: Provisioned administrator account '{admin_user}' via environment secret.")

        if reviewer_pass:
            h_rev, _ = hash_password(reviewer_pass)
            cursor.execute(
                """INSERT INTO users (username, hashed_password, salt, role, created_at)
                   VALUES (?, ?, ?, 'reviewer', ?)
                   ON CONFLICT(username) DO UPDATE SET hashed_password = excluded.hashed_password""",
                (reviewer_user, h_rev, "", now)
            )
            logger.info(f"Production Security: Provisioned reviewer account '{reviewer_user}' via environment secret.")

        cursor.execute("SELECT COUNT(*) FROM users")
        count_row = cursor.fetchone()
        user_count = count_row["COUNT(*)"] if isinstance(count_row, dict) and "COUNT(*)" in count_row else (list(count_row.values())[0] if isinstance(count_row, dict) else count_row[0])
        if user_count == 0:
            logger.warning(
                "PRODUCTION SECURITY NOTICE: Automatic demo accounts are disabled in production. "
                "Supply ADMIN_PASSWORD and/or REVIEWER_PASSWORD in your hosting environment variables."
            )
    else:
        # Development / Testing environments: Seed demonstration accounts if no users exist
        if admin_pass:
            h_adm, _ = hash_password(admin_pass)
            cursor.execute(
                """INSERT INTO users (username, hashed_password, salt, role, created_at)
                   VALUES (?, ?, ?, 'admin', ?)
                   ON CONFLICT(username) DO UPDATE SET hashed_password = excluded.hashed_password""",
                (admin_user, h_adm, "", now)
            )
        if reviewer_pass:
            h_rev, _ = hash_password(reviewer_pass)
            cursor.execute(
                """INSERT INTO users (username, hashed_password, salt, role, created_at)
                   VALUES (?, ?, ?, 'reviewer', ?)
                   ON CONFLICT(username) DO UPDATE SET hashed_password = excluded.hashed_password""",
                (reviewer_user, h_rev, "", now)
            )

        cursor.execute("SELECT COUNT(*) FROM users")
        count_row = cursor.fetchone()
        user_count = count_row["COUNT(*)"] if isinstance(count_row, dict) and "COUNT(*)" in count_row else (list(count_row.values())[0] if isinstance(count_row, dict) else count_row[0])
        if user_count == 0:
            h_rev, _ = hash_password("ReviewerPass2026!")
            cursor.execute(
                "INSERT INTO users (username, hashed_password, salt, role, created_at) VALUES (?, ?, ?, ?, ?)",
                ("reviewer", h_rev, "", "reviewer", now)
            )
            h_adm, _ = hash_password("AdminPass2026!")
            cursor.execute(
                "INSERT INTO users (username, hashed_password, salt, role, created_at) VALUES (?, ?, ?, ?, ?)",
                ("admin", h_adm, "", "admin", now)
            )
            logger.info("Development environment: Provisioned local demonstration reviewer and admin accounts.")

    conn.commit()

    # 6. Seed Review Cases from Baseline Synthetic CSV if empty
    cursor.execute("SELECT COUNT(*) FROM review_cases")
    count_case_row = cursor.fetchone()
    case_count = count_case_row["COUNT(*)"] if isinstance(count_case_row, dict) and "COUNT(*)" in count_case_row else (list(count_case_row.values())[0] if isinstance(count_case_row, dict) else count_case_row[0])

    csv_path = DATA_DIR / "review_cases.csv"
    if case_count == 0 and csv_path.exists():
        import pandas as pd
        tx_parcel_map = {}
        tx_csv_path = DATA_DIR / "transactions.csv"
        if tx_csv_path.exists():
            tx_df = pd.read_csv(tx_csv_path, usecols=["transaction_id", "parcel_id"])
            tx_parcel_map = dict(zip(tx_df["transaction_id"].astype(str), tx_df["parcel_id"].astype(str)))

        df = pd.read_csv(csv_path)
        cases_to_insert = []
        for _, row in df.iterrows():
            cid = str(row["case_id"])
            tx_id = str(row["transaction_id"])
            pid = str(row.get("parcel_id", tx_parcel_map.get(tx_id, "PARCEL-UNKNOWN")))
            scen = str(row.get("scenario", row.get("flagged_scenario", "UNKNOWN")))
            status = str(row.get("review_status", "UNREVIEWED"))
            cases_to_insert.append((
                cid, tx_id, pid, scen, status, "", None, now, now
            ))
        cursor.executemany(
            """INSERT INTO review_cases 
               (case_id, transaction_id, parcel_id, flagged_scenario, review_status, reviewer_notes, assigned_reviewer, created_at, updated_at) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            cases_to_insert
        )
        conn.commit()

    conn.close()
