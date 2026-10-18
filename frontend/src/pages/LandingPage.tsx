import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import {
  Leaf,
  Search,
  Compass,
  Layers,
  ShieldCheck,
  Bot,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Languages,
  LogIn,
  UserPlus,
  ChevronRight,
  Database,
  MapPin
} from 'lucide-react';

import { api, authStorage } from '../lib/api';
import { setLanguage } from '../i18n';
import { Button } from '../components/ui/Button';
import { HeroLandModel3D } from '../components/gis/HeroLandModel3D';

export const LandingPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const toggleLanguage = () => {
    setLanguage(isBn ? 'en' : 'bn');
  };

  // Immediate Direct Demo Access State
  const [isNavigatingDemo, setIsNavigatingDemo] = useState(false);

  const handleDemoAccess = () => {
    if (isNavigatingDemo) return;
    setIsNavigatingDemo(true);

    try {
      localStorage.setItem('landguard_has_entered', 'true');
      if (!authStorage.getToken()) {
        authStorage.setToken('demo_guest_token_' + Date.now());
      }
    } catch {
      // storage unavailable
    }

    navigate('/home');

    api.demoLogin()
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['authMe'] });
      })
      .catch(() => {
        // Safe to ignore: guest read-only access operates smoothly offline or during cold boot
      });
  };

  return (
    <div className="min-h-screen bg-[#05130E] text-slate-100 font-sans selection:bg-emerald-500 selection:text-black">
      {/* ========================================================================= */}
      {/* 1. TOP NAVIGATION HEADER (Matching Reference Image 1)                     */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-[#05130E]/90 backdrop-blur-md border-b border-emerald-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo & Platform Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-0.5 shadow-lg shadow-emerald-900/40 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#071D16] rounded-[14px] flex items-center justify-center">
                <Leaf className="w-6 h-6 text-emerald-400 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-white">LandGuard</span>
                <span className="text-xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">AI</span>
              </div>
              <p className="text-[10px] text-emerald-400/80 font-medium tracking-wide">
                {isBn ? "স্মার্ট ক্যাডাস্ট্রাল ইন্টেলিজেন্স" : "Cadastral Intelligence Platform"}
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <Link to="/home" className="hover:text-emerald-400 transition-colors">
              {isBn ? "মূল পাতা" : "Home"}
            </Link>
            <a href="#features" className="hover:text-emerald-400 transition-colors">
              {isBn ? "বৈশিষ্ট্যসমূহ" : "Features"}
            </a>
            <Link to="/search" className="hover:text-emerald-400 transition-colors">
              {isBn ? "জমির তথ্য" : "Land Search"}
            </Link>
            <Link to="/help" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>{isBn ? "AI সহকারী" : "AI Assistant"}</span>
            </Link>
          </nav>

          {/* Action CTAs & Language Switcher */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-800/60 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 text-xs font-semibold transition-all"
              title="Toggle Language"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{isBn ? "English" : "বাংলা"}</span>
            </button>

            {/* Sign In Link */}
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-xl transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isBn ? "লগইন" : "Sign In"}</span>
            </Link>

            {/* Register CTA */}
            <Link to="/register">
              <Button
                variant="primary"
                size="sm"
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/30 text-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isBn ? "শুরু করুন" : "Get Started"}</span>
              </Button>
            </Link>

            {/* One-Click Demo Header Button */}
            <button
              onClick={handleDemoAccess}
              disabled={isNavigatingDemo}
              className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-400/40 text-emerald-300 text-xs font-bold transition-all shadow-sm disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isBn ? "ডেমো দেখুন" : "Demo Access"}</span>
            </button>
          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. BALANCED TWO-COLUMN HERO SECTION (Matching Reference Image 1)          */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-24">
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* LEFT COLUMN: Hero Copy & Actions */}
            <div className="lg:col-span-7 space-y-7">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-semibold backdrop-blur-md shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>{isBn ? "স্মার্ট ক্যাডাস্ট্রাল ইন্টেলিজেন্স ও ভূমি তথ্য সেবা" : "Smart Cadastral Intelligence & Land Record Screening"}</span>
              </div>

              {/* Mandatory Bengali Heading with Emerald Gradient Accent */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-white">
                {isBn ? (
                  <>
                    আপনার জমির তথ্য, <br />
                    <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-green-300 bg-clip-text text-transparent">
                      আরও সহজ ও নিরাপদে
                    </span>
                  </>
                ) : (
                  <>
                    Your Land Records, <br />
                    <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-green-300 bg-clip-text text-transparent">
                      Verified & Protected with AI
                    </span>
                  </>
                )}
              </h1>

              {/* Supporting Subtitle */}
              <p className="text-base sm:text-lg text-slate-300/90 max-w-2xl leading-relaxed font-normal">
                {isBn
                  ? "জমি ও লেনদেনের তথ্য খুঁজুন, সম্ভাব্য অসংগতি বুঝুন এবং AI-এর সহায়তায় পর্যালোচনা করুন।"
                  : "Search land records, identify deed and mutation anomalies, and review chain-of-title integrity with AI-powered cadastral screening."}
              </p>

              {/* Primary & Secondary Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {/* Primary Button */}
                <Link to="/search">
                  <Button
                    variant="primary"
                    size="lg"
                    className="gap-2 px-7 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-xl shadow-emerald-950/60 hover:shadow-2xl hover:scale-105 transition-all text-sm sm:text-base"
                  >
                    <Search className="w-5 h-5" />
                    <span>{isBn ? "জমির তথ্য খুঁজুন" : "Find Land Records"}</span>
                  </Button>
                </Link>

                {/* Secondary Button: One-Click Demo */}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleDemoAccess}
                  disabled={isNavigatingDemo}
                  className="gap-2 px-7 py-4 border-emerald-500/40 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-200 font-bold rounded-2xl backdrop-blur-md shadow-lg transition-all text-sm sm:text-base group"
                >
                  <Sparkles className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform" />
                  <span>{isBn ? "লগইন ছাড়াই ডেমো দেখুন" : "Explore Demo Without Login"}</span>
                </Button>

                {/* Tertiary Link: AI Assistant */}
                <Link
                  to="/help"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 px-3 py-2 rounded-xl transition-colors"
                >
                  <Bot className="w-4 h-4" />
                  <span>{isBn ? "AI সহকারীর সঙ্গে কথা বলুন" : "Chat with AI Copilot"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Guest Demo Assurance Tag */}
              <div className="pt-3 border-t border-emerald-900/50 flex items-center gap-3 text-xs text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {isBn 
                    ? "কোনো পাসওয়ার্ড বা সাইন-আপ ছাড়াই উন্মুক্ত ডেমো তথ্য ও ক্যাডাস্ট্রাল ম্যাপ দেখুন।" 
                    : "Inspect open synthetic cadastral maps and transaction history without registration."}
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN: Cinematic 3D Miniature Land Model (Section 2 Signature Feature) */}
            <div className="lg:col-span-5 relative">
              <HeroLandModel3D />
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2.1 FOUR INTERACTIVE FEATURE BLOCKS (Section 4 Requirement)              */}
      {/* ========================================================================= */}
      <section className="py-8 border-t border-emerald-900/40" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Block 1: জমির তথ্য খুঁজুন */}
            <Link
              to="/search"
              className="group block p-6 rounded-3xl bg-[#09221B]/90 hover:bg-[#0C2A22] border border-emerald-800/40 hover:border-emerald-500/60 shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-900/40 group-hover:scale-110 transition-transform mb-4">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                {isBn ? "জমির তথ্য খুঁজুন" : "Find Land Records"}
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {isBn 
                  ? "বিভাগ, জেলা, মৌজা, খতিয়ান ও দাগ নম্বর দিয়ে দ্রুত সংরক্ষিত পার্সেল অনুসন্ধান করুন।" 
                  : "Search records by Division, District, Mouza, Khatian, and Dag plot numbers."}
              </p>
              <div className="mt-4 flex items-center text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
                <span>{isBn ? "অনুসন্ধান শুরু করুন" : "Search Now"}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Link>

            {/* Block 2: ডিজিটাল খসড়া ম্যাপ */}
            <Link
              to="/khasra-map"
              className="group block p-6 rounded-3xl bg-[#09221B]/90 hover:bg-[#0C2A22] border border-emerald-800/40 hover:border-emerald-500/60 shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-900/40 group-hover:scale-110 transition-transform mb-4">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                {isBn ? "ডিজিটাল খসড়া ম্যাপ" : "Digital Khasra Map"}
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {isBn 
                  ? "নম্বরযুক্ত ধারণামূলক দাগের নকশা ও দ্বৈত বিক্রয়ের পার্সেল সীমানা ভিজ্যুয়ালাইজেশন।" 
                  : "Interactive cadastral plot outlines with conflicting boundary overlays."}
              </p>
              <div className="mt-4 flex items-center text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
                <span>{isBn ? "ম্যাপ দেখুন" : "View Map"}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Link>

            {/* Block 3: AI লেনদেন যাচাই */}
            <Link
              to="/transactions"
              className="group block p-6 rounded-3xl bg-[#09221B]/90 hover:bg-[#0C2A22] border border-emerald-800/40 hover:border-emerald-500/60 shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-900/40 group-hover:scale-110 transition-transform mb-4">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                {isBn ? "AI লেনদেন যাচাই" : "AI Transaction Screening"}
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {isBn 
                  ? "র‍্যান্ডম ফরেস্ট ও আইসোলেশন ফরেস্টে দ্বৈত বিক্রয় ও নামজারি অসংগতি নির্ণয়।" 
                  : "Machine learning anomaly detection across recorded deed history."}
              </p>
              <div className="mt-4 flex items-center text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform">
                <span>{isBn ? "যাচাই করুন" : "Screen Transactions"}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Link>

            {/* Block 4: রিভিউ ও প্রতিবেদন */}
            <Link
              to="/reviews"
              className="group block p-6 rounded-3xl bg-[#09221B]/90 hover:bg-[#0C2A22] border border-emerald-800/40 hover:border-emerald-500/60 shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-900/40 group-hover:scale-110 transition-transform mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                {isBn ? "রিভিউ ও প্রতিবেদন" : "Reviews & Reports"}
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {isBn 
                  ? "খতিয়ান-নামজারি-দলিল (RMD) ধারাবাহিকতা অডিট এবং অফিসিয়াল পিডিএফ ডোসিয়ার।" 
                  : "Record-Mutation-Deed triangulation audits and official PDF dossiers."}
              </p>
              <div className="mt-4 flex items-center text-xs font-semibold text-blue-400 group-hover:translate-x-1 transition-transform">
                <span>{isBn ? "প্রতিবেদন দেখুন" : "View Dossier"}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. TRUSTWORTHY SYNTHETIC DATA METRICS (Actual Backend Counts)             */}
      {/* ========================================================================= */}
      <section className="border-y border-emerald-900/40 bg-[#04100C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div className="flex items-center gap-3">
              <Database className="w-6 h-6 text-emerald-400" />
              <div>
                <h4 className="text-sm font-bold text-white">
                  {isBn ? "সিন্থেটিক ভূমি ডেটাসেট পরিসংখ্যান" : "Verified Synthetic Dataset Records"}
                </h4>
                <p className="text-xs text-slate-400">
                  {isBn ? "প্রশিক্ষিত এআই মডেল ও ডেমো প্ল্যাটফর্মের জন্য সত্যতা যাচাইকৃত" : "Validated for explainable machine learning & public screening"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 sm:gap-12 text-center">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">৩,০০০</p>
                <p className="text-xs text-slate-400 font-medium">{isBn ? "নথিভুক্ত পার্সেল" : "Parcels"}</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-teal-400">৩,৮৫১</p>
                <p className="text-xs text-slate-400 font-medium">{isBn ? "হস্তান্তর লেনদেন" : "Transactions"}</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-amber-400">১,১৮৮</p>
                <p className="text-xs text-slate-400 font-medium">{isBn ? "অডিট রিভিউ কেস" : "Review Cases"}</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. AGRICULTURAL LAND EXPERIENCE (Preserving Reference 5 Photo)            */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-emerald-800/40">
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
              style={{ backgroundImage: `url('/assets/images/hero-bg.jpg')` }}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#05130E] via-[#05130E]/85 to-transparent" />

            {/* Content Container */}
            <div className="relative z-10 px-8 py-16 md:py-24 max-w-2xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold backdrop-blur-md">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isBn ? "বাংলাদেশের কৃষি ও গ্রামীণ ভূমির সুরক্ষা" : "Safeguarding Bangladesh Agricultural Lands"}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                {isBn 
                  ? "কৃষক ও ভূমির মালিকদের জন্য নির্ভরযোগ্য তথ্য সুরক্ষা" 
                  : "Empowering Farmers & Landowners with Transparent Land Records"}
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {isBn
                  ? "কোনো দালাল বা মধ্যস্বত্বভোগী ছাড়াই আপনার দাগ ও খতিয়ানের অবস্থা জানুন। বায়া দলিলের অসংগতি ও নামজারি তথ্য নিজেই যাচাই করে জমি হস্তান্তরের সিদ্ধান্ত নিন।"
                  : "Access your Mouza, Dag, and Khatian records directly without intermediaries. Verify mutation status and identify deed anomalies before initiating transfers."}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link to="/home">
                  <Button
                    variant="primary"
                    size="md"
                    className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg"
                  >
                    <span>{isBn ? "মূল ড্যাশবোর্ডে প্রবেশ করুন" : "Open Main Dashboard"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

                <button
                  onClick={handleDemoAccess}
                  disabled={isNavigatingDemo}
                  className="px-5 py-2.5 rounded-xl border border-emerald-500/50 text-emerald-300 font-semibold text-xs hover:bg-emerald-900/40 backdrop-blur-md transition-all disabled:opacity-50"
                >
                  {isBn ? "লগইন ছাড়াই ডেমো দেখুন" : "Explore Demo Without Login"}
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. FOOTER                                                                 */}
      {/* ========================================================================= */}
      <footer className="border-t border-emerald-900/40 bg-[#030E0A] py-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <Leaf className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-sm">LandGuard AI</span>
              <span className="text-slate-500">| {isBn ? "সর্বস্বত্ব সংরক্ষিত ২০২৬" : "All rights reserved 2026"}</span>
            </div>

            <div className="flex flex-wrap items-center gap-6 font-medium">
              <Link to="/search" className="hover:text-emerald-400">{isBn ? "জমি অনুসন্ধান" : "Land Search"}</Link>
              <Link to="/khasra-map" className="hover:text-emerald-400">{isBn ? "খসড়া ম্যাপ" : "Khasra Map"}</Link>
              <Link to="/transactions" className="hover:text-emerald-400">{isBn ? "লেনদেন" : "Transactions"}</Link>
              <Link to="/rmd" className="hover:text-emerald-400">{isBn ? "RMD অডিট" : "RMD Audit"}</Link>
              <Link to="/login" className="hover:text-emerald-400">{isBn ? "লগইন" : "Login"}</Link>
              <Link to="/register" className="hover:text-emerald-400">{isBn ? "নিবন্ধন" : "Register"}</Link>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-emerald-950 text-center text-[11px] text-slate-500">
            {isBn 
              ? "সতর্কবার্তা: এটি একটি গবেষণাভিত্তিক সিন্থেটিক ক্যাডাস্ট্রাল এআই ডেমো সিস্টেম। এটি কোনো সরকারি আইনি দলিল নয়।"
              : "Disclaimer: This is a synthetic cadastral AI screening demonstration. It is not an official legal deed."}
          </div>
        </div>
      </footer>
    </div>
  );
};
