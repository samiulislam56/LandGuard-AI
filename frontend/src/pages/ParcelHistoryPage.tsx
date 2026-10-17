import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  History,
  Search,
  Compass,
  Box,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

import { api } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { CadastralMap } from '../components/gis/CadastralMap';
import { AssetNetworkGraph } from '../components/gis/AssetNetworkGraph';
import { Cadastral3DExplorer } from '../components/gis/Cadastral3DExplorer';
import { generateCadastralPolygon, CadastralPlotGeo } from '../lib/geo';
import { ParcelPassportModal } from '../components/parcel/ParcelPassportModal';
import { TransactionComparisonStory } from '../components/parcel/TransactionComparisonStory';

export const ParcelHistoryPage: React.FC = () => {
  const { id = 'LG-P-002911' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === 'bn';
  const [targetId, setTargetId] = useState('');
  const [viewportMode, setViewportMode] = useState<'2d' | '3d'>('2d');
  const [isPassportOpen, setIsPassportOpen] = useState(false);

  // Explicit canonical alias resolution: PARCEL-002911 -> LG-P-002911
  React.useEffect(() => {
    if (!id) return;
    const cleanId = id.trim().toUpperCase();
    if (cleanId.startsWith('PARCEL-')) {
      const canonical = cleanId.replace('PARCEL-', 'LG-P-');
      navigate(`/parcels/${canonical}`, { replace: true });
    }
  }, [id, navigate]);

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['parcelHistory', id],
    queryFn: () => api.getParcelHistory(id),
    staleTime: 30000,
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetId.trim()) {
      let clean = targetId.trim().toUpperCase();
      if (clean.startsWith('PARCEL-')) {
        clean = clean.replace('PARCEL-', 'LG-P-');
      } else if (/^\d+$/.test(clean) && clean.length <= 6) {
        clean = 'LG-P-' + clean.padStart(6, '0');
      }
      navigate(`/parcels/${clean}`);
      setTargetId('');
    }
  };

  const parcel = data?.parcel;
  const history = useMemo(() => data?.transactions || [], [data?.transactions]);

  // Generate cadastral plot for this parcel
  const currentPlot: CadastralPlotGeo = useMemo(() => {
    const dagNo = parcel?.dag_no || 2911;
    const khatianNo = parcel?.khatian_no || 4820;
    const area = parcel?.total_area_acres || 1.85;
    const district = parcel?.district || 'Dhaka';
    const isConflict = history.some((tx) => tx.scenario === 'conflicting_sale' || tx.overlapping_claim === 1);

    return generateCadastralPolygon(
      id,
      district,
      dagNo,
      khatianNo,
      area,
      isConflict ? 'conflicting_sale' : 'normal'
    );
  }, [id, parcel, history]);

  return (
    <div className="space-y-6">
      {/* Header & Quick Parcel Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-atlas-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-atlas-cyan/15 text-atlas-cyan">
              <MapPin className="w-4 h-4" />
            </span>
            <h1 className="text-2xl font-bold font-mono tracking-tight text-atlas-textPrimary">
              {id}
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-atlas-cyan/10 text-atlas-cyan font-mono border border-atlas-cyan/20">
              Dag {parcel?.dag_no || '...'} &bull; Khatian {parcel?.khatian_no || '...'}
            </span>
          </div>
          <p className="text-xs text-atlas-textMuted mt-1">
            {t('nav.parcelIntelligence')} &bull; {t('dossier.chainOfTitle')} &bull; Topology Inspection
          </p>
        </div>

        {/* Quick Sample Switcher & Form */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1 text-[11px] font-mono">
            <span className="text-atlas-textMuted">Benchmark:</span>
            {['LG-P-002911', 'LG-P-000001', 'LG-P-000002'].map((pid) => (
              <button
                key={pid}
                type="button"
                onClick={() => navigate(`/parcels/${pid}`)}
                className={`px-2 py-0.5 rounded border text-xs transition-colors ${
                  id === pid
                    ? 'bg-atlas-cyan text-atlas-app font-bold border-atlas-cyan'
                    : 'border-atlas-border hover:border-atlas-cyan text-atlas-textMuted'
                }`}
              >
                {pid}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5">
            <input
              type="text"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              placeholder="Plot ID..."
              className="text-xs font-mono bg-atlas-surface border border-atlas-border rounded-md px-2.5 py-1.5 focus:outline-none focus:border-atlas-cyan w-32 text-atlas-textPrimary"
            />
            <Button variant="outline" size="sm" type="submit" className="h-8 px-2 text-xs">
              <Search className="w-3.5 h-3.5" />
            </Button>
          </form>

          <Button
            type="button"
            onClick={() => setIsPassportOpen(true)}
            className="h-8 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <span>{isBn ? "পার্সেল পাসপোর্ট" : "Parcel Passport"}</span>
          </Button>
        </div>
      </div>

      {isError ? (
        <div className="rounded-3xl border border-emerald-800/30 bg-emerald-950/20 dark:bg-[#062B22]/90 p-8 text-center max-w-xl mx-auto my-8 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {isBn ? "জমির তথ্য পাওয়া যায়নি" : "Parcel Record Not Found"}
          </h3>
          <p className="text-sm text-slate-600 dark:text-emerald-200/80 mb-6 leading-relaxed">
            {isBn 
              ? `"${id}" আইডিতে কোনো নমুনা জমির তথ্য পাওয়া যায়নি। সঠিক দাগ নম্বর বা পার্সেল কোড দিয়ে আবার অনুসন্ধান করুন।`
              : `No synthetic land record found for identifier "${id}". Please verify the Dag plot number or parcel ID.`}
          </p>

          <div className="p-4 rounded-2xl bg-white/60 dark:bg-[#031813]/80 border border-emerald-800/30 mb-6 text-left">
            <span className="text-xs font-semibold text-emerald-800 dark:text-[#C4E8A5] block mb-2">
              {isBn ? "প্রস্তাবিত নমুনা পার্সেলসমূহ:" : "Available Benchmark Parcels:"}
            </span>
            <div className="flex flex-wrap gap-2">
              {['LG-P-002911', 'LG-P-000001', 'LG-P-000002', 'LG-P-000104'].map((sampleId) => (
                <button
                  key={sampleId}
                  type="button"
                  onClick={() => navigate(`/parcels/${sampleId}`)}
                  className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-emerald-600/20 hover:bg-emerald-600 text-emerald-800 dark:text-[#C4E8A5] hover:text-white border border-emerald-600/40 transition-colors"
                >
                  {sampleId}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/search')}
              className="w-full sm:w-auto"
            >
              {isBn ? "ভূমি অনুসন্ধানে ফিরে যান" : "Back to Land Search"}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/parcels/LG-P-002911')}
              className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              {isBn ? "নমুনা পার্সেল দেখুন (LG-P-002911)" : "View Benchmark (LG-P-002911)"}
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Top Section: Cadastral Survey Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-atlas-surface border border-atlas-border shadow-sm">
              <span className="text-atlas-textMuted text-[10px] block uppercase tracking-wider">
                District / Division
              </span>
              <strong className="text-base text-atlas-textPrimary block mt-1">
                {isLoading ? <Skeleton className="h-5 w-20" /> : parcel?.district}
              </strong>
              <span className="text-[10px] text-atlas-cyan">Bangladesh Cadastre</span>
            </div>

            <div className="p-3.5 rounded-xl bg-atlas-surface border border-atlas-border shadow-sm">
              <span className="text-atlas-textMuted text-[10px] block uppercase tracking-wider">
                Upazila &bull; Mouza
              </span>
              <strong className="text-base text-atlas-textPrimary block mt-1">
                {isLoading ? <Skeleton className="h-5 w-24" /> : `${parcel?.upazila} &bull; ${parcel?.mouza}`}
              </strong>
              <span className="text-[10px] text-atlas-textMuted">JL No: {parcel?.jl_no}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-atlas-surface border border-atlas-border shadow-sm">
              <span className="text-atlas-textMuted text-[10px] block uppercase tracking-wider">
                Dag &bull; Khatian No.
              </span>
              <strong className="text-base text-atlas-textPrimary block mt-1">
                {isLoading ? <Skeleton className="h-5 w-24" /> : `Dag ${parcel?.dag_no} &bull; Khat ${parcel?.khatian_no}`}
              </strong>
              <span className="text-[10px] text-atlas-cyan font-semibold">Survey Sheet Record</span>
            </div>

            <div className="p-3.5 rounded-xl bg-atlas-surface border border-atlas-border shadow-sm">
              <span className="text-atlas-textMuted text-[10px] block uppercase tracking-wider">
                Recorded Acreage
              </span>
              <strong className="text-base text-atlas-cyan block mt-1">
                {isLoading ? <Skeleton className="h-5 w-16" /> : `${parcel?.total_area_acres.toFixed(3)} acres`}
              </strong>
              <span className="text-[10px] text-atlas-textMuted">
                ({((parcel?.total_area_acres || 0) * 100).toFixed(1)} decimals)
              </span>
            </div>
          </div>

          {/* GIS Spatial Viewport & Asset Topology Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left 7 Cols: Interactive 2D or 3D Cadastral Map */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-bold text-atlas-textPrimary uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-atlas-cyan" />
                  Cadastral Plot Boundary (Dag {parcel?.dag_no || '...'})
                </span>
                
                {/* 2D vs 3D Viewport Toggle */}
                <div className="flex items-center gap-1 bg-atlas-surface border border-atlas-border p-0.5 rounded-lg text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setViewportMode('2d')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                      viewportMode === '2d'
                        ? 'bg-atlas-cyan text-atlas-app font-bold'
                        : 'text-atlas-textMuted hover:text-atlas-textPrimary'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    2D Cadastre
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewportMode('3d')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                      viewportMode === '3d'
                        ? 'bg-atlas-cyan text-atlas-app font-bold'
                        : 'text-atlas-textMuted hover:text-atlas-textPrimary'
                    }`}
                  >
                    <Box className="w-3.5 h-3.5" />
                    3D Explorer
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-[420px] rounded-xl overflow-hidden border border-atlas-border bg-atlas-surface">
                {viewportMode === '2d' ? (
                  <CadastralMap
                    height="100%"
                    plots={[currentPlot]}
                    selectedParcelId={id}
                    initialDistrict={parcel?.district || 'Dhaka'}
                  />
                ) : (
                  <Cadastral3DExplorer
                    selectedParcelId={id}
                    onSelectParcel={(newPid: string) => navigate(`/parcels/${newPid}`)}
                  />
                )}
              </div>
            </div>

            {/* Right 5 Cols: Asset Lineage & Topological Deed Network */}
            <div className="lg:col-span-5 flex flex-col">
              <AssetNetworkGraph
                parcelId={id}
                transactions={history}
                className="flex-1 min-h-[420px]"
                onSelectTransaction={(txId) => navigate(`/assess/${txId}`)}
              />
            </div>
          </div>

          {/* Chronological Conveyance Sequence */}
          <Card className="border-atlas-border bg-atlas-surface shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-atlas-cyan" aria-hidden="true" />
                  <CardTitle>{t('dossier.chainOfTitle')} ({history.length} Deeds)</CardTitle>
                </div>
                <span className="text-xs font-mono text-atlas-textMuted">
                  Ascending Event Sequence
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : history.length === 0 ? (
                <p className="text-sm text-atlas-textMuted py-6 text-center">
                  {t('common.noData')}
                </p>
              ) : (
                <div className="relative border-l-2 border-atlas-cyan/30 ml-4 pl-6 space-y-6 my-2">
                  {history.map((tx, idx) => {
                    const isConflict = tx.scenario === 'conflicting_sale' || tx.overlapping_claim === 1;
                    return (
                      <div key={tx.transaction_id} className="relative group">
                        {/* Timeline node */}
                        <div
                          className={`absolute -left-[31px] top-2 w-3.5 h-3.5 rounded-full border-2 transition-transform group-hover:scale-125 ${
                            isConflict
                              ? 'border-atlas-red bg-atlas-red animate-pulse'
                              : 'border-atlas-cyan bg-atlas-app'
                          }`}
                        />

                        <div
                          className={`p-4 rounded-xl border transition-all ${
                            isConflict
                              ? 'border-atlas-red/40 bg-atlas-red/10'
                              : 'border-atlas-border bg-atlas-elevated/40 hover:border-atlas-cyan/50'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 font-mono">
                              <span className="text-xs text-atlas-textMuted">
                                #{idx + 1}
                              </span>
                              <strong className="text-sm text-atlas-textPrimary">
                                {tx.transaction_id}
                              </strong>
                              <Badge
                                variant={
                                  tx.scenario === 'normal'
                                    ? 'clean'
                                    : tx.scenario === 'incomplete'
                                    ? 'insufficient'
                                    : 'review'
                                }
                                size="sm"
                              >
                                {tx.scenario.replace(/_/g, ' ')}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-atlas-textMuted">
                                {tx.transaction_date}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/assess/${tx.transaction_id}`)}
                                rightIcon={<ArrowRight className="w-3 h-3" />}
                                className="h-7 text-xs"
                              >
                                {t('common.audit')}
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-atlas-textMuted pt-2 border-t border-atlas-border">
                            <div>
                              <span className="block text-[10px] text-atlas-textMuted uppercase">{t('dossier.seller')}</span>
                              <span className="text-atlas-textPrimary truncate block">{tx.seller_alias}</span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-atlas-textMuted uppercase">{t('dossier.buyer')}</span>
                              <span className="text-atlas-textPrimary truncate block">{tx.buyer_alias}</span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-atlas-textMuted uppercase">{t('dossier.areaTransferred')}</span>
                              <span className="text-atlas-textPrimary">{tx.sale_area_acres.toFixed(2)} ac</span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-atlas-textMuted uppercase">Claimed Share</span>
                              <span className="text-atlas-cyan font-semibold">{((tx.claimed_share || 0) * 100).toFixed(1)}%</span>
                            </div>
                          </div>

                          {isConflict && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-atlas-red bg-atlas-red/15 px-3 py-1.5 rounded-lg border border-atlas-red/30">
                              <ShieldAlert className="w-4 h-4 shrink-0" />
                              <span>{t('scenarios.conflicting_sale')}: Competing title claim detected for this parcel.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Side-by-Side Transaction Comparison & Guided Land Story */}
          <TransactionComparisonStory
            parcelId={id}
            transactions={history.map((tx) => ({
              transaction_id: tx.transaction_id,
              deed_date: tx.transaction_date,
              amount_bdt: 2500000,
              area_acres: tx.sale_area_acres,
              seller_id: tx.seller_alias,
              buyer_id: tx.buyer_alias,
              scenario: tx.scenario,
              overlapping_claim: tx.overlapping_claim,
            }))}
          />

          {/* Printable Synthetic Parcel Passport Modal */}
          <ParcelPassportModal
            isOpen={isPassportOpen}
            onClose={() => setIsPassportOpen(false)}
            parcel={parcel || { parcel_id: id }}
            transactionCount={history.length}
            lastScreeningDate="2026-10-15"
            screeningStatus={
              history.some((tx) => tx.scenario === 'conflicting_sale')
                ? 'REVIEW_REQUIRED'
                : 'VERIFIED'
            }
          />
        </>
      )}
    </div>
  );
};
