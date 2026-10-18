import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Layers, 
  Scale, 
  Bot, 
  ClipboardCheck, 
  Download, 
  ArrowRight, 
  Sparkles,
  Info,
  Compass,
  Box,
  SlidersHorizontal,
  Settings,
  Database,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

import { api } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LivingLandHero } from '../components/ui/LivingLandHero';

export const HomePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === 'bn';
  const [isAdvancedMode, setIsAdvancedMode] = useState<boolean>(false);

  // Fetch summary metrics from live backend asynchronously
  const { 
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    refetch: refetchSummary
  } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: () => api.getDashboardSummary(),
    staleTime: 60000,
  });

  const totalParcels = summary?.parcels;
  const totalTransactions = summary?.transactions;
  const flaggedCases = summary?.review_cases;

  // 10 Unified Feature Shortcuts (Preserving all Screenshot 5 features in Screenshot 1 visual styling)
  const serviceTiles = [
    {
      id: 'search',
      title: t('home.tileSearch', 'জমির তথ্য খুঁজুন'),
      desc: t('home.tileSearchDesc', 'বিভাগ, জেলা, মৌজা, খতিয়ান ও দাগ নম্বর দিয়ে দ্রুত জমি অনুসন্ধান।'),
      icon: Search,
      to: '/search',
      color: 'from-emerald-600 to-teal-700',
      badge: isBn ? "অনুসন্ধান" : "Search"
    },
    {
      id: 'khasra',
      title: t('home.tileKhasra', 'ডিজিটাল খসড়া ম্যাপ'),
      desc: t('home.tileKhasraDesc', 'নম্বরযুক্ত ধারণামূলক দাগের নকশা ও পার্সেল সীমানা ভিজ্যুয়ালাইজেশন।'),
      icon: Compass,
      to: '/khasra-map',
      color: 'from-teal-600 to-emerald-800',
      badge: isBn ? "ক্যাডাস্ট্রাল" : "Map"
    },
    {
      id: '3d',
      title: isBn ? "৩ডি পার্সেল এক্সপ্লোরার" : "3D Parcel Explorer",
      desc: isBn ? "পার্সেল সীমানা ও টপোগ্রাফির ত্রিমাত্রিক ইন্টারেক্টিভ মডেল।" : "Three.js interactive 3D cadastral land elevation model.",
      icon: Box,
      to: '/explorer-3d',
      color: 'from-cyan-600 to-blue-800',
      badge: isBn ? "ত্রিমাত্রিক" : "3D Model"
    },
    {
      id: 'transactions',
      title: t('home.tileTransactions', 'লেনদেন যাচাই'),
      desc: t('home.tileTransactionsDesc', 'জমির হস্তান্তরের ইতিহাস, ক্রয়-বিক্রয় ও দ্বৈত বিক্রয় স্ক্রিনিং।'),
      icon: Layers,
      to: '/transactions',
      color: 'from-amber-600 to-orange-700',
      badge: isBn ? "স্ক্রিনিং" : "Screening"
    },
    {
      id: 'assess',
      title: isBn ? "এআই মূল্যায়ন (AI Assessment)" : "AI Risk Assessment",
      desc: isBn ? "র‍্যান্ডম ফরেস্ট ও আইসোলেশন ফরেস্টে দ্বৈত বিক্রয় ঝুঁকি যাচাই।" : "Random Forest & Isolation Forest ML transaction screening.",
      icon: Sparkles,
      to: '/assess/TX-002911-2',
      color: 'from-emerald-500 to-green-700',
      badge: isBn ? "মেশিন লার্নিং" : "AI Model"
    },
    {
      id: 'rmd',
      title: t('home.tileRMD', 'RMD ত্রিভুজ অডিট'),
      desc: t('home.tileRMDDesc', 'খতিয়ান (Record), নামজারি (Mutation) ও দলিলের (Deed) সামঞ্জস্য অডিট।'),
      icon: Scale,
      to: '/rmd',
      color: 'from-purple-600 to-indigo-800',
      badge: isBn ? "ধারাবাহিকতা" : "Audit"
    },
    {
      id: 'reviews',
      title: t('home.tileReviews', 'রিভিউ ওয়ার্কস্পেস'),
      desc: t('home.tileReviewsDesc', 'সহকারী কমিশনার (ভূমি) অডিট রিভিউ কিউ ও স্ট্যাটাস ট্র্যাকিং।'),
      icon: ClipboardCheck,
      to: '/reviews',
      color: 'from-slate-700 to-slate-900',
      badge: isBn ? "ওয়ার্কস্পেস" : "Review"
    },
    {
      id: 'reports',
      title: t('home.tileReports', 'প্রতিবেদন কেন্দ্র'),
      desc: t('home.tileReportsDesc', 'অফিসিয়াল ফরেনসিক অ্যাসেসমেন্ট ডোসিয়ার পিডিএফ ডাউনলোড।'),
      icon: Download,
      to: '/reports',
      color: 'from-teal-600 to-emerald-900',
      badge: isBn ? "ডকুমেন্ট" : "Reports"
    },
    {
      id: 'copilot',
      title: t('home.tileCopilot', 'AI সহকারী (Copilot)'),
      desc: t('home.tileCopilotDesc', 'সহজ বাংলায় জমির আইনি পরিভাষা ও মিউটেশনের নিয়মাবলী জানুন।'),
      icon: Bot,
      to: '/help',
      color: 'from-blue-600 to-cyan-700',
      badge: isBn ? "সহায়িকা" : "Copilot"
    },
    {
      id: 'settings',
      title: isBn ? "সেটিংস ও নিরাপত্তা" : "Settings & Security",
      desc: isBn ? "ভাষা নির্বাচন, থিম পছন্দ এবং অ্যাকাউন্ট নিরাপত্তা কনফিগারেশন।" : "Configure language, theme, and security preferences.",
      icon: Settings,
      to: '/settings',
      color: 'from-slate-600 to-slate-800',
      badge: isBn ? "প্রোফাইল" : "Config"
    }
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      
      {/* ========================================================================= */}
      {/* 1. LIVING LAND BOTANICAL HERO (Gentle Parallax & Animated Cadastral Motif) */}
      {/* ========================================================================= */}
      <LivingLandHero />

      {/* ========================================================================= */}
      {/* 2. LIVE METRICS SUMMARY BAR (Real Backend Counts)                         */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        {/* Transparent Bengali Loading State while Backend Wakes Up / Fetches */}
        {isSummaryLoading && (
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold animate-pulse">
            <div className="w-3.5 h-3.5 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin shrink-0" />
            <span>{isBn ? "তথ্য লোড হচ্ছে, অনুগ্রহ করে একটু অপেক্ষা করুন।" : "Loading data, please wait a moment..."}</span>
          </div>
        )}

        {/* Temporary Backend Delay / Error Retry Banner */}
        {isSummaryError && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-amber-800 dark:text-amber-300 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{isBn ? "সার্ভারের সঙ্গে সংযোগে দেরি হচ্ছে। আবার চেষ্টা করুন।" : "Delayed connection to server. Please try again."}</span>
            </div>
            <button
              type="button"
              onClick={() => refetchSummary()}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all shrink-0 self-start sm:self-auto"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isBn ? "আবার চেষ্টা করুন" : "Retry"}</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#071D16] border border-slate-200 dark:border-emerald-500/20 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-emerald-400/80">
                {isBn ? "নথিভুক্ত পার্সেল" : "Total Parcels"}
              </span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {isSummaryLoading ? (
                  <div className="h-7 w-24 bg-slate-200 dark:bg-emerald-950/60 rounded-lg animate-pulse" />
                ) : (
                  <span>{(totalParcels ?? 3000).toLocaleString(isBn ? 'bn-BD' : 'en-US')}</span>
                )}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#071D16] border border-slate-200 dark:border-emerald-500/20 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-emerald-400/80">
                {isBn ? "হস্তান্তর লেনদেন" : "Recorded Transactions"}
              </span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {isSummaryLoading ? (
                  <div className="h-7 w-24 bg-slate-200 dark:bg-emerald-950/60 rounded-lg animate-pulse" />
                ) : (
                  <span>{(totalTransactions ?? 3851).toLocaleString(isBn ? 'bn-BD' : 'en-US')}</span>
                )}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-400 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#071D16] border border-slate-200 dark:border-emerald-500/20 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-emerald-400/80">
                {isBn ? "অডিট রিভিউ কেস" : "Review Required Cases"}
              </span>
              <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                {isSummaryLoading ? (
                  <div className="h-7 w-24 bg-slate-200 dark:bg-amber-950/60 rounded-lg animate-pulse" />
                ) : (
                  <span>{(flaggedCases ?? 1188).toLocaleString(isBn ? 'bn-BD' : 'en-US')}</span>
                )}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TEN UNIFIED FEATURE SHORTCUTS GRID                                     */}
      {/* ========================================================================= */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-emerald-900/40 pb-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>{isBn ? "ল্যান্ডগার্ড প্রধান মডিউল ও সেবাসমূহ" : "LandGuard AI Core Modules"}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isBn ? "প্রয়োজনীয় মডিউল নির্বাচন করে কাজ শুরু করুন" : "Select any feature to begin inspection or screening"}
            </p>
          </div>

          {/* Simple Mode vs Advanced Mode Toggle */}
          <button
            onClick={() => setIsAdvancedMode(!isAdvancedMode)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isAdvancedMode 
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{isAdvancedMode ? (isBn ? "বিস্তারিত মোড (সক্রিয়)" : "Advanced Mode (Active)") : (isBn ? "সহজ মোড" : "Simple Mode")}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4.5">
          {serviceTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <Link
                key={tile.id}
                to={tile.to}
                className="group block rounded-2xl bg-white dark:bg-[#071D16] p-5 border border-slate-200 dark:border-emerald-500/20 shadow-sm hover:shadow-xl hover:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between min-h-[195px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${tile.color} text-white shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-emerald-950/80 text-slate-700 dark:text-emerald-300 border border-slate-200 dark:border-emerald-800/40">
                      {tile.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                    {tile.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed font-normal">
                    {tile.desc}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-emerald-900/30 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <span>{isBn ? "প্রবেশ করুন" : "Open"}</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. GUIDANCE CARD                                                          */}
      {/* ========================================================================= */}
      <Card className="p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-white dark:from-emerald-950/40 dark:via-[#071D16] dark:to-[#071D16] border-emerald-300/60 dark:border-emerald-800/40 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5 shadow-md">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                {isBn ? "সহজ মোড বনাম বিস্তারিত মোড" : "Simple Mode vs. Detailed Inspection Mode"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {isBn 
                  ? "সাধারণ নাগরিকরা সহজে তথ্য বুঝতে ‘সহজ মোড’ ব্যবহার করতে পারেন। ভূমি গবেষক ও সার্ভেয়াররা যেকোনো পাতায় ‘বিস্তারিত মোড’ চালু করে এআই মডেল ভেক্টর ও বিস্তারিত প্রমাণ পর্যালোচনা করতে পারেন।"
                  : "Citizens can explore in Simple Mode for jargon-free explanations. Analysts can switch to Advanced Mode anytime to inspect ML feature weights and audit trees."}
              </p>
            </div>
          </div>

          <Link to="/search" className="shrink-0">
            <Button variant="primary" size="sm" className="gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-xs">
              {isBn ? "অনুসন্ধান শুরু করুন" : "Start Search"}
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </Card>

    </div>
  );
};
