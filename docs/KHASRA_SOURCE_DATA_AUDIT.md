# Digital Khasra Map Data Provenance & Real Synthetic Dataset Audit

**File Reference:** `frontend/src/pages/KhasraMapPage.tsx`, `backend/data/parcels.csv`, `backend/app/main.py`  
**Date:** October 17, 2026  

---

## 1. Forensic Audit: Where Did "Aminbazar (JL45), Savar" Originate?

### Investigation:
A previous frontend prototype featured a mock label: `"মৌজা: আমিনবাজার (JL45), সাভার"`. 
However, an audit of the true synthetic backend database (`backend/data/parcels.csv`, containing 3,000 synthetic records) revealed that **no parcel in the dataset belongs to Aminbazar or JL-45**.

The real synthetic dataset covers exactly 4 distinct Mouzas across Bangladesh (750 parcels each):

| District | Upazila | Mouza | JL Number | Dag Range | Khatian Range |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Dhaka** | Savar | **Ashulia** | `JL-005` | 101 – 850 | 1001 – 1750 |
| **Khulna** | Dumuria | **Raghunathpur** | `JL-032` | 101 – 850 | 1001 – 1750 |
| **Chattogram** | Patiya | **Haidgaon** | `JL-001` | 101 – 850 | 1001 – 1750 |
| **Rajshahi** | Paba | **Haripur** | `JL-082` | 101 – 850 | 1001 – 1750 |

Specifically:
- **`LG-P-002911`** (Benchmark test parcel with conflicting transactions) is located in:  
  **Khulna / Dumuria / Mouza: Raghunathpur (JL-032), Dag 611, Khatian 1211, Area 0.39 acres**.
- Attributing `LG-P-002911` to "Aminbazar, Savar" was a factual contradiction with the backend dataset and API responses.

---

## 2. Remediations Implemented

1. **Dynamic Backend Querying via React Query:**
   `KhasraMapPage.tsx` now leverages TanStack React Query to fetch the authentic parcel record directly from `/parcels/:id/history`:
   ```typescript
   const { data: realParcelHistory } = useQuery({
     queryKey: ['khasraParcelHistory', activeParcelId],
     queryFn: () => api.getParcelHistory(activeParcelId),
     enabled: Boolean(activeParcelId && activeParcelId.startsWith('LG-P-')),
     staleTime: 60000,
   });
   ```

2. **Accurate Provenance Badge:**
   When a parcel is queried, the header dynamically updates to display the verified record:
   ```tsx
   {realParcelHistory?.parcel ? (
     <>মৌজা: <strong>{realParcelHistory.parcel.mouza} ({realParcelHistory.parcel.jl_no})</strong> • {realParcelHistory.parcel.upazila}, {realParcelHistory.parcel.district} [বাস্তব সিন্থেটিক রেকর্ড]</>
   ) : (
     <>মৌজা: <strong>আশুলিয়া (JL-005)</strong> • সাভার, ঢাকা [নমুনা ডেমো এলাকা]</>
   )}
   ```

3. **Explicit Distinction between Schematic Topology & Ground Truth:**
   The UI clearly labels the interactive SVG polygon view as a *মৌজা নকশা স্কেচ (Schematic Cadastral Diagram)* for spatial relationship comprehension, while displaying verified source deeds, dates, and ownership records in the inspection panel and Parcel Passport.
