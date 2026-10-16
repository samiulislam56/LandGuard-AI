# LandGuard AI — Future Update & Continuous Delivery Workflow
**Document Version:** 1.0  
**Date:** October 16, 2026  

---

## 1. Overview

This document specifies the standard operating procedure for implementing future features, bug fixes, or enhancements to **LandGuard AI** using Antigravity pair programming and automated continuous deployment.

---

## 2. Seven-Step Continuous Update Cycle

```
Step 1: User Request & Specification
        │
        ▼
Step 2: Codebase Inspection & Impact Audit
        │
        ▼
Step 3: Implementation & Preservation Check
        │
        ▼
Step 4: Local Regression & Quality Testing (Pytest, Typecheck, Lint, Build)
        │
        ▼
Step 5: Git Commit & Push to main
        │
        ▼
Step 6: Automated CI & Cloud Redeployment (Render & Vercel)
        │
        ▼
Step 7: Production Verification & Smoke Test
```

### Step 1: User Request
- The user issues a specific feature request or bug report to Antigravity.

### Step 2: Codebase Inspection
- Inspect existing route contracts, Pydantic schemas, and frontend hooks before making modifications.
- Confirm ML model binaries and source CSV datasets remain unmodified and protected.

### Step 3: Implementation
- Implement changes using clean, typed code adhering to the Atlas Studio design system and FastAPI standards.

### Step 4: Local Quality Gates (Mandatory before Git Commit)
1. Backend Tests:
   ```bash
   cd backend && pytest -v
   ```
2. Frontend Typecheck:
   ```bash
   cd frontend && npm run typecheck
   ```
3. Frontend Lint:
   ```bash
   cd frontend && npm run lint
   ```
4. Frontend Production Build:
   ```bash
   cd frontend && npm run build
   ```

### Step 5: Meaningful Git Commit & Push
- Stage the verified changes:
  ```bash
  git add <modified_files>
  git commit -m "feat(scope): concise description of verified change"
  git push origin main
  ```

### Step 6: Automated Cloud Pipeline
- GitHub Actions automatically runs the Ubuntu CI workflow ([Runs](https://github.com/samiulislam56/LandGuard-AI/actions)).
- Render auto-detects `main` branch updates and redeploys the FastAPI container.
- Vercel auto-detects `main` branch updates and builds the new frontend static bundle.

### Step 7: Live Smoke Testing
- Verify that live Render endpoints and live Vercel pages are operational.
