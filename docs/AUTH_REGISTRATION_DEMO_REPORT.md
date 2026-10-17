# Authentication, Public Registration & One-Click Demo Access Report

**Project**: LandGuard AI  
**Date**: October 17, 2026  
**Auditor**: Senior Authentication Security Specialist  

---

## 1. Public User Registration Fix & Hardening

### A. Root Cause Resolution
- Previously, submitting the registration form resulted in: *"Registration failed. Please try again."*
- **Forensic Diagnosis**: The backend FastAPI service lacked an implementation for `POST /api/auth/register`, and the typed frontend API client in `frontend/src/lib/api.ts` had no corresponding `register()` method. Requests returned HTTP 404.
- **Backend Fix**: Implemented `RegisterRequest` schema and `register_user()` in `backend/app/auth.py`, backed by RFC 9106 **Argon2id** password hashing (`m=65536, t=3, p=4`).
- **Database Migration**: Added automated, idempotent column additions for `full_name` and `email` on the `users` table in `backend/app/database.py`.

### B. Screenshot 3 Role Categorization & Privilege Protection
The registration form includes the exact 4 user-profile categories:
1. `Farmer (কৃষক)` 🧑‍🌾
2. `Land Owner (জমির মালিক)` 🏡
3. `Researcher (গবেষক)` 🔬
4. `General Citizen (সাধারণ নাগরিক)` 👤

**Security Guardrail**:
- Profile selection is recorded for tailoring user guidance, but the backend strictly grants the safe `viewer` role.
- Public registration requests attempting to supply or claim `admin`, `reviewer`, or `root` are rejected with **HTTP 403 Forbidden**.
- Duplicate usernames or emails trigger **HTTP 409 Conflict**.

---

## 2. Screenshot 4 One-Click Demo Access Feature

### Visual Presentation
Positioned directly below the authentication form on both `/login` and `/register`:
- **Button Text**:
  - বাংলা: **"লগইন ছাড়াই ডেমো দেখুন"**
  - English: **"Explore Demo Without Login"**
- **Supporting Text**:
  - বাংলা: *"কোনো অ্যাকাউন্ট ছাড়াই নমুনা জমি ও লেনদেনের তথ্য দেখুন।"*
  - English: *"Explore sample land records and transactions without creating an account."*

### Functional & Authorization Behavior
- One-click trigger executes `POST /api/auth/demo` and redirects to `/home`.
- Establishes an authorized guest session with a visible **"ডেমো মোড" (Demo Mode)** indicator in the navigation bar.
- **Permitted Guest Access**: Public dashboard, synthetic parcel search, cadastral Khasra map, transaction history, AI assessment explanations, demo reports, and AI Copilot.
- **Backend-Enforced Restrictions**: Review case modifications (`PATCH /api/reviews/{id}`) and administrative endpoints are rejected with **HTTP 401 Unauthorized** or **HTTP 403 Forbidden**.
