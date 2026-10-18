import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, X, Share, Leaf, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';

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
      {/* Positioned right above AI Assistant launcher, never overlapping           */}
      {/* ========================================================================= */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-label={isBn ? "মোবাইল অ্যাপ ইনস্টল মেনু" : "Mobile App Install Menu"}
        aria-expanded={isExpanded}
        className="fixed bottom-[calc(7.75rem+env(safe-area-inset-bottom,0px))] sm:bottom-20 right-3.5 sm:right-6 z-50 flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-[#062B22]/95 hover:bg-[#093d30] text-[#C4E8A5] border border-emerald-400/50 shadow-lg hover:shadow-2xl backdrop-blur-md transition-all duration-300 transform hover:-translate-y-0.5 min-h-[38px] sm:min-h-[40px] focus:outline-none focus:ring-4 focus:ring-emerald-500/30 select-none group pointer-events-auto"
      >
        <span className="text-sm sm:text-base group-hover:scale-110 transition-transform">📱</span>
        <span className="font-bold text-xs sm:text-sm text-white">
          {isBn ? "অ্যাপ ইনস্টল" : "Install App"}
        </span>
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-emerald-300" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5 text-emerald-300 group-hover:-translate-y-0.5 transition-transform" />
        )}
      </button>

      {/* ========================================================================= */}
      {/* 2. EXPANDED INSTALLATION CARD                                             */}
      {/* Positioned above floating launchers with responsive container width       */}
      {/* ========================================================================= */}
      {isExpanded && (
        <div 
          role="region"
          aria-label={isBn ? "মোবাইল অ্যাপ ইনস্টল কার্ড" : "Mobile App Installation Card"}
          className="fixed bottom-[calc(10.75rem+env(safe-area-inset-bottom,0px))] sm:bottom-32 right-3 sm:right-6 w-[calc(100vw-24px)] max-w-[360px] sm:max-w-md z-[60] bg-[#062B22]/98 border-2 border-emerald-500/50 backdrop-blur-lg p-4 rounded-3xl shadow-2xl text-white animate-in fade-in slide-in-from-bottom-3 duration-200 max-h-[75vh] overflow-y-auto pointer-events-auto"
        >
          {/* Card Header: Icon, Titles & Close Toggle */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-emerald-800/50">
            <div className="flex items-center gap-3">
              {/* LandGuard App Icon */}
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-0.5 shadow-md shrink-0 flex items-center justify-center">
                <div className="w-full h-full bg-[#071D16] rounded-[14px] flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                    {isBn ? "ল্যান্ডগার্ড মোবাইল অ্যাপ" : "LandGuard Mobile App"}
                  </h4>
                  <span className="text-[10px] bg-emerald-700/80 text-emerald-200 px-1.5 py-0.5 rounded-full font-bold">
                    PWA
                  </span>
                </div>
                <p className="text-xs text-emerald-200/90 mt-0.5 font-normal">
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
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-emerald-800/40 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              title={isBn ? "বন্ধ করুন" : "Close"}
              aria-label={isBn ? "কার্ড বন্ধ করুন" : "Close card"}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Platform-Appropriate Instructions */}
          <div className="mt-3 p-2.5 rounded-2xl bg-emerald-950/70 border border-emerald-800/40 text-xs text-emerald-100/90 space-y-1.5">
            {isIOS ? (
              <div className="space-y-1 text-[11px] leading-relaxed">
                <p className="font-semibold text-[#C4E8A5] flex items-center gap-1">
                  <Share className="w-3.5 h-3.5" />
                  <span>{isBn ? "iOS / Safari নির্দেশিকা:" : "iOS / Safari Steps:"}</span>
                </p>
                <p>১. Safari-র শেয়ার বাটনে (Share ⎋) চাপুন।</p>
                <p>২. "Add to Home Screen" (⊞) বেছে নিন।</p>
                <p>৩. উপরে ডানে "Add" চাপলে অ্যাপ হোমস্ক্রিনে চলে আসবে।</p>
              </div>
            ) : deferredPrompt ? (
              <p className="text-[11px] text-emerald-200 leading-relaxed">
                {isBn 
                  ? "✓ গুগল ক্রোম বা সাপোর্টেড ব্রাউজারে নিচের বাটনে ক্লিক করে সরাসরি ফোনে ইনস্টল করুন।"
                  : "✓ Click the button below to install directly to your device home screen."}
              </p>
            ) : (
              <p className="text-[11px] text-emerald-200 leading-relaxed">
                {isBn
                  ? "ব্রাউজার মেনু (⋮ বা Share) থেকে 'Add to Home Screen' বা 'Install App' নির্বাচন করুন।"
                  : "Use browser menu (⋮ or Share) and select 'Add to Home screen' or 'Install'."}
              </p>
            )}
          </div>

          {/* Action Footer */}
          <div className="mt-3.5 flex items-center justify-between gap-2 pt-2 border-t border-emerald-800/40">
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1.5 font-medium transition-colors"
            >
              {isBn ? "এখন নয়" : "Not now"}
            </button>

            <Button
              size="sm"
              type="button"
              onClick={handleInstallClick}
              className="bg-[#0E8D60] hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md flex items-center gap-2 group transition-all"
            >
              <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              <span>{isBn ? "মোবাইলে ইনস্টল করুন" : "Install on Mobile"}</span>
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. iOS Safari Detailed Manual Instructions Modal                          */}
      {/* ========================================================================= */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200 pointer-events-auto">
          <div className="bg-[#062B22] border-2 border-emerald-600/40 p-6 rounded-3xl max-w-sm w-full shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-800/40 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2 text-white">
                <Share className="w-5 h-5 text-[#C4E8A5]" />
                <span>{isBn ? "iPhone / iPad-এ ইনস্টল" : "Install on iPhone / iPad"}</span>
              </h3>
              <button 
                type="button"
                onClick={() => setShowIOSGuide(false)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ol className="text-xs space-y-3 text-emerald-100/95 leading-relaxed list-decimal pl-4">
              <li>
                {isBn ? (
                  <>Safari ব্রাউজারের নিচের মেনুবারে থাকা <strong>শেয়ার আইকন (Share ⎋)</strong> ট্যাপ করুন।</>
                ) : (
                  <>Tap the <strong>Share button (⎋)</strong> in the Safari bottom bar.</>
                )}
              </li>
              <li>
                {isBn ? (
                  <>মেনু থেকে নিচে স্ক্রোল করে <strong>"Add to Home Screen" (⊞)</strong> বেছে নিন।</>
                ) : (
                  <>Scroll down and tap <strong>"Add to Home Screen" (⊞)</strong>.</>
                )}
              </li>
              <li>
                {isBn ? (
                  <>উপরে ডানে থাকা <strong>"Add"</strong> বাটনে চাপ দিন। আপনার হোম স্ক্রিনে ল্যান্ডগার্ড অ্যাপ যুক্ত হবে।</>
                ) : (
                  <>Tap <strong>"Add"</strong> in the top right corner to complete installation.</>
                )}
              </li>
            </ol>

            <Button
              className="w-full bg-[#0E8D60] hover:bg-emerald-600 text-white font-bold text-xs py-2.5 rounded-xl shadow-md"
              onClick={() => setShowIOSGuide(false)}
            >
              {isBn ? "বুঝেছি" : "Got it"}
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
