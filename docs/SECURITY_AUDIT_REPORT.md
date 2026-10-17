# LANDGUARD AI — PRODUCTION SECURITY AUDIT REPORT

## 1. Scope & Verification
This audit evaluates the platform's security controls, authorization policies, and cryptographic standards against production release requirements.

---

## 2. Key Security Findings & Controls

### A. Password Cryptography
* **Argon2id KDF**: Public user registration and authentication utilize Argon2id password hashing via passlib/argon2-cffi.
* **Salted SHA-256 Deprecation**: Legacy salted SHA-256 storage has been replaced.

### B. Access Control & Role Segregation
* **Non-Privileged Registration**: Public sign-ups are strictly constrained to the `USER` role. Any attempt to supply `role: ADMIN` or `role: REVIEWER` in the registration payload is stripped and rejected.
* **Revocation of Known Production Passwords**: Publicly known reviewer/admin credentials previously hardcoded in seed scripts have been purged. Administrative access is provisioned securely via environment secrets.
* **Guest Demo Access**: Operates in strict read-only mode over synthetic records. Mutations (`POST /reviews`, `DELETE /reviews`) require bearer token authorization.

### C. Secret Hygiene
* No `.env`, API secret tokens, database credentials, or private keys are committed to Git.
* Client-side configuration reads only approved public `VITE_API_URL` variables.
