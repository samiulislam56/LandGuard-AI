# Dashboard UI/UX & Living Land Experience Repair Report

**File Reference:** `frontend/src/components/ui/LivingLandHero.tsx`, `frontend/src/pages/HomePage.tsx`, `frontend/src/pages/DashboardPage.tsx`  
**Date:** October 17, 2026  

---

## 1. Problem Statement & Root Cause

### Defects Identified:
1. **Low Contrast Hero CTAs:** The hero action buttons in `LivingLandHero.tsx` used dark translucent backgrounds with insufficient contrast against the background gradient and particles. On mobile and lower-brightness screens, text was difficult to read.
2. **Text Clipping in Service Tiles:** Service cards in `HomePage.tsx` had fixed heights or constrained flex properties that clipped Bengali descenders and vowel diacritics (হ্রস্ব-ই, দীর্ঘ-ই, হ্রস্ব-উ কার) across medium tablet viewports.
3. **Hero Aspect Ratio & Height:** The previous hero section occupied excessive vertical viewport real estate on desktop monitors, pushing primary service entry points below the fold.

---

## 2. Technical Implementation & Remediations

### 1. High-Contrast Hero Action Buttons
- **Primary Action ("জমি অনুসন্ধান শুরু করুন"):**
  - Background: Solid emerald green (`bg-emerald-600` / `#0E8D60`) with crisp white text (`text-white`).
  - Target size: Minimum height of `48px` (`min-h-[48px]`), satisfying touch target guidelines.
  - Hover / Focus: High-contrast focus ring (`focus:ring-4 focus:ring-emerald-300`), subtle scale elevation (`hover:scale-[1.02] active:scale-[0.98]`).
- **Secondary Action ("খসড়া ক্যাডাস্ট্রাল ম্যাপ"):**
  - Background: Semi-transparent glass with solid 2px white border (`border-2 border-white/60 bg-white/15 text-white hover:bg-white/25`).
  - Accessibility: High-contrast text shadow and explicit focus outline (`focus:ring-4 focus:ring-white/40`).

### 2. Service Tiles Grid Overhaul
- Converted container to a responsive CSS Grid:
  ```css
  grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4.5
  ```
- Guaranteed min-height (`min-h-[195px]`) and flexible flex column layout so Bengali multi-line descriptions have adequate breathing room without overflow or line truncation.

### 3. Continuous Living Land Animation on Dashboard
- Integrated a live continuous Living Land animated banner in `DashboardPage.tsx`:
  - Ambient slow-drift cadastral parcel motif with floating contour particles.
  - Live metric widgets displaying synthetic ecosystem stats (Total Audited Parcels, Active Review Queue, Fraud Prevention Rate, RMD Triangulation Confidence).
  - Reduced motion accessibility respect (`@media (prefers-reduced-motion: reduce)`).
