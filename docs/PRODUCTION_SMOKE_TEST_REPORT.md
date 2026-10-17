# LANDGUARD AI — PRODUCTION SMOKE TEST REPORT

## 1. Environment & Target URLs
* **Frontend**: `https://land-guard-ai.vercel.app/`
* **Alternative Domain**: `https://land-guard-ai-ten.vercel.app/`
* **Backend**: `https://landguard-ai-backend-y2q3.onrender.com`
* **Execution Date**: 2026-10-17

---

## 2. Smoke Test Execution Results

| Endpoint / Journey | Target URL | Expected Result | Live Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Backend Health** | `GET /health` | `{"status": "ok", "models_loaded": 2, "datasets_loaded": 5}` | Verified HTTP 200 | **PASS** |
| **Dashboard Metrics** | `GET /dashboard/summary` | 3,000 parcels, 3,851 transactions | Verified HTTP 200 | **PASS** |
| **Benchmark Parcel** | `GET /parcels/LG-P-002911/history` | 3 transactions | Verified HTTP 200 | **PASS** |
| **Legacy Alias Resolution** | `GET /parcels/PARCEL-002911/history` | Maps to `LG-P-002911` | Verified HTTP 200 | **PASS** |
| **Reference Assessment 1** | `GET /assess/TX-002911-1` | `INSUFFICIENT_EVIDENCE` | Verified HTTP 200 | **PASS** |
| **Reference Assessment 2** | `GET /assess/TX-002911-2` | `REVIEW_REQUIRED` | Verified HTTP 200 | **PASS** |
| **Reference Assessment 3** | `GET /assess/TX-002911-3` | `PENDING_DATE_VERIFICATION` | Verified HTTP 200 | **PASS** |
| **Tile Endpoint Check** | Esri Dark Gray Base | HTTP 200 without watermark | Verified HTTP 200 | **PASS** |
| **Guest Demo Access** | `POST /auth/demo-login` | Token returned for read-only user | Verified HTTP 200 | **PASS** |
