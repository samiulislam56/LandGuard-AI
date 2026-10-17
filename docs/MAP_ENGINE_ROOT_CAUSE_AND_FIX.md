# LANDGUARD AI — MAP ENGINE ROOT CAUSE AND FIX REPORT

## 1. Issue Summary
* **Reported Defect**: In the Leaflet Cadastral Map (`CadastralMap.tsx`), selecting the **Midnight** layer rendered a dark map with repeated diagonal watermarks: `"API KEY REQUIRED"`. The map was unreadable and failed user experience standards.
* **Component**: [`frontend/src/components/gis/CadastralMap.tsx`](file:///e:/LandGuard-AI/frontend/src/components/gis/CadastralMap.tsx)

---

## 2. Root Cause Analysis
1. **Tile Provider Policy Change**:
   The tile layer was previously querying endpoints (such as unauthenticated CartoDB or Stadia Maps Alidade Smooth Dark) that require account credentials or origin whitelisting. Modern CDNs return watermarked raster image tiles when unauthenticated traffic exceeds quotas or originates from non-registered domains.
2. **Missing Key Handling**:
   The previous configuration had no fallback to legitimate keyless tile services and did not gracefully catch watermarked imagery.

---

## 3. Mandatory Engineering Fix
1. **Replacement with Keyless Open GIS Provider**:
   Replaced the unauthorized tile endpoint with **Esri World Dark Gray Base**:
   - **URL**: `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`
   - **Attribution**: `&copy; Esri &mdash; Esri, DeLorme, NAVTEQ`
   - **Features**: Zero watermarks, zero API key required, high-contrast dark cartography ideal for cadastral polygon overlays.
2. **Supported & Functional Map Layers**:
   - **Midnight GIS (`midnight`)**: Esri World Dark Gray Base (Clean dark basemap, zero watermark).
   - **Satellite Imagery (`satellite`)**: Esri World Imagery (`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`).
   - **Survey Map (`survey`)**: OpenStreetMap Standard (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`).
3. **Graceful Network & Error Handling**:
   - Attached Leaflet `tileerror` listener to count network failures and activate the offline cadastral vector fallback notice.
   - Preserved `ResizeObserver` to invalidate map size automatically when the viewport or sidebar resizes.
4. **Bilingual Navigation**:
   Layer buttons now utilize `t('map.midnight', 'মিডনাইট')`, `t('map.satellite', 'স্যাটেলাইট')`, and `t('map.survey', 'সার্ভে')` with Greenfield botanical styling.

---

## 4. Verification Evidence
* **Direct Tile Endpoint Test**:
  Executed HTTP GET against `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/7/56/96`:
  - **HTTP Status**: `200 OK`
  - **Content-Type**: `image/jpeg`
  - **Tile Size**: 3,416 bytes
  - **Watermark Check**: Clean tile with no "API KEY REQUIRED" text.
