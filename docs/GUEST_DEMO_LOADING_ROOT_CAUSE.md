# LandGuard AI — Guest Demo Loading Root Cause Analysis

**Date:** October 18, 2026  
**Status:** CONFIRMED & DOCUMENTED  
**Project:** LandGuard AI (Bangladesh Cadastral Intelligence & Dual-Sale Screening)  
**Production URLs:**  
- Frontend: https://land-guard-ai.vercel.app  
- Backend: https://landguard-ai-backend-y2q3.onrender.com  

---

## 1. Executive Summary

When a user visits the LandGuard AI login screen (`/login`) or landing page (`/`) and clicks **"লগইন ছাড়াই ডেমো দেখুন"** (Explore Demo Without Login), they experience a prolonged loading spinner. On a first visit or after backend inactivity, this delay lasts **30 to 60+ seconds**, leaving the user stuck on the authentication screen before any navigation occurs.

Our inspection confirms that this delay was **not caused by client-side render performance or routing bugs**, but by **tight synchronous coupling of client-side navigation to a remote network round-trip against a sleeping backend container**.

---

## 2. Component Inspection & Handlers

### 2.1 Demo Access Button Component
Located in:
- `frontend/src/pages/LoginPage.tsx` (Lines 415–427)
- `frontend/src/pages/LandingPage.tsx` (Lines 214 & 435)

```tsx
<Button
  type="button"
  variant="primary"
  onClick={handleDirectDemoAccess}
  isLoading={demoMutation.isPending}
>
  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
  <span>{isBn ? "লগইন ছাড়াই ডেমো দেখুন" : "Explore Demo Without Login"}</span>
  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
</Button>
```

### 2.2 The Blocking Mutation
```tsx
const demoMutation = useMutation({
  mutationFn: () => api.demoLogin(),
  onSuccess: () => {
    localStorage.setItem('landguard_has_entered', 'true');
    queryClient.invalidateQueries({ queryKey: ['authMe'] });
    setSuccessMsg(isBn ? 'লগইন ছাড়াই ডেমো মোডে প্রবেশ করছেন...' : 'Entering Demo Mode without login...');
    setTimeout(() => {
      navigate('/home');
    }, 500);
  },
  onError: () => {
    localStorage.setItem('landguard_has_entered', 'true');
    navigate('/home');
  }
});
```

### 2.3 What `api.demoLogin()` Executes
```ts
demoLogin: async (): Promise<LoginResponse> => {
  try {
    const res = await request<LoginResponse>('/api/auth/demo', {
      method: 'POST'
    });
    if (res.token) {
      authStorage.setToken(res.token);
    }
    return res;
  } catch {
    const fallback: LoginResponse = { ... };
    authStorage.setToken(fallback.token);
    return fallback;
  }
}
```

---

## 3. Measured Backend Latency & Cold Start Profile

### 3.1 Live Production Backend Measurements (Warm State)
Measured against `https://landguard-ai-backend-y2q3.onrender.com`:
| Endpoint | Method | Status | Measured Latency |
| :--- | :--- | :--- | :--- |
| `/health` | GET | 200 OK | **765.9 ms** |
| `/dashboard/summary` | GET | 200 OK | **785.3 ms** |
| `/api/auth/demo` | POST | 200 OK | **305.0 ms** |

### 3.2 Cold Start Breakdown (Render Free Tier Inactivity)
When Render spins down an inactive instance (after 15 minutes of inactivity):
1. **Container Provisioning & Boot:** ~25s – 40s
2. **Python Runtime & Heavy Library Imports:** ~7.4s (measured locally: `pandas` ~3.2s, `fastapi` ~1.5s, `joblib` ~0.5s)
3. **Database & Schema Initialization (`init_db()`):** ~150ms
4. **Dataframe & Model Deserialization (`resources()`):** ~2s – 4s
5. **Total Cold Start Delay:** **30 to 60+ seconds**

Because `LoginPage` and `LandingPage` awaited `api.demoLogin()` before calling `navigate('/home')`, the user was held on `/login` with `isLoading={true}` for the **entire duration of the cold start**. Even in a warm state, the network request (305 ms) plus an artificial `setTimeout` (500 ms) forced an ~805 ms delay, violating the sub-500ms immediate navigation standard.

---

## 4. Route Authorization & Security Audit

We inspected `backend/app/auth.py` and `backend/app/main.py` to check whether `/home` or the public dashboard strictly requires a server session token:

1. **Anonymous Guest Support:**  
   In `backend/app/auth.py` (`get_current_user`), if no `Authorization` header is present:
   ```python
   if not token:
       return UserProfile(username="guest", role="viewer", authenticated=False)
   ```
2. **Public Read-Only Endpoints:**  
   The following endpoints are completely public and read-only:
   - `/health`
   - `/dashboard/summary`
   - `/transactions`
   - `/parcels/{id}`
   - `/parcels/{id}/history`
   - `/assess/{transaction_id}`
   - `/api/reviews` (GET - list review cases)
   - `/api/rmd/audit`
   - `/api/rmd/parcels`
3. **Protected Endpoint Security:**  
   Only state mutations, such as `PUT /api/reviews/{case_id}`, are protected by role checks:
   ```python
   @app.put("/api/reviews/{case_id}", response_model=ReviewCase)
   def update_review_case_endpoint(
       case_id: str,
       payload: ReviewUpdateRequest,
       current_user: UserProfile = Depends(require_role(["reviewer", "admin"]))
   ):
   ```
   Both anonymous guests and `demo_guest` users hold the `viewer` role. If either attempts a protected update, FastAPI securely rejects the request with `401 Unauthorized` or `403 Forbidden`.

**Conclusion:** Navigation to `/home` does **not** depend on a server-side session. The frontend shell can and should navigate **immediately**, with optional guest token synchronization occurring asynchronously in the background.

---

## 5. Confirmed Root Cause Classification

| Factor | Finding | Impact |
| :--- | :--- | :--- |
| **Primary Root Cause** | Route navigation in `handleDirectDemoAccess` awaited `api.demoLogin()` | Blocked UI transition on a remote POST request |
| **Secondary Root Cause** | Artificial `setTimeout(..., 500)` after API success | Added 500 ms unnecessary artificial delay even when warm |
| **Infrastructure Characteristic** | Render free-tier cold sleep (30–60s spin-up) | Turned the synchronous network call into a 30–60s freeze |
| **UI Feedback Gap** | Dashboard lacked transparent Bengali cold-start status messages | When cold, dashboard queries appeared hung rather than waking up |

---

## 6. Implementation Solution Plan

1. **Immediate Decoupled Navigation (Step 2):**
   - Click `"লগইন ছাড়াই ডেমো দেখুন"` → synchronously record `landguard_has_entered = 'true'` and set local guest token in `authStorage`.
   - Call `navigate('/home')` immediately (<50ms, zero network block).
   - Fire `/api/auth/demo` non-blockingly in the background so the backend session is synced without delaying the user.
2. **Asynchronous Dashboard Data Hydration (Step 3):**
   - `/home` and `/dashboard` shells mount instantly with skeleton placeholders.
   - Display honest Bengali loading message while live metrics are fetching:
     `"তথ্য লোড হচ্ছে, অনুগ্রহ করে একটু অপেক্ষা করুন।"`
   - If backend takes >10s (cold start) or errors, display helpful retry prompt:
     `"সার্ভারের সঙ্গে সংযোগে দেরি হচ্ছে। আবার চেষ্টা করুন।"`
3. **Prevent Stuck Loading States (Step 4):**
   - Remove `isLoading={demoMutation.isPending}` from the Demo Access button.
   - Prevent duplicate rapid clicks using a brief debounce flag.
   - Guarantee navigation always fires synchronously.
