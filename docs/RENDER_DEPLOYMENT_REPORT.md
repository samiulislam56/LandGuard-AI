# LANDGUARD ATLAS — RENDER BACKEND DEPLOYMENT SPECIFICATION & REPORT

**Document Version:** 1.0.0  
**Date:** October 16, 2026  
**Service:** LandGuard AI FastAPI Backend  
**Hosting Provider:** Render ([render.com](https://render.com))  
**Deployment Type:** Web Service (Python 3.12)  
**Configuration File:** `render.yaml`  

---

## 1. Architecture & Deployment Settings

The FastAPI backend is configured for deployment as a Render Web Service connected to the GitHub repository:

| Parameter | Configuration Value | Justification |
| :--- | :--- | :--- |
| **Repository URL** | `https://github.com/samiulislam56/LandGuard-AI` | Single source of truth monorepo. |
| **Branch** | `main` | Production release branch. |
| **Root Directory** | `backend` | Isolates backend requirements from frontend dependencies. |
| **Runtime** | `Python` (3.12.15) | Matches the verified local Python virtual environment. |
| **Build Command** | `pip install -r requirements.txt` | Installs pinned Scikit-learn 1.6.1, FastAPI, Uvicorn, and Pandas. |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` | Binds to Render's dynamic `$PORT` environment variable. |
| **Health Check Path** | `/health` | Ensures zero-downtime rolling deploys only succeed when models load. |

---

## 2. Production Environment Variables

Configured in `render.yaml` and Render Dashboard:

```env
PYTHON_VERSION=3.12.15
ENVIRONMENT=production
LOG_LEVEL=INFO
ALLOWED_ORIGINS=http://localhost:5173,https://landguard-ai.vercel.app
ALLOW_VERCEL_PREVIEWS=true
DEFAULT_ASSESSMENT_DATE=2026-10-15
```

### CORS Security Model:
- Production Vercel domain (`https://landguard-ai.vercel.app`) is explicitly whitelisted.
- Vercel dynamic preview deployments are validated via regex matching (`https://.*\.vercel\.app`) with `ALLOW_VERCEL_PREVIEWS=true`.
- Local development origins (`http://localhost:5173`) remain supported for testing.

---

## 3. Path Resolution & Artifact Persistence

The backend application in `backend/app/main.py` utilizes cross-platform `pathlib.Path`:
```python
BASE = Path(__file__).resolve().parent.parent
DATA = BASE / "data"
MODELS = BASE / "models"
```
Because the 5 synthetic CSVs and the 2 trained model `.joblib` files are checked into the `backend/data/` and `backend/models/` directories of the Git repository:
1. They are cloned directly into the Render container upon deployment.
2. They do not depend on Windows drive letters (`E:\...`).
3. They persist across service restarts and instance scaling.

---

## 4. Live Production Health Verification Protocol

Once Render completes the build, the service is verified via:

```bash
# 1. Health & Model Status
curl -i https://<RENDER_SERVICE_NAME>.onrender.com/health
# Expected: HTTP 200 {"status":"ok","models_loaded":2,"datasets_loaded":5}

# 2. Dashboard Summary
curl -i https://<RENDER_SERVICE_NAME>.onrender.com/dashboard/summary
# Expected: HTTP 200 with parcels=3000, transactions=4200, review_cases=1188

# 3. Ground-Truth Assessment
curl -i https://<RENDER_SERVICE_NAME>.onrender.com/assess/TX-002911-2?assessment_date=2026-10-15
# Expected: HTTP 200 with final_status="REVIEW_REQUIRED"
```

---

## 5. Render Blueprint (`render.yaml`)

The repository includes a verified Render Blueprint at root:
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
        value: "http://localhost:5173,https://landguard-ai.vercel.app"
    healthCheckPath: /health
```
Users deploying via the Render Web UI can either select **New > Blueprint** and select `render.yaml`, or create a **New Web Service** pointing to `backend/`.
