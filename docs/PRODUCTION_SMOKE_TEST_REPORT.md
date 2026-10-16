# LANDGUARD ATLAS — PRODUCTION SMOKE TEST REPORT

**Document Version:** 1.0.0  
**Date:** October 16, 2026  
**QA Lead:** Quality Assurance Automation Engineer  
**Scope:** Pre-Deployment & Production Smoke Testing Matrix  

---

## 1. Test Execution Summary

| Smoke Test Category | Test Steps | Expected Outcome | Verification Status |
| :--- | :--- | :--- | :--- |
| **1. Application Boot & CDN** | Request root URL `/` on production host | HTTP 200, HTML document loads with `<title>LandGuard Atlas` and all asset bundles | **PASSED** |
| **2. API Connectivity** | Request `/health` on deployed backend | HTTP 200 `{"status":"ok","models_loaded":2,"datasets_loaded":5}` | **PASSED** |
| **3. Cadastral Dashboard** | Load `/` with default Dhaka framing | Central Leaflet map renders without gray tiles; KPI rail shows 3,000 plots and 4,200 transactions | **PASSED** |
| **4. 3D WebGL Explorer** | Click "3D Explorer" tab in Dashboard | Three.js scene initializes with elevated parcel blocks, camera orbit damping, and conceptual disclaimer | **PASSED** |
| **5. Cascading Geography** | Select Division "Chattogram", then District "Chattogram" | Centroid centers over Chattogram cadastral plots; unpopulated districts display honest "No Data" badge | **PASSED** |
| **6. Transaction Grid** | Navigate to `/transactions`, toggle Split View | Table and synchronized vector plot map render side-by-side with working pagination | **PASSED** |
| **7. Deed Detail Dossier** | Navigate to `/transactions/TX-002911-2` | Displays deed attributes, grantor/grantee aliases, and synthetic indicator flags | **PASSED** |
| **8. Chain of Title** | Navigate to `/parcels/LG-P-002911` | Topology graph and ascending 3-deed timeline render with conflict markers | **PASSED** |
| **9. Dual-Model Assessment** | Navigate to `/assess/TX-002911-2` | Returns `REVIEW_REQUIRED`, Random Forest prediction, Isolation Forest score, and evidence discrepancy findings | **PASSED** |
| **10. Bilingual Switcher** | Toggle `বাংলা` in Top Command Bar | All labels, metrics, and navigation immediately update to Bengali script with no clipped characters | **PASSED** |
| **11. Theme Switcher** | Switch between Dark, Light, and System | CSS variables update role tokens; high contrast preserved (>4.5:1 / >12:1) across both themes | **PASSED** |
| **12. SPA Refresh Routing** | Hard refresh on `/parcels/LG-P-002911` | Vercel rewrites route to `index.html`; React Router mounts detail page cleanly without 404 | **PASSED** |
| **13. Mobile Responsiveness** | Viewport resized to 390×844 | Layout collapses into single column, map clamped to 340px, mobile drawer operable | **PASSED** |

---

## 2. Benchmark Case Verification Results

Live backend outputs verified against configured assessment date `2026-10-15`:

| Case ID | Deterministic Tier | Result | Verification Notes |
| :--- | :--- | :--- | :--- |
| `TX-002911-1` | Evidence Verification Check | `INSUFFICIENT_EVIDENCE` | Verified missing registration chain records. |
| `TX-002911-2` | Competing Claim Rule | `REVIEW_REQUIRED` | Verified concurrent conveyance on same cadastral parcel. |
| `TX-002911-3` | Assessment Reference Date | `PENDING_DATE_VERIFICATION` | Verified transaction date occurs in future relative to assessment date. |

---

## 3. QA Sign-Off

The application demonstrates 100% smoke test pass rate across all functional, visual, and API boundaries.
