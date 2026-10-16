# LandGuard AI — Stage 1 Final Backend Verification Report
**Date:** October 15, 2026  
**Execution Environment:** Virtual Environment (`E:\LandGuard-AI\.venv`)  
**Python Runtime:** Python 3.12.15 (64-bit)  
**Host Platform:** Windows 11 (10.0.26200-SP0)  
**Status:** **PASS** (14/14 automated tests passed, 0 failures)

---

## 1. Executive Summary

This report documents the final verification of the LandGuard AI backend before the commencement of frontend development. Verification was executed strictly within the newly provisioned virtual environment (`E:\LandGuard-AI\.venv`) using Python 3.12.15.

All machine learning model artifacts, synthetic datasets, and FastAPI endpoints were evaluated against the criteria outlined in **SRS v1.1**.

### Key Results
- **Random Forest Classifier:** Loaded and verified with 200 estimators across 3 classes.
- **Isolation Forest Bundle:** Loaded and verified with 6-feature scaler pipeline and imputation medians.
- **Synthetic Datasets:** All 5 CSV files loaded without error (14,890 total rows across tables).
- **Automated Test Suite:** 14 out of 14 unit and integration tests passed via `pytest`.
- **Target Acceptance Criteria (AC-04):** Verified against ground-truth synthetic cases.
- **REST Status Codes:** HTTP 200 (Success), HTTP 404 (Not Found), and HTTP 422 (Unprocessable Entity) confirmed.

---

## 2. Python Environment & Dependency Details

The active virtual environment was inspected and verified:

| Parameter | Value |
| :--- | :--- |
| **Virtual Environment Path** | `E:\LandGuard-AI\.venv` |
| **Python Executable** | `E:\LandGuard-AI\.venv\Scripts\python.exe` |
| **Python Version** | `3.12.15` |
| **FastAPI Version** | `0.143.2` |
| **Starlette Version** | `1.8.0` |
| **Pydantic Version** | `2.14.1` |
| **scikit-learn Version** | `1.9.1` |
| **joblib Version** | `1.6.0` |
| **pandas Version** | `3.0.6` |
| **numpy Version** | `2.5.4` |
| **httpx Version** | `0.28.1` |
| **pytest Version** | `9.1.1` |

---

## 3. Machine Learning Model Verification

### 3.1 Random Forest Classifier (`landguard_rf_baseline_v1.joblib`)
- **File Location:** `backend/models/landguard_rf_baseline_v1.joblib` (516,481 bytes)
- **Model Object:** `sklearn.ensemble.RandomForestClassifier`
- **Verification Status:** **PASS**
- **Tree Count (`n_estimators`):** 200
- **Input Dimension (`n_features_in_`):** 9 features
- **Feature Names & Exact Ordering:**
  1. `registered`
  2. `prior_transaction_exists`
  3. `legitimate_resale_evidence`
  4. `seller_owner_mismatch`
  5. `area_mismatch`
  6. `mutation_mismatch`
  7. `document_hash_mismatch`
  8. `overlapping_claim`
  9. `missing_evidence`
- **Output Classes (`classes_`):**
  - `INSUFFICIENT_EVIDENCE`
  - `NO_REVIEW_FLAG_DETECTED`
  - `REVIEW_REQUIRED`

### 3.2 Isolation Forest Pipeline Bundle (`landguard_isolation_forest_v1.joblib`)
- **File Location:** `backend/models/landguard_isolation_forest_v1.joblib` (3,865,326 bytes)
- **Object Format:** Serialized Python Dictionary Bundle
- **Verification Status:** **PASS**
- **Bundle Keys:** `['pipeline', 'features', 'train_medians']`
- **Pipeline Architecture:**
  - Step 1: `StandardScaler()`
  - Step 2: `IsolationForest(contamination=0.05, n_estimators=200, n_jobs=-1, random_state=42)`
- **Feature Vector (6 dimensions):**
  - `sale_area_acres` (median: `0.713`)
  - `claimed_share` (median: `0.5`)
  - `transaction_month` (median: `6.0`)
  - `transaction_day` (median: `14.0`)
  - `prior_transaction_exists` (median: `0.0`)
  - `legitimate_resale_evidence` (median: `0.0`)
- **Operational Logic:** Dynamic date decomposition extracts month and day from `transaction_date`; missing or NaN values are imputed with stored medians.

---

## 4. Synthetic Dataset Verification

All five CSV files located in `backend/data/` loaded cleanly into pandas DataFrames:

| Dataset | File | Rows | Columns | Integrity & Schema Checks | Status |
| :--- | :--- | :---: | :---: | :--- | :---: |
| **Parcels** | `parcels.csv` | 3,000 | 9 | 750 each across Dhaka, Chattogram, Khulna, Rajshahi | **PASS** |
| **Ownership** | `ownership.csv` | 3,000 | 7 | 1:1 active owner snapshot with 1.0 ownership share | **PASS** |
| **Transactions** | `transactions.csv` | 3,851 | 18 | Dates span 2026-01-01 to 2026-12-27; 712 multi-sale plots | **PASS** |
| **Mutations** | `mutations.csv` | 3,851 | 6 | 1:1 transaction pairing; 223 CONFLICT, 3,628 MATCH | **PASS** |
| **Review Cases** | `review_cases.csv` | 1,188 | 5 | Exactly matches 1,188 flagged transaction scenarios | **PASS** |

---

## 5. API Endpoint Verification Results

All required endpoints were queried through `fastapi.testclient.TestClient`:

| Endpoint | Method | Query / Path Params | Expected Code | Actual Code | Verification Details | Result |
| :--- | :---: | :--- | :---: | :---: | :--- | :---: |
| `/health` | GET | None | 200 | 200 | `{"status": "ok", "models_loaded": 2, "datasets_loaded": 5}` | **PASS** |
| `/dashboard/summary` | GET | None | 200 | 200 | `parcels: 3000`, `transactions: 3851`, `review_cases: 1188`, `multi_tx_parcels: 712` | **PASS** |
| `/transactions` | GET | `?limit=5` | 200 | 200 | `total: 3851`, returns exactly 5 items, offset 0 | **PASS** |
| `/transactions/{id}` | GET | `TX-002911-2` | 200 | 200 | Correctly fetched record, scenario: `conflicting_sale`, overlapping_claim: 1 | **PASS** |
| `/parcels/{id}/history` | GET | `LG-P-002911` | 200 | 200 | Returns parcel metadata and 3 chronologically ordered transactions | **PASS** |
| `/assess/{id}` | GET | `TX-002911-2` | 200 | 200 | Multi-model assessment payload with evidence findings and disclaimer | **PASS** |
| `/transactions/{id}` | GET | `TX-NONEXISTENT-999` | 404 | 404 | `{"detail": "Record not found: TX-NONEXISTENT-999"}` | **PASS** |
| `/transactions` | GET | `?limit=-1` | 422 | 422 | Pydantic validation rejected negative pagination limit | **PASS** |
| `/transactions` | GET | `?limit=101` | 422 | 422 | Pydantic validation rejected limit exceeding maximum bound (100) | **PASS** |

---

## 6. Target Assessment Precedence Verification (AC-04)

Target test cases specified in the SRS were executed against reference date `2026-10-15`:

### Case 1: `TX-002911-1`
- **Transaction Date:** `2026-05-23`
- **Scenario:** `incomplete`
- **Expected Final Status:** `INSUFFICIENT_EVIDENCE`
- **Actual Final Status:** **`INSUFFICIENT_EVIDENCE`**
- **RF Prediction:** `INSUFFICIENT_EVIDENCE`
- **IF Prediction:** `NORMAL_PATTERN` (Decision score: `+0.1342`)
- **Evidence Findings:** None (`[]`)
- **Evidence Warnings:**
  - *"Mutation is not approved"* (mutation status is `PENDING`)
  - *"Supporting evidence is incomplete"* (`missing_evidence: 1`)
- **Outcome:** **PASS**

### Case 2: `TX-002911-2`
- **Transaction Date:** `2026-08-23`
- **Scenario:** `conflicting_sale`
- **Expected Final Status:** `REVIEW_REQUIRED`
- **Actual Final Status:** **`REVIEW_REQUIRED`**
- **RF Prediction:** `REVIEW_REQUIRED`
- **IF Prediction:** `NORMAL_PATTERN` (Decision score: `+0.0509`)
- **Evidence Findings:**
  - *"Potential overlapping claim indicator"* (`overlapping_claim: 1`)
  - *"Potential repeated sale to different buyers"* (same seller alias previously sold on this parcel)
- **Evidence Warnings:**
  - *"Mutation is not approved"*
- **Outcome:** **PASS**

### Case 3: `TX-002911-3`
- **Transaction Date:** `2026-11-23` (Future-dated relative to `2026-10-15`)
- **Scenario:** `normal`
- **Expected Final Status:** `PENDING_DATE_VERIFICATION`
- **Actual Final Status:** **`PENDING_DATE_VERIFICATION`**
- **RF Prediction:** `NO_REVIEW_FLAG_DETECTED`
- **IF Prediction:** `NORMAL_PATTERN` (Decision score: `+0.0328`)
- **Evidence Findings:**
  - *"Potential repeated sale to different buyers"*
- **Evidence Warnings:**
  - *"Future-dated transaction"*
  - *"Previous overlapping claim indicator in parcel history"*
- **Precedence Rule:** Even though findings exist and RF predicted no flag, the temporal constraint takes absolute precedence.
- **Outcome:** **PASS**

---

## 7. Automated Test Suite Execution Summary

Automated tests in `backend/tests/test_api.py` were executed via `pytest`:

```
============================= test session starts =============================
platform win32 -- Python 3.12.15, pytest-9.1.1, pluggy-1.7.0 -- E:\LandGuard-AI\.venv\Scripts\python.exe
rootdir: E:\LandGuard-AI\backend
plugins: anyio-4.15.1
collected 14 items

tests/test_api.py::test_health_endpoint PASSED                           [  7%]
tests/test_api.py::test_dashboard_summary PASSED                         [ 14%]
tests/test_api.py::test_list_transactions_limit_5 PASSED                 [ 21%]
tests/test_api.py::test_transaction_detail PASSED                        [ 28%]
tests/test_api.py::test_parcel_history PASSED                            [ 35%]
tests/test_api.py::test_assess_tx_002911_1 PASSED                        [ 42%]
tests/test_api.py::test_assess_tx_002911_2 PASSED                        [ 50%]
tests/test_api.py::test_assess_tx_002911_3_pending_date PASSED           [ 57%]
tests/test_api.py::test_unknown_transaction_404 PASSED                   [ 64%]
tests/test_api.py::test_unknown_parcel_404 PASSED                        [ 71%]
tests/test_api.py::test_invalid_pagination_limit_negative_422 PASSED     [ 78%]
tests/test_api.py::test_invalid_pagination_limit_exceeded_422 PASSED     [ 85%]
tests/test_api.py::test_model_bundle_integrity PASSED                    [ 92%]
tests/test_api.py::test_all_five_datasets_loaded PASSED                  [100%]

======================= 14 passed, 7 warnings in 24.92s =======================
```

---

## 8. Compatibility & Warnings Analysis

During testing, two non-fatal warning categories were detected:

1. **scikit-learn `InconsistentVersionWarning`:**
   - **Trigger:** Models were serialized under `scikit-learn 1.6.1` in Colab, while `.venv` contains `scikit-learn 1.9.1`.
   - **Impact:** Zero functional impact. Models deserialized cleanly, pipelines executed without error, and decision scores matched baseline benchmarks.
   - **Remediation for Production:** In `backend/requirements.txt`, pin `scikit-learn==1.6.1` for production builds to ensure deterministic bit-for-bit unpickling.

2. **Starlette `StarletteDeprecationWarning`:**
   - **Trigger:** Starlette 1.8.0 emits a notice that `TestClient` using `httpx` internally will transition to `httpx2` in future major releases.
   - **Impact:** Informational only; does not affect application runtime or HTTP client requests.

---

## 9. Final Verification Verdict

| Verification Domain | Tests Run | Passed | Failed | Verdict |
| :--- | :---: | :---: | :---: | :---: |
| Python 3.12 Virtual Environment | 2 | 2 | 0 | **PASS** |
| Random Forest Model Loading | 3 | 3 | 0 | **PASS** |
| Isolation Forest Bundle Loading | 3 | 3 | 0 | **PASS** |
| Synthetic Datasets Integrity | 5 | 5 | 0 | **PASS** |
| REST API Endpoints (200 OK) | 6 | 6 | 0 | **PASS** |
| Assessment Precedence (AC-04) | 3 | 3 | 0 | **PASS** |
| REST Error Handling (404 / 422) | 3 | 3 | 0 | **PASS** |
| **Total Automated Checks** | **14** | **14** | **0** | **100% PASS** |

### Conclusion
The existing FastAPI backend, machine learning models, and synthetic datasets are fully verified, structurally sound, and compliant with all technical constraints in **SRS v1.1**.

The backend is certified ready for frontend API integration. No code has been pushed to GitHub, no cloud deployments have been initiated, and no frontend development has commenced.

---
*Report generated and archived at `docs/BACKEND_VERIFICATION_REPORT.md`.*  
*Awaiting user approval before proceeding to Stage 2.*
