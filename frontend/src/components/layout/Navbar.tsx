import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Moon,
  Sun,
  Monitor,
  Menu,
  Activity,
  ShieldAlert,
  AlertCircle,
  ExternalLink,
  Languages,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../lib/api';
import { setLanguage } from '../../i18n';

interface NavbarProps {
  onOpenMobileMenu: () => void;
  isSidebarCollapsed: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [globalSearch, setGlobalSearch] = useState('');

  const currentLang = i18n.language === 'bn' ? 'bn' : 'en';

  // Live health query
  const { data: healthData, isError } = useQuery({
    queryKey: ['systemHealth'],
    queryFn: () => api.checkHealth(),
    refetchInterval: 30000,
    retry: 1,
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      navigate(`/transactions?search=${encodeURIComponent(globalSearch.trim())}`);
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
    <header className="sticky top-0 z-30 h-16 bg-[#07141E]/95 dark:bg-[#07141E]/95 backdrop-blur-md border-b border-atlas-border px-4 sm:px-6 flex items-center justify-between gap-3 select-none">
      {/* Left: Mobile Menu & Atlas Title Context */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
          <span className="font-extrabold text-sm tracking-tight text-white">
            {t('app.name')}
          </span>
          <span className="text-atlas-cyan font-semibold">/</span>
          <span className="text-slate-300">{t('app.subtitle')}</span>
        </div>
      </div>

      {/* Center: Search Transaction ID or Parcel ID (Matching Reference 3) */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl mx-2">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder={t('topbar.searchPlaceholder')}
            className="w-full text-xs font-mono bg-[#102533]/90 border border-atlas-cyan/30 hover:border-atlas-cyan/60 rounded-xl pl-10 pr-24 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-atlas-cyan transition-all shadow-inner"
            aria-label="Global Transaction Search"
          />
          <button
            type="submit"
            className="absolute right-1.5 px-3 py-1 bg-atlas-cyan hover:bg-atlas-cyan/80 text-slate-950 font-bold text-xs rounded-lg transition-colors font-mono"
          >
            {t('topbar.searchButton')}
          </button>
        </div>
      </form>

      {/* Right: Language Switcher, Action Links & Telemetry */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Language Switcher (EN / বাংলা) */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border border-atlas-border hover:border-atlas-cyan bg-[#102533] text-slate-200 hover:text-white transition-all font-mono"
          title={`Switch Language (Current: ${currentLang.toUpperCase()})`}
          aria-label={`Switch Language, current is ${currentLang === 'en' ? 'English' : 'Bangla'}`}
        >
          <Languages className="w-3.5 h-3.5 text-atlas-cyan" />
          <span className={currentLang === 'en' ? 'text-atlas-cyan font-extrabold' : 'text-slate-400'}>EN</span>
          <span className="text-slate-500">|</span>
          <span className={currentLang === 'bn' ? 'text-atlas-cyan font-extrabold' : 'text-slate-400'}>বাংলা</span>
        </button>

        {/* Quick Benchmark Link */}
        <button
          type="button"
          onClick={() => navigate('/assess/TX-002911-2')}
          className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-950/40 border border-red-500/40 text-red-300 hover:bg-red-900/50 transition-colors font-mono"
          title="Inspect Ground Truth Conflict Benchmark AC-04"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          <span>{t('topbar.inspectBenchmark')}</span>
        </button>

        {/* Backend API Health Indicator */}
        <div
          title={isError ? t('app.offline') : t('app.fastapiLive')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border border-atlas-cyan/25 bg-[#102533]/80"
        >
          {isError ? (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-red-500 animate-pulse" aria-hidden="true" />
              <span className="hidden lg:inline text-red-400 font-semibold">{t('app.offline')}</span>
            </>
          ) : healthData?.status === 'ok' ? (
            <>
              <Activity className="w-3.5 h-3.5 text-atlas-cyan animate-pulse" aria-hidden="true" />
              <span className="hidden lg:inline text-atlas-cyan font-semibold">{t('app.fastapiLive')}</span>
            </>
          ) : (
            <span className="text-amber-400">{t('app.connecting')}</span>
          )}
        </div>

        {/* API Docs External link */}
        <a
          href="http://127.0.0.1:8000/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-mono text-slate-300 hover:text-white border border-slate-700 hover:border-atlas-cyan/40 bg-[#102533]/50 transition-colors"
          title="Open FastAPI Swagger Interactive Documentation"
        >
          <span>{t('topbar.apiDocs')}</span>
          <ExternalLink className="w-3 h-3 text-atlas-cyan" />
        </a>

        {/* Theme Cycler */}
        <button
          type="button"
          onClick={cycleTheme}
          className="p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors border border-slate-800"
          title={`Theme: ${theme} (Current: ${resolvedTheme})`}
          aria-label={`Toggle theme, current is ${theme}`}
        >
          {theme === 'system' ? (
            <Monitor className="w-4 h-4" aria-hidden="true" />
          ) : resolvedTheme === 'dark' ? (
            <Moon className="w-4 h-4 text-atlas-cyan" aria-hidden="true" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
          )}
        </button>
      </div>
    </header>
  );
};

