# LandGuard AI — Cadastral Intelligence Console (Frontend)

**Framework:** React 18 + Vite + TypeScript (Strict)  
**Styling:** Tailwind CSS + Semantic Cadastral Design Tokens (`src/styles/tokens.css`)  
**Data Fetching:** TanStack Query (React Query)  
**Routing:** React Router v6  
**Icons:** Lucide React  
**Analytics:** Recharts  
**Data Policy:** SYNTHETIC DEMONSTRATION DATA ONLY — Screening Signals, Not Legal Title or Fraud Determinations

---

## 1. Overview

The LandGuard AI frontend is a forensic LandTech intelligence application designed to screen synthetic cadastral records, investigate conflicting deeds, inspect area mismatches, and trace deed transfer histories without asserting legal ownership or conclusive fraud.

### Key Workspaces
- **Dashboard (`/`):** Real-time aggregation of 3,000 parcels, 3,851 transactions, 712 multi-sale plots, and 8 synthetic scenario distributions powered by `GET /dashboard/summary`.
- **Transaction Explorer (`/transactions`):** Debounced full-text search, scenario filtering (conflicting sale, owner mismatch, mutation conflict, etc.), and server-side pagination powered by `GET /transactions`.
- **Transaction Detail (`/transactions/:id`):** Deed attributes inspector, indicator checklist, and quick links to parcel history and AI assessment.
- **Parcel Intelligence (`/parcels/:id`):** Cadastral plot bounds dossier (district, upazila, mouza, jl_no, dag_no, khatian_no, acreage) and chronological deed sequence powered by `GET /parcels/{id}/history`.
- **AI Assessment Console (`/assess/:id`):** Multi-model evaluation combining Random Forest 3-class prediction, Isolation Forest anomaly scoring, and deterministic rule-based evidence verification.
- **Review Workspace (`/review-cases`):** Demonstration case queue (1,188 flagged scenarios).
- **Audit Dossier & Reports (`/reports`):** Exportable forensic screening summary with printable stylesheet.
- **Workspace Settings (`/settings`):** Three-state theme (Light / Dark / System), WCAG 2.1 AA motion toggle, and backend health monitor.

---

## 2. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of the FastAPI backend service (no trailing slash) | `http://localhost:8000` |

*Note: Vite environment variables are injected into client-side JavaScript at build time. Never store credentials or private tokens in `VITE_*` variables.*

---

## 3. Available Scripts

From the `frontend` directory:

```bash
# Install dependencies
npm install

# Start local development server (http://localhost:5173)
npm run dev

# Run strict TypeScript type check
npm run typecheck

# Build optimized production bundle for Vercel
npm run build

# Preview production build locally
npm run preview
```

---

## 4. Visual Design System

The application uses an institutional Cadastral Intelligence aesthetic:
- **Deep Forest (`#10282B`):** Navigation, primary dark canvas.
- **Cadastral Green (`#163D3C`):** Institutional accents and dark surfaces.
- **Signal Teal (`#25B6A0`):** Primary interactive controls and verified states.
- **Review Amber (`#E8A94D`):** Warning indicators and insufficient evidence states.
- **Paper White (`#F1F5F2`):** Light canvas and warm document surfaces.
- **Alert Red (`#B74445`):** Discrepancy flags and review required states.

---

## 5. Deployment on Vercel

Configured for zero-configuration Vercel deployment:
- **Root Directory:** `frontend`
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Routing:** `frontend/vercel.json` rewrites all requests to `/index.html` to support React Router browser history.
