# LANDGUARD AI — COMPLETE BUG AUDIT & ROOT-CAUSE ANALYSIS

## 1. Executive Summary
This document records the exhaustive audit of all frontend and backend modules in the LandGuard AI system. Every defect identified has been traced to its exact source line, reproduction steps, network behavior, and required remediation.

---

## 2. Comprehensive Issue Matrix

### Issue 1: Midnight Map Layer Rendering "API KEY REQUIRED" Watermark
* **Severity**: **Critical** (Map unusable, blocks cadastral visual inspection)
* **Affected Files**: [`frontend/src/components/gis/CadastralMap.tsx`](file:///e:/LandGuard-AI/frontend/src/components/gis/CadastralMap.tsx)
* **Reproduction Steps**:
  1. Navigate to `/khasra-map` or open any cadastral map view.
  2. Select the "Midnight" layer.
  3. Map tiles load with repeated diagonal "API KEY REQUIRED" watermarks and black tiles.
* **Root Cause**:
  The tile layer endpoint was previously configured using an endpoint requiring an API key or unauthenticated domain blocking. Even CartoDB has increasingly rate-limited and deprecated anonymous CDN access for external domains.
* **Network Behavior**: Tile requests either returned 401/403 or generated dynamically watermarked raster images from the tile provider.
* **Required Fix**:
  Replace the Midnight layer with an official, open, keyless, high-reliability dark basemap: **Esri World Dark Gray Base** (`https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`). This endpoint provides zero-watermark, highly stable dark cartography with appropriate attribution.
* **Verification**: Real-browser visual inspection confirming clean tiles with zero watermarks.

---

### Issue 2: Parcel ID / Record Not Found Bug (`PARCEL-002911` vs `LG-P-002911`)
* **Severity**: **Critical** (Blocks parcel dossier and transaction history)
* **Affected Files**:
  * [`frontend/src/pages/KhasraMapPage.tsx`](file:///e:/LandGuard-AI/frontend/src/pages/KhasraMapPage.tsx) (Lines 31–38)
  * [`frontend/src/pages/SearchPage.tsx`](file:///e:/LandGuard-AI/frontend/src/pages/SearchPage.tsx) (Lines 142–145, 302)
  * [`frontend/src/pages/ParcelHistoryPage.tsx`](file:///e:/LandGuard-AI/frontend/src/pages/ParcelHistoryPage.tsx) (Error state & alias handling)
  * [`frontend/src/locales/bn.json`](file:///e:/LandGuard-AI/frontend/src/locales/bn.json) & [`en.json`](file:///e:/LandGuard-AI/frontend/src/locales/en.json)
  * [`backend/app/main.py`](file:///e:/LandGuard-AI/backend/app/main.py) (`/parcels/{parcel_id}/history`)
* **Reproduction Steps**:
  1. Open Digital Khasra Map (`/khasra-map`).
  2. Click on Plot 102.
  3. Click "সম্পূর্ণ দলিল ইতিহাস" (Deed History).
  4. URL navigates to `/parcels/PARCEL-002911`.
  5. Page renders `Record not found: PARCEL-002911`.
* **Root Cause**:
  `KhasraMapPage.tsx` and `SearchPage.tsx` hardcoded fictional `PARCEL-` prefixes (e.g. `PARCEL-002910` to `PARCEL-002917`), whereas the actual synthetic dataset (`backend/data/parcels.csv`) exclusively uses `LG-P-002911` through `LG-P-002917`. Furthermore, no alias resolution existed to canonicalize legacy `PARCEL-` queries to `LG-P-`.
* **Network Behavior**:
  `GET https://.../parcels/PARCEL-002911/history` returned HTTP 404: `{"detail": "Record not found: PARCEL-002911"}`.
* **Required Fix**:
  1. Update `KhasraMapPage.tsx` and `SearchPage.tsx` to use canonical identifiers (`LG-P-002910`, `LG-P-002911`, etc.).
  2. Implement canonical alias resolver in `ParcelHistoryPage.tsx`: if given `PARCEL-002911`, unambiguously map to `LG-P-002911` and update the route.
  3. In `backend/app/main.py`, allow unambiguous `PARCEL-` aliases to resolve to `LG-P-` if the target parcel exists in the dataset.
  4. Redesign the Not Found UI with helpful Bengali messaging: `"এই আইডিতে কোনো নমুনা জমির তথ্য পাওয়া যায়নি।"` with search suggestions, clear input, and valid benchmark links.

---

### Issue 3: Raw Translation Keys Leaking into User Interface (`common.noData`, `nav.parcelIntelligence`)
* **Severity**: **High** (Violates release quality standards; displays raw code strings)
* **Affected Files**:
  * [`frontend/src/pages/ParcelHistoryPage.tsx`](file:///e:/LandGuard-AI/frontend/src/pages/ParcelHistoryPage.tsx) (Lines 92, 133)
  * [`frontend/src/locales/en.json`](file:///e:/LandGuard-AI/frontend/src/locales/en.json)
  * [`frontend/src/locales/bn.json`](file:///e:/LandGuard-AI/frontend/src/locales/bn.json)
  * [`frontend/src/i18n.ts`](file:///e:/LandGuard-AI/frontend/src/i18n.ts)
* **Reproduction Steps**:
  1. Navigate to `/parcels/invalid-id` or inspect header breadcrumbs.
  2. Observe `nav.parcelIntelligence` and `common.noData` printed directly on the page.
* **Root Cause**:
  Keys `common.noData`, `nav.parcelIntelligence`, `nav.reviewWorkspace`, `dossier.chainOfTitle`, etc., were invoked with `t()` but omitted from `locales/en.json` and `locales/bn.json`. Additionally, `i18n.ts` had no `parseMissingKeyHandler` to prevent raw keys from leaking if undefined.
* **Required Fix**:
  1. Add complete Bengali and English definitions for all 26 identified missing keys.
  2. Configure `parseMissingKeyHandler` in `i18n.ts` to transform any unexpected missing key into clean human-readable text.

---

### Issue 4: Navigation Links using Outdated Aliases in Search Suggestions
* **Severity**: **Medium**
* **Affected Files**: [`frontend/src/pages/SearchPage.tsx`](file:///e:/LandGuard-AI/frontend/src/pages/SearchPage.tsx)
* **Root Cause**: Benchmark search suggestions displayed `PARCEL-000104`, `PARCEL-001420`, etc.
* **Required Fix**: Align all sample search items and placeholders to canonical `LG-P-` format.

---

### Issue 5: Contrast and Theme Readability on Map Overlay Cards
* **Severity**: **Medium**
* **Affected Files**: [`frontend/src/components/gis/CadastralMap.tsx`](file:///e:/LandGuard-AI/frontend/src/components/gis/CadastralMap.tsx)
* **Root Cause**: Dark mode floating dossiers had subtle cyan borders that lacked contrast on deep green backgrounds.
* **Required Fix**: Apply Greenfield botanical luxury tokens (`#062B22`, `#0E8D60`, `#C4E8A5`, `#D7B677`) with explicit WCAG AAA contrast ratios.
