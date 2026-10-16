# LandGuard AI — Vercel Project Configuration Guide
**Document Version:** 1.0  
**Date:** October 16, 2026  
**Existing Vercel Project:** [https://vercel.com/mind-forge13/land-guard-ai](https://vercel.com/mind-forge13/land-guard-ai)  
**Team / Account:** `mind-forge13`  
**Project Name:** `land-guard-ai`  

---

## 1. Project Overview & Build Settings

The LandGuard AI frontend is a single-page React + TypeScript + Vite application styled with Tailwind CSS.

### Exact Vercel Build Configuration:
- **Framework Preset:** `Vite`
- **Root Directory:** `frontend`
- **Install Command:** `npm ci`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **SPA Rewrites (`frontend/vercel.json`):**
  ```json
  {
    "rewrites": [
      {
        "source": "/(.*)",
        "destination": "/index.html"
      }
    ]
  }
  ```

---

## 2. Environment Variable Configuration (CRITICAL)

Vite bakes environment variables into the static JavaScript bundle at **build time**. Setting the environment variable requires triggering a fresh deployment.

### Required Variable:
- **Variable Key:** `VITE_API_URL`
- **Target Environments:** `Production`, `Preview`, `Development`
- **Variable Value:** Your deployed Render backend HTTPS URL  
  *(e.g., `https://<your-service-slug>.onrender.com` without trailing slash)*

---

## 3. Configuration via Vercel Dashboard

1. Navigate to: [https://vercel.com/mind-forge13/land-guard-ai/settings/environment-variables](https://vercel.com/mind-forge13/land-guard-ai/settings/environment-variables)
2. Add a new variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://<YOUR-RENDER-SERVICE-NAME>.onrender.com`
   - **Environments:** Select **Production**, **Preview**, and **Development**
   - Click **Save**.
3. **Trigger Redeployment:**
   - Go to the **Deployments** tab: [https://vercel.com/mind-forge13/land-guard-ai/deployments](https://vercel.com/mind-forge13/land-guard-ai/deployments)
   - Click the three dots (`...`) next to the latest production deployment &rarr; Click **Redeploy**.
   - Check **"Use existing Build Cache"** &rarr; **UNCHECK** it so Vite rebuilds with the new environment variable.
   - Click **Redeploy**.

---

## 4. Verification Checkpoints

1. Open the live Vercel URL in your browser.
2. Open Developer Tools &rarr; Network tab:
   - Verify that requests to `/health`, `/dashboard/summary`, `/transactions`, and `/api/reviews` target your Render HTTPS URL.
   - Verify there are no CORS errors in the browser console.
3. Test direct deep linking:
   - Refresh on `/assess/TX-002911-2` to ensure `vercel.json` rewrites prevent 404s.
4. Test review actions in the Review Workspace:
   - Click **"Sign In to Review (Auditor)"** &rarr; Sign in with `reviewer` / `ReviewerPass2026!`.
   - Update a case status and verify persistence.
5. Test PDF download:
   - Go to `/reports` and click **"Download PDF Report"** &rarr; verify the binary PDF downloads successfully.
