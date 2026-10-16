# ---------------------------------------------------------------------------
# LandGuard AI — Persistent Review Case & Audit Database
# ---------------------------------------------------------------------------
import os
import sqlite3
import hashlib
import secrets
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "landguard_reviews.db"


def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    if not salt:
        salt = secrets.token_hex(16)
    hashed = hashlib.sha256((salt + password).encode("utf-8")).hexdigest()
    return hashed, salt


def verify_password(password: str, hashed: str, salt: str) -> bool:
    expected, _ = hash_password(password, salt)
    return secrets.compare_digest(expected, hashed)


def init_db():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    conn = get_db_connection()
    cursor = conn.cursor()

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

    # 3. Users Table (RBAC: admin, reviewer, viewer)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            hashed_password TEXT NOT NULL,
            salt TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'reviewer',
            created_at TEXT NOT NULL
        )
    """)

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

    # Seed default users if not present
    cursor.execute("SELECT COUNT(*) FROM users")
    user_count = cursor.fetchone()[0]
    now = datetime.now(timezone.utc).isoformat()

    if user_count == 0:
        # Default Reviewer
        h_rev, s_rev = hash_password("ReviewerPass2026!")
        cursor.execute(
            "INSERT INTO users (username, hashed_password, salt, role, created_at) VALUES (?, ?, ?, ?, ?)",
            ("reviewer", h_rev, s_rev, "reviewer", now)
        )
        # Default Admin
        h_adm, s_adm = hash_password("AdminPass2026!")
        cursor.execute(
            "INSERT INTO users (username, hashed_password, salt, role, created_at) VALUES (?, ?, ?, ?, ?)",
            ("admin", h_adm, s_adm, "admin", now)
        )
        conn.commit()

    # Seed review cases from baseline synthetic CSV if empty
    cursor.execute("SELECT COUNT(*) FROM review_cases")
    case_count = cursor.fetchone()[0]

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
