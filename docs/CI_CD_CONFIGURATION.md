# LandGuard AI — Continuous Integration & Continuous Deployment (CI/CD)
**Document Version:** 1.0  
**Date:** October 16, 2026  
**Repository:** [https://github.com/samiulislam56/LandGuard-AI](https://github.com/samiulislam56/LandGuard-AI)  

---

## 1. Architecture Overview

The LandGuard AI CI/CD pipeline ensures automated code quality checks, test verification, and automated continuous deployment:

```
Developer Workstation (Antigravity IDE)
       │
       ▼  git push origin main
GitHub Repository (samiulislam56/LandGuard-AI)
       │
       ├──► GitHub Actions CI (.github/workflows/ci.yml)
       │       ├── Job 1: Frontend Quality (npm ci, tsc, eslint, vite build)
       │       └── Job 2: Backend Quality (python 3.12, pip, pytest -v [25 tests])
       │
       ├──► Render Auto-Deploy (Web Service: landguard-ai-backend)
       │       └── Detects changes in backend/ & render.yaml &rarr; Redeploys FastAPI
       │
       └──► Vercel Auto-Deploy (Project: land-guard-ai)
               └── Detects changes in frontend/ & vercel.json &rarr; Rebuilds with VITE_API_URL
```

---

## 2. GitHub Actions Quality Gates

Configured in `.github/workflows/ci.yml`:

- **Triggers:** Push and Pull Request to `main`.
- **Frontend Job:**
  - Node.js 20 environment on `ubuntu-latest`.
  - Runs `npm ci`.
  - Runs `npm run typecheck` (`tsc --noEmit`).
  - Runs `npm run lint` (`eslint src`).
  - Runs `npm run build` (`vite build`).
- **Backend Job:**
  - Python 3.12 environment on `ubuntu-latest`.
  - Installs backend dependencies from `backend/requirements.txt`.
  - Runs `pytest -v` across all 25 automated unit, regression, model-loading, auth, review persistence, and PDF generation tests.

---

## 3. Verified CI Run History

| Run ID | Commit | Event | Status | Conclusion | URL |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **38862125438** | `86f1876` | push | completed | **success** | [Run 38862125438](https://github.com/samiulislam56/LandGuard-AI/actions/runs/38862125438) |
| **38854917873** | `0e309f6` | push | completed | **success** | [Run 38854917873](https://github.com/samiulislam56/LandGuard-AI/actions/runs/38854917873) |

---

## 4. Automatic Webhook Deployment Sync

1. **Vercel Native Integration:**
   - When a commit is pushed to `main`, Vercel automatically checks out `main`, runs `npm ci` and `npm run build` in `frontend/`, and deploys the new static build to production.
2. **Render Native Integration:**
   - When a commit is pushed to `main`, Render detects changes in `backend/`, executes `pip install -r requirements.txt`, runs `uvicorn app.main:app`, and swaps the zero-downtime container once `/health` returns HTTP 200.
