import os
import time
import logging
from pathlib import Path
from datetime import date, datetime, timezone
from functools import lru_cache
from typing import Optional, Dict, Any, List

import pandas as pd
import numpy as np
import joblib

from fastapi import FastAPI, HTTPException, Query, Request, Response, Depends, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .database import init_db, get_db_connection
from .auth import (
    LoginRequest,
    LoginResponse,
    UserProfile,
    authenticate_user,
    invalidate_session,
    get_current_user,
    require_role,
)
from .reports import generate_assessment_pdf

# ---------------------------------------------------------------------------
# 1. Base Paths & Configuration Settings
# ---------------------------------------------------------------------------
BASE = Path(__file__).resolve().parent.parent
DATA = BASE / "data"
MODELS = BASE / "models"


class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "LandGuard AI")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    API_VERSION: str = "0.1.0"
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    ALLOWED_ORIGINS: str = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,https://landguard-ai.vercel.app"
    )
    ALLOW_VERCEL_PREVIEWS: bool = os.getenv("ALLOW_VERCEL_PREVIEWS", "true").lower() in ("true", "1", "yes")
    DEFAULT_ASSESSMENT_DATE: date = date.fromisoformat(
        os.getenv("DEFAULT_ASSESSMENT_DATE", "2026-10-15")
    )


settings = Settings()

# ---------------------------------------------------------------------------
# 2. Structured Safe Logging
# ---------------------------------------------------------------------------
logger = logging.getLogger("landguard.api")
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)

# ---------------------------------------------------------------------------
# 3. Application Factory & Middleware
# ---------------------------------------------------------------------------
app = FastAPI(
    title=f"{settings.PROJECT_NAME} API",
    description="Synthetic land transaction screening & cadastral intelligence prototype",
    version=settings.API_VERSION
)

# CORS Configuration for local React development and Vercel hosting
origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]
origin_regex = r"^https:\/\/.*\.vercel\.app$" if settings.ALLOW_VERCEL_PREVIEWS else None

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=origin_regex,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)


@app.middleware("http")
async def audit_logging_middleware(request: Request, call_next):
    start_time = time.perf_counter()
    response = await call_next(request)
    duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
    
    # Safe request audit without logging citizen identifiers or raw payloads
    logger.info(
        f"HTTP {request.method} {request.url.path} - status={response.status_code} - duration={duration_ms}ms"
    )
    response.headers["X-Process-Time-Ms"] = str(duration_ms)
    return response


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logger.warning(
        f"HTTPException on {request.method} {request.url.path}: {exc.status_code} - {exc.detail}"
    )
    # Retains backward-compatible 'detail' field while adding status metadata
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "status_code": exc.status_code,
            "error": True
        }
    )


# ---------------------------------------------------------------------------
# 4. Model Features & Rule Mappings
# ---------------------------------------------------------------------------
RF_FEATURES = [
    "registered",
    "prior_transaction_exists",
    "legitimate_resale_evidence",
    "seller_owner_mismatch",
    "area_mismatch",
    "mutation_mismatch",
    "document_hash_mismatch",
    "overlapping_claim",
    "missing_evidence"
]

RULE_MESSAGES = {
    "seller_owner_mismatch": "Ownership mismatch indicator",
    "area_mismatch": "Area mismatch indicator",
    "mutation_mismatch": "Mutation mismatch indicator",
    "document_hash_mismatch": "Document integrity mismatch indicator",
    "overlapping_claim": "Potential overlapping claim indicator"
}


# ---------------------------------------------------------------------------
# 5. Resource Caching & Data Helpers
# ---------------------------------------------------------------------------
@lru_cache(maxsize=1)
def resources():
    tables = {
        name: pd.read_csv(DATA / f"{name}.csv")
        for name in [
            "parcels", "ownership", "transactions",
            "mutations", "review_cases"
        ]
    }

    rf = joblib.load(
        MODELS / "landguard_rf_baseline_v1.joblib"
    )
    iso = joblib.load(
        MODELS / "landguard_isolation_forest_v1.joblib"
    )
    return tables, rf, iso


def clean(value):
    if isinstance(value, dict):
        return {str(k): clean(v) for k, v in value.items()}
    if isinstance(value, list):
        return [clean(v) for v in value]
    if isinstance(value, (np.integer,)):
        return int(value)
    if isinstance(value, (np.floating,)):
        return float(value)
    if isinstance(value, pd.Timestamp):
        return value.isoformat()
    if pd.api.types.is_scalar(value) and pd.isna(value):
        return None
    return value


def get_record(table, field, value):
    matched = table[table[field] == value]
    if matched.empty:
        raise HTTPException(
            status_code=404,
            detail=f"Record not found: {value}"
        )
    return matched.iloc[0]


# ---------------------------------------------------------------------------
# 6. Evidence Verification Engine & Assessment Logic
# ---------------------------------------------------------------------------
def evidence_check(tx, tables, assessment_date):
    parcel_id = tx["parcel_id"]
    tx_date = pd.to_datetime(
        tx["transaction_date"], errors="coerce"
    )

    findings = []
    warnings = []
    evidence = {}

    parcel_rows = tables["parcels"][
        tables["parcels"]["parcel_id"] == parcel_id
    ]

    if parcel_rows.empty:
        warnings.append("Parcel record unavailable")
    else:
        parcel = parcel_rows.iloc[0]
        parcel_area = float(parcel["total_area_acres"])
        sale_area = float(tx["sale_area_acres"])

        evidence["parcel_area_acres"] = parcel_area
        evidence["sale_area_acres"] = sale_area

        if sale_area <= 0 or sale_area > parcel_area + 1e-4:
            findings.append(
                "Sale area outside recorded parcel bounds"
            )

    owners = tables["ownership"]
    owner_dates = pd.to_datetime(
        owners["start_date"], errors="coerce"
    )

    owner_match = owners[
        (owners["parcel_id"] == parcel_id)
        & (owners["person_alias"] == tx["seller_alias"])
        & (owners["status"] == "ACTIVE")
        & (owner_dates <= tx_date)
    ]

    if owner_match.empty:
        findings.append(
            "Seller not supported by available ownership snapshot"
        )
    else:
        share = float(owner_match["ownership_share"].sum())
        if float(tx["claimed_share"]) > share + 1e-4:
            findings.append(
                "Claimed share exceeds recorded ownership share"
            )

    mutations = tables["mutations"]
    mutation_rows = mutations[
        mutations["transaction_id"] == tx["transaction_id"]
    ]

    if mutation_rows.empty:
        warnings.append("Mutation record missing")
    else:
        mutation = mutation_rows.iloc[0]

        if mutation["parcel_id"] != parcel_id:
            findings.append("Mutation parcel reference mismatch")

        if mutation["record_consistency"] != "MATCH":
            findings.append("Mutation consistency mismatch")

        if mutation["status"] != "APPROVED":
            warnings.append("Mutation is not approved")

    all_tx = tables["transactions"].copy()
    all_tx["_date"] = pd.to_datetime(
        all_tx["transaction_date"], errors="coerce"
    )

    if pd.notna(tx_date):
        previous = all_tx[
            (all_tx["parcel_id"] == parcel_id)
            & (all_tx["_date"] < tx_date)
        ].sort_values("_date")
    else:
        previous = all_tx.iloc[0:0]

    evidence["previous_transaction_ids"] = (
        previous["transaction_id"].tolist()
    )

    same_seller = previous[
        (previous["seller_alias"] == tx["seller_alias"])
        & (previous["buyer_alias"] != tx["buyer_alias"])
    ]

    if not same_seller.empty:
        if int(tx["legitimate_resale_evidence"]) == 1:
            warnings.append(
                "Repeated seller transaction; resale evidence "
                "requires independent verification"
            )
        else:
            findings.append(
                "Potential repeated sale to different buyers"
            )

    if (previous["overlapping_claim"] == 1).any():
        warnings.append(
            "Previous overlapping claim indicator in parcel history"
        )

    for field, message in RULE_MESSAGES.items():
        if int(tx[field]) == 1:
            findings.append(message)

    if int(tx["missing_evidence"]) == 1:
        warnings.append("Supporting evidence is incomplete")

    if pd.isna(tx_date):
        warnings.append("Invalid transaction date")
    elif tx_date.date() > assessment_date:
        warnings.append("Future-dated transaction")

    if findings:
        status = "REVIEW_REQUIRED"
    elif warnings:
        status = "INSUFFICIENT_EVIDENCE"
    else:
        status = "NO_REVIEW_FLAG_DETECTED"

    return {
        "status": status,
        "findings": sorted(set(findings)),
        "warnings": sorted(set(warnings)),
        "evidence": evidence
    }


def assess(transaction_id, assessment_date):
    tables, rf, iso_bundle = resources()
    tx = get_record(
        tables["transactions"],
        "transaction_id",
        transaction_id
    )

    rf_input = pd.DataFrame([
        {name: tx[name] for name in RF_FEATURES}
    ]).astype(float)

    rf_status = str(rf.predict(rf_input)[0])

    dt = pd.to_datetime(
        tx["transaction_date"], errors="coerce"
    )

    anomaly_values = {
        "sale_area_acres": tx["sale_area_acres"],
        "claimed_share": tx["claimed_share"],
        "transaction_month": dt.month if pd.notna(dt) else np.nan,
        "transaction_day": dt.day if pd.notna(dt) else np.nan,
        "prior_transaction_exists": tx["prior_transaction_exists"],
        "legitimate_resale_evidence": tx["legitimate_resale_evidence"]
    }

    feature_names = iso_bundle["features"]
    medians = iso_bundle["train_medians"]

    anomaly_input = pd.DataFrame(
        [anomaly_values]
    ).reindex(columns=feature_names)

    for column in feature_names:
        anomaly_input[column] = pd.to_numeric(
            anomaly_input[column], errors="coerce"
        ).fillna(medians.get(column, 0))

    pipeline = iso_bundle["pipeline"]
    anomaly_prediction = int(
        pipeline.predict(anomaly_input)[0]
    )
    anomaly_score = float(
        pipeline.decision_function(anomaly_input)[0]
    )

    verification = evidence_check(
        tx, tables, assessment_date
    )

    if pd.isna(dt) or dt.date() > assessment_date:
        final = "PENDING_DATE_VERIFICATION"
    elif (
        rf_status == "REVIEW_REQUIRED"
        or verification["status"] == "REVIEW_REQUIRED"
    ):
        final = "REVIEW_REQUIRED"
    elif (
        rf_status == "INSUFFICIENT_EVIDENCE"
        or verification["status"] == "INSUFFICIENT_EVIDENCE"
    ):
        final = "INSUFFICIENT_EVIDENCE"
    else:
        final = "NO_REVIEW_FLAG_DETECTED"

    return clean({
        "transaction_id": transaction_id,
        "parcel_id": tx["parcel_id"],
        "assessment_date": assessment_date.isoformat(),
        "final_status": final,
        "random_forest": {
            "prediction": rf_status
        },
        "isolation_forest": {
            "status": (
                "ANOMALY" if anomaly_prediction == -1
                else "NORMAL_PATTERN"
            ),
            "decision_score": anomaly_score
        },
        "evidence_verification": verification,
        "human_review_recommended": (
            final != "NO_REVIEW_FLAG_DETECTED"
        ),
        "disclaimer": (
            "Synthetic-data screening only. "
            "No finding proves fraud or legal ownership."
        )
    })


# ---------------------------------------------------------------------------
# 7. Endpoints & Route Definitions
# ---------------------------------------------------------------------------
@app.get("/")
def home():
    return {
        "project": settings.PROJECT_NAME,
        "api_version": settings.API_VERSION,
        "environment": settings.ENVIRONMENT,
        "docs": "/docs"
    }


@app.get("/health")
def health():
    tables, rf, iso = resources()
    return {
        "status": "ok",
        "models_loaded": 2,
        "datasets_loaded": len(tables)
    }


@app.get("/dashboard/summary")
def dashboard_summary():
    tables, _, _ = resources()
    tx = tables["transactions"]
    return {
        "parcels": len(tables["parcels"]),
        "transactions": len(tx),
        "review_cases": len(tables["review_cases"]),
        "multiple_transaction_parcels": int(
            (tx.groupby("parcel_id").size() > 1).sum()
        ),
        "scenario_counts": tx["scenario"].value_counts().to_dict(),
        "data_origin": "SYNTHETIC"
    }


@app.get("/transactions")
def list_transactions(
    search: Optional[str] = None,
    scenario: Optional[str] = None,
    limit: int = Query(default=20, ge=1, le=100, description="Items per page (1-100)"),
    offset: int = Query(default=0, ge=0, description="Pagination offset (>=0)")
):
    tables, _, _ = resources()
    df = tables["transactions"]

    if search:
        needle = search.strip()
        df = df[
            df["transaction_id"].str.contains(
                needle, case=False, regex=False, na=False
            )
            | df["parcel_id"].str.contains(
                needle, case=False, regex=False, na=False
            )
        ]

    if scenario:
        df = df[df["scenario"] == scenario.strip()]

    total = len(df)
    items = df.iloc[offset:offset + limit]

    return clean({
        "total": total,
        "limit": limit,
        "offset": offset,
        "items": items.to_dict(orient="records")
    })


@app.get("/transactions/{transaction_id}")
def transaction_detail(transaction_id: str):
    tables, _, _ = resources()
    row = get_record(
        tables["transactions"],
        "transaction_id",
        transaction_id
    )
    return clean(row.to_dict())


@app.get("/parcels/{parcel_id}/history")
def parcel_history(parcel_id: str):
    tables, _, _ = resources()
    parcel = get_record(
        tables["parcels"], "parcel_id", parcel_id
    )

    history = tables["transactions"][
        tables["transactions"]["parcel_id"] == parcel_id
    ].sort_values("transaction_date")

    return clean({
        "parcel": parcel.to_dict(),
        "total_transactions": len(history),
        "transactions": history.to_dict(orient="records")
    })


@app.get("/assess/{transaction_id}")
def assess_endpoint(
    transaction_id: str,
    as_of_date: date = Query(default=settings.DEFAULT_ASSESSMENT_DATE)
):
    return assess(transaction_id, as_of_date)


# ---------------------------------------------------------------------------
# 10. Stage 4 — Database Initialization & Startup
# ---------------------------------------------------------------------------
@app.on_event("startup")
def on_startup():
    init_db()
    logger.info("Stage 4 persistent review database and RBAC initialized.")


# Initialize DB immediately on module import
init_db()


# ---------------------------------------------------------------------------
# 11. Stage 4 — Authentication & User Sessions
# ---------------------------------------------------------------------------
@app.post("/api/auth/login", response_model=LoginResponse)
def login_endpoint(credentials: LoginRequest):
    session = authenticate_user(credentials)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password. Valid demo users: 'reviewer' or 'admin'."
        )
    return session


@app.post("/api/auth/logout")
def logout_endpoint(request: Request):
    auth_header = request.headers.get("Authorization")
    token = None
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1].strip()
    elif request.headers.get("X-Auth-Token"):
        token = request.headers.get("X-Auth-Token").strip()

    if token:
        invalidate_session(token)
    return {"status": "logged_out"}


@app.get("/api/auth/me", response_model=UserProfile)
def get_me_endpoint(user: UserProfile = Depends(get_current_user)):
    return user


# ---------------------------------------------------------------------------
# 12. Stage 4 — Persistent Review Case Workspace
# ---------------------------------------------------------------------------
class ReviewUpdateRequest(BaseModel):
    status: Optional[str] = Field(None, description="Review status: UNREVIEWED, IN_REVIEW, APPROVED_VALID, FLAGGED_DISPUTE, REJECTED")
    reviewer_notes: Optional[str] = Field(None, description="Auditor investigation notes")
    notes: Optional[str] = Field(None, description="Alias for reviewer_notes")
    assigned_reviewer: Optional[str] = Field(None, description="Assigned reviewer username")


@app.get("/api/reviews")
def list_review_cases(
    status: Optional[str] = None,
    scenario: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0)
):
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM review_cases WHERE 1=1"
    count_query = "SELECT COUNT(*) FROM review_cases WHERE 1=1"
    params: List[Any] = []
    count_params: List[Any] = []

    if status:
        query += " AND review_status = ?"
        count_query += " AND review_status = ?"
        params.append(status.strip().upper())
        count_params.append(status.strip().upper())

    if scenario:
        query += " AND flagged_scenario = ?"
        count_query += " AND flagged_scenario = ?"
        params.append(scenario.strip().lower())
        count_params.append(scenario.strip().lower())

    if search:
        s = f"%{search.strip()}%"
        query += " AND (case_id LIKE ? OR transaction_id LIKE ? OR parcel_id LIKE ?)"
        count_query += " AND (case_id LIKE ? OR transaction_id LIKE ? OR parcel_id LIKE ?)"
        params.extend([s, s, s])
        count_params.extend([s, s, s])

    cursor.execute(count_query, count_params)
    total = cursor.fetchone()[0]

    query += " ORDER BY case_id ASC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    items = [dict(r) for r in rows]
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "items": items
    }


@app.get("/api/reviews/{case_id}")
def get_review_case(case_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM review_cases WHERE case_id = ?", (case_id.strip(),))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Review case '{case_id}' not found.")

    case_dict = dict(row)

    # Fetch audit history
    cursor.execute("SELECT * FROM review_audit_log WHERE case_id = ? ORDER BY id DESC", (case_id.strip(),))
    history_rows = cursor.fetchall()
    conn.close()

    case_dict["history"] = [dict(h) for h in history_rows]

    # Augment with transaction details if available
    try:
        tables, _, _ = resources()
        tx_row = tables["transactions"][tables["transactions"]["transaction_id"] == case_dict["transaction_id"]]
        if not tx_row.empty:
            case_dict["transaction_details"] = clean(tx_row.iloc[0].to_dict())
    except Exception as e:
        logger.warning(f"Could not fetch transaction details for review case {case_id}: {e}")

    return clean(case_dict)


@app.patch("/api/reviews/{case_id}")
def update_review_case(
    case_id: str,
    update: ReviewUpdateRequest,
    current_user: UserProfile = Depends(require_role(["reviewer", "admin"]))
):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM review_cases WHERE case_id = ?", (case_id.strip(),))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Review case '{case_id}' not found.")

    current_case = dict(row)
    prev_status = current_case["review_status"]
    raw_status = update.status.strip().upper() if update.status else prev_status

    status_alias = {
        "APPROVED": "APPROVED_VALID",
        "DISPUTED": "FLAGGED_DISPUTE",
        "DISPUTE": "FLAGGED_DISPUTE",
    }
    new_status = status_alias.get(raw_status, raw_status)

    valid_statuses = {"UNREVIEWED", "IN_REVIEW", "APPROVED_VALID", "FLAGGED_DISPUTE", "REJECTED"}
    if new_status not in valid_statuses:
        conn.close()
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status '{new_status}'. Allowed values: {sorted(list(valid_statuses))}"
        )

    incoming_notes = update.reviewer_notes if update.reviewer_notes is not None else update.notes
    new_notes = incoming_notes if incoming_notes is not None else current_case["reviewer_notes"]
    new_assignee = update.assigned_reviewer if update.assigned_reviewer is not None else (current_case["assigned_reviewer"] or current_user.username)
    now = datetime.now(timezone.utc).isoformat()

    cursor.execute("""
        UPDATE review_cases 
        SET review_status = ?, reviewer_notes = ?, assigned_reviewer = ?, updated_at = ?
        WHERE case_id = ?
    """, (new_status, new_notes, new_assignee, now, case_id.strip()))

    # Record audit trail
    audit_notes = incoming_notes or f"Review status updated from {prev_status} to {new_status}"
    cursor.execute("""
        INSERT INTO review_audit_log (case_id, previous_status, new_status, changed_by, notes, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (case_id.strip(), prev_status, new_status, current_user.username, audit_notes, now))
    conn.commit()

    cursor.execute("SELECT * FROM review_cases WHERE case_id = ?", (case_id.strip(),))
    updated_row = cursor.fetchone()

    cursor.execute("SELECT * FROM review_audit_log WHERE case_id = ? ORDER BY id DESC", (case_id.strip(),))
    history_rows = cursor.fetchall()
    conn.close()

    res = dict(updated_row)
    res["history"] = [dict(h) for h in history_rows]
    return clean(res)


@app.get("/api/reviews/{case_id}/history")
def get_case_audit_history(case_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM review_audit_log WHERE case_id = ? ORDER BY id DESC", (case_id.strip(),))
    rows = cursor.fetchall()
    conn.close()
    return clean([dict(r) for r in rows])


# ---------------------------------------------------------------------------
# 13. Stage 4 — Real Downloadable Assessment PDF Report
# ---------------------------------------------------------------------------
@app.get("/api/reports/assessment/{transaction_id}")
def download_assessment_report(
    transaction_id: str,
    as_of_date: date = Query(default=settings.DEFAULT_ASSESSMENT_DATE)
):
    tables, _, _ = resources()
    tx_row = get_record(tables["transactions"], "transaction_id", transaction_id)
    tx_data = clean(tx_row.to_dict())

    parcel_id = tx_data["parcel_id"]
    parcel_row = get_record(tables["parcels"], "parcel_id", parcel_id)
    parcel_data = clean(parcel_row.to_dict())

    assessment_data = assess(transaction_id, as_of_date)

    pdf_bytes = generate_assessment_pdf(assessment_data, tx_data, parcel_data)

    filename = f"LandGuard_Forensic_Dossier_{transaction_id}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-cache",
        }
    )

