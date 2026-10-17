# LANDGUARD AI — AUTHENTICATION & GUEST ACCESS REGRESSION REPORT

## 1. Scope & Objectives
This audit verifies the security, integrity, and usability of all authentication and guest user journeys in LandGuard AI:
1. Public User Registration with Argon2id password hashing.
2. 4 Citizen Profile Categories (`Farmer`, `Land Owner`, `Researcher`, `General Citizen`).
3. Single-Click Guest Demo Access (**"লগইন ছাড়াই ডেমো দেখুন"**).
4. Role-Based Access Control (RBAC) ensuring public registrations receive non-administrative roles.
5. Protection against credential leakage in public repositories and client bundles.

---

## 2. Authentication Test Results

| Test Scenario | Method / Route | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **New Citizen Registration** | `POST /auth/register` | User created with Argon2id hash | HTTP 201 Created | **PASS** |
| **Duplicate Registration Rejection** | `POST /auth/register` | HTTP 400 with duplicate error | HTTP 400 Bad Request | **PASS** |
| **Citizen Profile Categories** | `Farmer`, `Land Owner`, etc. | Validated profile field, role: `USER` | Role assigned: `USER` | **PASS** |
| **Public Privilege Escalation Guard**| `role: ADMIN` in payload | Ignored / rejected; role forced to `USER` | Default role enforced | **PASS** |
| **Password Mismatch Guard** | Different confirm password | HTTP 422 Unprocessable Content | HTTP 422 Returned | **PASS** |
| **Guest Demo Access** | `POST /auth/demo-login` | Token generated for read-only user | HTTP 200 Token returned | **PASS** |
| **Revoked Hardcoded Passwords** | Legacy known passwords | Inactive in production | Hardcoded accounts disabled | **PASS** |

---

## 3. UI/UX Verification
- Both [`LoginPage.tsx`](file:///e:/LandGuard-AI/frontend/src/pages/LoginPage.tsx) and [`RegisterPage.tsx`](file:///e:/LandGuard-AI/frontend/src/pages/RegisterPage.tsx) prominently feature the green guest access button:
  > **"লগইন ছাড়াই ডেমো দেখুন"**
- Clicking demo access allows unauthenticated citizens to browse synthetic cadastral maps, transaction histories, and AI screening results in read-only mode without credentials.
- Profile choices clearly explain citizen intent without implying government land inspector privileges.
