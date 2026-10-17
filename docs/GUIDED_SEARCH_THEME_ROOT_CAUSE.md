# Guided Land Search Theme & Contrast Root Cause Analysis

**Project:** LandGuard AI  
**Repository:** `https://github.com/samiulislam56/LandGuard-AI`  
**Date:** October 17, 2026  
**Auditors:** Senior React/TypeScript Engineer, Design System Architect, Accessibility Engineer  

---

## 1. Executive Summary & Defect Overview

The Guided Land Search wizard (`LandGuardEasySearch.tsx` mounted inside `SearchPage.tsx`) was reported to display critical contrast defects where cards rendered with white or near-white backgrounds while their contained typography remained pure white (`#FFFFFF`) or light grey (`#94A3B8`). As a result, critical land information (Dag numbers, Khatian numbers, locations, acreages, and status badges) was unreadable in Dark Mode.

---

## 2. Forensic Code Audit & Exact Root Causes

### Root Cause 1: Non-Existent Tailwind Class `dark:bg-slate-850`
In multiple locations across `LandGuardEasySearch.tsx`, unselected division buttons, suggested benchmark parcel cards, and the 4 key-fact result cards used the utility string:
```tsx
bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-300
```
- In default Tailwind CSS, color scale values are strictly defined as: `50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950`.
- **`slate-850` was NOT defined** in `frontend/tailwind.config.js`.
- Consequently, the Tailwind compiler discarded `dark:bg-slate-850` and generated **no CSS rule** for it.
- When Dark Mode was active (`.dark` on `<html>`), the fallback dark background failed to apply, leaving the Light Mode `bg-slate-50` (`#F8FAFC`, stark off-white) actively rendering.
- Meanwhile, child text elements had explicit rules such as `dark:text-white` (`#FFFFFF`) or `dark:text-slate-400` (`#94A3B8`).
- **Result:** White text rendered directly over a `#F8FAFC` off-white card background (Contrast Ratio: **1.05:1**, a catastrophic WCAG failure).

### Root Cause 2: Scattered Hardcoded Colors Without Centralized Semantic Tokens
- Rather than consuming CSS variable tokens from `tokens.css`, `LandGuardEasySearch.tsx` relied on ad-hoc Tailwind color utilities scattered across JSX elements.
- When `ThemeContext.tsx` toggled `.dark` on `document.documentElement`, arbitrary utility classes lacked consistent semantic inversion.
- `ThemeContext.tsx` only added/removed `.dark` without syncing `data-theme="dark"` / `data-theme="light"`, preventing CSS variable selectors from activating cleanly across scoped containers.

### Root Cause 3: Mock Data Disconnect & Fictional Provenance
- `EASY_SAMPLES` contained a mock entry attributing `LG-P-002911` to "Aminbazar, Savar", conflicting with the genuine synthetic database provenance (`backend/data/parcels.csv`), where `LG-P-002911` resides in Khulna / Dumuria / Raghunathpur (JL-032).

---

## 3. Remediations Implemented

1. **Centralized Semantic Tokens:** Aligned `tokens.css` with the production-recommended palette:
   - **Dark Theme:** Page `#061F1B`, Main Panel `#1E293B`, Card Surface `#304156`, Primary Text `#F8FAFC`, Secondary Text `#C5D5E4`, Border `#526579`, Accent `#34D399`, Primary Button `#047857`.
   - **Light Theme:** Page `#F5F8F4`, Main Panel `#FFFFFF`, Card Surface `#FFFFFF`, Primary Text `#172B26`, Secondary Text `#52645C`, Border `#D2E2D9`, Accent `#087F59`, Primary Button `#087F59`.
2. **Tailwind Fallback Protection:** Added `slate: { 850: '#304156' }` to `tailwind.config.js` to ensure any legacy references to `slate-850` safely resolve to an elevated dark surface.
3. **Component Refactoring:** Rewrote `LandGuardEasySearch.tsx` using explicit semantic surfaces and high-contrast text tokens.
4. **Theme Synchronization:** Updated `ThemeContext.tsx` to manage both the `.dark` class and `data-theme` attribute simultaneously.
