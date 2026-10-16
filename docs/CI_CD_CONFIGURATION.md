# LANDGUARD ATLAS — CONTINUOUS INTEGRATION & CONTINUOUS DEPLOYMENT (CI/CD)

**Document Version:** 1.0.0  
**Date:** October 16, 2026  
**Pipeline:** GitHub Actions (`.github/workflows/ci.yml`) + Vercel + Render  
**Target Repository:** `https://github.com/samiulislam56/LandGuard-AI`  

---

## 1. CI/CD Architecture Overview

The LandGuard Atlas platform is configured with an automated multi-stage continuous delivery pipeline:

```
                  ┌──────────────────────────────────────────────┐
                  │                 Developer Push               │
                  │             git push origin main             │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │              GitHub Actions CI               │
                  │   ┌──────────────────┐ ┌──────────────────┐  │
                  │   │ Frontend Quality │ │ Backend Quality  │  │
                  │   │ • npm ci         │ │ • pip install    │  │
                  │   │ • typecheck      │ │ • pytest -v      │  │
                  │   │ • eslint         │ │ • 19 tests pass  │  │
                  │   │ • vite build     │ │                  │  │
                  │   └──────────────────┘ └──────────────────┘  │
                  └──────────────────────┬───────────────────────┘
                                         │ (On Pass)
                         ┌───────────────┴───────────────┐
                         ▼                               ▼
        ┌────────────────────────────────┐ ┌────────────────────────────────┐
        │        Vercel Webhook          │ │         Render Webhook         │
        │ • Root: frontend               │ │ • Root: backend                │
        │ • Build: npm run build         │ │ • Build: pip install -r reqs   │
        │ • Output: dist                 │ │ • Run: uvicorn app.main:app    │
        │ • Deploy: Production Edge CDN  │ │ • Health: /health              │
        └────────────────────────────────┘ └────────────────────────────────┘
```

---

## 2. GitHub Actions Workflow (`ci.yml`)

Located at `.github/workflows/ci.yml`:

```yaml
name: LandGuard AI — Continuous Integration

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  frontend-quality:
    name: Frontend Quality Verification
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: TypeScript Typecheck
        run: npm run typecheck

      - name: ESLint Code Quality
        run: npm run lint

      - name: Production Bundle Build
        run: npm run build

  backend-quality:
    name: Backend Quality Verification
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: 'pip'
          cache-dependency-path: backend/requirements.txt

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt

      - name: Run Pytest Test Suite
        run: pytest -v
```

---

## 3. Automatic Deployments Configuration

1. **Vercel GitHub Integration:**
   - In Vercel, connect repository `samiulislam56/LandGuard-AI`.
   - Set Root Directory to `frontend`.
   - Automatic deployments trigger automatically whenever commits are pushed to `main`.
2. **Render GitHub Integration:**
   - In Render, create Web Service from `samiulislam56/LandGuard-AI` or select `render.yaml`.
   - Set Root Directory to `backend`.
   - Auto-deploy is enabled for `main`.
3. **Path-Based Deploy Filtering:**
   - Both platforms inspect monorepo paths (`frontend/**` vs `backend/**`), ensuring that frontend documentation or styling edits do not trigger unnecessary backend container rebuilds.
