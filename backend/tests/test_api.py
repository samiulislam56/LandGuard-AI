from datetime import date
import pytest
from fastapi.testclient import TestClient
import pandas as pd
import numpy as np

from app.main import app, resources, RF_FEATURES

client = TestClient(app)


def test_root_endpoint_metadata():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["project"] == "LandGuard AI"
    assert data["api_version"] == "0.1.0"
    assert "environment" in data
    assert data["docs"] == "/docs"


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["models_loaded"] == 2
    assert data["datasets_loaded"] == 5


def test_dashboard_summary():
    response = client.get("/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["parcels"] == 3000
    assert data["transactions"] == 3851
    assert data["review_cases"] == 1188
    assert data["multiple_transaction_parcels"] == 712
    assert data["data_origin"] == "SYNTHETIC"
    assert "scenario_counts" in data
    assert data["scenario_counts"]["normal"] == 2609


def test_list_transactions_limit_5():
    response = client.get("/transactions?limit=5")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 3851
    assert data["limit"] == 5
    assert data["offset"] == 0
    assert len(data["items"]) == 5


def test_list_transactions_scenario_filter():
    response = client.get("/transactions?scenario=conflicting_sale")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 73
    for item in data["items"]:
        assert item["scenario"] == "conflicting_sale"


def test_transaction_detail():
    tx_id = "TX-002911-2"
    response = client.get(f"/transactions/{tx_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["transaction_id"] == tx_id
    assert data["parcel_id"] == "LG-P-002911"
    assert data["scenario"] == "conflicting_sale"


def test_parcel_history():
    parcel_id = "LG-P-002911"
    response = client.get(f"/parcels/{parcel_id}/history")
    assert response.status_code == 200
    data = response.json()
    assert data["parcel"]["parcel_id"] == parcel_id
    assert data["total_transactions"] == 3
    assert len(data["transactions"]) == 3
    # Check chronological ordering
    dates = [t["transaction_date"] for t in data["transactions"]]
    assert dates == sorted(dates)


def test_assess_tx_002911_1():
    response = client.get("/assess/TX-002911-1?as_of_date=2026-10-15")
    assert response.status_code == 200
    data = response.json()
    assert data["transaction_id"] == "TX-002911-1"
    assert data["final_status"] == "INSUFFICIENT_EVIDENCE"
    assert data["human_review_recommended"] is True
    assert data["random_forest"]["prediction"] == "INSUFFICIENT_EVIDENCE"


def test_assess_tx_002911_2():
    response = client.get("/assess/TX-002911-2?as_of_date=2026-10-15")
    assert response.status_code == 200
    data = response.json()
    assert data["transaction_id"] == "TX-002911-2"
    assert data["final_status"] == "REVIEW_REQUIRED"
    assert data["human_review_recommended"] is True
    assert data["random_forest"]["prediction"] == "REVIEW_REQUIRED"
    assert "Potential repeated sale to different buyers" in data["evidence_verification"]["findings"]


def test_assess_tx_002911_3_pending_date():
    response = client.get("/assess/TX-002911-3?as_of_date=2026-10-15")
    assert response.status_code == 200
    data = response.json()
    assert data["transaction_id"] == "TX-002911-3"
    assert data["final_status"] == "PENDING_DATE_VERIFICATION"
    assert data["human_review_recommended"] is True
    assert "Future-dated transaction" in data["evidence_verification"]["warnings"]


def test_unknown_transaction_404():
    response = client.get("/transactions/TX-NONEXISTENT-999")
    assert response.status_code == 404
    data = response.json()
    assert "Record not found" in data["detail"]
    assert data["status_code"] == 404
    assert data["error"] is True


def test_unknown_parcel_404():
    response = client.get("/parcels/LG-P-NONEXISTENT/history")
    assert response.status_code == 404
    data = response.json()
    assert "Record not found" in data["detail"]
    assert data["status_code"] == 404
    assert data["error"] is True


def test_invalid_pagination_limit_negative_422():
    response = client.get("/transactions?limit=-1")
    assert response.status_code == 422


def test_invalid_pagination_limit_exceeded_422():
    response = client.get("/transactions?limit=101")
    assert response.status_code == 422


def test_cors_headers_local_react():
    headers = {"Origin": "http://localhost:5173"}
    response = client.get("/health", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"


def test_cors_headers_vercel_preview():
    headers = {"Origin": "https://landguard-git-preview-test.vercel.app"}
    response = client.get("/health", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "https://landguard-git-preview-test.vercel.app"


def test_timing_middleware_header():
    response = client.get("/health")
    assert response.status_code == 200
    assert "X-Process-Time-Ms" in response.headers
    duration = float(response.headers["X-Process-Time-Ms"])
    assert duration >= 0.0


def test_model_bundle_integrity():
    tables, rf, iso_bundle = resources()
    assert hasattr(rf, "predict")
    assert list(rf.classes_) == [
        "INSUFFICIENT_EVIDENCE",
        "NO_REVIEW_FLAG_DETECTED",
        "REVIEW_REQUIRED"
    ]
    assert isinstance(iso_bundle, dict)
    assert "pipeline" in iso_bundle
    assert "features" in iso_bundle
    assert "train_medians" in iso_bundle
    assert len(iso_bundle["features"]) == 6


def test_all_five_datasets_loaded():
    tables, _, _ = resources()
    assert set(tables.keys()) == {
        "parcels", "ownership", "transactions", "mutations", "review_cases"
    }
    assert len(tables["parcels"]) == 3000
    assert len(tables["ownership"]) == 3000
    assert len(tables["transactions"]) == 3851
    assert len(tables["mutations"]) == 3851
    assert len(tables["review_cases"]) == 1188
