import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Cadastral3DExplorer } from '../components/gis/Cadastral3DExplorer';
import { Button } from '../components/ui/Button';

export const Explorer3DPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="space-y-4 pb-8 select-none">
      {/* Header Bar */}
      <div className="rounded-2xl border border-atlas-border bg-atlas-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-atlas-md">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            className="text-xs font-mono"
          >
            {t('common.back')}
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <Box className="w-5 h-5 text-atlas-cyan" />
              <h1 className="text-lg font-extrabold text-atlas-textPrimary tracking-tight">
                {t('explorer3d.title')}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-atlas-cyan/15 text-atlas-cyan border border-atlas-cyan/30 text-[10px] font-mono font-bold">
                Three.js + R3F
              </span>
            </div>
            <p className="text-xs text-atlas-textMuted font-mono mt-0.5">
              {t('explorer3d.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span className="text-[11px]">{t('explorer3d.conceptualBadge')}</span>
          </span>
        </div>
      </div>

      {/* Main 3D Canvas Container */}
      <div className="w-full">
        <Suspense
          fallback={
            <div className="h-[620px] rounded-2xl bg-atlas-surface border border-atlas-border flex items-center justify-center text-atlas-cyan font-mono text-xs animate-pulse">
              {t('common.loading')} 3D Cadastral Engine...
            </div>
          }
        >
          <Cadastral3DExplorer height="660px" />
        </Suspense>
      </div>
    </div>
  );
};
