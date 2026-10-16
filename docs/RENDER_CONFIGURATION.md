# LandGuard AI — Render Backend Deployment Guide
**Document Version:** 1.0  
**Date:** October 16, 2026  
**Repository:** [https://github.com/samiulislam56/LandGuard-AI](https://github.com/samiulislam56/LandGuard-AI)  
**Target Environment:** Render Cloud Platform (Python 3.12 Web Service)  

---

## 1. Overview & Architecture

The LandGuard AI backend is built with FastAPI, scikit-learn, joblib, and pandas. It loads:
- **Random Forest Model:** `backend/models/rf_model.joblib`
- **Isolation Forest Model Bundle:** `backend/models/iso_forest.joblib`
- **Five Synthetic Datasets:** `backend/data/*.csv`
- **Persistent Review Database:** Auto-initialized SQLite database at `backend/data/landguard_reviews.db` with seeding from `review_cases.csv` and `transactions.csv`.

---

## 2. Infrastructure as Code: `render.yaml` Blueprint

The root directory includes a declarative blueprint `render.yaml`:

```yaml
services:
  - type: web
    name: landguard-ai-backend
    runtime: python
    rootDir: backend
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.12.15
      - key: ENVIRONMENT
        value: production
      - key: ALLOW_VERCEL_PREVIEWS
        value: "true"
      - key: ALLOWED_ORIGINS
        value: "http://localhost:5173,https://landguard-ai.vercel.app,https://land-guard-ai.vercel.app"
    healthCheckPath: /health
```

---

## 3. Manual Deployment Setup Steps (via Render Dashboard)

If deploying through the Render Web Dashboard ([https://dashboard.render.com](https://dashboard.render.com)):

1. **Sign in / Authorize GitHub:**
   - Log into Render using your GitHub account.
   - Authorize access to `https://github.com/samiulislam56/LandGuard-AI`.
2. **Create New Web Service:**
   - Click **New +** &rarr; **Web Service**.
   - Select the repository `samiulislam56/LandGuard-AI`.
3. **Configure Service Details:**
   - **Name:** `landguard-ai-backend` (or your chosen unique slug)
   - **Region:** Singapore / Frankfurt / Oregon
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free (or Starter if continuous zero-cold-start memory is desired)
4. **Environment Variables:**
   - `PYTHON_VERSION`: `3.12.15`
   - `ENVIRONMENT`: `production`
   - `ALLOW_VERCEL_PREVIEWS`: `true`
   - `ALLOWED_ORIGINS`: `http://localhost:5173,https://landguard-ai.vercel.app,https://land-guard-ai.vercel.app`
5. **Health Check Path:**
   - Set to `/health` (Returns HTTP 200 `{"status": "ok", "models_loaded": 2, "datasets_loaded": 5}`).
6. **Trigger Deployment:**
   - Click **Create Web Service**.

---

## 4. Verification Checkpoints

Once Render completes the build, test the deployed endpoints:

```bash
# 1. Health check
curl -X GET https://<YOUR-RENDER-SLUG>.onrender.com/health

# 2. Executive summary
curl -X GET https://<YOUR-RENDER-SLUG>.onrender.com/dashboard/summary

# 3. Ground truth regression case
curl -X GET https://<YOUR-RENDER-SLUG>.onrender.com/assess/TX-002911-2

# 4. Review workspace cases
curl -X GET https://<YOUR-RENDER-SLUG>.onrender.com/api/reviews?limit=5

# 5. PDF generation stream
curl -X GET https://<YOUR-RENDER-SLUG>.onrender.com/api/reports/assessment/TX-002911-2 --output test_report.pdf
```
