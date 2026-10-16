# LANDGUARD ATLAS — FUTURE UPDATE & CONTINUOUS MAINTENANCE WORKFLOW

**Document Version:** 1.0.0  
**Date:** October 16, 2026  
**Audience:** Antigravity AI Engineering Sessions & Engineering Maintainers  

---

## 1. Golden Rules for Future Antigravity Sessions

Whenever the user requests a new feature, bug fix, or design adjustment in Antigravity:
1. **Single Source of Truth:** Repository `https://github.com/samiulislam56/LandGuard-AI` on branch `main` is the canonical codebase.
2. **Never Force-Push:** Never execute `git push --force` or destructive history re-writes.
3. **No Uncontrolled Automation:** Never start background processes that commit or push arbitrary unverified changes. All Git commits and pushes must occur only upon explicit user request or authorization after verified quality gates pass.
4. **Machine Learning & Data Protection:**
   - Never retrain or overwrite the trained model bundles (`rf_model` or `iso_forest`) without explicit authorization.
   - Never modify or overwrite baseline synthetic CSV datasets in `backend/data/`.
   - Never alter the 6-tier deterministic assessment policy precedence.

---

## 2. Standard Edit → Test → Commit → Push → Verify Workflow

Follow this step-by-step lifecycle for every update:

```
[1. Pull Latest]      git pull origin main
       │
[2. Implement Code]   Modify components, styles, or endpoints
       │
[3. Run Typecheck]    cd frontend && npm run typecheck
       │
[4. Run Lint]         npm run lint
       │
[5. Run Build]        npm run build
       │
[6. Run Backend CI]   cd backend && pytest -v
       │
[7. Stage & Commit]   git add <modified files>
                      git commit -m "feat/fix: descriptive message"
       │
[8. Push to GitHub]   git push origin main
       │
[9. Verify Deployment]Monitor GitHub Actions -> Check Vercel & Render builds
```

---

## 3. Rollback & Fault Recovery Protocol

If a production deployment encounters an issue:
1. **Preserve Current State:** Do not attempt force-pushing old commits over `main`.
2. **Revertvia Git Revert:**
   ```bash
   git revert <failing_commit_sha> -m 1
   git push origin main
   ```
   This creates a clean, forward-tracking reversal commit that triggers automatic re-deployment to the previous known-good state on both Vercel and Render.
3. **Provider Rollback Buttons:** Both Vercel and Render dashboards provide an instant **"Rollback to Previous Deployment"** button that re-routes live CDN traffic to the prior release in < 15 seconds.
