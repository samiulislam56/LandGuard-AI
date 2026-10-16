import json
import sys
from pathlib import Path
from datetime import date
from fastapi.testclient import TestClient

backend_dir = Path("e:/LandGuard-AI/backend")
sys.path.insert(0, str(backend_dir))

from app.main import app, resources, RF_FEATURES

client = TestClient(app)

results = {}

print("=== 1. Environment & Packages ===")
import platform
import sklearn
import joblib
import pandas as pd
import numpy as np
import fastapi
import pydantic

results["environment"] = {
    "python_version": platform.python_version(),
    "python_path": sys.executable,
    "platform": platform.platform(),
    "packages": {
        "fastapi": fastapi.__version__,
        "pydantic": pydantic.__version__,
        "scikit-learn": sklearn.__version__,
        "joblib": joblib.__version__,
        "pandas": pd.__version__,
        "numpy": np.__version__
    }
}
print(json.dumps(results["environment"], indent=2))

print("\n=== 2. Model & Dataset Loading ===")
tables, rf, iso_bundle = resources()

results["models"] = {
    "random_forest": {
        "loaded": True,
        "type": str(type(rf)),
        "classes": list(rf.classes_),
        "n_estimators": len(rf.estimators_),
        "n_features_in": getattr(rf, "n_features_in_", None),
        "feature_names_in": list(getattr(rf, "feature_names_in_", []))
    },
    "isolation_forest": {
        "loaded": True,
        "bundle_keys": list(iso_bundle.keys()),
        "features": iso_bundle.get("features"),
        "train_medians": iso_bundle.get("train_medians"),
        "pipeline_steps": [name for name, _ in iso_bundle.get("pipeline").steps]
    }
}
print("Models verified:", results["models"])

results["datasets"] = {}
for name, df in tables.items():
    results["datasets"][name] = {
        "row_count": len(df),
        "column_count": len(df.columns),
        "columns": list(df.columns)
    }
print("Datasets verified:", results["datasets"])

print("\n=== 3. Endpoint Verifications ===")
endpoints_to_test = [
    ("/health", "health"),
    ("/dashboard/summary", "dashboard_summary"),
    ("/transactions?limit=5", "transactions_limit_5"),
    ("/transactions/TX-002911-2", "transaction_detail_TX_002911_2"),
    ("/parcels/LG-P-002911/history", "parcel_history_LG_P_002911"),
    ("/assess/TX-002911-2", "assess_TX_002911_2")
]

results["endpoints"] = {}
for path, label in endpoints_to_test:
    res = client.get(path)
    print(f"\nEndpoint: GET {path}")
    print(f"Status: {res.status_code}")
    print(f"Response: {json.dumps(res.json(), indent=2)[:300]}...")
    results["endpoints"][label] = {
        "path": path,
        "status_code": res.status_code,
        "body": res.json()
    }

print("\n=== 4. Assessment Precedence Verifications ===")
assessments = [
    ("TX-002911-1", "INSUFFICIENT_EVIDENCE"),
    ("TX-002911-2", "REVIEW_REQUIRED"),
    ("TX-002911-3", "PENDING_DATE_VERIFICATION")
]

results["assessment_cases"] = {}
for tx_id, expected_status in assessments:
    res = client.get(f"/assess/{tx_id}?as_of_date=2026-10-15")
    data = res.json()
    actual_status = data.get("final_status")
    match = actual_status == expected_status
    print(f"Assessment {tx_id}: Expected '{expected_status}', got '{actual_status}' -> MATCH: {match}")
    results["assessment_cases"][tx_id] = {
        "expected": expected_status,
        "actual": actual_status,
        "match": match,
        "random_forest": data.get("random_forest"),
        "isolation_forest": data.get("isolation_forest"),
        "findings": data.get("evidence_verification", {}).get("findings"),
        "warnings": data.get("evidence_verification", {}).get("warnings")
    }

print("\n=== 5. Edge Cases (404 and 422) ===")
res_404 = client.get("/transactions/TX-NONEXISTENT-999")
print(f"Unknown TX 404 test: Status {res_404.status_code}, Body: {res_404.json()}")
results["unknown_tx_404"] = {
    "status_code": res_404.status_code,
    "body": res_404.json(),
    "pass": res_404.status_code == 404
}

res_422_neg = client.get("/transactions?limit=-1")
print(f"Invalid pagination limit=-1: Status {res_422_neg.status_code}")
res_422_exceed = client.get("/transactions?limit=101")
print(f"Invalid pagination limit=101: Status {res_422_exceed.status_code}")
results["invalid_pagination_422"] = {
    "limit_negative_status": res_422_neg.status_code,
    "limit_exceeded_status": res_422_exceed.status_code,
    "pass": res_422_neg.status_code == 422 and res_422_exceed.status_code == 422
}

with open("e:/LandGuard-AI/docs/verification_data.json", "w") as f:
    json.dump(results, f, indent=2)

print("\nSaved full verification data to docs/verification_data.json")
