# LANDGUARD ATLAS — BILINGUAL INTERNATIONALIZATION (i18n) COVERAGE REPORT
## Complete Bangla + English Localization Architecture & Verification

**Document Version:** 1.0.0  
**Date:** October 16, 2026  
**Lead:** Internationalization & Localization Engineer  
**Languages Supported:** English (`en`) and বাংলা (`bn`)  
**Locale Files:**
- `frontend/src/locales/en.json`
- `frontend/src/locales/bn.json`

---

## 1. Architectural Overview

The internationalization architecture uses **`i18next`** and **`react-i18next`**, configured in `frontend/src/i18n.ts` and initialized in `frontend/src/main.tsx`.

### Key Architecture Highlights:
- **Instant Switching:** Language toggle changes state immediately via `i18n.changeLanguage(lang)`, re-rendering all `useTranslation()` consumers without full page reloads.
- **Persistence:** Selected language preference is automatically stored in `localStorage` under key `landguard_language` with fallback to browser language detection.
- **Document Binding:** `document.documentElement.lang` is dynamically synchronized to `'en'` or `'bn'` for assistive technology and screen readers.
- **Non-Technical Identifiers Rule:** As strictly specified by the master requirements, technical identifiers such as Transaction IDs (`TX-002911-2`), Parcel IDs (`LG-P-002911`), Dag numbers, and machine-readable status codes retain their canonical syntax, while all user-facing labels, table headers, buttons, disclaimers, and explanations are localized.

---

## 2. Translation Dictionaries Structure & Key Coverage

Both locale files (`en.json` and `bn.json`) maintain an identical hierarchical JSON key structure:

```
{
  "app": { ... },
  "nav": { ... },
  "topbar": { ... },
  "filters": { ... },
  "scenarios": { ... },
  "metrics": { ... },
  "map": { ... },
  "dossier": { ... },
  "results": { ... },
  "charts": { ... },
  "explorer3d": { ... },
  "settings": { ... },
  "common": { ... }
}
```

### Key Namespace Breakdown:

| Namespace | Key Count | Description | Sample English | Sample Bengali |
| :--- | :--- | :--- | :--- | :--- |
| `app` | 4 | Brand name, subtitle, and synthetic data legal disclaimer. | "LandGuard Atlas" | "ল্যান্ডগার্ড অ্যাটলাস" |
| `nav` | 9 | Sidebar and mobile drawer navigation routes. | "Geo Intelligence", "AI Assessment" | "ভূ-গোয়েন্দা পর্যবেক্ষণ", "এআই মূল্যায়ন" |
| `topbar` | 6 | Search placeholders, division/district selectors, quick links. | "Search transaction or plot..." | "লেনদেন বা খতিয়ান অনুসন্ধান..." |
| `filters` | 8 | Division and district filtering controls and labels. | "All Divisions", "No synthetic records available" | "সকল বিভাগ", "এই জেলায় কোন কৃত্রিম রেকর্ড নেই" |
| `scenarios` | 8 | Forensic transaction scenario classifications. | "Conflicting Double Sale", "Area Mismatch" | "বিরোধপূর্ণ দ্বৈত বিক্রয়", "জমির পরিমাপে গরমিল" |
| `metrics` | 6 | Dashboard metric cards (parcels, deeds, cases). | "Total Cadastral Parcels", "Multi-Deed Plots" | "মোট জরিপকৃত প্লট", "একাধিক দলিলের প্লট" |
| `map` | 7 | Map controls, layers, and satellite overlays. | "Cadastral Boundary Layer", "Reset Camera" | "ক্যাডাস্ট্রাল সীমানা স্তর", "ক্যামেরা রিসেট" |
| `dossier` | 10 | Transaction and deed inspection metadata. | "Chain of Title", "Seller Alias", "Deed Value" | "মালিকানা পরম্পরা", "বিক্রেতার ছদ্মনাম", "দলিল মূল্য" |
| `results` | 5 | AI Assessment final determination labels. | "Review Required", "Pending Verification" | "পর্যালোচনা আবশ্যক", "তারিখ যাচাই অপেক্ষমাণ" |
| `charts` | 4 | Analytics chart titles, tooltips, and axes. | "Scenario Frequency Distribution" | "পরিস্থিতি ভিত্তিক লেনদেন বিন্যাস" |
| `explorer3d` | 9 | 3D Parcel Explorer titles, tooltips, and controls. | "3D Cadastral Parcel Explorer", "Conceptual 3D" | "ত্রিমাত্রিক ক্যাডাস্ট্রাল পার্সেল অনুসন্ধান", "ধারণাগত ৩ডি" |
| `settings` | 8 | Theme, motion, and API connectivity labels. | "Interface Appearance", "Motion Controls" | "ইন্টারফেসের রূপরেখা", "অ্যানিমেশন নিয়ন্ত্রণ" |
| `common` | 12 | Generic UI actions, states, and button labels. | "Audit Deed", "Export / Print", "Loading..." | "দলিল নিরীক্ষা", "রপ্তানি / প্রিন্ট", "লোড হচ্ছে..." |

---

## 3. Bangladesh Administrative Geography Coverage

In `frontend/src/data/bangladeshAdmin.ts`, all **8 divisions** and **64 districts** are comprehensively defined with:
- Standard English name
- Verified Bengali script spelling (বাংলা নাম)
- Geographic centroid coordinates (`lat`, `lng`)
- Default map zoom framing
- Explicit synthetic data coverage flag (`hasSyntheticCoverage`)

### Sample Division Mapping:
- **Dhaka / ঢাকা** (13 Districts: Dhaka, Gazipur, Narayanganj, Tangail, Kishoreganj, Manikganj, Munshiganj, Narsingdi, Faridpur, Gopalganj, Madaripur, Rajbari, Shariatpur)
- **Chattogram / চট্টগ্রাম** (11 Districts: Chattogram, Cox's Bazar, Cumilla, Feni, Brahmanbaria, Chandpur, Lakshmipur, Noakhali, Khagrachhari, Rangamati, Bandarban)
- **Rajshahi / রাজশাহী** (8 Districts: Rajshahi, Bogura, Joypurhat, Naogaon, Natore, Chapainawabganj, Pabna, Sirajganj)
- **Khulna / খুলনা** (10 Districts: Khulna, Bagerhat, Chuadanga, Jashore, Jhenaidah, Kushtia, Magura, Meherpur, Narail, Satkhira)
- **Barishal / বরিশাল** (6 Districts: Barishal, Barguna, Bhola, Jhalokati, Patuakhali, Pirojpur)
- **Sylhet / সিলেট** (4 Districts: Sylhet, Habiganj, Moulvibazar, Sunamganj)
- **Rangpur / রংপুর** (8 Districts: Rangpur, Dinajpur, Gaibandha, Kurigram, Lalmonirhat, Nilphamari, Panchagarh, Thakurgaon)
- **Mymensingh / ময়মনসিংহ** (4 Districts: Mymensingh, Jamalpur, Netrokona, Sherpur)

---

## 4. Bengali Typography & Script Rendering Optimizations

Bengali script requires deliberate typographical handling to avoid common visual defects:
1. **Font Choice:** Implemented `Noto Sans Bengali` and `Hind Siliguri` loaded from Google Fonts via `frontend/index.html`.
2. **Line-Height Preservation:** Applied `line-height: 1.6` (`leading-relaxed`) across Bengali labels. This ensures conjunct consonants (*juktakkhor*) and vertical vowel signs (*ikar*, *dirghikar*, *ukar*, *dirghukar*, *hoshonto*) are never clipped by container boundaries.
3. **Numerals:** Configured tabular figures for IDs and financial figures while maintaining English numerals for technical data IDs to ensure consistency across cadastral filings.

---

## 5. Dynamic Backend Messages Handling

Per the Master Prompt instructions:
- When predefined evidence flags occur (`seller_owner_mismatch`, `area_mismatch`, `overlapping_claim`, etc.), typed translations in `scenarios.*` and `dossier.*` are displayed.
- For dynamic unstructured evidence findings generated by the Python evidence verification engine (e.g. *"Transaction date is in the future relative to assessment date 2026-10-15"*), the original English string is rendered verbatim inside a structured badge, preserving forensic legal precision without introducing mistranslations.

---

## 6. Verification Checklist

- [x] Language switcher present in Top Command Bar on all routes.
- [x] Language switcher present in Settings page with interactive EN/বাংলা radio cards.
- [x] Immediate UI re-rendering without page reload.
- [x] Preference persisted across sessions in `localStorage`.
- [x] Zero raw translation keys visible in any route.
- [x] No text clipping or line-height overlap in Bengali rendering.
- [x] 8 divisions and 64 districts available in both languages.
- [x] All 8 primary routes verified in English and Bengali.
