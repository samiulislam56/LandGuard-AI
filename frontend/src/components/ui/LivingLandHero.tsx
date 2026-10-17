import React, { useState } from 'react';
import { Sparkles, Eye, EyeOff, ShieldCheck, Search, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import { AnimatedCadastralMotif } from './AnimatedCadastralMotif';

export const LivingLandHero: React.FC = () => {

  // Lite Mode toggle for battery saving
  const [isLiteMode, setIsLiteMode] = useState<boolean>(() => {
    return localStorage.getItem('landguard_lite_mode') === 'true';
  });

  const toggleLiteMode = () => {
    setIsLiteMode(prev => {
      const next = !prev;
      localStorage.setItem('landguard_lite_mode', String(next));
      return next;
    });
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-emerald-800/30 bg-[#062B22]">
      {/* Background Image Layer with Gentle Parallax/Motion (Preserving Bangladesh agricultural imagery) */}
      <div 
        className={`absolute inset-0 bg-cover bg-center transition-transform duration-1000 ${
          isLiteMode ? '' : 'motion-safe:animate-[slow-drift_25s_ease-in-out_infinite_alternate]'
        }`}
        style={{
          backgroundImage: "url('/assets/images/hero-bg.jpg')",
          willChange: isLiteMode ? 'auto' : 'transform'
        }}
      />

      {/* Atmospheric Emerald & Forest Vignette Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#062B22]/95 via-[#062B22]/80 to-[#062B22]/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#062B22] via-transparent to-black/30" />

      {/* Subtle Animated Cadastral Boundary Overlay */}
      {!isLiteMode && (
        <div className="absolute right-0 bottom-0 top-0 w-full sm:w-2/3 pointer-events-none">
          <AnimatedCadastralMotif className="w-full h-full object-cover" />
        </div>
      )}

      {/* Content Container */}
      <div className="relative z-10 p-6 sm:p-10 lg:p-14 max-w-3xl space-y-6">
        {/* Top Badges & Lite Mode Toggle */}
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-500/30 text-[#C4E8A5] text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#D7B677]" />
            <span>Living Land • বোটানিক্যাল ল্যান্ড ইন্টেলিজেন্স</span>
          </div>

          <button
            type="button"
            onClick={toggleLiteMode}
            title={isLiteMode ? "স্বাভাবিক অ্যানিমেশন চালু করুন" : "ব্যাটারি বাঁচানোর জন্য লাইট মোড চালু করুন"}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 text-slate-200 text-xs transition-colors"
          >
            {isLiteMode ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="hidden sm:inline">{isLiteMode ? "লাইট মোড" : "ফুল মোশন"}</span>
          </button>
        </div>

        {/* Hero Title & Bengali Pitch */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            সহজ ও নির্ভরযোগ্য <br />
            <span className="bg-gradient-to-r from-[#C4E8A5] via-[#25B6A0] to-[#D7B677] bg-clip-text text-transparent">
              ভূমি তথ্য ও লেনদেন যাচাইকরণ
            </span>
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-normal">
            বাংলাদেশের সাধারণ নাগরিক, কৃষক ও জমি ক্রেতাদের জন্য সহজতম ডিজিটাল সমাধান। মৌজা নকশা, খসড়া খতিয়ান ও দলিলের নির্ভুল এআই স্ক্রিনিং এখন হাতের মুঠোয়।
          </p>
        </div>

        {/* Action Buttons */}
        {/* Action Buttons with High-Contrast Accessible Styling */}
        <div className="flex flex-wrap items-center gap-3.5 pt-2">
          <Link to="/search">
            <Button
              className="min-h-[48px] px-6 py-3 rounded-2xl bg-[#0E8D60] hover:bg-emerald-600 active:bg-emerald-700 text-white font-extrabold text-sm sm:text-base flex items-center gap-2.5 shadow-lg shadow-emerald-950/60 focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all"
            >
              <Search className="w-5 h-5 text-emerald-100" />
              <span>সহজে জমি খুঁজুন</span>
            </Button>
          </Link>

          <Link to="/khasra-map">
            <button
              type="button"
              className="min-h-[48px] px-6 py-3 rounded-2xl bg-white/15 hover:bg-white/25 active:bg-white/30 text-white font-extrabold text-sm sm:text-base flex items-center gap-2.5 border-2 border-white/60 hover:border-white shadow-lg backdrop-blur-md focus:ring-2 focus:ring-white focus:outline-none transition-all"
            >
              <Compass className="w-5 h-5 text-[#C4E8A5]" />
              <span>খসড়া ম্যাপ দেখুন</span>
            </button>
          </Link>
        </div>

        {/* Bottom Trust Indicators */}
        <div className="pt-4 border-t border-emerald-800/40 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-emerald-200/80">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C4E8A5]" />
            <span>১০০% সিন্থেটিক নিরাপদ ডাটা</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C4E8A5]" />
            <span>দ্বৈত বিক্রয় সংঘাত শনাক্তকরণ</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C4E8A5]" />
            <span>সহজ বাংলা পরামর্শ</span>
          </div>
        </div>
      </div>
    </div>
  );
};
