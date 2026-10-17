# MASTER REPAIR BASELINE — RECOVERY CHECKPOINT

## 1. System State & Checkpoint
* **Timestamp**: 2026-10-17 12:10:00+06:00
* **Repository**: `https://github.com/samiulislam56/LandGuard-AI`
* **Local Workspace**: `E:\LandGuard-AI`
* **Current Branch**: `main`
* **Baseline Commit SHA**: `6ccbabb` (`feat(frontend): LandGuard Greenfield 3D redesign with interactive hero, 3D explorer, and botanical luxury theme`)
* **Working Tree**: Clean (0 uncommitted changes)
* **Remote Sync**: 100% in sync with `origin/main`

## 2. Infrastructure & Endpoints
* **Canonical Vercel Frontend**: `https://land-guard-ai.vercel.app/`
* **Alternative Observed Domain**: `https://land-guard-ai-ten.vercel.app/`
* **Live Render Backend URL**: `https://landguard-ai-backend-y2q3.onrender.com`
* **Backend Health**: `{"status": "ok", "models_loaded": 2, "datasets_loaded": 5}`

## 3. Runtime & Tooling Versions
* **Node.js**: Windows x64
* **Vite**: 6.4.4
* **React**: 18.3.1
* **TypeScript**: Strict Mode enabled
* **TailwindCSS**: 3.4.17
* **Python**: 3.12 (Virtualenv: `E:\LandGuard-AI\.venv`)
* **FastAPI**: 0.115+
* **Uvicorn**: 0.30+
* **Pytest**: 9.1.1 (36 passing unit tests)

## 4. Prioritized Issues to Repair
1. **Midnight Map Error**: Map tiles failing with repeated `"API KEY REQUIRED"` watermarks due to unauthorized or deprecated tile provider endpoint.
2. **Parcel ID / Record Not Found Bug**: URL or search queries using `PARCEL-002911` fail because backend dataset identifiers are prefixed with `LG-P-002911`. Need canonical contract, alias resolution, and friendly fallback.
3. **Broken Internationalization (i18n)**: Raw keys such as `common.noData` and `nav.parcelIntelligence` leaking to end users.
4. **General Functionality, Contrast, Accessibility, and Test Suite Stabilization**.
