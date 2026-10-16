# LandGuard Atlas — Next-Generation Geo-Intelligence Command Center
### Synthetic Land Transaction Intelligence & Potential Double-Selling Screening Platform for Bangladesh

[![CI Quality Pipeline](https://github.com/samiulislam56/LandGuard-AI/actions/workflows/ci.yml/badge.svg)](https://github.com/samiulislam56/LandGuard-AI/actions/workflows/ci.yml)
[![FastAPI Backend](https://img.shields.io/badge/Backend-FastAPI%200.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Three.js](https://img.shields.io/badge/3D%20Engine-Three.js%20%2B%20R3F-black?logo=three.js&logoColor=white)](https://threejs.org)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Bilingual](https://img.shields.io/badge/i18n-English%20%7C%20বাংলা-20C7D4)](https://github.com/samiulislam56/LandGuard-AI)

---

## 1. Overview & Problem Statement

Land records and conveyance deeds in Bangladesh frequently encounter disputes stemming from **duplicate sales, overlapping claims, inconsistent mutation records, and missing evidence chains**. 

**LandGuard Atlas** is an automated cadastral intelligence and transaction screening prototype designed to assist deed auditors, legal reviewers, and land registration officers with:
1. Detecting competing and concurrent title claims across cadastral parcels (*Dag* & *Khatian* numbers).
2. Quantifying multi-dimensional anomaly risk using a **dual-model machine learning architecture** (Random Forest Classifier + Isolation Forest Anomaly Detector).
3. Verifying deterministic evidence rules including seller-owner mismatches, area bound discrepancies, mutation gaps, and deed document integrity hashes.
4. Exploring historical land parcel ownership lineages in both **2D interactive GIS maps** and an interactive **3D Cadastral Parcel Explorer**.
5. Delivering a fully localized **bilingual interface** supporting both **English** and **বাংলা (Bengali)**.

> [!IMPORTANT]
> **Synthetic Data & Legal Disclaimer:**
> LandGuard AI operates exclusively on synthetic datasets generated for demonstration, testing, and research purposes. It does not contain actual personally identifiable information (PII) or official surveyed property boundaries. Machine learning scores and anomaly indicators highlight transaction patterns for human review and **do not constitute definitive legal proof of fraud or invalid title**.

---

## 2. Live Deployment Endpoints

| Service | Platform | Environment | Live URL |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | Vercel | Production | `https://landguard-ai.vercel.app` (or configured Vercel alias) |
| **Backend REST API** | Render | Production | `https://landguard-ai-backend.onrender.com` |
| **API Health Telemetry** | Render | Production | `https://landguard-ai-backend.onrender.com/health` |
| **Interactive API Docs** | Render | Production | `https://landguard-ai-backend.onrender.com/docs` |

---

## 3. Key System Features

### 3.1 Geospatial Command Center (Reference 3 "God Mode")
- High-contrast geospatial visual system using the **LandGuard Atlas** palette (`#07141E`, `#102533`, `#20C7D4` in Dark; `#F3F7F8`, `#FFFFFF`, `#087F77` in Light).
- Interactive Bangladesh administrative framing with cascading selectors for all **8 divisions and 64 districts** with authentic Bengali typography.
- Tabular KPI rail tracking total parcels (3,000), total conveyances (4,200), multi-deed plots (882), and unreviewed dispute cases (1,188).
- Forensic scenario distribution visualization across 7 anomaly classifications.
- Slide-out quick investigation drawer for instant deed triage.

### 3.2 Conceptual 3D Cadastral Parcel Explorer
- Built with **Three.js** and **React Three Fiber** (`@react-three/fiber@8.17.10` & `three@0.160.0`).
- Procedural elevated land parcel blocks with heights reflecting transaction volume and risk.
- Wireframe boundaries, dynamic camera orbit controls, focus feedback, and conflict deed connection arcs.
- Automatic WebGL error boundary and graceful 2D fallback.

### 3.3 Full Bilingual Internationalization (EN | বাংলা)
- Immediate runtime language toggle without full page reload.
- Typography optimized for Bengali script (`Noto Sans Bengali` & `Hind Siliguri`) with relaxed line heights to eliminate character clipping.
- Comprehensive localization across all navigation, KPI metrics, filter chips, map controls, and AI audit explanations.

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

---

## 9. Continuous Integration & Deployment (CI/CD)

The repository is configured with automated continuous delivery:
1. **GitHub Actions CI (`.github/workflows/ci.yml`):** Automatically validates every push and pull request across both frontend (typecheck, lint, build) and backend (pytest test suite).
2. **Vercel Frontend Auto-Deployment:** Connected to `frontend/` directory with automatic branch deployment on `main`.
3. **Render Backend Auto-Deployment:** Configured via `render.yaml` running `pip install -r requirements.txt` and `uvicorn`.

---

## 10. License

This project is developed for educational, demonstration, and research purposes under the [MIT License](LICENSE).