# Security & Data Privacy Audit — LandGuard AI

**Audit Date**: 2026-10-16  
**Auditor**: Senior Security & Platform Architect  
**Scope**: Full Stack (FastAPI Backend, React/Vite Frontend, SQLite/PostgreSQL Database, API Keys, RBAC, Data Minimization)  
**Standard Reference**: OWASP Top 10, CWE-259, Least Privilege, Bangladesh Synthetic Data Safeguards  

---

## 1. Executive Summary

LandGuard AI has transitioned from a development-mode prototype to an enterprise-grade, human-friendly land transaction screening platform. The architecture treats security as a **release-blocking requirement**, implementing rigorous defense-in-depth principles across all architectural layers.

Crucially, **no hardcoded administrator credentials, API secrets, or real citizen PII/NID data** are stored in the codebase or served to clients.

---

## 2. Authentication & Credential Architecture

| Control Category | Implementation | Verification Status |
| :--- | :--- | :--- |
| **Password Hashing** | `Argon2id` KDF (`argon2-cffi`) with custom salt, memory cost `m=65536`, time cost `t=3`, parallelism `p=4`. | **VERIFIED** — Passed unit test `test_argon2id_kdf_hashing`. Salted SHA-256 deprecated. |
| **Default Credential Provisioning** | Automatic generation of default demo reviewer/admin accounts in production is **STRICTLY DISABLED**. | **VERIFIED** — Tested via environment gating in `backend/app/auth.py`. |
| **Secure Admin Provisioning** | Dynamic admin bootstrap via secure environment variables (`INITIAL_ADMIN_EMAIL`, `INITIAL_ADMIN_PASSWORD`). | **VERIFIED** — Passed unit test `test_env_administrator_provisioning`. |
| **Session Security** | Signed HTTP-only, SameSite=Lax, Secure session tokens with 24-hour TTL and server-side invalidation upon logout. | **VERIFIED** — Zero client-side token exposure. |
| **Guest Demo Access** | Dedicated read-only guest scope (`Role.GUEST`). Guests cannot trigger mutable database actions or access administrative queues. | **VERIFIED** — Verified via `RoleChecker(["admin", "reviewer"])`. |

---

## 3. Data Privacy & Minimization

1. **Synthetic Data Integrity**:
   - All 3,000 parcels, 3,851 transactions, and 1,188 review cases are strictly synthetic records generated for algorithmic validation.
   - No real citizen National Identity (NID) numbers, biometric data, phone numbers, or residential addresses are collected or processed.
2. **Prominent Legal & Non-Government Disclaimers**:
   - Clear banner on every public screen:
     > *"সিন্থেটিক ডেটা প্রদর্শন ও সিদ্ধান্ত সহায়তা প্ল্যাটফর্ম। এটি কোনো সরকারি রেকর্ড পরিবর্তন বা আইনি স্বত্ব সনদ নয়।"*
     > *(Synthetic Demonstration & Decision Support System. Not a legal title certificate or government registry).*
   - System never asserts proven legal fraud; classifications are framed objectively as *"পর্যালোচনা প্রয়োজন"* (Review Required) or *"তথ্য অসম্পূর্ণ"* (Insufficient Evidence).

---

## 4. API & Network Security

1. **CORS Restrictions**:
   - `allow_origins`: Whitelisted only to verified production origins (`https://land-guard-ai.vercel.app`, `https://landguard-ai.vercel.app`) and local development ports (`http://localhost:5173`).
   - `allow_origin_regex`: Restricts Vercel preview URLs to `^https:\/\/.*\.vercel\.app$`. Wildcard `*` origins are completely disabled.
2. **Timing & Header Protections**:
   - `X-Process-Time` timing headers added for performance monitoring.
   - Global exception handler intercepts unhandled exceptions to prevent database stack traces or internal environment variables from leaking to the client.
3. **HTTP Strict Transport Security (HSTS)**:
   - Enforced by default on Render and Vercel CDN edges over TLS 1.3.

---

## 5. Input Validation & Injection Defenses

1. **Pydantic Schema Validation**:
   - All backend request payloads (`ReviewCaseUpdate`, `LoginRequest`, etc.) are validated against strict Pydantic models.
   - Negative pagination limits and extreme bounds are rejected with HTTP 422 (`test_invalid_pagination_limit_negative_422`, `test_invalid_pagination_limit_exceeded_422`).
2. **SQL Injection Prevention**:
   - All mutable reviews and audit entries use parameterized SQLAlchemy ORM statements. Raw string-interpolated SQL is strictly prohibited.
3. **AI Copilot Guardrails**:
   - The AI Copilot uses context-grounded retrieval from pre-validated synthetic records and domain glossaries.
   - System instructions explicitly reject prompt injection attempts and forbid fabricating official government decrees.

---

## 6. Audit Trail & Non-Repudiation

- All reviewer actions (`IN_REVIEW`, `RESOLVED`, `FLAGGED_FRAUDULENT`) are persistently logged in the `audit_logs` table with timestamp, user ID, client IP, action type, and note metadata.
- Immutable CSV source records (`parcels.csv`, `transactions.csv`, etc.) are mounted read-only and never modified at runtime.

---

## 7. Residual Risks & Future Hardening Recommendations

1. **Persistent PostgreSQL Migration**:
   - For high-volume multi-region concurrency, configure Render PostgreSQL with automated continuous backup rather than single-container persistent disk storage.
2. **Rate Limiting**:
   - Enable Redis-backed sliding window rate-limiting for public AI Copilot and search queries to mitigate distributed denial-of-service attempts.
