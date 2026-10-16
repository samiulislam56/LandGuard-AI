# Frontend Visual QA & Design System Report — LandGuard AI

**Design Identity**: LandGuard Greenfield (Human-Friendly Digital Land Experience)  
**Atmosphere**: Agricultural, Trustworthy, Modern, Calm, Premium, Bilingual  
**Framework**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Vite  

---

## 1. Visual Aesthetics & Reference Realization

The frontend has been completely redesigned away from dense, intimidating cyber-dashboards toward a welcoming land-services portal inspired by the user's provided references:

1. **Agricultural Hero Section (Reference 2 Inspired)**:
   - High-resolution, authentic Bangladesh agricultural landscape (`hero-bg.jpg`) with a warm, soft gradient overlay.
   - Core value proposition in Bengali: *"আপনার জমির তথ্য, আরও সহজে"* supported by clear subtext explaining synthetic verification and review workflows.
   - Prominent Primary CTAs: *"জমির তথ্য খুঁজুন"* and *"ডেমো ব্যবহার করুন"*.

2. **Eight Service Shortcut Cards (Reference 2 Inspired)**:
   - Large, clickable, responsive cards with emerald/amber gradient icons:
     1. জমির তথ্য খুঁজুন (`/search`)
     2. খতিয়ান ও দাগ অনুসন্ধান (`/search?tab=khatian`)
     3. লেনদেন যাচাই ও স্ক্রিনিং (`/transactions`)
     4. ডিজিটাল খসড়া ম্যাপ (`/khasra`)
     5. RMD অডিট ও দলিল যাচাই (`/rmd`)
     6. AI সহকারী (`copilot`)
     7. আবেদন / রিভিউ অবস্থা (`/reviews`)
     8. সহায়তা ও নির্দেশিকা (`/help`)

3. **Cascading Land Search (Reference 1 Inspired)**:
   - Step 1: Select Division (Dhaka, Chattogram, Rajshahi, Khulna, Barishal, Sylhet, Rangpur, Mymensingh).
   - Step 2: Select District (64 Bangladesh districts supported, with clear synthetic coverage badges).
   - Step 3: Select Upazila & Mouza (e.g. Savar &rarr; Aminbazar, Pahartali &rarr; North Kattali).
   - Step 4: Enter Dag or Khatian or Parcel ID.
   - Zero-fabrication warning shown when a district outside the 4 synthetic test regions is selected.

4. **Digital Khasra Cadastral Map (Reference 3 & 4 Inspired)**:
   - Dual-mode visualization:
     - **Schematic Mode (ধারণামূলক নকশা)**: Interactive numbered SVG plot grid showing Dag 101 to 108 with plot boundaries, area in acres, and color-coded status badges (*"স্বাভাবিক"*, *"দ্বন্দ্বমূলক বিক্রয়"*, *"নামজারি অমিল"*).
     - **Geographic GIS Mode**: Integrated Google Maps / OpenStreetMap cadastral view with satellite imagery.
   - Mandatory synthetic disclaimer displayed prominently:
     > *"ধারণামূলক খসড়া মানচিত্র — সরকারি জরিপ নয়"*

5. **AI Copilot Floating Launcher & Modal**:
   - Floating assistant button anchored in bottom-right corner with spark and chat indicators.
   - Conversational Bengali-first answers grounded in application data and domain rules.

---

## 2. Theme Verification (Light & Dark)

- **Light Mode ("Greenfield Ivory")**:
  - Background: Warm cream/white (`bg-[#faf9f5]`).
  - Cards: Crisp ivory (`bg-white/95`) with 1px border (`border-emerald-900/10`).
  - Text: Deep forest green headings and readable charcoal body.
  - Zero contrast clipping or unreadable white-on-white text.
- **Dark Mode ("Botanical Charcoal")**:
  - Background: Deep slate green (`dark:bg-[#07130c]`).
  - Cards: Dark forest emerald surfaces (`dark:bg-[#0b1f15]`).
  - Text: Crisp off-white (`dark:text-slate-100`).
  - Contrast ratios exceed WCAG AA requirements across all controls.

---

## 3. Responsive Breakpoint Testing

- **Mobile Viewports (320px - 480px)**: Single-column service tiles, stacked search selectors, sticky mobile-friendly header.
- **Tablet Viewports (768px - 1024px)**: 2-column service grid, side-by-side search filters.
- **Desktop Viewports (1280px+)**: 4-column service grid, wide schematic plot viewer with parcel inspector sidebar.
