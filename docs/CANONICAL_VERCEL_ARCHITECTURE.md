# Canonical Vercel Architecture & Deployment Specification

**Project**: LandGuard AI  
**Repository**: [https://github.com/samiulislam56/LandGuard-AI](https://github.com/samiulislam56/LandGuard-AI)  
**Vercel Project**: `mind-forge13/land-guard-ai`  
**Target Canonical URL**: [https://land-guard-ai.vercel.app/](https://land-guard-ai.vercel.app/)  
**Live Render Backend**: [https://landguard-ai-backend-y2q3.onrender.com](https://landguard-ai-backend-y2q3.onrender.com/)  

---

## 1. Single Source of Truth

The single source of truth for LandGuard AI is the `main` branch of GitHub repository `samiulislam56/LandGuard-AI`.

### Project Layout
```
LandGuard-AI/
├── .github/workflows/ci.yml   # Automatic GitHub Actions CI/CD Quality Pipeline
├── vercel.json                # Root Vercel Build & Output Dispatcher
├── render.yaml                # Render Web Service Blueprint
├── backend/                   # FastAPI Python Service
│   ├── app/                   # API, Auth, Database, ML Assessment Engine
│   └── tests/                 # 36 Unit & Security Regression Tests
└── frontend/                  # React + TypeScript + Vite Application
    ├── vercel.json            # Frontend SPA Catch-All Rewrites
    ├── package.json           # Dependencies & Scripts
    ├── vite.config.ts         # Vite Bundler & Chunk Splitting Config
    └── src/
        ├── pages/             # Landing, Home, Login, GIS, RMD, 3D, Reviews
        ├── components/        # Layout, GIS Maps, Copilot, UI Primitives
        └── lib/               # Typed API Client & Auth Storage
```

---

## 2. Multi-Level Vercel Build Compatibility

To guarantee that any Vercel configuration builds and deploys the identical unified frontend, two configuration files are maintained:

### A. Root `vercel.json` (For Root-Configured Projects)
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "cd frontend && npm install",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### B. Subdirectory `frontend/vercel.json` (For Directory-Specific Projects)
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

## 3. Environment Variables

| Variable | Environment | Value | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | Production, Preview, Development | `https://landguard-ai-backend-y2q3.onrender.com` | Live Render backend endpoint |

---

## 4. Domain Mapping & Unification in Vercel Dashboard

1. Navigate to: [https://vercel.com/mind-forge13/land-guard-ai/settings/domains](https://vercel.com/mind-forge13/land-guard-ai/settings/domains)
2. Ensure `land-guard-ai.vercel.app` is the primary production domain connected to branch `main`.
3. If `land-guard-ai-ten.vercel.app` is also present under the team, configure a 308 Permanent Redirect from `land-guard-ai-ten.vercel.app` &rarr; `land-guard-ai.vercel.app` preserving the full path.
