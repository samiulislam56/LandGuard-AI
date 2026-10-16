import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Search, 
  FileText, 
  Layers, 
  Scale, 
  Bot, 
  ClipboardCheck, 
  Download, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Info,
  Compass
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const HomePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  const serviceTiles = [
    {
      id: 'search',
      title: t('home.tileSearch', 'জমির তথ্য খুঁজুন'),
      desc: t('home.tileSearchDesc', 'বিভাগ, জেলা, মৌজা ও দাগ নম্বর দিয়ে দ্রুত জমি অনুসন্ধান করুন।'),
      icon: Search,
      to: '/search',
      color: 'from-emerald-600 to-teal-700',
      badge: isBn ? "সহজ সেবা" : "Guided"
    },
    {
      id: 'khatian',
      title: t('home.tileKhatian', 'খতিয়ান ও দাগ অনুসন্ধান'),
      desc: t('home.tileKhatianDesc', 'সিএস, এসএ, আরএস খতিয়ান ও দাগের রেকর্ডীয় মালিকানা জানুন।'),
      icon: FileText,
      to: '/search',
      color: 'from-blue-600 to-indigo-700',
      badge: isBn ? "রেকর্ড" : "RoR"
    },
    {
      id: 'transactions',
      title: t('home.tileTransactions', 'লেনদেন যাচাই'),
      desc: t('home.tileTransactionsDesc', 'জমির অতীতের হস্তান্তর ও সম্ভাব্য দ্বৈত-বিক্রয় অসংগতি যাচাই করুন।'),
      icon: Layers,
      to: '/transactions',
      color: 'from-amber-600 to-orange-700',
      badge: isBn ? "স্ক্রিনিং" : "Screening"
    },
    {
      id: 'khasra',
      title: t('home.tileKhasra', 'ডিজিটাল খসড়া ম্যাপ'),
      desc: t('home.tileKhasraDesc', 'নম্বরযুক্ত ধারণামূলক দাগের নকশা ও পার্সেল সীমানা দেখুন।'),
      icon: Compass,
      to: '/khasra-map',
      color: 'from-emerald-700 to-green-800',
      badge: isBn ? "ক্যাডাস্ট্রাল" : "Map"
    },
    {
      id: 'rmd',
      title: t('home.tileRMD', 'RMD ত্রিভুজ অডিট'),
      desc: t('home.tileRMDDesc', 'খতিয়ান, নামজারি ও দলিলের মধ্যকার সামঞ্জস্য ও বায়া ধারাবাহিকতা অডিট।'),
      icon: Scale,
      to: '/rmd',
      color: 'from-purple-600 to-violet-800',
      badge: isBn ? "ধারাবাহিকতা" : "Audit"
    },
    {
      id: 'copilot',
      title: t('home.tileCopilot', 'AI সহকারী'),
      desc: t('home.tileCopilotDesc', 'সহজ বাংলায় জমির প্রশ্ন করুন এবং দ্রুত নির্দেশিকা পান।'),
      icon: Bot,
      to: '/help',
      color: 'from-cyan-600 to-blue-700',
      badge: isBn ? "সহায়িকা" : "Assistant"
    },
    {
      id: 'reviews',
      title: t('home.tileReviews', 'আবেদন / রিভিউ অবস্থা'),
      desc: t('home.tileReviewsDesc', 'পর্যালোচনার জন্য পাঠানো আবেদন এবং কেস ওয়ার্কস্পেস স্ট্যাটাস দেখুন।'),
      icon: ClipboardCheck,
      to: '/reviews',
      color: 'from-slate-700 to-slate-900',
      badge: isBn ? "ওয়ার্কস্পেস" : "Queue"
    },
    {
      id: 'reports',
      title: t('home.tileReports', 'প্রতিবেদন কেন্দ্র'),
      desc: t('home.tileReportsDesc', 'অফিসিয়াল ফরেনসিক অ্যাসেসমেন্ট ডোসিয়ার পিডিএফ ডাউনলোড করুন।'),
      icon: Download,
      to: '/reports',
      color: 'from-teal-600 to-emerald-800',
      badge: isBn ? "ডকুমেন্ট" : "Dossier"
    }
  ];

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-20">
      {/* Agricultural Hero Section (Reference 2 Inspiration) */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-emerald-800/10 dark:border-emerald-500/20">
        {/* Background Image Container with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: `url('/assets/images/hero-bg.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-900/85 to-transparent dark:from-black/95 dark:via-slate-950/90" />

        {/* Hero Content */}
        <div className="relative z-10 px-6 py-14 md:py-20 lg:px-12 max-w-3xl text-white space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/80 backdrop-blur-md border border-emerald-500/40 text-emerald-200 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{isBn ? "স্মার্ট ভূমি তথ্য ও লেনদেন যাচাই সহায়ক" : "Smart Land Information & Transaction Screening"}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            {t('home.heroTitle', 'আপনার জমির তথ্য, আরও সহজে')}
          </h1>

          <p className="text-base md:text-lg text-emerald-100/90 leading-relaxed font-normal">
            {t('home.heroSubtitle', 'জমি ও লেনদেনের তথ্য খুঁজুন, সম্ভাব্য অসংগতি বুঝুন এবং প্রয়োজন হলে পর্যালোচনার জন্য পাঠান।')}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link to="/search">
              <Button 
                variant="primary" 
                size="lg" 
                className="gap-2 px-6 py-3.5 text-base font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                <Search className="w-5 h-5" />
                {t('home.ctaSearch', 'জমির তথ্য খুঁজুন')}
              </Button>
            </Link>

            <Link to="/khasra-map">
              <Button 
                variant="outline" 
                size="lg" 
                className="gap-2 px-6 py-3.5 text-base font-medium border-emerald-400/50 text-white bg-emerald-900/40 hover:bg-emerald-800/60 backdrop-blur-md rounded-xl"
              >
                <Compass className="w-5 h-5 text-amber-300" />
                {t('home.ctaDemo', 'ডেমো ব্যবহার করুন')}
              </Button>
            </Link>
          </div>

          {/* Guest Demo Assurance Card */}
          <div className="pt-4 border-t border-emerald-500/20 flex items-center gap-3 text-xs text-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {t('home.guestDemoDesc', 'আপনি সিন্থেটিক ভূমি রেকর্ড, খসড়া ম্যাপ এবং লেনদেন যাচাই করতে পারবেন কোনো লগইন ছাড়াই।')}
            </span>
          </div>
        </div>
      </div>

      {/* Service Shortcut Cards Grid (Reference 2 Style) */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
              {t('home.servicesTitle', 'প্রধান সেবাসমূহ')}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              {t('home.servicesSubtitle', 'সহজে প্রয়োজনীয় সেবাটি নির্বাচন করুন')}
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {isBn ? "সকল সেবা উন্মুক্ত সিন্থেটিক ডেমো" : "Open Public Synthetic Prototype"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {serviceTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <Link
                key={tile.id}
                to={tile.to}
                className="group block rounded-2xl bg-white dark:bg-slate-800 p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-xl hover:border-emerald-600/40 dark:hover:border-emerald-500/40 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${tile.color} text-white shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {tile.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {tile.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    {tile.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <span>{isBn ? "প্রবেশ করুন" : "Open Service"}</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Informational Guidance Banner */}
      <Card className="p-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 border-emerald-200 dark:border-emerald-900/50 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {isBn ? "সহজ মোড বনাম বিস্তারিত মোড" : "Simple Mode vs. Advanced Mode"}
              </h3>
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {isBn 
                  ? "সাধারণ নাগরিকরা সহজে তথ্য বুঝতে ‘সহজ মোড’ ব্যবহার করতে পারেন। ভূমি গবেষক ও সার্ভেয়াররা যেকোনো পাতায় ‘বিস্তারিত মোড’ চালু করে এআই মডেল ভেক্টর ও বিস্তারিত প্রমাণ পর্যালোচনা করতে পারেন।"
                  : "Citizens can explore in 'Simple Mode' for clear, jargon-free explanations. Analysts can switch to 'Advanced Mode' anytime to inspect ML feature weights and audit trees."}
              </p>
            </div>
          </div>

          <Link to="/search" className="shrink-0">
            <Button variant="primary" size="sm" className="gap-1.5 bg-emerald-700 hover:bg-emerald-800">
              {isBn ? "অনুসন্ধান শুরু করুন" : "Start Search"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
