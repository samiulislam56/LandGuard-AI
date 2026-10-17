# New LandTech Features & Enhancements Report

**Date:** October 17, 2026  

---

## 1. Feature Implementations

### 1. Guided Land Search Wizard (জমি অনুসন্ধান)
- **Path:** `/search` (component: `LandGuardEasySearch.tsx`)
- **Enhancement:** Multi-step progressive disclosure wizard designed specifically for citizens with varying literacy and digital experience. Removed distracting voice assistant / microphone controls per user directive, focusing instead on clear visual selection of District (জেলা), Upazila (উপজেলা), Mouza (মৌজা), and Dag (দাগ নম্বর).
- **Benchmark Autocomplete:** Direct 1-click loading for popular benchmark parcels (e.g., `LG-P-002911`, `LG-P-000004`).

### 2. Digital Parcel Passport Modal & Print View
- **Path:** Accessible from Khasra Map and Parcel History via "পার্সেল পাসপোর্ট প্রিন্ট করুন"
- **Component:** `ParcelPassportModal.tsx`
- **Capabilities:**
  - Generates an official-looking synthetic Land Investigation Passport.
  - Displays Mouza metadata, JL number, Dag & Khatian numbers, surveyed area in acres & decimals, chronological chain of deeds, seller-buyer relationships, and ML screening verdict.
  - Dedicated `@media print` CSS stylesheet formatting the passport cleanly on A4 paper with high-contrast borders and clear legal synthetic disclaimer.

### 3. Plain-Language "Why Flagged?" Explanation
- Translates ML anomaly scores and rule violations into plain, actionable Bengali explanation:
  - *দাগের অতিরিক্ত জমি হস্তান্তর (Area Oversold)*
  - *একই দলিলে একাধিক গ্রহীতা (Multiple Simultaneous Transferees)*
  - *নামজারি পর্চা অমিল (Mutation Record Discrepancy)*
- Replaces raw technical feature names with everyday land terminology easily understood by rural citizens.

### 4. Cadastral Boundary Ridge & Survey Corner Stones ("জমির বেড় ও সীমানা পিলার")
- High-contrast boundary stroke (`strokeWidth: 4.5`, `#047857` normal, `#DC2626` conflict, `#D97706` mismatch).
- Glowing selection aura and stone markers (`SURVEY_CORNER_STONES`) marking survey corner stone coordinates.
- Dashed outer boundary representing the full mouza ridge.
