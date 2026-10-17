# Reference Screenshot to System Feature Mapping

**Project**: LandGuard AI  
**Date**: October 17, 2026  
**Auditor**: Lead Full-Stack Architect & Product Designer  

---

## Overview

The user provided six mandatory reference screenshots defining the visual language, authentication layout, role categorization, guest access, feature preservation, and business logic. This document defines the exact mapping between each screenshot and its implementation in LandGuard AI.

---

## 1. Screenshot-to-Requirement Mapping Table

| Screenshot | Design Artifact / Reference | System Component | Design & Functional Requirements |
| :--- | :--- | :--- | :--- |
| **IMAGE 1** | Primary Visual Identity & Landing Page | `frontend/src/pages/LandingPage.tsx` | - Premium dark emerald-green theme (`#05130E` / `#071D16`).<br>- Two-column hero layout with green gradient accent headline: *"আপনার জমির তথ্য, আরও নিরাপদ ও সহজে"*.<br>- Clean navigation header with logo, links, language switcher, Sign In, Get Started, and Demo Access.<br>- Four dark feature cards: Digital Land Search, Khasra Map, AI Transaction Screening, Evidence & Review.<br>- **Content Sanitization**: Removed all unrelated satellite degradation, restoration impact, and unsupported 95% claims.<br>- **Verified Data Summary**: Displays real synthetic backend counts: 3,000 parcels, 3,851 transactions, 1,188 review cases. |
| **IMAGE 2** | Authentication Card Layout | `frontend/src/pages/LoginPage.tsx` | - Centered clean authentication card on light mint/white background.<br>- Emerald-green leaf application logo in rounded container.<br>- Vertical form organization with visible labels, rounded inputs, and password visibility toggles (`Eye`/`EyeOff`).<br>- High-contrast green submit button.<br>- Unified layout serving **both** Login (`/login`) and Registration (`/register`).<br>- Replaced dark authentication variant from Screenshot 6 with this clean, accessible card. |
| **IMAGE 3** | Registration Role Categorization | `frontend/src/pages/LoginPage.tsx` | - Registration dropdown with **exactly 4 public user-profile options**:<br>  1. `Farmer (কৃষক)` 🧑‍🌾<br>  2. `Land Owner (জমির মালিক)` 🏡<br>  3. `Researcher (গবেষক)` 🔬<br>  4. `General Citizen (সাধারণ নাগরিক)` 👤<br>- **Security Enforcement**: Stored strictly as profile metadata. Backend assigns the safe `viewer` role only. Public users are never granted `admin` or `reviewer` privileges (HTTP 403 Forbidden). |
| **IMAGE 4** | One-Click Demo Access | `LoginPage.tsx`, `LandingPage.tsx`, `Navbar.tsx` | - Prominent card placed below the authentication forms on both Login and Register.<br>- **Exact Required Bengali Text**: *"লগইন ছাড়াই ডেমো দেখুন"*<br>- **Exact Required Supporting Text**: *"কোনো অ্যাকাউন্ট ছাড়াই নমুনা জমি ও লেনদেনের তথ্য দেখুন।"*<br>- **Exact English Translation**: *"Explore Demo Without Login"* / *"Explore sample land records and transactions without creating an account."*<br>- One-click execution calling `POST /api/auth/demo` and navigating directly to `/home`.<br>- Authorized read-only guest session with visible *"ডেমো মোড"* indicator in navbar. |
| **IMAGE 5** | Existing Main System Features | `frontend/src/pages/HomePage.tsx`, `DashboardPage.tsx` | - Preserves all working LandGuard AI capabilities:<br>  - Bangladesh agricultural land hero imagery (`hero-bg.jpg`).<br>  - Main Bengali heading: *"আপনার জমির তথ্য, নিরাপদ ও সহজে পর্যালোচনা করুন"*.<br>  - Land search, Digital Khasra Map, 3D Parcel Explorer, RMD triangulation audit, Transaction Explorer, Review Workspace, Report Center, AI Copilot, Settings.<br>- Restyled into Image 1's dark emerald-green theme with refined borders and high contrast. |
| **IMAGE 6** | Existing Authentication Logic Migration | `backend/app/auth.py`, `backend/app/main.py` | - Preserves all backend authentication behavior, session management, Argon2id password KDF hashing, duplicate detection (HTTP 409), and role authorization.<br>- Conflicting dark UI from Screenshot 6 retired in favor of Screenshot 2's clean layout. |

---

## 2. Design Consistency & Theme Unification

- **Light Mode**: Clean mint/white surfaces with deep emerald accents, matching Screenshot 2's accessible cards.
- **Dark Mode**: Refined botanical forest-green surfaces (`#05130E` / `#071D16`), matching Screenshot 1's aesthetic.
- **Typography**: Inter/Manrope font family with Noto Sans Bengali for authentic Bengali script rendering.
