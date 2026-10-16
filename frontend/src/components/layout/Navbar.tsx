import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Moon,
  Sun,
  Menu,
  Languages,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../context/ThemeContext';
import { setLanguage } from '../../i18n';
import { api } from '../../lib/api';

interface NavbarProps {
  onOpenMobileMenu: () => void;
  isSidebarCollapsed: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu }) => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [globalSearch, setGlobalSearch] = useState('');

  const { data: userProfile } = useQuery({
    queryKey: ['authMe'],
    queryFn: () => api.getMe(),
  });

  const currentLang = i18n.language === 'bn' ? 'bn' : 'en';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(globalSearch.trim())}`);
      setGlobalSearch('');
    }
  };

  const toggleLanguage = () => {
    const nextLang = currentLang === 'en' ? 'bn' : 'en';
    setLanguage(nextLang);
  };

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-emerald-900/10 dark:border-emerald-500/20 px-4 sm:px-6 flex items-center justify-between gap-3 select-none transition-colors duration-200">
      {/* Left: Mobile Menu & Logo Badge */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" aria-hidden="true" />
        </button>

        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
            LG
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
              LandGuard AI
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </span>
            <span className="text-[11px] text-emerald-800 dark:text-emerald-300/90 font-medium">
              স্মার্ট ভূমি তথ্য ও যাচাই
            </span>
          </div>
        </Link>
      </div>

      {/* Center: Search Dag / Khatian / Transaction */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-2 hidden sm:block">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder={currentLang === 'bn' ? "দাগ নম্বর, খতিয়ান বা লেনদেন খুঁজুন..." : "Search Dag, Khatian or Transaction..."}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 rounded-xl pl-9 pr-20 py-2 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-inner"
            aria-label="Global Land Search"
          />
          <button
            type="submit"
            className="absolute right-1 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs rounded-lg transition-colors"
          >
            {currentLang === 'bn' ? "খুঁজুন" : "Search"}
          </button>
        </div>
      </form>

      {/* Right: Demo Mode Indicator, Guest Demo / Login Link, Language, Theme, Quick Shortcuts */}
      <div className="flex items-center gap-2">
        {/* Visible Demo Mode / User Profile Badge (Problem 2) */}
        {userProfile?.username === 'demo_guest' || !userProfile?.authenticated ? (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100/90 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{currentLang === 'bn' ? "ডেমো মোড" : "Demo Mode"}</span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="truncate max-w-[100px]">{userProfile?.username}</span>
          </div>
        )}

        {/* Direct Demo / Login Link */}
        <Link
          to="/login"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-all shadow-sm"
          title={currentLang === 'bn' ? "লগইন বা সরাসরি ডেমো প্রবেশ" : "Sign In or Direct Demo Access"}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span>{currentLang === 'bn' ? "লগইন / ডেমো" : "Login / Demo"}</span>
        </Link>

        {/* Language Switcher */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-semibold"
          title={currentLang === 'en' ? "বাংলায় পরিবর্তন করুন" : "Switch to English"}
          aria-label="Toggle Language"
        >
          <Languages className="w-3.5 h-3.5 text-emerald-600" />
          <span>{currentLang === 'bn' ? "বাংলা" : "ENG"}</span>
        </button>

        {/* Theme Cycle Button */}
        <button
          type="button"
          onClick={cycleTheme}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Current Theme: ${theme}`}
          aria-label="Toggle display theme"
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="w-4 h-4 text-emerald-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
        </button>
      </div>
    </header>
  );
};
