# LANDGUARD AI — BENGALI-FIRST USER JOURNEYS & EXPERIENCE DESIGN

**Principle:** Bengali First, English Second. Accessible to citizens with diverse digital literacy.  
**Standard:** Clear visual hierarchy, plain language, recognizable icons, large touch targets.  

---

## 1. Journey 1: সাধারণ নাগরিক (General Citizen / Landholder)
*Goal: Look up a family land plot and understand if there are any conflicting transaction flags.*

1. **Step 1 — Arrival at Homepage:**
   - Citizen lands on `https://land-guard-ai.vercel.app`.
   - The page opens in clean, readable Bengali: **"আপনার জমির তথ্য, আরও সহজে"**.
   - Citizen sees the green rural Bangladesh landscape and clicks the primary CTA: **"জমির তথ্য খুঁজুন"** or **"ডেমো ব্যবহার করুন"**.
2. **Step 2 — Guided Search:**
   - Citizen selects **বিভাগ (Division)**: e.g., `ঢাকা`.
   - Citizen selects **জেলা (District)**: e.g., `Dhaka`.
   - Citizen enters **দাগ নম্বর (Dag No)**: `102` or **খতিয়ান নম্বর (Khatian No)**.
   - Clicks **"খুঁজুন"**.
3. **Step 3 — Inspecting Parcel & Digital Khasra:**
   - Results show matching synthetic parcel `PARCEL-002911` with schematic plot diagram.
   - Citizen sees plot acreage (`০.৫৫ একর`) and owner alias.
4. **Step 4 — Reviewing Transaction Status:**
   - Citizen clicks the latest transaction (`TX-002911-2`).
   - The result appears in plain Bengali:
     > **পর্যালোচনা প্রয়োজন (Review Required)**  
     > *"দলিলে উল্লিখিত বিক্রেতার সাথে পূর্বের খতিয়ান রেকর্ডের গরমিল পাওয়া গেছে। জমি ক্রয়ের পূর্বে সহকারী কমিশনার (ভূমি) অফিস থেকে নামজারি খতিয়ান যাচাই করার পরামর্শ দেওয়া হচ্ছে।"*
5. **Step 5 — Seeking Copilot Guidance:**
   - Citizen clicks the floating **"AI সহকারী"** button.
   - Asks: *"Review Required মানে কী?"*
   - Copilot gives a reassuring, clear explanation in Bengali with recommended next steps.

---

## 2. Journey 2: পেশাদার বিশ্লেষক (Cadastral Analyst / Researcher)
*Goal: Investigate potential double-selling patterns and check ML anomaly detection scores.*

1. **Step 1 — Switch to বিস্তারিত মোড (Advanced Mode):**
   - Analyst clicks the toggle on top of the assessment page.
2. **Step 2 — Feature Vector & Anomaly Score:**
   - Views the 9 binary features evaluated by the Random Forest classifier.
   - Inspects the Isolation Forest anomaly decision score (`-0.187` &rarr; `ANOMALY`).
3. **Step 3 — RMD Triangulation:**
   - Analyzes the 3-way discrepancy between Khatian ownership, Mutation consistency, and Deed registration.
4. **Step 4 — PDF Report Generation:**
   - Downloads official Cadastral Dossier PDF with full metadata and charts.

---

## 3. Journey 3: দায়িত্বপ্রাপ্ত ভূমি কর্মকর্তা (Authorized Caseworker / Reviewer)
*Goal: Triage flagged cases, record investigation notes, and update review status.*

1. **Step 1 — Secure Login:**
   - Logs in with Argon2id-authenticated caseworker account.
2. **Step 2 — Review Queue:**
   - Filters review cases by `UNREVIEWED` and scenario.
3. **Step 3 — Case Resolution:**
   - Reviews transaction evidence and marks status as `APPROVED`, `REJECTED`, or `IN_REVIEW`.
   - Writes caseworker notes which are saved immutably into the audit trail.
