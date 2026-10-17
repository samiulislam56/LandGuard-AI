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
      <div className="rounded-3xl border border-emerald-800/40 bg-gradient-to-r from-[#062B22] to-[#0B3B2F] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl text-white">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            className="text-xs font-mono border-emerald-600/40 text-emerald-200 hover:bg-emerald-800/40"
          >
            {t('common.back')}
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <Box className="w-5 h-5 text-[#C4E8A5]" />
              <h1 className="text-lg font-extrabold text-white tracking-tight">
                {t('explorer3d.title')}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#C4E8A5] border border-emerald-500/30 text-[10px] font-mono font-bold">
                Three.js + R3F
              </span>
            </div>
            <p className="text-xs text-emerald-200/70 font-mono mt-0.5">
              {t('explorer3d.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-1.5 shadow-sm">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span className="text-[11px] font-semibold">{t('explorer3d.conceptualBadge')}</span>
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
