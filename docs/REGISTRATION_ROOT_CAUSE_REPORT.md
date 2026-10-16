# Forensic Root Cause Analysis Report: Registration Failure

**Project**: LandGuard AI  
**Date**: 2026-10-17  
**Investigator**: Senior Full-Stack & Authentication Security Engineer  
**Component**: Authentication Subsystem (React / Vite Frontend & Python FastAPI Backend)  

---

## 1. Problem Statement

When attempting to register a new account on the user onboarding page, the application surfaced the following error to the user:
> *"Registration Error — Registration failed. Please try again."*

---

## 2. Investigation & Forensic Trace

### A. Frontend API Client Audit
- Inspection of `frontend/src/lib/api.ts` revealed that while authentication methods `login()`, `logout()`, `demoLogin()`, and `getMe()` existed, **no `register()` API method was defined**.
- In the initial UI, the registration form submission had no matching backend API contract to call, and earlier revisions or attempts to submit an account either triggered a 404 Not Found error against unrouted paths or fell back to mock mutations.

### B. Backend OpenAPI Route Specification Audit
- Inspection of `backend/app/main.py` and `backend/app/auth.py` revealed:
  - `POST /api/auth/login`: Present.
  - `POST /api/auth/demo`: Present.
  - `POST /api/auth/logout`: Present.
  - `GET /api/auth/me`: Present.
  - **`POST /api/auth/register`: Completely MISSING (HTTP 404 Not Found)**.
- Any network request targeting `/api/auth/register` resulted in an immediate **HTTP 404 (Not Found)** status code from FastAPI, triggering the generic failure toast: *"Registration failed. Please try again."*

### C. Database Schema Audit
- The `users` table created in `backend/app/database.py` initially had only:
  - `username TEXT PRIMARY KEY`
  - `hashed_password TEXT NOT NULL`
  - `salt TEXT NOT NULL DEFAULT ''`
  - `role TEXT NOT NULL DEFAULT 'reviewer'`
  - `created_at TEXT NOT NULL`
- The table lacked columns for `full_name` and `email`, causing potential schema divergence if arbitrary user attributes were passed.

---

## 3. Corrective Implementation

### 1. Backend Endpoint Implementation (`POST /api/auth/register`)
- Created Pydantic schema `RegisterRequest` in `backend/app/auth.py`:
  - `name`: string (min 2 chars)
  - `username`: string (min 3 chars, alphanumeric)
  - `email`: optional email string
  - `role`: string (defaults to Farmer / Citizen)
  - `password`: string (min 6 chars)
  - `confirm_password`: validation against password
- Created `register_user(data: RegisterRequest) -> LoginResponse`:
  - **Argon2id Hashing**: Uses `hash_password(data.password)` with memory cost `m=65536`, time cost `t=3`, parallelism `p=4`.
  - **Role Hardening**: Strictly assigns public registered users the safe `viewer` role. Prevents privilege escalation by disallowing registration as `admin`, `reviewer`, or `root` (HTTP 403 Forbidden).
  - **Conflict Detection**: Checks for existing usernames and emails with explicit **HTTP 409 Conflict** errors.
  - **Auto-Session Establishment**: Creates and returns an active session token upon registration so the user is immediately authenticated.

### 2. Database Schema Migration
- Added automated migration in `backend/app/database.py` to ensure `full_name` and `email` columns exist on `users` across SQLite and PostgreSQL databases without breaking existing tables.

### 3. Frontend Service & UI Integration
- Added `api.register(payload: RegisterPayload)` in `frontend/src/lib/api.ts`.
- Integrated `registerMutation` in `frontend/src/pages/LoginPage.tsx` with user-friendly, localized error and success messages.

---

## 4. Verification

- Backend unit tests created in `backend/tests/test_api.py`:
  - `test_public_registration_success`: **PASSED** (HTTP 201 Created, Argon2id hash verified, viewer role assigned).
  - `test_registration_duplicate_username_conflict`: **PASSED** (HTTP 409 Conflict).
  - `test_registration_password_mismatch`: **PASSED** (HTTP 422 Unprocessable Content).
  - `test_registration_reserved_username_rejected`: **PASSED** (HTTP 403 Forbidden for admin/reviewer).
  - `test_registered_viewer_user_cannot_mutate_reviews`: **PASSED** (HTTP 403 Forbidden on protected review mutations).
