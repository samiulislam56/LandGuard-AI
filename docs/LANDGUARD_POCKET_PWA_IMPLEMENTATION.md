# LANDGUARD POCKET — INSTALLABLE PWA IMPLEMENTATION

## 1. Overview & Architecture
**LandGuard Pocket (ল্যান্ডগার্ড পকেট)** transforms the LandGuard AI web platform into an installable Progressive Web App (PWA) on Android, iOS, Windows, and macOS devices without rewriting the codebase or fragmenting into multiple repositories.

### Key PWA Components
- **Web App Manifest**: [`frontend/public/manifest.webmanifest`](file:///e:/LandGuard-AI/frontend/public/manifest.webmanifest)
- **High-Resolution Icons**: [`icon-192.svg`](file:///e:/LandGuard-AI/frontend/public/icon-192.svg), [`icon-512.svg`](file:///e:/LandGuard-AI/frontend/public/icon-512.svg)
- **Standalone Display**: Fullscreen app shell with `#062B22` theme and background colors.
- **Service Worker**: [`frontend/public/sw.js`](file:///e:/LandGuard-AI/frontend/public/sw.js)
- **Lifecycle Controller**: [`frontend/src/pwa.ts`](file:///e:/LandGuard-AI/frontend/src/pwa.ts)
- **Mobile Bottom Navigation**: [`frontend/src/components/layout/MobileBottomNav.tsx`](file:///e:/LandGuard-AI/frontend/src/components/layout/MobileBottomNav.tsx)
- **Install Prompt Controller**: [`frontend/src/components/pwa/PWAInstallBanner.tsx`](file:///e:/LandGuard-AI/frontend/src/components/pwa/PWAInstallBanner.tsx)
- **Zero-Network Fallback**: [`frontend/public/offline.html`](file:///e:/LandGuard-AI/frontend/public/offline.html)

---

## 2. Platform Installation Guides

### Android & Chromium Browsers
1. When browsing in Chrome, Edge, or Samsung Internet, the browser emits the `beforeinstallprompt` event.
2. The custom **LandGuard Pocket Banner** surfaces with a prominent green button: **"ইনস্টল করুন" (Install App)**.
3. Tapping the button launches the native Android install dialog. Once accepted, LandGuard AI is placed in the user's app drawer and home screen.
4. It launches as a standalone application without browser URL address bars.

### iOS / iPadOS (Safari)
1. Apple does not support standard `beforeinstallprompt`.
2. LandGuard Pocket detects iOS user agents and presents an accessible walkthrough:
   - *পদক্ষেপ ১: Safari ব্রাউজারের নিচের মেনুবারে থাকা 'Share' আইকন ট্যাপ করুন।*
   - *পদক্ষেপ ২: মেনু থেকে 'Add to Home Screen' (হোম স্ক্রিনে যোগ করুন) বেছে নিন।*
   - *পদক্ষেপ ৩: উপরে ডানে থাকা 'Add' বাটনে চাপ দিন।*
3. The app is launched via the Apple Web Clip with standalone navigation.

---

## 3. Mobile Bottom Navigation
To ensure effortless single-handed thumb operation on mobile screens (`< 1024px`), a fixed bottom navigation bar is active:
- **হোম (`/home`)**: Direct access to the citizen command dashboard.
- **জমি খুঁজুন (`/search`)**: Immediate launch of LandGuard Easy 3-step wizard.
- **খসড়া ম্যাপ (`/khasra-map`)**: Cadastral 2D plot boundaries.
- **যাচাই (`/assess/TX-002911-2`)**: Plain-language AI assessment screening.
- **আরও (`More`)**: Opens the comprehensive drawer for Help, Settings, and administrative reviews.
