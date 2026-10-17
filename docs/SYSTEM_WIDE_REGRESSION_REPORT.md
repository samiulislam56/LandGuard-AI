# System-Wide Regression Testing Report

**Date:** October 17, 2026  
**Test Suite:** Backend Pytest (38 tests) + Frontend TypeCheck & Lint & Vite Build  

---

## 1. Automated Test Suite Results

```text
============================= test session starts =============================
platform win32 -- Python 3.12.15, pytest-9.1.1, pluggy-1.7.0
rootdir: E:\LandGuard-AI\backend
plugins: anyio-4.15.1
collecting ... collected 38 items

tests/test_api.py::test_root_endpoint_metadata PASSED                    [  2%]
tests/test_api.py::test_health_endpoint PASSED                           [  5%]
tests/test_api.py::test_dashboard_summary PASSED                         [  7%]
tests/test_api.py::test_list_transactions_limit_5 PASSED                 [ 10%]
tests/test_api.py::test_list_transactions_scenario_filter PASSED         [ 13%]
tests/test_api.py::test_transaction_detail PASSED                        [ 15%]
tests/test_api.py::test_parcel_history PASSED                            [ 18%]
tests/test_api.py::test_parcel_history_legacy_alias PASSED               [ 21%]
tests/test_api.py::test_parcel_history_not_found PASSED                  [ 23%]
tests/test_api.py::test_assess_tx_002911_1 PASSED                        [ 26%]
tests/test_api.py::test_assess_tx_002911_2 PASSED                        [ 28%]
tests/test_api.py::test_assess_tx_002911_3_pending_date PASSED           [ 31%]
tests/test_api.py::test_unknown_transaction_404 PASSED                   [ 34%]
tests/test_api.py::test_unknown_parcel_404 PASSED                        [ 36%]
tests/test_api.py::test_invalid_pagination_limit_negative_422 PASSED     [ 39%]
tests/test_api.py::test_invalid_pagination_limit_exceeded_422 PASSED     [ 42%]
tests/test_api.py::test_cors_headers_local_react PASSED                  [ 44%]
tests/test_api.py::test_cors_headers_vercel_preview PASSED               [ 47%]
tests/test_api.py::test_timing_middleware_header PASSED                  [ 50%]
tests/test_api.py::test_model_bundle_integrity PASSED                    [ 52%]
tests/test_api.py::test_all_five_datasets_loaded PASSED                  [ 55%]
tests/test_api.py::test_auth_login_success_and_logout PASSED             [ 57%]
tests/test_api.py::test_auth_login_invalid_password PASSED               [ 60%]
tests/test_api.py::test_auth_me_unauthenticated_defaults_to_guest PASSED [ 63%]
tests/test_api.py::test_argon2id_kdf_hashing PASSED                      [ 65%]
tests/test_api.py::test_env_administrator_provisioning PASSED            [ 68%]
tests/test_api.py::test_reviews_list_and_filter PASSED                   [ 71%]
tests/test_api.py::test_review_detail_and_patch_workflow PASSED          [ 73%]
tests/test_api.py::test_download_pdf_report_endpoint PASSED              [ 76%]
tests/test_api.py::test_rmd_audit_endpoint PASSED                        [ 78%]
tests/test_api.py::test_rmd_parcel_endpoint PASSED                       [ 81%]
tests/test_api.py::test_direct_demo_auth_endpoint PASSED                 [ 84%]
tests/test_api.py::test_public_registration_success PASSED               [ 86%]
tests/test_api.py::test_registration_duplicate_username_conflict PASSED  [ 89%]
tests/test_api.py::test_registration_password_mismatch PASSED            [ 92%]
tests/test_api.py::test_registration_reserved_username_rejected PASSED   [ 94%]
tests/test_api.py::test_guest_demo_user_cannot_mutate_reviews PASSED     [ 97%]
tests/test_api.py::test_registered_viewer_user_cannot_mutate_reviews PASSED [100%]

======================= 38 passed, 4 warnings in 32.26s =======================
```

---

## 2. Frontend Quality Gates

- **`npm.cmd run typecheck`:** Exited with code `0`. (Strict TypeScript compilation clean).
- **`npm.cmd run lint`:** Exited with code `0`. (ESLint 0 warnings, 0 errors).
- **`npm.cmd run build`:** Exited with code `0`. (All 2908 modules transformed, zero syntax or bundle errors).
- **Live Render Assessment Script:** All 3 target assessments (`TX-002911-1`, `TX-002911-2`, `TX-002911-3`) confirmed 100% passing.
