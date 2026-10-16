import os
import time
import logging
from pathlib import Path
from datetime import date
from functools import lru_cache
from typing import Optional, Dict, Any, List

import pandas as pd
import numpy as np
import joblib

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

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
