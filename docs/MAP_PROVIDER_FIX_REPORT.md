# Cadastral & Geographic Map Provider Fix Report

**File Reference:** `frontend/src/components/gis/CadastralMap.tsx`, `frontend/src/pages/KhasraMapPage.tsx`  
**Date:** October 17, 2026  

---

## 1. Problem Statement: The "API KEY REQUIRED" Watermark & Missing Tiles

### Root Cause Analysis:
1. In previous builds, the Geographic Map component utilized CartoDB Dark Matter / Basemaps CDN (`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`).
2. CartoDB tightened their public rate-limits and required domain-restricted API tokens for high-resolution tile fetching, resulting in broken tile images, 404 responses, and unsightly "API KEY REQUIRED" overlay text on zoom levels 15–18.
3. Furthermore, when users zoomed in to inspect individual land parcels (zoom level 17–18), Leaflet requested zoom levels beyond the native LOD (Level of Detail) of many providers, causing missing tile grids.

---

## 2. Technical Solution: Keyless Esri Dark Canvas with Client-Side Upscaling

### 1. Migrated to Esri ArcGIS Keyless Dark Canvas:
Selected Esri's high-reliability ArcGIS Online World Dark Gray Base:
- Tile URL: `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`
- Zero API key required, highly available worldwide CDN, perfect aesthetic match for LandTech dark mode.

### 2. Configured `maxNativeZoom` and `maxZoom` for High Zoom Inspection:
Esri Dark Canvas provides tiles up to zoom level 16 natively. To allow users to zoom in to zoom 17 or 18 without tile 404s, we configured Leaflet's `maxNativeZoom`:
```typescript
{
  id: "midnight",
  name: "মিডনাইট মোড (Midnight)",
  url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
  attribution: "&copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
  maxZoom: 18,
  maxNativeZoom: 16
}
```
With `maxNativeZoom: 16`, Leaflet automatically takes zoom 16 tiles and scales them up smoothly using CSS transforms for zoom 17 and 18, eliminating 404 network requests entirely.

### 3. Graceful Error Handling Fallback:
Added tile error listener that gracefully swaps failed tiles or retains adjacent cached tiles rather than showing grey missing squares.
