import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, X, Share, Smartphone } from 'lucide-react';
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
  const [showBanner, setShowBanner] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    if (sessionStorage.getItem('pwa_install_dismissed')) return false;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as unknown as { standalone?: boolean }).standalone;
    if (isStandalone) return false;
    return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  });
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('pwa_install_dismissed')) return;

    // Android/Chrome beforeinstallprompt listener
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.info('[PWA] User response to install prompt:', outcome);
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('pwa_install_dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="fixed bottom-16 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-[#062B22]/95 border-2 border-emerald-500/40 backdrop-blur-md p-4 rounded-3xl shadow-2xl text-white animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-[#C4E8A5] shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-white">
                  {isBn ? "ল্যান্ডগার্ড মোবাইল অ্যাপ" : "LandGuard Mobile App"}
                </h4>
                <span className="text-[10px] bg-emerald-700/80 text-emerald-200 px-1.5 py-0.5 rounded-full font-bold">
                  PWA
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5 leading-snug">
                {isBn 
                  ? "দ্রুত ব্যবহারের জন্য আপনার ফোনে অ্যাপটি ইনস্টল করুন।"
                  : "Install on your home screen for quick, reliable access."}
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1 rounded-full text-slate-400 hover:text-white transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-end gap-2 pt-2 border-t border-emerald-800/40">
          <button
            onClick={handleDismiss}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5"
          >
            {isBn ? "এখন নয়" : "Not now"}
          </button>
          <Button
            size="sm"
            onClick={handleInstallClick}
            className="bg-[#0E8D60] hover:bg-emerald-600 text-white font-bold text-xs px-4 py-1.5 rounded-xl shadow-md flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isBn ? "ইনস্টল করুন" : "Install App"}</span>
          </Button>
        </div>
      </div>

      {/* iOS Safari Manual Instructions Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#062B22] border-2 border-emerald-600/40 p-6 rounded-3xl max-w-sm w-full shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-800/40 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Share className="w-5 h-5 text-[#C4E8A5]" />
                <span>iPhone / iPad-এ ইনস্টল</span>
              </h3>
              <button onClick={() => setShowIOSGuide(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <ol className="text-xs space-y-3 text-emerald-100/90 leading-relaxed list-decimal pl-4">
              <li>
                Safari ব্রাউজারের নিচের মেনুবারে থাকা <strong>শেয়ার আইকন (Share)</strong> ট্যাপ করুন।
              </li>
              <li>
                মেনু থেকে স্ক্রোল করে <strong>"Add to Home Screen"</strong> (হোম স্ক্রিনে যোগ করুন) বেছে নিন।
              </li>
              <li>
                উপরে ডানে থাকা <strong>"Add"</strong> বাটনে চাপ দিন। আপনার হোম স্ক্রিনে ল্যান্ডগার্ড অ্যাপ যুক্ত হবে।
              </li>
            </ol>

            <Button
              className="w-full bg-[#0E8D60] text-white font-bold text-xs py-2.5 rounded-xl"
              onClick={() => setShowIOSGuide(false)}
            >
              বুঝেছি
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
