# Registration & Authentication End-to-End Test Report — LandGuard AI

**Date**: 2026-10-17  
**Test Suite**: Pytest Backend Suite (36 Tests) + Frontend TypeScript & Build Verification  

---

## 1. Backend Authentication & Registration Test Matrix

All 36 backend tests executed and passed cleanly:

```
tests/test_api.py::test_root_endpoint_metadata PASSED                    [  2%]
tests/test_api.py::test_health_endpoint PASSED                           [  5%]
tests/test_api.py::test_dashboard_summary PASSED                         [  8%]
tests/test_api.py::test_list_transactions_limit_5 PASSED                 [ 11%]
tests/test_api.py::test_list_transactions_scenario_filter PASSED         [ 13%]
tests/test_api.py::test_transaction_detail PASSED                        [ 16%]
tests/test_api.py::test_parcel_history PASSED                            [ 19%]
tests/test_api.py::test_assess_tx_002911_1 PASSED                        [ 22%]
tests/test_api.py::test_assess_tx_002911_2 PASSED                        [ 25%]
tests/test_api.py::test_assess_tx_002911_3_pending_date PASSED           [ 27%]
tests/test_api.py::test_unknown_transaction_404 PASSED                   [ 30%]
tests/test_api.py::test_unknown_parcel_404 PASSED                        [ 33%]
tests/test_api.py::test_invalid_pagination_limit_negative_422 PASSED     [ 36%]
tests/test_api.py::test_invalid_pagination_limit_exceeded_422 PASSED     [ 38%]
tests/test_api.py::test_cors_headers_local_react PASSED                  [ 41%]
tests/test_api.py::test_cors_headers_vercel_preview PASSED               [ 44%]
tests/test_api.py::test_timing_middleware_header PASSED                  [ 47%]
tests/test_api.py::test_model_bundle_integrity PASSED                    [ 50%]
tests/test_api.py::test_all_five_datasets_loaded PASSED                  [ 52%]
tests/test_api.py::test_auth_login_success_and_logout PASSED             [ 55%]
tests/test_api.py::test_auth_login_invalid_password PASSED               [ 58%]
tests/test_api.py::test_auth_me_unauthenticated_defaults_to_guest PASSED [ 61%]
tests/test_api.py::test_argon2id_kdf_hashing PASSED                      [ 63%]
tests/test_api.py::test_env_administrator_provisioning PASSED            [ 66%]
tests/test_api.py::test_reviews_list_and_filter PASSED                   [ 69%]
tests/test_api.py::test_review_detail_and_patch_workflow PASSED          [ 72%]
tests/test_api.py::test_download_pdf_report_endpoint PASSED              [ 75%]
tests/test_api.py::test_rmd_audit_endpoint PASSED                        [ 77%]
tests/test_api.py::test_rmd_parcel_endpoint PASSED                       [ 80%]
tests/test_api.py::test_direct_demo_auth_endpoint PASSED                 [ 83%]
tests/test_api.py::test_public_registration_success PASSED               [ 86%]
tests/test_api.py::test_registration_duplicate_username_conflict PASSED  [ 88%]
tests/test_api.py::test_registration_password_mismatch PASSED            [ 91%]
tests/test_api.py::test_registration_reserved_username_rejected PASSED   [ 94%]
tests/test_api.py::test_guest_demo_user_cannot_mutate_reviews PASSED     [ 97%]
tests/test_api.py::test_registered_viewer_user_cannot_mutate_reviews PASSED [100%]
======================= 36 passed in 22.27s =======================
```

---

## 2. Test Case Highlights

1. **`test_public_registration_success`**:
   - Submits `name`, `username`, `email`, `role`, `password`, `confirm_password`.
   - Validates HTTP 201 status, session token issuance, and strict assignment of `viewer` role.
2. **`test_registration_duplicate_username_conflict`**:
   - Submits an identical username twice; asserts second request returns HTTP 409 Conflict.
3. **`test_registration_password_mismatch`**:
   - Submits mismatched passwords; asserts request returns HTTP 422 Unprocessable Content.
4. **`test_registration_reserved_username_rejected`**:
   - Attempts registration using `"admin"`; asserts request returns HTTP 403 Forbidden.
5. **`test_guest_demo_user_cannot_mutate_reviews`**:
   - Attempts unauthenticated `PATCH /api/reviews/{id}`; asserts HTTP 401 Unauthorized.
6. **`test_registered_viewer_user_cannot_mutate_reviews`**:
   - Registers a citizen user and attempts `PATCH /api/reviews/{id}`; asserts HTTP 403 Forbidden.

---

## 3. Frontend Quality Gates

- **`npm run typecheck`**: **0 errors** (`tsc --noEmit` passed).
- **`npm run build`**: Production bundle created cleanly in `dist/`.
- **Localization**: Verified in both Bengali (`বাংলা`) and English (`en`).
