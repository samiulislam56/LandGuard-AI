# LANDGUARD AI — PARCEL ID CONTRACT & ROUTING TEST REPORT

## 1. Problem Diagnosis & Origin of the Defect
* **Reported Symptom**: Accessing or clicking certain parcel links produced an error: `Record not found: PARCEL-002911` with the raw UI label `common.noData`.
* **Root Cause**:
  In [`KhasraMapPage.tsx`](file:///e:/LandGuard-AI/frontend/src/pages/KhasraMapPage.tsx) and [`SearchPage.tsx`](file:///e:/LandGuard-AI/frontend/src/pages/SearchPage.tsx), sample schematic plots had hardcoded fictional identifiers with the prefix `PARCEL-` (e.g., `PARCEL-002910` through `PARCEL-002917`), whereas the actual synthetic CSV records in `backend/data/parcels.csv` are strictly formatted with `LG-P-` prefixes (`LG-P-002910`, `LG-P-002911`, etc.).
  When users clicked Plot 102 on the Khasra map, it linked to `/parcels/PARCEL-002911`. The backend lookup failed, and the frontend rendered an unhelpful raw error state.

---

## 2. Canonical Parcel Identifier Contract
* **Canonical Format**: `LG-P-XXXXXX` (e.g., `LG-P-002911`, `LG-P-000001`, `LG-P-000104`).
* **Dataset Truth**: 3,000 synthetic parcels mapped to Divisions (Dhaka, Chattogram, Rajshahi, Khulna), Upazilas, Mouzas, and Dag plots.
* **Legacy Alias Contract**:
  - Unambiguous legacy queries prefixed with `PARCEL-` (e.g. `PARCEL-002911`) are mapped to `LG-P-002911`.
  - In the frontend, `ParcelHistoryPage.tsx` automatically resolves `PARCEL-002911` to `LG-P-002911` via `navigate(..., { replace: true })`.
  - In the backend, `/parcels/{parcel_id}/history` resolves `PARCEL-` prefixes to `LG-P-` if the candidate parcel exists in `tables["parcels"]`.
  - Genuinely nonexistent identifiers correctly return HTTP 404 without crashing or fabricating fake data.

---

## 3. Human-Centered Not Found Experience
When an unknown identifier is entered, `ParcelHistoryPage.tsx` now presents a dignified, helpful Bengali-first card:
- **Title**: `"জমির তথ্য পাওয়া যায়নি"` (Bengali) / `"Parcel Record Not Found"` (English).
- **Explanation**: `"এই আইডিতে কোনো নমুনা জমির তথ্য পাওয়া যায়নি। সঠিক দাগ নম্বর বা পার্সেল কোড দিয়ে আবার অনুসন্ধান করুন।"`.
- **Active Benchmark Links**: Clickable buttons for verified parcels: `LG-P-002911`, `LG-P-000001`, `LG-P-000002`, `LG-P-000104`.
- **Recovery Actions**: Direct buttons for "ভূমি অনুসন্ধানে ফিরে যান" (Back to Land Search) and "নমুনা পার্সেল দেখুন (LG-P-002911)".

---

## 4. Test Evidence & Automated Validation
* **Backend Pytest**:
  1. `test_parcel_history`: `GET /parcels/LG-P-002911/history` &rarr; `HTTP 200`, returns 3 chronological transactions.
  2. `test_parcel_history_legacy_alias`: `GET /parcels/PARCEL-002911/history` &rarr; `HTTP 200`, resolves to `LG-P-002911`.
  3. `test_parcel_history_not_found`: `GET /parcels/NONEXISTENT-PARCEL-9999/history` &rarr; `HTTP 404`, `"detail": "Record not found: NONEXISTENT-PARCEL-9999"`.
