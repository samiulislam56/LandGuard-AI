# Authentication & Guest Demo Architecture Report — LandGuard AI

**Date**: 2026-10-17  
**Scope**: User Registration, Institutional Login, 1-Click Guest Demo Access, and Role-Based Access Control (RBAC)  

---

## 1. Multi-Tier Access Matrix

LandGuard AI enforces a clean separation of capabilities across 3 user personas:

| Persona | Authentication State | Assigned Role | Permitted Actions | Restricted Actions |
| :--- | :--- | :--- | :--- | :--- |
| **Guest Demo User** | Unauthenticated OR Authorized Demo Token (`demo_guest`) | `viewer` | • Browse public dashboards<br>• Search 3,000 synthetic parcels<br>• View transaction histories<br>• Explore schematic Khasra maps<br>• View explainable AI assessments<br>• Query Bengali AI Copilot | • Cannot edit review cases<br>• Cannot change dispute statuses<br>• Cannot access admin controls<br>• Cannot modify DB records |
| **Registered Citizen** | Authenticated via `POST /api/auth/register` or `/login` | `viewer` | • All Guest Demo permissions<br>• Persistent user profile<br>• Authorized session token with 24h TTL | • Cannot mutate institutional review records<br>• Lacks reviewer/admin permissions |
| **Authorized Reviewer / Admin** | Provisioned securely via host environment variables | `reviewer` / `admin` | • Full administrative case workspace<br>• Update review statuses (`APPROVED_VALID`, `FLAGGED_DISPUTE`)<br>• Audit trail generation<br>• System telemetry & PDF dossiers | • Protected by Argon2id password verification and RBAC middleware |

---

## 2. 1-Click Demo Access Feature ("লগইন ছাড়াই ডেমো দেখুন")

Per mandatory product requirements, a dedicated Demo Access section is placed directly below the primary authentication form on **both Login and Registration screens**:

- **Button Text**:
  - বাংলা: **"লগইন ছাড়াই ডেমো দেখুন"**
  - English: **"Explore Demo Without Login"**
- **Supporting Text**:
  - বাংলা: *"কোনো অ্যাকাউন্ট ছাড়াই নমুনা জমি ও লেনদেনের তথ্য দেখুন।"*
  - English: *"Explore sample land records and transactions without creating an account."*
- **Mechanism**:
  - Calls `api.demoLogin()`, generating a secure `demo_guest` session token from `POST /api/auth/demo`.
  - Sets `landguard_has_entered = 'true'` in client storage.
  - Redirects immediately to `/home` (the main Greenfield portal).
  - Displays a visible **"ডেমো মোড" (Demo Mode)** indicator in the top navigation bar.

---

## 3. Server-Side Enforcement (Defense-in-Depth)

Guest restrictions are strictly enforced on the **FastAPI backend**, not merely hidden in the frontend UI:
- Sensitive mutation endpoints (e.g., `PATCH /api/reviews/{case_id}`) are guarded with:
  ```python
  current_user: UserProfile = Depends(require_role(["reviewer", "admin"]))
  ```
- If an unauthenticated guest attempts a mutation &rarr; **HTTP 401 Unauthorized**.
- If a registered citizen or demo guest attempts a mutation &rarr; **HTTP 403 Forbidden** (*"User with role 'viewer' lacks permission for this action"*).
