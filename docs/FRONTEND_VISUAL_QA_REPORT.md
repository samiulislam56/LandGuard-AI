# LANDGUARD ATLAS — FRONTEND VISUAL QA & VERIFICATION REPORT
## End-to-End Viewport, Theme, Language, Contrast & Functional Inspection

**Document Version:** 1.0.0  
**Audit Date:** October 16, 2026  
**QA Lead:** Quality Assurance Automation Engineer & Accessibility Specialist  
**Application:** LandGuard Atlas (Cadastral Intelligence Platform)  
**Host URL:** `http://localhost:5173/`  
**Backend API:** `http://127.0.0.1:8000`  

---

## 1. Quality Assurance Objective & Scope

This report records the comprehensive visual and functional QA verification conducted on the overhauled LandGuard Atlas frontend. Every page was tested across:
- **Multiple Screen Resolutions:** Desktop, laptop, tablet, and mobile viewports.
- **Theme Combinations:** Dark Mode, Light Mode, and System synchronization.
- **Language Localization:** English (`en`) and Bengali (`bn`).
- **Contrast & Legibility:** WCAG 2.1 AA compliant text contrast ratios.
- **Live API Integration:** Real data binding from FastAPI backend.

---

## 2. Tested Viewports & Responsiveness Matrix

| Viewport Profile | Resolution | Layout Behavior | Navigation Mechanism | Inspection Result |
| :--- | :--- | :--- | :--- | :--- |
| **Large Desktop / Monitor** | 1920 × 1080 | Full command center; central map with side rail analytics; no horizontal scrolling. | Left icon rail + Top command bar | **PASSED** — Generous data spacing, high map dominance. |
| **Standard Laptop** | 1440 × 900 | High-density grid; 2D/3D map toggle centered; analytics panels stacked gracefully. | Left icon rail + Top command bar | **PASSED** — Directly mirrors Reference 3 layout. |
| **Compact Laptop** | 1366 × 768 | Map maintains min-height 520px; KPI rail wraps to 4 columns; investigation drawer overlays smoothly. | Left icon rail + Top command bar | **PASSED** — All controls accessible above the fold. |
| **Tablet / Foldable** | 768 × 1024 | Stacked layout: command bar, map viewport, metric rail, then scenario breakdown. | Collapsible sidebar / Mobile drawer | **PASSED** — Touch targets > 44px; clean spacing. |
| **Standard Mobile** | 390 × 844 (iPhone 12/13/14) | Single column scroll; map height clamped to 340px; horizontal chip scroll for district filters. | Mobile bottom drawer / Hamburger menu | **PASSED** — Finger-friendly navigation; no clipping. |
| **Compact Mobile** | 375 × 812 (iPhone Mini / SE) | Single column; compact KPI badges; accessible font sizes with line-height preservation. | Mobile bottom drawer | **PASSED** — Bengali text does not overlap or wrap destructively. |
| **Ultra-Compact Mobile** | 320 × 568 (iPhone 5 / SE 1st gen) | Minimum supported viewport; table scrolls horizontally with sticky first column. | Mobile hamburger menu | **PASSED** — No layout overflow outside viewport. |

---

## 3. Theme & Contrast Verification

Every surface and text color was evaluated using the LandGuard Atlas role tokens:

| Element / Component | Dark Mode Style | Light Mode Style | Contrast Ratio | WCAG Compliance |
| :--- | :--- | :--- | :--- | :--- |
| **Main Canvas Background** | `#07141E` | `#F3F7F8` | N/A (Canvas) | Compliant |
| **Card Surface** | `#102533` | `#FFFFFF` | N/A (Surface) | Compliant |
| **Primary Headings (`h1`, `h2`)** | `#F1F8FB` on `#102533` | `#102630` on `#FFFFFF` | > 12:1 | **WCAG AAA** |
| **Secondary Metadata (`textMuted`)** | `#AFC5CE` on `#102533` | `#526A74` on `#FFFFFF` | > 6.2:1 | **WCAG AA** |
| **Cyan Accent Buttons & Badges** | `#20C7D4` on `#102533` | `#087F77` on `#FFFFFF` | > 4.8:1 | **WCAG AA** |
| **Critical Warning Badges** | `#E46B70` on `#102533` | `#C93B41` on `#FFFFFF` | > 4.9:1 | **WCAG AA** |
| **Map Vector Overlays** | Cyan `#20C7D4` with 2px stroke | Dark Teal `#087F77` with 2px stroke | > 5:1 vs tile backdrop | **WCAG AA** |
| **Table Header Row** | `#16313E` with `#AFC5CE` | `#E9F1F3` with `#526A74` | > 5.5:1 | **WCAG AA** |

*Result:* **Zero white-on-white or dark-on-dark contrast failures.** Light mode displays crisp dark slate typography on paper white; dark mode presents luminous signal accents on midnight blue.

---

## 4. Bilingual Localization (i18n) QA

- **Language Switching Mechanism:** Instant re-render via `useTranslation()` upon clicking language pill (`EN | বাংলা`) in Navbar or selecting preferred language in Settings. No full page reload required.
- **Font Rendering:**
  - English strings render in `Manrope` with tabular figures from `IBM Plex Mono`.
  - Bengali strings render in `Noto Sans Bengali` with explicit line-heights (`leading-relaxed` / `1.6`) to prevent vowel diacritic clipping (`ikar`, `ukar`, `hoshonto`).
- **Translation Completeness:**
  - Navigation links (Sidebar, Navbar, Mobile Drawer): 100% translated.
  - KPI metric labels and units: 100% translated.
  - Scenario distribution names: 100% translated.
  - 8 Divisions and 64 Districts: 100% translated with verified Bengali spellings.
  - AI Assessment status explanations: 100% translated.
  - Synthetic data disclaimer: 100% translated.
  - **Zero raw translation keys (`{{key}}` or `missing_key`) visible in the interface.**

---

## 5. Route-by-Route Visual & Functional Audit

### 5.1 Dashboard (`/`)
- **Visual Composition:** Visually mirrors Reference Screenshot 3. Map is the central hero element with ambient depth.
- **2D/3D Mode Switcher:** Switching to "3D Explorer" renders interactive Three.js procedural parcel scene seamlessly.
- **Cascading Filters:** Selecting "Dhaka" filters districts to Dhaka, Gazipur, Narayanganj, etc. Selecting a non-covered district like "Bagerhat" displays honest coverage notice: *"No synthetic records available in Dataset v1.1"*.
- **Investigation Drawer:** Clicking any recent transaction opens the slide-out drawer displaying deed attributes, evidence indicators, and direct link to audit.

### 5.2 Transaction Explorer (`/transactions`)
- **View Modes:** Table View, Split View (Table + Map), and Full Map View work smoothly.
- **Data Grid:** Displays Deed ID, Parcel ID, Date, Seller Alias, Buyer Alias, Transferred Area, Claimed Share, and Scenario Badge.
- **Search & Filters:** Real-time search filters items by transaction ID or parcel ID without UI lag.

### 5.3 Transaction Detail Dossier (`/transactions/:id`)
- **Header:** Transaction ID with scenario badge and direct audit navigation button.
- **Metadata Cards:** Conveyance attributes, official registration status, prior deed presence, and resale evidence flags.
- **Forensic Indicators Checklist:** Displays green checkmarks for clear rules and red warnings for flagged anomalies.
- **Plot Spatial Bounds:** Mini cadastral map shows the exact parcel boundary geometry.

### 5.4 Parcel Intelligence Dossier (`/parcels/:id`)
- **Cadastral Metric Cards:** District, Upazila, Mouza, JL Number, Dag Number, Khatian Number, and Recorded Acreage.
- **2D / 3D Plot Viewport:** Allows toggling between Leaflet cadastral boundary and Three.js 3D parcel plot.
- **Asset Network Graph:** SVG interactive deed lineage graph linking Grantor -> Grantee nodes across registered conveyances.
- **Ascending Chronology Timeline:** Numbered conveyance sequence with pulsating indicators on double-selling events.

### 5.5 AI Assessment Workspace (`/assess/:id`)
- **Dual-Model Breakdown:**
  - *Random Forest Classifier:* Displays prediction (`REVIEW_REQUIRED` / `NO_REVIEW_FLAG_DETECTED`), tree count (200), and ground-truth features.
  - *Isolation Forest Anomaly:* Displays status (`ANOMALY_DETECTED` / `NORMAL`) and standardized decision score.
- **Evidence Findings & Warnings:** Structured forensic findings checklist detailing missing records or timeline discrepancies.
- **Benchmark Presets:** Direct quick-switch buttons for AC-04 reference test cases:
  - `TX-002911-1` → `INSUFFICIENT_EVIDENCE` (Missing evidence, historical claim)
  - `TX-002911-2` → `REVIEW_REQUIRED` (Conflicting double sale, concurrent claim)
  - `TX-002911-3` → `PENDING_DATE_VERIFICATION` (Future deed event date relative to reference date)

### 5.6 3D Cadastral Explorer (`/explorer-3d`)
- Dedicated full-height interactive 3D scene.
- Elevated plot geometries with color-coded scenario heights.
- Smooth mouse orbit, pan, and zoom controls.
- Reset camera button restores canonical 45° perspective.
- Fullscreen button maximizes workspace.
- Clear conceptual disclaimer badge and legend.
- Graceful WebGL error fallback tested and verified.

### 5.7 Review Queue Workspace (`/review`)
- Structured triage table of unreviewed cases from synthetic baseline datasets.
- Explicit SRS v1.1 architectural boundary callout notifying users that mutable database operations (`PATCH /review-cases/:id`) are scheduled for future backend migration.

### 5.8 Audit Dossier Reports (`/reports`)
- Printable on-screen forensic report preview.
- Includes report header, model scores, evidence verification findings, administrative warnings, and mandatory synthetic disclaimer.
- `@media print` stylesheet verified via `window.print()` trigger.

### 5.9 Workspace Settings (`/settings`)
- Immediate language switcher (`English` vs `বাংলা`).
- 3-mode theme selector (`Dark Mode`, `Light Mode`, `System Synced`).
- WCAG motion controls (`Smooth Motion` vs `Reduced Motion`).
- Real-time FastAPI connectivity card displaying base URL, status (Operational HTTP 200), models loaded (2), and datasets loaded (5).

---

## 6. Ground-Truth Assessment Cases Verification

Using the standard reference assessment date `2026-10-15`, all three reference benchmark cases were validated against live backend responses:

| Transaction ID | Expected Final Status | Actual Live Output | RF Prediction | IsoForest Status | Evidence Findings |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`TX-002911-1`** | `INSUFFICIENT_EVIDENCE` | `INSUFFICIENT_EVIDENCE` | `REVIEW_REQUIRED` | `ANOMALY_DETECTED` | Missing chain evidence, lack of registered deed documentation. |
| **`TX-002911-2`** | `REVIEW_REQUIRED` | `REVIEW_REQUIRED` | `REVIEW_REQUIRED` | `ANOMALY_DETECTED` | Competing title claim, concurrent transaction on same parcel. |
| **`TX-002911-3`** | `PENDING_DATE_VERIFICATION` | `PENDING_DATE_VERIFICATION` | `NO_REVIEW_FLAG_DETECTED` | `NORMAL` | Event date occurs after configured assessment date `2026-10-15`. |

*Result:* **100% adherence to deterministic assessment policy.**

---

## 7. QA Sign-Off

The LandGuard Atlas frontend satisfies all functional, visual, accessibility, and architectural criteria outlined in the Master Redesign Prompt. Zero release-blocking defects remain.
