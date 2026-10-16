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


# ---------------------------------------------------------------------------
# STAGE 4 TESTS: AUTHENTICATION, RBAC, PERSISTENT REVIEW WORKSPACE, PDF REPORT
# ---------------------------------------------------------------------------

def test_auth_login_success_and_logout():
    # 1. Login with reviewer credentials
    resp = client.post("/api/auth/login", json={
        "username": "reviewer",
        "password": "ReviewerPass2026!"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "token" in data
    assert data["username"] == "reviewer"
    assert data["role"] == "reviewer"

    token = data["token"]

    # 2. Check /api/auth/me with Bearer token
    me_resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["username"] == "reviewer"
    assert me_data["authenticated"] is True

    # 3. Logout
    logout_resp = client.post("/api/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert logout_resp.status_code == 200


def test_auth_login_invalid_password():
    resp = client.post("/api/auth/login", json={
        "username": "reviewer",
        "password": "WrongPassword123!"
    })
    assert resp.status_code == 401
    assert "Invalid username or password" in resp.json()["detail"]


def test_auth_me_unauthenticated_defaults_to_guest():
    resp = client.get("/api/auth/me")
    assert resp.status_code == 200
    data = resp.json()
    assert data["username"] == "guest"
    assert data["role"] == "viewer"
    assert data["authenticated"] is False


def test_reviews_list_and_filter():
    resp = client.get("/api/reviews?limit=10&offset=0")
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] > 0
    assert len(data["items"]) <= 10

    first_case = data["items"][0]
    assert "case_id" in first_case
    assert "transaction_id" in first_case
    assert "review_status" in first_case


def test_review_detail_and_patch_workflow():
    # 1. Get first review case
    list_resp = client.get("/api/reviews?limit=1")
    assert list_resp.status_code == 200
    case_id = list_resp.json()["items"][0]["case_id"]

    # 2. Get case detail
    detail_resp = client.get(f"/api/reviews/{case_id}")
    assert detail_resp.status_code == 200
    detail_data = detail_resp.json()
    assert detail_data["case_id"] == case_id
    assert "transaction_id" in detail_data

    # 3. Unauthorized PATCH should be rejected (401)
    unauth_patch = client.patch(f"/api/reviews/{case_id}", json={
        "status": "IN_REVIEW",
        "notes": "Unauthorized attempt"
    })
    assert unauth_patch.status_code == 401

    # 4. Authenticate as reviewer
    login_resp = client.post("/api/auth/login", json={
        "username": "reviewer",
        "password": "ReviewerPass2026!"
    })
    token = login_resp.json()["token"]
    auth_header = {"Authorization": f"Bearer {token}"}

    # 5. Authorized PATCH should succeed (200)
    auth_patch = client.patch(
        f"/api/reviews/{case_id}",
        json={
            "status": "APPROVED",
            "notes": "Verified chain of custody and approved."
        },
        headers=auth_header
    )
    assert auth_patch.status_code == 200
    patched_data = auth_patch.json()
    assert patched_data["review_status"] in ("APPROVED", "APPROVED_VALID")
    assert "Verified chain of custody" in patched_data["reviewer_notes"]

    # 6. Verify audit history exists
    hist_resp = client.get(f"/api/reviews/{case_id}/history")
    assert hist_resp.status_code == 200
    hist = hist_resp.json()
    assert len(hist) >= 1
    assert hist[0]["changed_by"] == "reviewer"
    assert hist[0]["new_status"] in ("APPROVED", "APPROVED_VALID")


def test_download_pdf_report_endpoint():
    # Ground truth test transaction
    resp = client.get("/api/reports/assessment/TX-002911-2")
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/pdf"
    assert "attachment; filename=" in resp.headers["content-disposition"]
    # PDF files start with %PDF- header magic bytes
    assert resp.content.startswith(b"%PDF-")
    assert len(resp.content) > 1000

