# OFFLINE CACHE & SERVICE WORKER SECURITY AUDIT

## 1. Security Mandate & Threat Model
In public LandTech applications, service worker caching represents a potential privacy and security risk if dynamic backend API responses, authentication tokens, user passwords, or confidential audit dossiers are persisted in public client caches.

The LandGuard AI security architecture mandates:
1. **Zero Dynamic API Caching**: All endpoints matching `/api/` or `landguard-ai-backend-y2q3.onrender.com` must completely bypass the service worker cache.
2. **Zero Mutation Interception**: HTTP methods `POST`, `PUT`, `DELETE`, and `PATCH` are passed directly to the network and are never stored.
3. **No Credential Caching**: Password inputs, session tokens, JWTs, and registration payloads are excluded from cache operations.
4. **No Private Review Caching**: Reviewer notes, admin mutation flags, and case audit dispositions require active backend authorization and must never be served from stale offline caches.

---

## 2. Implementation Audit in `sw.js`

```javascript
// FORBIDDEN URL PATTERNS STRICTLY BYPASSED
const FORBIDDEN_CACHE_PATTERNS = [
  '/api/',
  'onrender.com',
  '/auth/',
  '/login',
  '/register',
  '/signup',
  '/reviews',
  '/assess/',
  '/reports/pdf',
  '/download'
];
```

### Verified Security Controls
| Security Check | Implementation Rule | Verification Result | Status |
| :--- | :--- | :--- | :--- |
| **API Caching Bypass** | `url.pathname.includes('/api/')` skips cache | Verified in `sw.js` fetch listener | **PASS** |
| **Backend Domain Bypass** | `url.hostname.includes('onrender.com')` skips cache | Verified in `sw.js` | **PASS** |
| **Mutation Bypass** | `if (request.method !== 'GET') return;` | Mutations never cached | **PASS** |
| **Auth Endpoint Bypass** | `/auth/` routes strictly excluded | Password/token leakage prevented | **PASS** |
| **Offline Fallback Isolation**| Navigation offline errors serve static `/offline.html` | No stale authenticated data leaked | **PASS** |
| **Cache Purging on Update** | `caches.delete(name)` for all non-matching versions | Stale assets purged on new release | **PASS** |

---

## 3. Offline User Communication
When offline:
1. The static application shell displays:
   > *"আপনি এখন অফলাইনে আছেন। লাইভ তথ্য দেখতে ইন্টারনেট প্রয়োজন।"*
2. Users are explicitly informed that live AI assessments, satellite tile downloads, and deed screening require active network connectivity.
3. No synthetic transaction score is ever fabricated or simulated during network loss.
