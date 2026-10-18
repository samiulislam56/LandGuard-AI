import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, X, Share, Leaf, ChevronUp, ChevronDown } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallBanner: React.FC = () => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  });
  
  const [isStandalone, setIsStandalone] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches || 
           (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  });

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);
  const [installSuccess, setInstallSuccess] = useState<boolean>(false);

  useEffect(() => {
    // 1. Android / Chromium install prompt capture
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // 2. Successful installation event
    const handleAppInstalled = () => {
      console.info('[PWA] Application successfully installed.');
      setIsStandalone(true);
      setIsExpanded(false);
      setInstallSuccess(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.info('[PWA] User outcome:', outcome);
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsExpanded(false);
        setInstallSuccess(true);
      }
      return;
    }

    // Fallback: Show guide modal for browsers without direct prompt API
    setShowIOSGuide(true);
  };

  // If already running in standalone installed PWA mode, do not show redundant install widget
  if (isStandalone && !installSuccess) {
    return null;
  }

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. COLLAPSED FLOATING LAUNCHER BUTTON ("📱 অ্যাপ ইনস্টল")                 */}
      {/* High-contrast in both Light (#FFFFFF/#14382B) and Dark (#172A27/#F8FAFC) */}
      {/* ========================================================================= */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-label={isBn ? "মোবাইল অ্যাপ ইনস্টল মেনু" : "Mobile App Install Menu"}
        aria-expanded={isExpanded}
        className="fixed bottom-[calc(7.75rem+env(safe-area-inset-bottom,0px))] sm:bottom-20 right-3.5 sm:right-6 z-50 flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-white dark:bg-[#172A27] hover:bg-[#EFF8F3] dark:hover:bg-[#203B33] text-[#14382B] dark:text-[#F8FAFC] border-2 border-[#B5DFCD] dark:border-[#365C50] shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 min-h-[38px] sm:min-h-[40px] focus:outline-none focus:ring-4 focus:ring-[#087E59]/30 select-none group pointer-events-auto"
      >
        <span className="text-sm sm:text-base group-hover:scale-110 transition-transform">📱</span>
        <span className="font-bold text-xs sm:text-sm text-[#14382B] dark:text-[#F8FAFC]">
          {isBn ? "অ্যাপ ইনস্টল" : "Install App"}
        </span>
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-[#087E59] dark:text-[#34D399]" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5 text-[#087E59] dark:text-[#34D399] group-hover:-translate-y-0.5 transition-transform" />
        )}
      </button>

      {/* ========================================================================= */}
      {/* 2. EXPANDED INSTALLATION CARD                                             */}
      {/* Solid high-contrast background in Light (#FFFFFF) & Dark (#172A27)        */}
      {/* ========================================================================= */}
      {isExpanded && (
        <div 
          role="region"
          aria-label={isBn ? "মোবাইল অ্যাপ ইনস্টল কার্ড" : "Mobile App Installation Card"}
          className="fixed bottom-[calc(10.75rem+env(safe-area-inset-bottom,0px))] sm:bottom-32 right-3 sm:right-6 w-[calc(100vw-24px)] max-w-[360px] sm:max-w-md z-[60] bg-white dark:bg-[#172A27] border-2 border-[#B5DFCD] dark:border-[#365C50] text-[#14382B] dark:text-[#F8FAFC] p-4 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200 max-h-[75vh] overflow-y-auto pointer-events-auto"
        >
          {/* Card Header: Icon, Titles & Close Toggle */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#D2E2D9] dark:border-[#365C50]/60">
            <div className="flex items-center gap-3">
              {/* LandGuard App Icon */}
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#087E59] to-[#044E36] p-0.5 shadow-md shrink-0 flex items-center justify-center">
                <div className="w-full h-full bg-[#EFF8F3] dark:bg-[#071D16] rounded-[14px] flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-[#087E59] dark:text-[#34D399]" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm sm:text-base font-extrabold text-[#14382B] dark:text-[#F8FAFC] tracking-tight">
                    {isBn ? "ল্যান্ডগার্ড মোবাইল অ্যাপ" : "LandGuard Mobile App"}
                  </h4>
                  <span className="text-[10px] bg-[#EFF8F3] dark:bg-[#203B33] text-[#087E59] dark:text-[#A7F3D0] border border-[#B5DFCD] dark:border-[#365C50] px-1.5 py-0.5 rounded-full font-bold">
                    PWA
                  </span>
                </div>
                <p className="text-xs text-[#52645B] dark:text-[#CBD5D1] mt-0.5 font-medium">
                  {isBn 
                    ? "আপনার ফোনে অ্যাপের মতো ব্যবহার করুন"
                    : "Use like a native app on your phone"}
                </p>
              </div>
            </div>

            {/* Close / Collapse Button */}
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="p-1.5 rounded-xl text-[#52645B] hover:text-[#14382B] hover:bg-[#EFF8F3] dark:text-[#CBD5D1] dark:hover:text-[#F8FAFC] dark:hover:bg-[#203B33] transition-colors focus:outline-none focus:ring-2 focus:ring-[#087E59]/50"
              title={isBn ? "বন্ধ করুন" : "Close"}
              aria-label={isBn ? "কার্ড বন্ধ করুন" : "Close card"}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Platform-Appropriate Instructions */}
          <div className="mt-3 p-3 rounded-2xl bg-[#EFF8F3] dark:bg-[#203B33] border border-[#B5DFCD] dark:border-[#365C50] text-xs text-[#254A38] dark:text-[#E2F4E9] space-y-1.5">
            {isIOS ? (
              <div className="space-y-1 text-[11px] leading-relaxed">
                <p className="font-bold text-[#14382B] dark:text-[#A7F3D0] flex items-center gap-1">
                  <Share className="w-3.5 h-3.5 text-[#087E59] dark:text-[#34D399]" />
                  <span>{isBn ? "iOS / Safari নির্দেশিকা:" : "iOS / Safari Steps:"}</span>
                </p>
                <p>১. Safari ব্রাউজারের নিচের মেনুবারে থাকা শেয়ার বাটনে (Share ⎋) চাপুন।</p>
                <p>২. নিচে স্ক্রোল করে "Add to Home Screen" (⊞) বেছে নিন।</p>
                <p>৩. উপরে ডানে "Add" চাপলে অ্যাপ হোমস্ক্রিনে চলে আসবে।</p>
              </div>
            ) : deferredPrompt ? (
              <p className="text-[11px] leading-relaxed font-medium">
                {isBn 
                  ? "✓ গুগল ক্রোম বা সাপোর্টেড ব্রাউজারে নিচের বাটনে ক্লিক করে সরাসরি ফোনে ইনস্টল করুন।"
                  : "✓ Click the button below to install directly to your device home screen."}
              </p>
            ) : (
              <p className="text-[11px] leading-relaxed font-medium">
                {isBn
                  ? "ব্রাউজার মেনু (⋮ বা Share) থেকে 'Add to Home Screen' বা 'Install App' নির্বাচন করুন।"
                  : "Use browser menu (⋮ or Share) and select 'Add to Home screen' or 'Install'."}
              </p>
            )}
          </div>

          {/* Action Footer */}
          <div className="mt-3.5 flex items-center justify-between gap-2 pt-2 border-t border-[#D2E2D9] dark:border-[#365C50]/60">
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="text-xs font-semibold text-[#344B40] hover:text-[#14382B] hover:bg-[#EFF8F3] dark:text-[#CBD5D1] dark:hover:text-[#F8FAFC] dark:hover:bg-[#203B33] px-2.5 py-1.5 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#087E59]/40"
            >
              {isBn ? "এখন নয়" : "Not now"}
            </button>

            <button
              type="button"
              onClick={handleInstallClick}
              className="bg-[#087E59] hover:bg-[#066946] active:bg-[#055237] text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 group transition-all focus:outline-none focus:ring-2 focus:ring-[#087E59] focus:ring-offset-2 dark:focus:ring-offset-[#172A27]"
            >
              <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform text-white" />
              <span className="text-white">{isBn ? "মোবাইলে ইনস্টল করুন" : "Install on Mobile"}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. iOS Safari Detailed Manual Instructions Modal                          */}
      {/* Solid high-contrast background in Light (#FFFFFF) & Dark (#172A27)        */}
      {/* ========================================================================= */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 pointer-events-auto">
          <div className="bg-white dark:bg-[#172A27] border-2 border-[#B5DFCD] dark:border-[#365C50] p-6 rounded-3xl max-w-sm w-full shadow-2xl text-[#14382B] dark:text-[#F8FAFC] space-y-4">
            <div className="flex items-center justify-between border-b border-[#D2E2D9] dark:border-[#365C50]/60 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2 text-[#14382B] dark:text-[#F8FAFC]">
                <Share className="w-5 h-5 text-[#087E59] dark:text-[#34D399]" />
                <span>{isBn ? "iPhone / iPad-এ ইনস্টল" : "Install on iPhone / iPad"}</span>
              </h3>
              <button 
                type="button"
                onClick={() => setShowIOSGuide(false)} 
                className="text-[#52645B] hover:text-[#14382B] hover:bg-[#EFF8F3] dark:text-[#CBD5D1] dark:hover:text-[#F8FAFC] dark:hover:bg-[#203B33] p-1.5 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#087E59]/40"
                aria-label={isBn ? "বন্ধ করুন" : "Close"}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ol className="text-xs space-y-3 text-[#254A38] dark:text-[#E2F4E9] leading-relaxed list-decimal pl-4">
              <li>
                {isBn ? (
                  <>Safari ব্রাউজারের নিচের মেনুবারে থাকা <strong className="font-bold text-[#14382B] dark:text-white">শেয়ার আইকন (Share ⎋)</strong> ট্যাপ করুন।</>
                ) : (
                  <>Tap the <strong className="font-bold text-[#14382B] dark:text-white">Share button (⎋)</strong> in the Safari bottom bar.</>
                )}
              </li>
              <li>
                {isBn ? (
                  <>মেনু থেকে নিচে স্ক্রোল করে <strong className="font-bold text-[#14382B] dark:text-white">"Add to Home Screen" (⊞)</strong> বেছে নিন।</>
                ) : (
                  <>Scroll down and tap <strong className="font-bold text-[#14382B] dark:text-white">"Add to Home Screen" (⊞)</strong>.</>
                )}
              </li>
              <li>
                {isBn ? (
                  <>উপরে ডানে থাকা <strong className="font-bold text-[#14382B] dark:text-white">"Add"</strong> বাটনে চাপ দিন। আপনার হোম স্ক্রিনে ল্যান্ডগার্ড অ্যাপ যুক্ত হবে।</>
                ) : (
                  <>Tap <strong className="font-bold text-[#14382B] dark:text-white">"Add"</strong> in the top right corner to complete installation.</>
                )}
              </li>
            </ol>

            <button
              type="button"
              className="w-full bg-[#087E59] hover:bg-[#066946] active:bg-[#055237] text-white font-bold text-xs sm:text-sm py-2.5 rounded-xl shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#087E59] focus:ring-offset-2 dark:focus:ring-offset-[#172A27]"
              onClick={() => setShowIOSGuide(false)}
            >
              {isBn ? "বুঝেছি" : "Got it"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
