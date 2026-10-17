import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, 
  Printer, 
  ShieldCheck, 
  Building2, 
  Award
} from 'lucide-react';
import { Button } from '../ui/Button';

interface ParcelPassportProps {
  isOpen: boolean;
  onClose: () => void;
  parcel: {
    parcel_id: string;
    district?: string;
    upazila?: string;
    mouza?: string;
    jl_no?: string;
    dag_no?: number | string;
    khatian_no?: number | string;
    total_area_acres?: number;
    scenario?: string;
  };
  transactionCount?: number;
  lastScreeningDate?: string;
  screeningStatus?: string;
}

export const ParcelPassportModal: React.FC<ParcelPassportProps> = ({
  isOpen,
  onClose,
  parcel,
  transactionCount = 3,
  lastScreeningDate = '2026-10-15',
  screeningStatus = 'REVIEW_REQUIRED'
}) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const syntheticUrl = `https://land-guard-ai.vercel.app/parcels/${parcel.parcel_id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#071F18] border-2 border-emerald-600/40 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 text-slate-900 dark:text-white print:p-0 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Close Button (Hidden when printing) */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors print:hidden"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Passport Certificate Container */}
        <div className="border-4 border-double border-emerald-700/60 p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-emerald-50/40 via-white to-emerald-50/20 dark:from-emerald-950/40 dark:via-[#071F18] dark:to-emerald-950/20 relative overflow-hidden">
          {/* Subtle Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] dark:opacity-[0.06]">
            <Award className="w-96 h-96 text-emerald-800" />
          </div>

          {/* Header */}
          <div className="text-center pb-5 border-b-2 border-emerald-700/30">
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <span className="p-2 bg-emerald-700 text-white rounded-xl shadow-sm">
                <Building2 className="w-6 h-6" />
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif text-emerald-950 dark:text-emerald-100">
              {isBn ? "ল্যান্ডগার্ড সিন্থেটিক পার্সেল পাসপোর্ট" : "LandGuard Synthetic Parcel Passport"}
            </h2>
            <p className="text-xs uppercase tracking-widest text-emerald-800 dark:text-emerald-300 font-bold mt-1">
              Geospatial Land Intelligence Certificate • Dossier Summary
            </p>

            {/* Mandatory Synthetic Disclaimer Banner */}
            <div className="mt-3 inline-block px-3 py-1 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 rounded-full text-[11px] font-bold text-amber-900 dark:text-amber-200">
              {isBn 
                ? "⚠️ এটি একটি কৃত্রিম সিন্থেটিক প্রদর্শনী নথি — সরকারি মালিকানা সনদ নয়।"
                : "⚠️ Synthetic demonstration record — not an official land ownership certificate."}
            </div>
          </div>

          {/* Core Parcel Identification Table */}
          <div className="my-6 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-white/80 dark:bg-slate-900/60 rounded-xl border border-emerald-800/20">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">পার্সেল আইডি</span>
                <span className="text-sm font-bold font-mono text-emerald-700 dark:text-emerald-300">{parcel.parcel_id}</span>
              </div>
              <div className="p-3 bg-white/80 dark:bg-slate-900/60 rounded-xl border border-emerald-800/20">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">দাগ নম্বর</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{parcel.dag_no || '১০২'}</span>
              </div>
              <div className="p-3 bg-white/80 dark:bg-slate-900/60 rounded-xl border border-emerald-800/20">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">খতিয়ান নম্বর</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{parcel.khatian_no || 'KH-102'}</span>
              </div>
              <div className="p-3 bg-white/80 dark:bg-slate-900/60 rounded-xl border border-emerald-800/20">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">জেলা ও উপজেলা</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{parcel.district || 'Dhaka'}, {parcel.upazila || 'Savar'}</span>
              </div>
              <div className="p-3 bg-white/80 dark:bg-slate-900/60 rounded-xl border border-emerald-800/20">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">মৌজা ও জেএল নং</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{parcel.mouza || 'Aminbazar'} (JL {parcel.jl_no || '45'})</span>
              </div>
              <div className="p-3 bg-white/80 dark:bg-slate-900/60 rounded-xl border border-emerald-800/20">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">মোট রেকর্ডীয় আয়তন</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{parcel.total_area_acres || 0.55} একর</span>
              </div>
            </div>

            {/* Screening Summary & QR Section */}
            <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-emerald-800/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs uppercase font-bold text-slate-500">স্ক্রিনিং অবস্থা:</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                    {screeningStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  সর্বশেষ স্ক্রিনিং তারিখ: <span className="font-mono font-semibold">{lastScreeningDate}</span>
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  মোট নথিভুক্ত লেনদেন: <span className="font-mono font-semibold">{transactionCount} টি</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  উৎস: সিন্থেটিক ভূমিল্যান্ড ট্রানজাকশন ডেটাসেট (Immutable Artifacts)
                </p>
              </div>

              {/* Synthetic Verification QR Code */}
              <div 
                className="flex flex-col items-center p-2.5 bg-white rounded-xl border border-slate-300 shadow-sm shrink-0"
                title={syntheticUrl}
              >
                <div className="w-24 h-24 bg-slate-900 p-1 rounded flex items-center justify-center text-white text-[10px] font-mono text-center relative">
                  {/* Decorative QR-like pattern */}
                  <div className="grid grid-cols-4 gap-1 w-full h-full p-1 opacity-90">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div key={i} className={`rounded-xs ${i % 2 === 0 || i % 5 === 0 ? 'bg-white' : 'bg-transparent'}`} />
                    ))}
                  </div>
                  <span className="absolute text-[8px] bg-emerald-800 text-white px-1 py-0.5 rounded bottom-0.5">
                    DEMO QR
                  </span>
                </div>
                <span className="text-[9px] text-slate-500 mt-1 font-mono">
                  {parcel.parcel_id}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Signature & Hash */}
          <div className="pt-4 border-t border-emerald-700/30 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2">
            <span>LandGuard AI Digital Verification Hash: <span className="font-mono text-emerald-700 dark:text-emerald-300">sha256-7a44d69b</span></span>
            <span className="font-bold text-emerald-900 dark:text-emerald-200">ভূমি তথ্য অধিকার সহায়তা প্রকল্প</span>
          </div>
        </div>

        {/* Action Buttons (Hidden when printing) */}
        <div className="mt-6 flex items-center justify-end gap-3 print:hidden">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border-slate-300 dark:border-slate-600"
          >
            {isBn ? "বন্ধ করুন" : "Close"}
          </Button>
          <Button
            type="button"
            onClick={handlePrint}
            className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-2 shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>{isBn ? "প্রিন্ট / PDF সংরক্ষণ" : "Print / Save PDF"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
