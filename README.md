# LandGuard AI — স্মার্ট ভূমি তথ্য ও লেনদেন যাচাই সহায়ক
### LandGuard Greenfield — Human-Friendly Digital Land Experience
> *"জমির তথ্য বুঝুন, লেনদেনের অসংগতি যাচাই করুন।"*  
> *"Understand Land Records. Screen Transaction Inconsistencies."*

[![CI Quality Pipeline](https://github.com/samiulislam56/LandGuard-AI/actions/workflows/ci.yml/badge.svg)](https://github.com/samiulislam56/LandGuard-AI/actions/workflows/ci.yml)
[![FastAPI Backend](https://img.shields.io/badge/Backend-FastAPI%200.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Three.js](https://img.shields.io/badge/3D%20Engine-Three.js%20%2B%20R3F-black?logo=three.js&logoColor=white)](https://threejs.org)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Bengali First](https://img.shields.io/badge/Language-বাংলা%20(Default)%20%7C%20English-20C7D4)](https://github.com/samiulislam56/LandGuard-AI)

---

## 1. Overview & Vision

LandGuard AI is an approachable, inclusive, yet analytically rigorous land information and transaction screening platform tailored for Bangladesh. Built on human-centered design principles, it empowers citizens with limited digital literacy while offering comprehensive forensic evidence tools for land professionals, legal researchers, and authorized reviewers.

### Core Experience Principles
- **Simple outside, powerful inside**: Citizens navigate intuitive step-by-step land workflows without cognitive fatigue; experts expand deep forensic evidence on demand.
- **Bengali-First Localization**: Opens natively in standard Bengali (`বাংলা`) by default with seamless toggle to English.
- **Data-Centered Architecture**: Grounded in immutable synthetic records (3,000 parcels, 3,851 transactions) and trained Random Forest + Isolation Forest ML pipelines.
- **RMD Triangulation (Record Mutation Deed)**: Auditing discrepancies across Record of Rights (Khatian), Mutation (Namjari), and Registered Deeds (Dalil).
- **Grounded AI Copilot**: Accessible conversational assistant explaining land terminology and screening outcomes in clear, simple Bengali.
- **Digital Khasra & Cadastral Visualization**: Schematic numbered plot layouts (Dag 101–108) with real geographic GIS map integration.

> [!IMPORTANT]
> **Synthetic Demonstration & Non-Government Disclaimer:**
> LandGuard AI is a synthetic demonstration and decision-support system. It is **not** a certified government land registry, nor does it claim official ministry affiliation, legal title certification, or definitive proof of fraud.

---

## 2. Live Deployment Endpoints

| Service | Platform | Environment | Live URL |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | Vercel | Production | [https://land-guard-ai.vercel.app](https://land-guard-ai.vercel.app) |
| **Backend REST API** | Render | Production | [https://landguard-ai-backend-y2q3.onrender.com](https://landguard-ai-backend-y2q3.onrender.com) |
| **API Health Telemetry** | Render | Production | [https://landguard-ai-backend-y2q3.onrender.com/health](https://landguard-ai-backend-y2q3.onrender.com/health) |
| **Interactive API Docs** | Render | Production | [https://landguard-ai-backend-y2q3.onrender.com/docs](https://landguard-ai-backend-y2q3.onrender.com/docs) |

---

## 3. Key Modules & User Journeys

### 3.1 Greenfield Agricultural Homepage
- Inspired by Bangladesh land-service portals with warm ivory surfaces, agricultural greenery, and prominent action buttons.
- 8 responsive service tiles: জমির তথ্য, খতিয়ান/দাগ, লেনদেন যাচাই, ডিজিটাল খসড়া ম্যাপ, RMD অডিট, AI সহকারী, আবেদন অবস্থা, ও সহায়তা কেন্দ্র.

### 3.2 Cascading Land Search
- 8 Divisions, 64 Districts, cascading Upazila and Mouza selectors, and Dag/Khatian/Parcel search.
- Explicit warnings for regions outside the 4 synthetic coverage zones without fabricating fake data.

### 3.3 RMD (Record Mutation Deed) Discrepancy Triangulation
- Dedicated forensic auditing module correlating:
  1. **Record of Rights (খতিয়ান)**: Dag no, Khatian no, surveyed acreage, recorded ownership.
  2. **Registered Deed (দলিল)**: Transaction date, seller/buyer aliases, deed share, registered status.
  3. **Mutation (নামজারি)**: Case volume, mutation status, and approval alignment.
- Resolves statuses: `RMD_ALIGNED`, `RMD_CHAIN_DISCREPANCY`, `RMD_MUTATION_MISSING`, `RMD_AREA_OVERCLAIM`.

### 3.4 Digital Khasra Map
- **Schematic Khasra Mode**: Visual numbered plot diagram with real synthetic record association.
- **Georeferenced GIS Mode**: Real satellite map overlay with Google Maps / Leaflet integration.
- Clear disclaimer: *"ধারণামূলক খসড়া মানচিত্র — সরকারি জরিপ নয়"*.

### 3.5 AI Copilot Assistant
- Context-aware chatbot explaining *"Review Required মানে কী?"*, *"Mutation mismatch কেন?"*, and how to find land records in clear Bengali.

### 3.4 Forensic AI Assessment Workspace
- Explainable dual-model audit report:
  - **Random Forest Classifier (200 trees):** Classification output (`REVIEW_REQUIRED` vs `NO_REVIEW_FLAG_DETECTED`).
  - **Isolation Forest Anomaly Pipeline:** Standardized anomaly score and outlier detection flag.
- Rule-based evidence verification findings, administrative warnings, and reference assessment date controls.
- Preset benchmark buttons for reference audit scenarios:
  - `TX-002911-1` → `INSUFFICIENT_EVIDENCE`
  - `TX-002911-2` → `REVIEW_REQUIRED`
  - `TX-002911-3` → `PENDING_DATE_VERIFICATION`

---

## 4. Architecture & Data Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LANDGUARD ATLAS CLIENT                          │
│     React 18 + TypeScript + Vite + Tailwind CSS + Lucide + i18next     │
│       ┌───────────────────────┐       ┌──────────────────────┐        │
│       │  2D Leaflet Cadastre  │       │  3D R3F WebGL Scene  │        │
│       └───────────────────────┘       └──────────────────────┘        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / REST (JSON)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FASTAPI BACKEND SERVICE                         │
│                    Python 3.12 + Pydantic v2 + Uvicorn                 │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                 Deterministic Assessment Engine                │   │
│   │   1. Reference Date Check (Future Event -> PENDING_DATE)       │   │
│   │   2. Evidence Discrepancy Rules (Hash, Area, Claim)            │   │
│   │   3. Random Forest Classification (200 Trees)                  │   │
│   │   4. Isolation Forest Outlier Anomaly Scoring                  │   │
│   └────────────────────────────────────────────────────────────────┘   │
│            ▲                                     ▲                     │
│            │                                     │                     │
│   ┌────────┴────────┐                  ┌─────────┴─────────┐           │
│   │ Trained Models  │                  │  Synthetic Datasets│          │
│   │ • rf_model      │                  │  • parcels.csv    │          │
│   │ • iso_forest    │                  │  • transactions   │          │
│   └─────────────────┘                  │  • mutations      │          │
│                                        │  • ownership      │          │
│                                        │  • review_cases   │          │
│                                        └───────────────────┘           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Technology Stack

### Frontend
- **Framework:** React 18.3.1 + TypeScript (strict typing)
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS + Role-Based CSS Variables
- **3D Visualization:** Three.js 0.160.0 + React Three Fiber 8.17.10 + Drei 9.121.5
- **Mapping:** Leaflet + React-Leaflet
- **Internationalization:** i18next + react-i18next
- **State & Caching:** TanStack React Query v5
- **Animations:** Framer Motion
- **Icons:** Lucide React

### Backend
- **Framework:** FastAPI 0.115+
- **ASGI Server:** Uvicorn (standard)
- **Machine Learning:** Scikit-learn 1.6.1 + Joblib
- **Data Analysis:** Pandas 2.2+ + NumPy 2.0+
- **Validation:** Pydantic v2
- **Testing:** Pytest 8.3+

---

## 6. Local Installation & Development Guide

### Prerequisites
- **Node.js:** v18.0.0 or later (v20+ recommended)
- **Python:** 3.12.x
- **Git**

### Clone Repository
```bash
git clone https://github.com/samiulislam56/LandGuard-AI.git
cd LandGuard-AI
```

### Backend Setup
```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Backend API will be live at `http://127.0.0.1:8000` (Docs: `http://127.0.0.1:8000/docs`).

### Frontend Setup
```bash
cd ../frontend
npm ci
npm run dev
```
Frontend web application will be live at `http://localhost:5173`.

---

## 7. Testing & Quality Verification

Run all test suites locally:

### Frontend Verification
```bash
cd frontend
npm run typecheck   # Strict TypeScript verification
npm run lint        # ESLint code quality
npm run build       # Production bundle build
```

### Backend Test Suite
```bash
cd backend
pytest -v           # 19 automated tests
```

---

## 8. API Endpoint Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Health check, loaded model count, loaded dataset count. |
| `GET` | `/dashboard/summary` | Global cadastral metrics and scenario counts. |
| `GET` | `/transactions` | Paginated transaction list with optional scenario filtering. |
| `GET` | `/transactions/{id}` | Detailed conveyance attributes and synthetic indicators. |
| `GET` | `/parcels/{id}/history` | Cadastral plot attributes and chronological deed sequence. |
| `GET` | `/assess/{id}` | Explainable dual-model audit and evidence discrepancy findings. |
| `POST` | `/api/auth/login` | Reviewer and administrator session authentication. |
| `POST` | `/api/auth/logout` | Session invalidation and secure logout. |
| `GET` | `/api/auth/me` | Current caller identity and role profile (viewer/reviewer/admin). |
| `GET` | `/api/reviews` | Persistent review cases with status/scenario filtering and search. |
| `GET` | `/api/reviews/{id}` | Case review details with linked deed record and audit history. |
| `PATCH` | `/api/reviews/{id}` | Role-protected case resolution mutation and audit logging. |
| `GET` | `/api/reviews/{id}/history` | Immutable chronological audit timeline for a review case. |
| `GET` | `/api/reports/assessment/{id}` | Real downloadable ReportLab binary PDF assessment report. |

---

## 9. Continuous Integration & Deployment (CI/CD)

The repository is configured with automated continuous delivery:
1. **GitHub Actions CI (`.github/workflows/ci.yml`):** Automatically validates every push and pull request across both frontend (typecheck, lint, build) and backend (pytest test suite).
2. **Vercel Frontend Auto-Deployment:** Connected to `frontend/` directory with automatic branch deployment on `main`.
3. **Render Backend Auto-Deployment:** Configured via `render.yaml` running `pip install -r requirements.txt` and `uvicorn`.

---

## 10. Technical Reports & Architecture Documentation

Detailed documentation is available in the [`docs/`](docs/) directory:
- [Stage 4 Advanced Integration Report](docs/STAGE_4_ADVANCED_INTEGRATION_REPORT.md)
- [Stage 5 Deployment Report](docs/STAGE_5_DEPLOYMENT_REPORT.md)
- [Render Configuration Guide](docs/RENDER_CONFIGURATION.md)
- [Vercel Configuration Guide](docs/VERCEL_CONFIGURATION.md)
- [CI/CD Configuration Guide](docs/CI_CD_CONFIGURATION.md)
- [Production Test Report](docs/PRODUCTION_TEST_REPORT.md)
- [Future Update Workflow](docs/FUTURE_UPDATE_WORKFLOW.md)

---

## 11. License

This project is developed for educational, demonstration, and research purposes under the [MIT License](LICENSE).