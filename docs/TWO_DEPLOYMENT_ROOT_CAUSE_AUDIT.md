# Forensic Investigation: Why Two Vercel URLs Presented Different Experiences

**Project**: LandGuard AI  
**Date**: October 17, 2026  
**Auditor**: Lead Full-Stack Architect & Senior DevOps Engineer  

---

## 1. Executive Summary

During production inspection, two distinct URLs were accessible, each presenting conflicting visual designs and behaviors:
- **URL A (`https://land-guard-ai.vercel.app/`)**: Displayed an English-only landing page with the headline *"Protect Earth's Living Land"*, satellite degradation monitoring copy, unsupported 95% ML claims, and legacy Create React App assets (`/static/js/main.154bd570.js`).
- **URL B (`https://land-guard-ai-ten.vercel.app/welcome`)**: Displayed the updated Bengali-first LandGuard AI application built with React, TypeScript, and Vite (`/assets/index-[hash].js`), but navigated visitors initially to an onboarding gate.

---

## 2. Technical Root-Cause Discovery

### A. Asset Bundle Decomposition
Direct network extraction of script bundles revealed:
1. `https://land-guard-ai.vercel.app/` was serving:
   - Chunk: `/static/js/main.154bd570.js` (Size: 821,255 bytes)
   - HTML Meta: `<meta name="description" content="Web site created using create-react-app"/>`
   - Content strings found: `"Protect Earth"`, `"Satellite"`, `"95%"`, `"living land"`.
   - Content strings missing: `"Atlas"`, `"Bengali"`, `"Khasra"`.
2. `https://land-guard-ai-ten.vercel.app/` was serving:
   - Chunk: `/assets/index-[hash].js` (Vite production output)
   - HTML Title: `<title>LandGuard Atlas — Next-Generation Geo-Intelligence Command Center</title>`
   - Content strings found: Bengali translations, RMD audits, Cadastral Maps, and Argon2id authentication.

### B. Why Did This Divergence Occur?
1. **Initial Create React App Deployment**: When the user's Vercel team (`mind-forge13`) first created the project `land-guard-ai`, an early prototype built with Create React App (CRA) was deployed to `land-guard-ai.vercel.app`.
2. **Repository Subdirectory Architecture**: When the repository was refactored into a monorepo (`frontend/` and `backend/`), the default Vercel project settings at root (`./`) lacked a `package.json`, halting automatic Git-triggered deployments on the original project unless the Vercel Root Directory was updated to `frontend`.
3. **Duplicate Vercel Project Creation (`land-guard-ai-ten`)**: A second Vercel deployment was initiated targeting `frontend/`, which Vercel automatically assigned the suffix `-ten` (`land-guard-ai-ten.vercel.app`) because the subdomain `land-guard-ai` was already claimed by the initial project.
4. **Onboarding Gate Routing**: Within `frontend/src/App.tsx`, a `RootHandler` checked `localStorage.getItem('landguard_has_entered')`. For any first-time visitor, it automatically redirected `/` to `/welcome`, bypassing the landing page and immediately rendering `LoginPage`.

---

## 3. Corrective Unification Strategy

1. **Root & Frontend Vercel Configurations**:
   - Placed a canonical `vercel.json` at the repository root directing Vercel builds into `frontend/` (`"buildCommand": "cd frontend && npm run build"`, `"outputDirectory": "frontend/dist"`).
   - Maintained `frontend/vercel.json` with SPA rewrite rules (`"source": "/(.*)", "destination": "/index.html"`).
2. **Canonical Route Architecture**:
   - Route `/` now directly mounts the unified `LandingPage` inspired by Reference Image 1 with genuine LandGuard AI Bangladesh land content.
   - Route `/home` serves the unified main dashboard preserving all Screenshot 5 features.
   - Routes `/login` and `/register` serve the clean mint/white authentication card with the 4 profile options and 1-click Demo Access.
3. **Domain Consolidation Guidance**:
   - The user's primary canonical domain `https://land-guard-ai.vercel.app/` should be assigned to the production Git deployment on `main`.
   - Secondary domain `https://land-guard-ai-ten.vercel.app/` receives the identical bundle from the single source of truth repository.
