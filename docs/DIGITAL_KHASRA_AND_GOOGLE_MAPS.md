# LANDGUARD AI — DIGITAL KHASRA & GEOGRAPHIC MAP SPECIFICATION

**Module:** Digital Khasra / Cadastral Plot Map & Google Maps Context  
**Inspiration:** Reference Screenshots 3 & 4 (Numbered Khasra plots & boundary overlays)  
**Standard:** Synthetic LandTech Visualization & Non-Government Disclaimer  

---

## 1. Dual-Mode Map Architecture

LandGuard AI provides two complementary map modes:

```mermaid
graph TD
    MapContainer[Digital Khasra Map View] --> ModeSwitch{Map Mode Selector}
    ModeSwitch -->|Mode 1: Default| Mode1[ধারণামূলক খসড়া মানচিত্র - Conceptual Khasra Map]
    ModeSwitch -->|Mode 2: Geographic Context| Mode2[ভৌগোলিক ম্যাপ - Geographic Map Context]

    subgraph Mode1_Details [Mode 1: Conceptual Khasra Map]
        M1_Plots[Numbered Dag / Plot Polygons]
        M1_Labels[Plot Dag Numbers: দাগ নং ১০১, ১০২, ১০৩...]
        M1_Colors[Status Coloring: সবুজ=স্বাভাবিক, হলুদ=পর্যালোচনা, লাল=বিরোধ]
        M1_Inspect[Interactive Click: Plot Details & Linked Transactions]
        M1_Disclaimer[Mandatory: ধারণামূলক খসড়া মানচিত্র — সরকারি জরিপ নয়]
    end

    subgraph Mode2_Details [Mode 2: Google Maps / GIS Context]
        M2_Google[Google Maps JS API / OpenStreetMap Satellite Hybrid]
        M2_Bounds[8 Division & 64 District Geographic Centers]
        M2_Active[Highlighting Supported Districts: Dhaka, Chattogram, Rajshahi, Khulna]
        M2_Attribution[Google Maps Legal Attribution & Clean Fallback]
    end

    Mode1 --> Mode1_Details
    Mode2 --> Mode2_Details
```

---

## 2. Mode 1 — Conceptual Khasra Map (Schematic Plot Layout)

### Design & Layout (Inspired by Reference 3 & 4)
- Plots are rendered as clear geometric polygon parcels arranged in a realistic Mouza layout.
- Each parcel block shows:
  - **দাগ নম্বর (Dag Number):** e.g., `১০১`, `১০২`, `১০৩`, `১০৪`.
  - **জমির পরিমাণ (Area in Acres):** e.g., `০.৩৫ একর`.
  - **স্ট্যাটাস ইন্ডিকেটর (Status Color):** Emerald (স্বাভাবিক), Amber (পর্যালোচনা প্রয়োজন), Rose (মালিকানা অসংগতি).
- Clicking any parcel immediately opens the **Parcel Intelligence Drawer** showing:
  - Parcel ID (`PARCEL-002911`)
  - খতিয়ান নম্বর (Khatian No.)
  - জেলা ও উপজেলা (District & Upazila)
  - সংশ্লিষ্ট লেনদেনসমূহ (Linked Transactions)
  - RMD ধারাবাহিকতা স্ট্যাটাস (RMD Triangulation Status)
- Prominent persistent banner:
  > **"ধারণামূলক খসড়া মানচিত্র — সরকারি জরিপ নয়"**  
  > *(This schematic plot diagram is for demonstration and decision-support only; it is not an official cadastral survey.)*

---

## 3. Mode 2 — Geographic Map Context (Google Maps & GIS)

- Uses Google Maps JavaScript API with graceful fallback to OpenStreetMap / Leaflet tile layers when no API key is set in `VITE_GOOGLE_MAPS_API_KEY`.
- Correctly displays division markers and district boundaries across Bangladesh.
- Highlights the four synthetic data districts (Dhaka, Chattogram, Rajshahi, Khulna) with clickable badges that jump directly to their supported Mouza records.
- Accessible zoom, pan, full-screen, and reset controls with full touch responsiveness.
