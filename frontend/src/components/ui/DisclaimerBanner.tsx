import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, AlertCircle } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const { t } = useTranslation();

  return (
    <aside
      aria-label="Synthetic Data & Demonstration Disclaimer"
      className="bg-amber-500/10 border-b border-amber-500/25 text-slate-800 dark:text-slate-200 px-4 py-2 text-xs font-medium transition-colors select-none"
    >
      <div className="w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" aria-hidden="true" />
          <span className="leading-relaxed">
            {t('app.disclaimer')}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 shrink-0 font-mono">
          <AlertCircle className="w-3.5 h-3.5 text-atlas-cyan" aria-hidden="true" />
          <span>v1.1 • 3,000 synthetic plots</span>
        </div>
      </div>
    </aside>
  );
};
