# LANDGUARD ATLAS — VERCEL FRONTEND DEPLOYMENT SPECIFICATION & REPORT

**Document Version:** 1.0.0  
**Date:** October 16, 2026  
**Application:** LandGuard Atlas React 18 + TypeScript + Three.js Frontend  
**Hosting Provider:** Vercel ([vercel.com](https://vercel.com))  
**Deployment Source:** GitHub Repository `https://github.com/samiulislam56/LandGuard-AI`  
**Configuration File:** `frontend/vercel.json`  

---

## 1. Project Configuration Settings

| Vercel Setting | Value | Notes |
| :--- | :--- | :--- |
| **Framework Preset** | `Vite` | Standard Vite framework preset. |
| **Root Directory** | `frontend` | Directs Vercel build engine to `frontend/`. |
| **Install Command** | `npm ci` | Uses frozen `package-lock.json` for deterministic builds. |
| **Build Command** | `npm run build` | Executes `tsc && vite build`. |
| **Output Directory** | `dist` | Default production build distribution folder. |
| **Node.js Version** | `20.x` or `22.x` | Modern LTS runtimes fully supported. |

---

## 2. Environment Variables

Configure in the Vercel Dashboard under **Project Settings > Environment Variables**:

| Variable Name | Environment | Value | Purpose |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | Production | `https://<RENDER_SERVICE_NAME>.onrender.com` | Live deployed Render FastAPI service URL. |
| `VITE_API_URL` | Preview | `https://<RENDER_SERVICE_NAME>.onrender.com` | Connects preview builds to the live backend. |

---

## 3. SPA Routing & Deep Link Rewrites

To prevent HTTP 404 errors when refreshing client-side React Router pages (`/transactions/:id`, `/parcels/:id`, `/assess/:id`, `/explorer-3d`, `/review`, `/reports`, `/settings`), the project provides `frontend/vercel.json`:

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

This guarantees that all route requests are served by `index.html` and handled by React Router's client-side history API.

---

## 4. Production Smoke Test Verification Checklist

Once Vercel deployment completes:

1. **Root URL (`/`):**
   - Verify page loads with HTTP 200.
   - Verify Bangladesh map renders cleanly without missing tiles.
   - Verify 3D Parcel Explorer initializes smoothly when clicking the "3D Explorer" tab.
2. **Deep Links:**
   - Navigate to `/transactions/TX-002911-2` and press F5 (hard refresh) -> Verify page reloads without 404.
   - Navigate to `/parcels/LG-P-002911` -> Verify cadastral dossier and timeline display.
   - Navigate to `/assess/TX-002911-2` -> Verify dual-model outputs and evidence findings.
3. **Bilingual Toggle:**
   - Click `বাংলা` in the top bar -> Verify all navigation, metrics, and labels switch instantly to Bengali without character clipping.
4. **Theme Preference:**
   - Toggle between Dark, Light, and System modes -> Verify contrast integrity across all panels and charts.
5. **API Connectivity:**
   - Check the top bar telemetry status -> Verify green dot indicating connection to the Render backend.
