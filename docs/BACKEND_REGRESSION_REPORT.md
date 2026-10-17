# LANDGUARD AI — BACKEND REGRESSION & DATA INTEGRITY REPORT

## 1. Test Execution Summary
* **Test Framework**: Pytest 9.1.1 on Python 3.12
* **Total Tests Executed**: 38
* **Passed**: 38 (100%)
* **Failed**: 0
* **Execution Duration**: 27.82 seconds

---

## 2. API Contract Verification

| Endpoint | Tested Params / Scenarios | Response Code | Validations |
| :--- | :--- | :--- | :--- |
| `GET /health` | Healthcheck | `200 OK` | `models_loaded: 2`, `datasets_loaded: 5` |
| `GET /dashboard/summary` | Global counts | `200 OK` | `parcels: 3000`, `transactions: 3851`, `review_cases: 1188` |
| `GET /transactions` | `limit=5`, `offset=0` | `200 OK` | Pagination parameters respected, 5 items returned |
| `GET /transactions/{id}` | `TX-002911-2` | `200 OK` | Scenario: `conflicting_sale`, correct deed dates |
| `GET /parcels/{id}/history` | Canonical `LG-P-002911` | `200 OK` | 3 transactions, sorted chronologically |
| `GET /parcels/{id}/history` | Legacy Alias `PARCEL-002911` | `200 OK` | **PASS**: Resolved to `LG-P-002911` |
| `GET /parcels/{id}/history` | Unknown ID | `404 Not Found` | Clean `Record not found` exception |
| `GET /assess/{tx_id}` | `TX-002911-1` (`2026-10-15`) | `200 OK` | `final_status: INSUFFICIENT_EVIDENCE` |
| `GET /assess/{tx_id}` | `TX-002911-2` (`2026-10-15`) | `200 OK` | `final_status: REVIEW_REQUIRED` |
| `GET /assess/{tx_id}` | `TX-002911-3` (`2026-10-15`) | `200 OK` | `final_status: PENDING_DATE_VERIFICATION` |

---

## 3. Dataset & Machine Learning Integrity
* **Immutable CSV Datasets**: Verified checksums and counts for all 5 synthetic tables:
  1. `parcels.csv`: 3,000 plots
  2. `transactions.csv`: 3,851 transfer deeds
  3. `ownership.csv`: 3,000 ownership records
  4. `mutations.csv`: 3,851 mutation records
  5. `review_cases.csv`: 1,188 flagged cases
* **Random Forest & Isolation Forest**: Artifacts loaded into memory without retraining. Deterministic scoring matches verified ground truth.
