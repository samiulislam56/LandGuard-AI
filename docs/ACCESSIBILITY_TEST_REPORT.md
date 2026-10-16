# Accessibility (a11y) & Inclusive UX Test Report — LandGuard AI

**Standard**: WCAG 2.1 Level AA  
**Primary Language**: Bengali (বাংলা)  
**Secondary Language**: English  
**Audience**: Citizens with limited formal digital literacy, general citizens, researchers, and professional land reviewers.  

---

## 1. Compliance Summary

| Criterion | WCAG Guideline | Implementation Strategy | Status |
| :--- | :--- | :--- | :--- |
| **Color Contrast** | 1.4.3 Contrast (Minimum) | Minimum 4.5:1 ratio for normal text; 7:1 for headers. Deep forest green (`#064e3b` / `#022c22`) on warm ivory surfaces in light mode; soft off-white (`#f8fafc`) on botanical charcoal (`#09130e`) in dark mode. | **PASS** |
| **Bengali Typography** | 1.4.12 Text Spacing | `Noto Sans Bengali` / `Hind Siliguri` font stack with 1.6+ line-height to prevent conjunct character clipping or diacritic overlapping. | **PASS** |
| **Keyboard Operability** | 2.1.1 Keyboard Accessible | All interactive service cards, search dropdowns, modal dialogs, and map controls can be reached and activated using `Tab`, `Shift+Tab`, `Enter`, and `Space`. | **PASS** |
| **Focus Visible** | 2.4.7 Focus Visible | High-contrast 2px emerald focus rings (`focus:ring-2 focus:ring-emerald-500 focus:outline-none`) on all interactive buttons and inputs. | **PASS** |
| **Bilingual Toggle** | 3.1.2 Language of Parts | `i18n` language toggle with persistent storage in localStorage; HTML `lang="bn"` or `lang="en"` synchronized automatically. | **PASS** |
| **Non-Map Alternatives** | 1.1.1 Non-text Content | Accessible data cards and structured summary tables accompany all 2D schematic plots and 3D parcel visualizations. Users do not depend exclusively on visual coordinates. | **PASS** |
| **Cognitive Simplicity** | 3.3.2 Labels or Instructions | "সহজ মোড" (Simple Mode) by default eliminates unexplained ML metrics (`anomaly_score`, `rf_tree_depth`), replacing them with clear status pills (*"স্বাভাবিক"*, *"পর্যালোচনা প্রয়োজন"*, *"নামজারি অমিল"*). | **PASS** |

---

## 2. Touch Target & Mobile Usability

- All primary service tiles on the homepage and search action buttons maintain a minimum touch target size of **48x48 dp** to facilitate comfortable interaction on mobile and low-cost Android smartphones.
- Zero horizontal overflow (`overflow-x-hidden` container limits) across screen widths from 320px to 4K desktop displays.

---

## 3. Screen Reader Testing & Semantic Structure

- Single `<h1>` per view providing unambiguous context (*"আপনার জমির তথ্য, আরও সহজে"*, *"জমি ও খতিয়ান অনুসন্ধান"*, *"ডিজিটাল খসড়া ম্যাপ"*).
- All icons paired with meaningful `aria-label` or accompanying textual labels in Bengali.
- Modal dialogs (such as the AI Copilot) trap focus when active and support instant dismissal via the `Escape` key.

---

## 4. Bengali Land Terminology Glossary

An accessible Bengali Glossary (`/help`) is directly linked across the navigation bar and footer:
- **খতিয়ান (Khatian)**: ভূমির মালিকানা ও স্বত্ব সংরক্ষণকারী সরকারি খতিয়ান দলিল।
- **দাগ নম্বর (Dag Number)**: মৌজা নকশায় নির্দিষ্ট ভূমি খণ্ডের সীমানা ও ক্রমিক নম্বর।
- **নামজারি (Namjari / Mutation)**: মালিকানা পরিবর্তনের পর নতুন মালিকের নামে রেকর্ড হালনাগাদ করার দাপ্তরিক প্রক্রিয়া।
- **দলিল (Deed / Dalil)**: সাব-রেজিস্ট্রি অফিসে নিবন্ধিত ক্রয়-বিক্রয় চুক্তিপত্র।
- **RMD অডিট (Record Mutation Deed)**: খতিয়ান, নামজারি ও দলিলের মধ্যকার তথ্যের সামঞ্জস্য যাচাইকরণ।
