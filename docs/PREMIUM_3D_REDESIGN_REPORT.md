# LANDGUARD GREENFIELD — PREMIUM 3D REDESIGN & UI/UX MASTER ARCHITECTURE REPORT

## 1. Executive Summary & Brand Identity
**LandGuard AI** has been transformed into **LANDGUARD GREENFIELD: IMMERSIVE LAND INTELLIGENCE**, combining botanical luxury, modern land-tech cartography, and cinematic interactive 3D spatial models. The design delivers a dignified, accessible, Bengali-first experience tailored for Bangladeshi landholders, farmers, researchers, and land officers.

### Color Tokens & Botanical Luxury Palette
| Token Name | Hex Code | Purpose & Accessibility |
| :--- | :--- | :--- |
| **Deep Forest** | `#062B22` | Hero background, dark surface, deep card contrast |
| **Forest Dark** | `#031813` | Canvas clear color, footer, high-contrast dark foundation |
| **Greenfield Emerald** | `#0E8D60` | Primary buttons, clean parcel indicators, brand highlights |
| **Leaf Mint** | `#C4E8A5` | Interactive hover rings, plot boundary highlights, active badges |
| **Warm Gold** | `#D7B677` | Discrepancy/mismatch indicators, area tags, premium accents |
| **Ivory Light** | `#F5F8F2` | Light mode background, clean high-contrast text |
| **Ivory Muted** | `#E2EBE5` | Light surface borders, secondary badges |

---

## 2. Cinematic 3D Homepage Hero (`HeroLandModel3D.tsx`)
Mounted on the right column of the landing page hero, the 3D miniature land model introduces a distinctive spatial identity while respecting mobile performance:
- **Procedural Agricultural Plots**: 4 interactive parcels (**দাগ ১০১**, **১০২**, **১০৩**, **১০৪**) with varying elevations and lush vegetation-themed hues.
- **Micro-Interactions**: Hover elevation dampening, floating 3D Bengali Dag number text labels, and cadastral boundary outlines (`#C4E8A5` and `#D7B677`).
- **Parallax & Camera Controls**: Controlled smooth rotation with soft mouse parallax and natural directional sunlight + ambient illumination.
- **Mandatory Ethical Cadastral Disclaimer**: Floating pill badge permanently displayed:
  > *"ধারণামূলক ত্রিমাত্রিক মডেল — সরকারি জরিপ নয়"*
- **Plot Inspection Overlay**: Hovering or selecting a parcel displays instant acreage, land type, and boundary status in the bottom-left glass card.
- **Static Fallback & ErrorBoundary**: WebGL fallback for low-end mobile devices and users with `prefers-reduced-motion`.

---

## 3. Dedicated 3D Parcel Explorer (`Cadastral3DExplorer.tsx` & `Explorer3DPage.tsx`)
- **Numbered Conceptual Cadastral Blocks**: Color-coded blocks for clean parcels (`#0E8D60`), conflicting double-sales (`#EF4444`), and area/mutation mismatches (`#D7B677`).
- **Conflict Deed Arcs**: 3D quadratic bezier curve visualizing conflicting transactions between parcels (e.g., `TX-002911-2`).
- **Camera Tools**: Smooth orbit, zoom dampening, and one-click camera view reset (`ক্যামেরা রিসেট`).
- **Floating Parcel Dossier**: Real-time inspection drawer with quick navigation shortcuts to full forensic dossier (`/parcels/:id`) and AI screening assessment (`/assess/:txId`).
- **Required Bengali Badge**:
  > *"ধারণামূলক জমির মানচিত্র — সরকারি জরিপ নয়"* (Bengali) / *"Conceptual Land Map — Not an Official Survey"* (English).

---

## 4. Preserved Product Architecture & Features
No backend models or existing features were removed:
- **Authentication & Guest Access**: Retained Argon2id password hashing, public registration with 4 citizen profile categories (`Farmer`, `Land Owner`, `Researcher`, `General Citizen`), and one-click guest access (**"লগইন ছাড়াই ডেমো দেখুন"**).
- **Core Modules**:
  1. Land Search (Division, District, Mouza, Khatian, Dag)
  2. Digital Khasra Map (2D SVG Cadastral Outlines)
  3. RMD (Record-Mutation-Deed Triangulation)
  4. 3D Parcel Explorer
  5. AI Transaction Screening (Random Forest & Isolation Forest)
  6. Review Queue & Dossier Reports
  7. AI Copilot (Domain Land Assistant)
- **Zero Fabricated Claims**: All counts reflect actual backend endpoints (`/dashboard/summary`, `/transactions`, `/parcels`).
