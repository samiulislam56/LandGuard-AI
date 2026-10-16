# LANDGUARD ATLAS — FRONTEND ROOT CAUSE AUDIT & CODEBASE INSPECTION REPORT

**Document Version:** 1.0.0  
**Audit Date:** October 16, 2026  
**Auditor:** Principal Frontend Architect & UI/UX Design Director  
**Platform:** LandGuard AI — Cadastral Intelligence Platform  
**Target Reference:** Reference Screenshot 3 (`media_1792083884236.png` — "God Mode" Geospatial Command Center)  

---

## 1. Executive Summary

This comprehensive audit inspects every file, component, token, route, style, dependency, and API contract in `frontend/src`. The objective is to identify all architectural, visual, layout, contrast, interaction, internationalization, and 3D rendering defects before executing the ultimate master redesign.

Previous iterations attempted superficial patches. This audit isolates the deep systemic causes across 12 distinct functional areas, defining verified corrections and verification criteria.

---

## 2. Comprehensive Root Cause Matrix

| Category | Component / File | Root Cause | Visible Impact | Proposed Architectural Correction | Verification Method |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Typography & Contrast** | `tokens.css`, `index.css`, all pages | Hardcoded Tailwind utility classes (e.g. `text-white`) without semantic dark-mode tokens; generic system font fallback. | In light theme, text becomes white on white surfaces; in dark theme, some card labels lacked contrast; Bengali text clipped line-height. | Implement role-based CSS variables using the recommended palette (`#07141E`, `#102533`, `#20C7D4` in dark; `#F3F7F8`, `#FFFFFF`, `#087F77` in light). Load `Manrope` for English, `Noto Sans Bengali` for Bengali, and `IBM Plex Mono` for cadastral IDs. | Computed style contrast ratio check (>4.5:1 for normal text, >7:1 for headers). |
| **Hero & Information Density** | `DashboardPage.tsx` | Legacy SaaS layout retained an oversized marketing banner (280px height) with low functional density. | Pushed the map below the fold on standard laptop screens (1366x768) and broke visual similarity with Reference 3. | Replaced hero banner with a high-density **Geospatial Command Strip** featuring administrative cascading filters, scenario pills, and temporal indicators. | Viewport height measurement at 1366px and 1440px desktop resolutions. |
| **Map Rendering & Boundaries** | `CadastralMap.tsx` | Leaflet initialized before CSS grid container dimensions settled; Esri World Imagery requested at zoom > 18 returned HTTP 404. | Gray blank tile sectors; missing tile edges upon container resize; broken tile 404 console errors. | Attached `ResizeObserver` calling `map.invalidateSize()`; clamped tile providers to `maxNativeZoom: 18`; added graceful fallback state for tile network drops. | Resize browser window, switch tabs, toggle fullscreen, monitor network tab. |
| **Administrative Hierarchy** | `bangladeshAdmin.ts`, `CadastralMap.tsx`, `DashboardPage.tsx` | Hardcoded 4 districts without national administrative context or Bengali nomenclature. | Users could not explore all 8 divisions or 64 districts; no cascading division-to-district filter. | Implemented complete 8-division, 64-district dataset with English and Bengali labels, centroids, zoom levels, and explicit synthetic coverage flags (`hasSyntheticCoverage`). | Cascade test through all 8 divisions and verify that the 60 non-covered districts display honest "No Data" notices. |
| **Internationalization (i18n)** | All pages, components, and navigation | User-facing strings hardcoded in English throughout JSX; no language toggle or localization context. | Zero Bengali language capability; international auditors and local land officers unable to use the native script. | Configure `i18next` and `react-i18next` with `frontend/src/locales/en.json` and `frontend/src/locales/bn.json`; build language switcher in top bar; translate all user-facing labels, buttons, statuses, and disclaimers. | Language switch toggle test; verify immediate DOM text updates without page reload in both Dark and Light themes. |
| **3D Geospatial Visualization** | New feature requirement | Lack of spatial 3D parcel depth or interactive deed relationship topology. | Cadastral plots perceived solely as flat 2D maps without intuitive elevation or deed lineage inspection. | Build an interactive **3D Cadastral Parcel Explorer** using React Three Fiber (`@react-three/fiber@8.17.10`) and Three.js (`three@0.160.0`), featuring procedural elevated land blocks, boundary lines, camera orbit controls, hover selection, connection arcs, and WebGL error fallback. | WebGL canvas render test; verify rotation, zoom, selection feedback, and WebGL fallback on unsupported environments. |
| **Theme System & State** | `ThemeContext.tsx`, `Navbar.tsx`, `SettingsPage.tsx` | Incomplete theme state synchronization across nested cards; theme flash on reload. | Switching between Light, Dark, and System modes caused mismatched card backgrounds and text colors. | Re-engineer `ThemeContext.tsx` with `localStorage` persistence, explicit `.dark` class binding on `document.documentElement`, and role-based variables for cards, tables, maps, and 3D overlays. | Theme toggle test in Navbar and Settings across all 8 routes in both Dark and Light modes. |
| **Transaction Explorer** | `TransactionsPage.tsx` | Static table styling lacked geospatial synchronization, split view, and responsive mobile drawers. | High cognitive friction when investigating multi-party sales across large datasets. | Rebuild with unified LandGuard Atlas visual system: filter strip, split-view mode (Table + Cadastral Map), scenario badges, pagination, and direct links to `/assess/:id`. | Test pagination, search debouncing, scenario filtering, and split-screen mode on desktop and mobile. |
| **AI Assessment Workspace** | `AssessmentPage.tsx` | Dense unformatted text for evidence findings; dual-model outputs (RF vs IF) lacked visual hierarchy. | Auditors could not easily distinguish between machine learning anomaly signals and rule-based evidence discrepancies. | Structure page into clear forensic sections: Executive Status Pill, Dual-Model Engine Breakdown (Random Forest probability vs Isolation Forest decision score), Evidence Discrepancy Matrix, and Human Review Guidance. | Verify ground-truth test cases (`TX-002911-1`, `TX-002911-2`, `TX-002911-3`) against configured assessment date (`2026-10-15`). |
| **Parcel Intelligence & History** | `ParcelHistoryPage.tsx` | Disjointed parcel metadata; timeline lacked deed connection lines and scenario-coded nodes. | Difficulty visualizing chain of title and identifying where conflicting double-sales entered the registry. | Rebuild with high-contrast parcel metadata card, integrated `CadastralMap` plot framing, interactive `AssetNetworkGraph` deed topology, and chronological deed timeline. | Inspect parcel `LG-P-002911` with its 3 conveyances and verify node interactivity. |
| **Review Workspace & Reports** | `ReviewQueuePage.tsx`, `ReportsPage.tsx` | Inconsistent card borders; unclear state regarding backend mutation capabilities; reports lacked print CSS. | Confusion about mutable review actions; printing produced broken multi-column layouts. | Add clear SRS v1.1 architectural boundary banners explaining read-only demonstration queue; implement high-fidelity printable audit report with clean `@media print` stylesheets. | Trigger `window.print()` and verify print preview styling. |
| **Accessibility (WCAG 2.1 AA)** | All UI components | Missing focus-visible rings; unlabelled icon buttons; interactive elements lacking unique IDs. | Keyboard-only users and screen readers unable to navigate or operate map controls and filters. | Add `:focus-visible` outline rings with `--focus-ring` token; assign `aria-label` and `title` to all icon buttons; maintain proper heading hierarchy (`h1` -> `h2` -> `h3`). | Keyboard Tab navigation walkthrough; screen reader element hierarchy audit. |

---

## 3. Detailed Component-by-Component Defect Inventory

### 3.1 `CadastralMap.tsx`
* **Defect 1:** Container size invalidation bug during initial mount or tab switch.
  * *Root Cause:* Leaflet renders before CSS grid/flex calculates final pixel height/width.
  * *Fix:* Implement `ResizeObserver` observing the container element, calling `map.invalidateSize()`.
* **Defect 2:** Satellite imagery 404 errors at zoom > 18.
  * *Root Cause:* Esri World Imagery does not publish tiles beyond zoom 18 in certain regions of Bangladesh.
  * *Fix:* Constrain `maxNativeZoom: 18` across all tile layers.
* **Defect 3:** Floating property summary text contrast.
  * *Root Cause:* Hardcoded dark text inside floating card rendered on dark basemaps.
  * *Fix:* Enforce role-based high-contrast typography (`text-slate-100`, `text-slate-300`, `text-cadastral-teal`).

### 3.2 `DashboardPage.tsx`
* **Defect 1:** Layout proportion disparity with Reference 3.
  * *Root Cause:* Excessive empty space in hero section; widgets scattered across cards instead of unified command center layout.
  * *Fix:* Recreate Reference 3 layout: Top search & filter bar, 8-col dominant map + 4-col right investigation dossier, 4 compact bottom KPI cards, live transaction table with CSV export, and scenario distribution bar chart.
* **Defect 2:** Missing CSV export.
  * *Root Cause:* Buttons existed in UI mockups without functional data export handlers.
  * *Fix:* Implement client-side CSV generator compiling active transaction records with proper MIME headers and download triggering.

### 3.3 `TransactionsPage.tsx`
* **Defect 1:** Disconnected table and map views.
  * *Root Cause:* Map and table rendered independently without cross-highlighting.
  * *Fix:* Introduce tri-state View Mode switcher (`Table`, `Split View`, `Map Only`) with reactive parcel polygon generation for selected table rows.

### 3.4 `AssessmentPage.tsx`
* **Defect 1:** Lack of explanatory visual indicators for ML model discordance.
  * *Root Cause:* When Random Forest predicted `NO_REVIEW_FLAG_DETECTED` but evidence verification flagged findings, no discrepancy warning was displayed.
  * *Fix:* Introduce Discrepancy Indicator card highlighting conflicts between heuristic evidence verification and statistical classification.

### 3.5 Global Design Tokens & Typography
* **Defect 1:** System font inconsistency and Bengali glyph clipping.
  * *Root Cause:* Relying on browser default sans-serif font resulted in mismatched line-heights for complex Bengali conjunct characters.
  * *Fix:* Import Google Fonts for `Manrope` (display/body English), `Noto Sans Bengali` (display/body Bengali), and `IBM Plex Mono` (identifiers). Set line-height to 1.5 for Bengali text to avoid ascender/descender clipping.

---

## 4. Remediation Plan & Execution Roadmap

1. **Step 1: Design Tokens & Typography Integration**
   - Update `tokens.css` with dark (`#07141E`, `#102533`, `#20C7D4`) and light (`#F3F7F8`, `#FFFFFF`, `#087F77`) palettes.
   - Configure `@import` for Manrope, Noto Sans Bengali, and IBM Plex Mono in `index.html` and `index.css`.
2. **Step 2: Internationalization Engine Setup**
   - Create `frontend/src/i18n.ts` initializing `i18next` and `react-i18next`.
   - Author complete translation dictionaries: `frontend/src/locales/en.json` and `frontend/src/locales/bn.json`.
   - Add language switcher pill to `Navbar.tsx` and `SettingsPage.tsx`.
3. **Step 3: Interactive 3D Cadastral Parcel Explorer**
   - Implement `frontend/src/components/gis/Cadastral3DExplorer.tsx` using `@react-three/fiber` and `three`.
   - Build procedural 3D land plot meshes, boundary lines, orbital camera controls, parcel raycast selection, lighting, and WebGL error fallback.
4. **Step 4: Geospatial Dashboard Overhaul (Reference 3 Alignment)**
   - Wire all administrative selectors (8 divisions, 64 districts) and scenario filters into `DashboardPage.tsx`.
   - Embed dominant Leaflet map, right investigation dossier, real KPI metrics, and results table with CSV export.
5. **Step 5: Application-Wide Route Polish**
   - Overhaul `TransactionsPage.tsx`, `TransactionDetailPage.tsx`, `AssessmentPage.tsx`, `ParcelHistoryPage.tsx`, `ReviewQueuePage.tsx`, `ReportsPage.tsx`, and `SettingsPage.tsx`.
   - Ensure all routes use i18n hooks, support dark/light themes, and respect responsive viewports.
6. **Step 6: Quality Gates & Verification**
   - Run `npm run typecheck`, `npm run lint`, and `npm run build`.
   - Verify live API endpoints (`GET /health`, `GET /dashboard/summary`, `GET /transactions`).
   - Run backend `pytest` suite.
   - Produce comprehensive documentation reports.

---

*This audit document serves as the binding baseline for all subsequent Stage 3C master implementations.*
