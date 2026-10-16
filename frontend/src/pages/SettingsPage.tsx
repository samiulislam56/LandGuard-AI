import React from 'react';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Monitor,
  CheckCircle2,
  Server,
  Languages,
  Activity,
  Sliders,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../context/ThemeContext';
import { api } from '../lib/api';
import { setLanguage } from '../i18n';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme, motionPreference, setMotionPreference, resolvedTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const { data: health, isLoading, isError, refetch } = useQuery({
    queryKey: ['settingsHealth'],
    queryFn: () => api.checkHealth(),
  });

  const currentLang = i18n.language.startsWith('bn') ? 'bn' : 'en';

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-atlas-border">
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-atlas-cyan" aria-hidden="true" />
          <h1 className="text-2xl font-bold tracking-tight text-atlas-textPrimary">
            {t('nav.settings')}
          </h1>
        </div>
        <p className="text-sm text-atlas-textMuted mt-1">
          Configure visual themes, language localization, accessibility preferences, and inspect API connectivity.
        </p>
      </div>

      {/* Language Selector */}
      <Card className="border-atlas-border bg-atlas-surface">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-atlas-cyan" />
            <CardTitle>Bilingual Localization (English &bull; বাংলা)</CardTitle>
          </div>
          <span className="text-xs font-mono text-atlas-cyan">
            Active: {currentLang === 'bn' ? 'বাংলা (Bengali)' : 'English'}
          </span>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-atlas-textMuted">
            Select your preferred display language. All cadastral labels, filters, metrics, and navigation will update instantly:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                currentLang === 'en'
                  ? 'border-atlas-cyan bg-atlas-cyan/10 font-bold'
                  : 'border-atlas-border hover:bg-atlas-elevated'
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-atlas-elevated flex items-center justify-center font-bold text-xs text-atlas-cyan">
                EN
              </div>
              <div>
                <span className="text-sm text-atlas-textPrimary block">English</span>
                <span className="text-[11px] text-atlas-textMuted">
                  Standard Cadastral Intelligence terminology and English numerics.
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setLanguage('bn')}
              className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                currentLang === 'bn'
                  ? 'border-atlas-cyan bg-atlas-cyan/10 font-bold'
                  : 'border-atlas-border hover:bg-atlas-elevated'
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-atlas-elevated flex items-center justify-center font-bold text-xs text-atlas-teal">
                বাং
              </div>
              <div>
                <span className="text-sm text-atlas-textPrimary block">বাংলা (Bengali)</span>
                <span className="text-[11px] text-atlas-textMuted font-bengali">
                  বাংলাদেশ ভূমি রেকর্ড পরিভাষা এবং বাংলা লিপিকরণ।
                </span>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card className="border-atlas-border bg-atlas-surface">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-atlas-cyan" />
            <CardTitle>{t('settings.appearance')}</CardTitle>
          </div>
          <span className="text-xs font-mono text-atlas-cyan">
            Active: {theme} ({resolvedTheme})
          </span>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-atlas-textMuted">
            Select your preferred visual mode for the LandGuard Atlas Command Center:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Dark Option (Default Atlas God Mode) */}
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                theme === 'dark'
                  ? 'border-atlas-cyan bg-atlas-cyan/10 font-bold'
                  : 'border-atlas-border hover:bg-atlas-elevated'
              }`}
            >
              <Moon className="w-5 h-5 text-atlas-cyan shrink-0 mt-0.5" />
              <div>
                <span className="text-sm text-atlas-textPrimary block">Dark Mode</span>
                <span className="text-[11px] text-atlas-textMuted">
                  Atlas God Mode (#07141E) with cyan signal depth
                </span>
              </div>
            </button>

            {/* Light Option */}
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                theme === 'light'
                  ? 'border-atlas-cyan bg-atlas-cyan/10 font-bold'
                  : 'border-atlas-border hover:bg-atlas-elevated'
              }`}
            >
              <Sun className="w-5 h-5 text-atlas-amber shrink-0 mt-0.5" />
              <div>
                <span className="text-sm text-atlas-textPrimary block">Light Mode</span>
                <span className="text-[11px] text-atlas-textMuted">
                  Clean crisp paper canvas (#F3F7F8) with deep ink contrast
                </span>
              </div>
            </button>

            {/* System Option */}
            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                theme === 'system'
                  ? 'border-atlas-cyan bg-atlas-cyan/10 font-bold'
                  : 'border-atlas-border hover:bg-atlas-elevated'
              }`}
            >
              <Monitor className="w-5 h-5 text-atlas-textMuted shrink-0 mt-0.5" />
              <div>
                <span className="text-sm text-atlas-textPrimary block">System Synced</span>
                <span className="text-[11px] text-atlas-textMuted">
                  Auto-synchronizes with operating system preference
                </span>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility & Motion */}
      <Card className="border-atlas-border bg-atlas-surface">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-atlas-cyan" />
            <CardTitle>{t('settings.motion')}</CardTitle>
          </div>
          <span className="text-xs font-mono text-atlas-cyan">
            Active: {motionPreference}
          </span>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-atlas-textMuted">
            Control Framer Motion transitions, chart animations, and 3D camera controls:
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => setMotionPreference('default')}
              className={`flex-1 p-3.5 rounded-xl border text-left text-xs transition-all ${
                motionPreference === 'default'
                  ? 'border-atlas-cyan bg-atlas-cyan/10 font-bold'
                  : 'border-atlas-border hover:bg-atlas-elevated'
              }`}
            >
              <span className="font-semibold block text-sm mb-0.5 text-atlas-textPrimary">Smooth Motion</span>
              <span className="text-[11px] text-atlas-textMuted">
                Enables purposeful micro-interactions, 3D orbit controls, and subtle hover cues.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMotionPreference('reduced')}
              className={`flex-1 p-3.5 rounded-xl border text-left text-xs transition-all ${
                motionPreference === 'reduced'
                  ? 'border-atlas-cyan bg-atlas-cyan/10 font-bold'
                  : 'border-atlas-border hover:bg-atlas-elevated'
              }`}
            >
              <span className="font-semibold block text-sm mb-0.5 text-atlas-textPrimary">Reduced Motion</span>
              <span className="text-[11px] text-atlas-textMuted">
                Disables non-essential animations for vestibular comfort and rapid data scanning.
              </span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Backend API Service Status */}
      <Card className="border-atlas-border bg-atlas-surface">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-atlas-cyan" aria-hidden="true" />
            <CardTitle>{t('settings.apiStatus')}</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs font-mono h-7"
          >
            {t('common.filter')} / Test
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 font-mono text-xs">
          <div className="p-3.5 rounded-xl bg-atlas-elevated border border-atlas-border space-y-2">
            <div className="flex justify-between">
              <span className="text-atlas-textMuted">Configured API Base URL:</span>
              <span className="font-bold text-atlas-cyan">{api.getApiUrl()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-atlas-textMuted">Connection Status:</span>
              <span>
                {isLoading ? (
                  'Checking...'
                ) : isError ? (
                  <span className="text-atlas-red font-bold">Unreachable / Offline</span>
                ) : (
                  <span className="text-atlas-teal font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 inline" /> Operational (HTTP 200)
                  </span>
                )}
              </span>
            </div>
            {health && (
              <>
                <div className="flex justify-between">
                  <span className="text-atlas-textMuted">Loaded ML Models:</span>
                  <span className="text-atlas-textPrimary">{health.models_loaded} (Random Forest + Isolation Forest)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-atlas-textMuted">Loaded Datasets:</span>
                  <span className="text-atlas-textPrimary">{health.datasets_loaded} synthetic CSVs</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
