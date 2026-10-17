import React, { useState, useMemo, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Layers,
  FileSpreadsheet,
  AlertOctagon,
  CopyCheck,
  Share2,
  Download,
  RotateCcw,
  ArrowRight,
  SlidersHorizontal,
  Box,
  Map as MapIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { CadastralMap } from '../components/gis/CadastralMap';
import { Cadastral3DExplorer } from '../components/gis/Cadastral3DExplorer';
import { AssetNetworkGraph } from '../components/gis/AssetNetworkGraph';
import { SAMPLE_CADASTRAL_PLOTS } from '../lib/geo';
import { AnimatedCadastralMotif } from '../components/ui/AnimatedCadastralMotif';
import {
  BANGLADESH_DIVISIONS_LIST,
  BANGLADESH_DISTRICTS,
  DistrictInfo,
  getDistrictsByDivision,
} from '../lib/bangladeshAdmin';

export const DashboardPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isBn = i18n.language === 'bn';

  // Filters state matching Reference 3 "God Mode"
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('dhaka');
  const [selectedScenario, setSelectedScenario] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [workspaceMode, setWorkspaceMode] = useState<'map2d' | 'explorer3d'>('map2d');
  const [showNetworkGraph, setShowNetworkGraph] = useState<boolean>(false);
  const [showInvestigationPanel, setShowInvestigationPanel] = useState<boolean>(true);

  // 1. Dashboard summary stats query
  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    error: summaryError,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: () => api.getDashboardSummary(),
    staleTime: 60000,
  });

  // 2. Transaction list query for the table below map
  const {
    data: transactionData,
    isLoading: isTxLoading,
  } = useQuery({
    queryKey: ['dashboardTransactions', selectedScenario, searchQuery],
    queryFn: () =>
      api.getTransactions({
        limit: 8,
        scenario: selectedScenario !== 'all' ? selectedScenario : undefined,
        search: searchQuery.trim() || undefined,
      }),
    staleTime: 30000,
  });

  // Available districts filtered by selected division
  const availableDistricts = useMemo(() => {
    return getDistrictsByDivision(selectedDivision);
  }, [selectedDivision]);

  // Selected district info object
  const currentDistrictInfo = useMemo(() => {
    return (
      BANGLADESH_DISTRICTS.find((d) => d.id === selectedDistrictId) ||
      BANGLADESH_DISTRICTS[0]
    );
  }, [selectedDistrictId]);

  // Scenario chart data from real API response
  const scenarioData = useMemo(() => {
    if (!summary?.scenario_counts) return [];
    return Object.entries(summary.scenario_counts)
      .map(([key, count]) => ({
        name: t(`scenarios.${key}`, key.replace(/_/g, ' ')),
        rawKey: key,
        count: count || 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [summary, t]);

  const getScenarioColor = (key: string) => {
    switch (key) {
      case 'normal':
        return '#24B79C'; // Signal Teal
      case 'conflicting_sale':
        return '#E46B70'; // Critical Red
      case 'owner_mismatch':
      case 'area_mismatch':
      case 'mutation_mismatch':
      case 'document_tamper':
        return '#E7B34B'; // Warning Amber
      case 'incomplete':
      case 'legitimate_resale':
      default:
        return '#20C7D4'; // Cyan
    }
  };

  const handleDivisionChange = (divId: string) => {
    setSelectedDivision(divId);
    const districts = getDistrictsByDivision(divId);
    if (districts.length > 0) {
      setSelectedDistrictId(districts[0].id);
    }
  };

  const handleResetFilters = () => {
    setSelectedDivision('all');
    setSelectedDistrictId('dhaka');
    setSelectedScenario('all');
    setSearchQuery('');
  };

  // Functional CSV Export
  const handleExportCSV = () => {
    const items = transactionData?.items || [];
    if (items.length === 0) return;

    const headers = [
      'Transaction ID',
      'Parcel ID',
      'Transaction Date',
      'Seller',
      'Buyer',
      'Sale Area (Acres)',
      'Scenario',
      'Seller-Owner Mismatch',
      'Area Mismatch',
      'Mutation Mismatch',
    ];

    const rows = items.map((tx) => [
      tx.transaction_id,
      tx.parcel_id,
      tx.transaction_date,
      `"${tx.seller_alias}"`,
      `"${tx.buyer_alias}"`,
      tx.sale_area_acres,
      tx.scenario,
      tx.seller_owner_mismatch,
      tx.area_mismatch,
      tx.mutation_mismatch,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `landguard_transactions_${selectedDistrictId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isSummaryError) {
    return (
      <ErrorState
        title="Failed to Connect to LandGuard Backend"
        message={
          summaryError instanceof Error
            ? summaryError.message
            : 'FastAPI backend connection failure. Ensure uvicorn is running on http://127.0.0.1:8000.'
        }
        onRetry={() => refetchSummary()}
      />
    );
  }

  return (
    <div className="space-y-4 pb-8 select-none">
      {/* =========================================================================
          SECTION 0: LIVING LAND DASHBOARD BANNER — CONTINUOUS BOTANICAL MOTION & CADASTRAL ANIMATION
          ========================================================================= */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-emerald-800/30 bg-[#062B22] p-5 sm:p-7">
        {/* Continuous Animated Land Photography Background Layer */}
        <div
          className="absolute inset-0 bg-cover bg-center motion-safe:animate-[slow-drift_25s_ease-in-out_infinite_alternate] opacity-40 pointer-events-none"
          style={{
            backgroundImage: "url('/assets/images/hero-bg.jpg')",
            willChange: 'transform'
          }}
        />

        {/* Ambient Dark Forest Vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#062B22]/95 via-[#062B22]/85 to-[#062B22]/60 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#062B22] via-transparent to-black/30 pointer-events-none" />

        {/* Continuous Animated Cadastral Boundary Lines Layer */}
        <div className="absolute right-0 bottom-0 top-0 w-full md:w-2/3 pointer-events-none opacity-60">
          <AnimatedCadastralMotif className="w-full h-full object-cover" />
        </div>

        {/* Banner Content */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-500/40 text-[#C4E8A5] text-xs font-semibold backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Living Land • জীবন্ত ভূমির চলমান অ্যানিমেশন</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {isBn ? "স্মার্ট ক্যাডাস্ট্রাল ড্যাশবোর্ড ও স্ক্রিনিং কমান্ড সেন্টার" : "Smart Cadastral Dashboard & Screening Command Center"}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed font-normal">
              {isBn 
                ? "বাংলাদেশের ৬৪টি জেলার ক্যাডাস্ট্রাল পার্সেল, লাইভ জিআইএস খসড়া ম্যাপ ও সিন্থেটিক দ্বৈত-বিক্রয় ঝুঁকি স্ক্রিনিং ইন্টেলিজেন্স।" 
                : "Real-time GIS cadastral boundary inspection, synthetic transaction verification, and dual-sale risk screening."}
            </p>
          </div>

          {/* Quick Metrics Badges & Shortcuts */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="px-3 py-1.5 rounded-2xl bg-black/50 backdrop-blur-md border border-emerald-500/30 text-center min-w-[80px]">
              <span className="block text-[9px] uppercase font-mono text-emerald-400 font-bold">{isBn ? "মোট পার্সেল" : "PARCELS"}</span>
              <span className="font-mono text-sm sm:text-base font-extrabold text-white">{summary?.parcels || 3000}</span>
            </div>
            <div className="px-3 py-1.5 rounded-2xl bg-black/50 backdrop-blur-md border border-emerald-500/30 text-center min-w-[80px]">
              <span className="block text-[9px] uppercase font-mono text-emerald-400 font-bold">{isBn ? "স্ক্রিন্ড লেনদেন" : "TX COUNT"}</span>
              <span className="font-mono text-sm sm:text-base font-extrabold text-white">{summary?.transactions || 3851}</span>
            </div>
            <div className="px-3 py-1.5 rounded-2xl bg-black/50 backdrop-blur-md border border-rose-500/40 text-center min-w-[80px]">
              <span className="block text-[9px] uppercase font-mono text-rose-400 font-bold">{isBn ? "ঝুঁকি কেস" : "FLAGGED"}</span>
              <span className="font-mono text-sm sm:text-base font-extrabold text-rose-300">{summary?.review_cases || 1188}</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 1: GEOSPATIAL FILTERS & SEARCH STRIP (Directly matching Reference 3)
          ========================================================================= */}
      <div className="rounded-2xl border border-atlas-border bg-atlas-surface p-3 sm:p-4 shadow-atlas-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Cascading Administrative Dropdowns & Scenario Filters */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Division Selector */}
            <div className="flex flex-col">
              <label
                htmlFor="division-select"
                className="text-[10px] font-mono uppercase tracking-wider text-atlas-textMuted mb-0.5"
              >
                {t('filters.division')} ({BANGLADESH_DIVISIONS_LIST.length})
              </label>
              <select
                id="division-select"
                value={selectedDivision}
                onChange={(e) => handleDivisionChange(e.target.value)}
                className="bg-atlas-elevated border border-atlas-border hover:border-atlas-cyan/60 rounded-xl px-3 py-1.5 text-xs font-mono font-medium text-atlas-textPrimary focus:outline-none focus:ring-1 focus:ring-atlas-cyan cursor-pointer shadow-inner min-w-[140px]"
              >
                <option value="all">{t('filters.allDivisions')}</option>
                {BANGLADESH_DIVISIONS_LIST.map((div) => (
                  <option key={div.id} value={div.id}>
                    {isBn ? `${div.nameBn} (${div.nameEn})` : `${div.nameEn} (${div.nameBn})`}
                  </option>
                ))}
              </select>
            </div>

            {/* District Selector (Cascading 64 Districts) */}
            <div className="flex flex-col">
              <label
                htmlFor="district-select"
                className="text-[10px] font-mono uppercase tracking-wider text-atlas-textMuted mb-0.5"
              >
                {t('filters.district')} ({availableDistricts.length})
              </label>
              <select
                id="district-select"
                value={selectedDistrictId}
                onChange={(e) => setSelectedDistrictId(e.target.value)}
                className="bg-atlas-elevated border border-atlas-border hover:border-atlas-cyan/60 rounded-xl px-3 py-1.5 text-xs font-mono font-medium text-atlas-textPrimary focus:outline-none focus:ring-1 focus:ring-atlas-cyan cursor-pointer shadow-inner min-w-[180px]"
              >
                {availableDistricts.map((dist) => (
                  <option key={dist.id} value={dist.id}>
                    {isBn ? `${dist.nameBn} (${dist.nameEn})` : `${dist.nameEn} (${dist.nameBn})`}{' '}
                    {dist.hasSyntheticCoverage ? '⚡ [750]' : '[No Data]'}
                  </option>
                ))}
              </select>
            </div>

            {/* Scenario Filter */}
            <div className="flex flex-col">
              <label
                htmlFor="scenario-select"
                className="text-[10px] font-mono uppercase tracking-wider text-atlas-textMuted mb-0.5"
              >
                {t('filters.scenario')}
              </label>
              <select
                id="scenario-select"
                value={selectedScenario}
                onChange={(e) => setSelectedScenario(e.target.value)}
                className="bg-atlas-elevated border border-atlas-border hover:border-atlas-cyan/60 rounded-xl px-3 py-1.5 text-xs font-mono font-medium text-atlas-textPrimary focus:outline-none focus:ring-1 focus:ring-atlas-cyan cursor-pointer shadow-inner min-w-[150px]"
              >
                <option value="all">{t('scenarios.all')}</option>
                <option value="conflicting_sale">{t('scenarios.conflicting_sale')}</option>
                <option value="owner_mismatch">{t('scenarios.owner_mismatch')}</option>
                <option value="area_mismatch">{t('scenarios.area_mismatch')}</option>
                <option value="mutation_mismatch">{t('scenarios.mutation_mismatch')}</option>
                <option value="document_tamper">{t('scenarios.document_tamper')}</option>
                <option value="normal">{t('scenarios.normal')}</option>
              </select>
            </div>

            {/* Assessment Date Period Indicator */}
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase tracking-wider text-atlas-textMuted mb-0.5">
                {t('filters.period')}
              </span>
              <div className="bg-atlas-elevated border border-atlas-border rounded-xl px-3 py-1.5 text-xs font-mono text-atlas-textSecondary">
                2024-01-01 &rarr; 2026-10-15
              </div>
            </div>

            {/* Reset Filter Button */}
            <div className="flex flex-col justify-end">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-atlas-textSecondary hover:text-atlas-textPrimary hover:bg-black/5 dark:hover:bg-white/5 border border-atlas-border transition-colors"
                title={t('filters.reset')}
              >
                <RotateCcw className="w-3.5 h-3.5 text-atlas-cyan" />
                <span>{t('filters.reset')}</span>
              </button>
            </div>
          </div>

          {/* Quick Right Action: 2D/3D Mode, Dossier Toggle & Topology Graph */}
          <div className="flex items-center gap-2 shrink-0">
            {/* 2D Map vs 3D Parcel Explorer Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-atlas-elevated border border-atlas-border">
              <button
                type="button"
                onClick={() => setWorkspaceMode('map2d')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                  workspaceMode === 'map2d'
                    ? 'bg-atlas-cyan text-slate-950 font-bold shadow'
                    : 'text-atlas-textSecondary hover:text-atlas-textPrimary'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>2D Map</span>
              </button>
              <button
                type="button"
                onClick={() => setWorkspaceMode('explorer3d')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                  workspaceMode === 'explorer3d'
                    ? 'bg-atlas-cyan text-slate-950 font-bold shadow'
                    : 'text-atlas-textSecondary hover:text-atlas-textPrimary'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>3D Explorer</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowInvestigationPanel(!showInvestigationPanel)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
                showInvestigationPanel
                  ? 'bg-atlas-cyan/15 text-atlas-cyan border-atlas-cyan/40 font-bold'
                  : 'bg-atlas-elevated text-atlas-textMuted border-atlas-border hover:text-atlas-textPrimary'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showInvestigationPanel ? t('filters.hideDossier') : t('filters.showDossier')}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowNetworkGraph(!showNetworkGraph)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
                showNetworkGraph
                  ? 'bg-sky-500/15 text-sky-400 border-sky-500/40 font-bold'
                  : 'bg-atlas-elevated text-atlas-textMuted border-atlas-border hover:text-atlas-textPrimary'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{showNetworkGraph ? t('filters.hideGraph') : t('filters.showGraph')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: CENTRAL DOMINANT MAP (OR 3D EXPLORER) + RIGHT INVESTIGATION PANEL
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Central Dominant Workspace (8 cols when panel open, 12 when closed) */}
        <div
          className={`${
            showInvestigationPanel ? 'lg:col-span-8' : 'lg:col-span-12'
          } transition-all duration-300`}
        >
          <div className="rounded-2xl border border-atlas-border bg-atlas-surface p-2 shadow-atlas-lg overflow-hidden relative">
            {workspaceMode === 'map2d' ? (
              <CadastralMap
                height="580px"
                plots={SAMPLE_CADASTRAL_PLOTS}
                selectedDistrictId={selectedDistrictId}
                onSelectDistrict={(dist: DistrictInfo) => {
                  setSelectedDistrictId(dist.id);
                  setSelectedDivision(dist.divisionId);
                }}
              />
            ) : (
              <Suspense
                fallback={
                  <div className="h-[580px] flex items-center justify-center font-mono text-xs text-atlas-cyan">
                    {t('common.loading')} 3D Engine...
                  </div>
                }
              >
                <Cadastral3DExplorer height="580px" />
              </Suspense>
            )}
          </div>
        </div>

        {/* Right Docked Investigation Dossier Panel (4 cols) matching Reference 3 */}
        {showInvestigationPanel && (
          <div className="lg:col-span-4 space-y-3 animate-in fade-in slide-in-from-right duration-200">
            {/* Selected District Geo-Intelligence Summary Card */}
            <div className="rounded-2xl border border-atlas-border bg-atlas-surface p-4 shadow-atlas-md text-atlas-textPrimary">
              <div className="flex items-start justify-between pb-3 border-b border-atlas-border">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base tracking-tight">
                      {isBn ? currentDistrictInfo.nameBn : currentDistrictInfo.nameEn}
                    </span>
                    <span className="text-xs font-mono text-atlas-cyan font-semibold">
                      ({isBn ? currentDistrictInfo.nameEn : currentDistrictInfo.nameBn})
                    </span>
                  </div>
                  <p className="text-xs text-atlas-textMuted font-mono mt-0.5">
                    {t('filters.division')}: <strong className="text-atlas-textSecondary">{currentDistrictInfo.divisionId.toUpperCase()}</strong> &bull; Lat/Lon: {currentDistrictInfo.centroid[0].toFixed(2)}&deg;N, {currentDistrictInfo.centroid[1].toFixed(2)}&deg;E
                  </p>
                </div>

                {currentDistrictInfo.hasSyntheticCoverage ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold tracking-wider uppercase">
                    {t('dossier.covered')}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 text-[10px] font-mono font-bold tracking-wider uppercase">
                    {t('dossier.noRecords')}
                  </span>
                )}
              </div>

              {/* District Dataset Status Notice */}
              <div className="mt-3">
                {currentDistrictInfo.hasSyntheticCoverage ? (
                  <div className="p-2.5 rounded-xl bg-atlas-elevated border border-atlas-border text-xs">
                    <div className="flex items-center justify-between font-mono">
                      <span>{t('dossier.activeCoverage')}:</span>
                      <span className="font-bold text-atlas-cyan">750 {t('metrics.plots')}</span>
                    </div>
                    <p className="text-[11px] text-atlas-textMuted mt-1 leading-relaxed">
                      {t('dossier.activeCoverageDesc')}
                    </p>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs">
                    <span className="font-bold text-amber-400 block mb-0.5">
                      {t('dossier.noCoverageTitle')}
                    </span>
                    <p className="text-[11px] text-atlas-textMuted leading-relaxed">
                      {t('dossier.noCoverageDesc')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Benchmark Conflict Dossier Card (AC-04 TX-002911-2) */}
            <div className="rounded-2xl border border-red-500/30 bg-atlas-surface p-4 shadow-atlas-md text-atlas-textPrimary">
              <div className="flex items-center justify-between pb-2.5 border-b border-red-500/20">
                <div className="flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4 text-red-500 animate-pulse" />
                  <span className="font-mono text-xs font-bold text-red-400 uppercase tracking-wider">
                    {t('dossier.benchmarkTitle')}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-red-300 bg-red-500/20 px-2 py-0.5 rounded-md font-bold">
                  {t('dossier.groundTruth')}
                </span>
              </div>

              <div className="mt-3 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-atlas-textMuted">{t('dossier.targetPlot')}:</span>
                  <span className="text-atlas-cyan font-bold">LG-P-002911 (Dag 4021)</span>
                </div>

                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-atlas-textMuted">{t('dossier.competingDeed')}:</span>
                  <span className="text-amber-400 font-bold">TX-002911-1 (Overlap)</span>
                </div>

                <div className="p-2.5 rounded-xl bg-red-950/20 border border-red-500/30 text-xs space-y-1">
                  <span className="text-red-300 font-bold text-[11px] block">
                    {t('dossier.findingsTitle')}:
                  </span>
                  <ul className="text-[11px] text-atlas-textSecondary space-y-1 list-disc list-inside">
                    <li>{t('dossier.findingOverlap')}</li>
                    <li>{t('dossier.findingMutation')}</li>
                    <li>{t('dossier.findingDualML')}</li>
                  </ul>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/assess/TX-002911-2')}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  className="w-full text-xs font-bold shadow-atlas-sm mt-2 font-mono"
                >
                  {t('dossier.auditBenchmark')}
                </Button>
              </div>
            </div>

            {/* Optional Embedded Asset Network Graph */}
            {showNetworkGraph && (
              <div className="rounded-2xl border border-sky-500/30 bg-atlas-surface p-3 shadow-atlas-md">
                <AssetNetworkGraph
                  parcelId="LG-P-002911"
                  className="h-[280px]"
                  onSelectTransaction={(txId) => navigate(`/assess/${txId}`)}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 3: REAL DASHBOARD KPI METRICS STRIP (Zone 3 - Bottom / Floating)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1: Registered Parcels */}
        <div className="rounded-2xl border border-atlas-border bg-atlas-surface p-4 shadow-atlas-md hover:border-atlas-cyan/50 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-atlas-textMuted">
              {t('metrics.parcels')}
            </span>
            <div className="p-2 rounded-xl bg-atlas-cyan/10 text-atlas-cyan group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          {isSummaryLoading ? (
            <Skeleton className="h-8 w-24 mt-2" />
          ) : (
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono tracking-tight text-atlas-textPrimary">
                {summary?.parcels.toLocaleString()}
              </span>
              <span className="text-xs font-mono text-atlas-textMuted">{t('metrics.plots')}</span>
            </div>
          )}

          {/* Region Distribution Micro-Bar */}
          <div className="mt-3 pt-2.5 border-t border-atlas-border space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-atlas-textMuted">
              <span>Dhaka: 750</span>
              <span>Chattogram: 750</span>
            </div>
            <div className="w-full bg-atlas-elevated h-1.5 rounded-full overflow-hidden flex">
              <div className="bg-atlas-cyan h-full w-1/4" title="Dhaka (750)" />
              <div className="bg-sky-500 h-full w-1/4" title="Chattogram (750)" />
              <div className="bg-amber-500 h-full w-1/4" title="Khulna (750)" />
              <div className="bg-emerald-500 h-full w-1/4" title="Rajshahi (750)" />
            </div>
          </div>
        </div>

        {/* Metric 2: Screened Transactions */}
        <div className="rounded-2xl border border-atlas-border bg-atlas-surface p-4 shadow-atlas-md hover:border-atlas-cyan/50 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-atlas-textMuted">
              {t('metrics.conveyances')}
            </span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-atlas-cyan group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>

          {isSummaryLoading ? (
            <Skeleton className="h-8 w-24 mt-2" />
          ) : (
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono tracking-tight text-atlas-textPrimary">
                {summary?.transactions.toLocaleString()}
              </span>
              <span className="text-xs font-mono text-atlas-textMuted">{t('metrics.deeds')}</span>
            </div>
          )}

          <div className="mt-3 pt-2.5 border-t border-atlas-border flex justify-between items-center text-[11px] font-mono text-atlas-textMuted">
            <span>{t('metrics.syntheticRegistry')}</span>
            <span className="text-atlas-cyan font-semibold">{t('metrics.parsed')}</span>
          </div>
        </div>

        {/* Metric 3: Multi-Sale Overlaps */}
        <div className="rounded-2xl border border-atlas-border bg-atlas-surface p-4 shadow-atlas-md hover:border-sky-500/50 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-atlas-textMuted">
              {t('metrics.multiSale')}
            </span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 group-hover:scale-110 transition-transform">
              <CopyCheck className="w-4 h-4" />
            </div>
          </div>

          {isSummaryLoading ? (
            <Skeleton className="h-8 w-24 mt-2" />
          ) : (
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono tracking-tight text-sky-400">
                {summary?.multiple_transaction_parcels.toLocaleString()}
              </span>
              <span className="text-xs font-mono text-atlas-textMuted">
                ({Math.round(((summary?.multiple_transaction_parcels || 0) / (summary?.parcels || 1)) * 100)}%)
              </span>
            </div>
          )}

          <div className="mt-3 pt-2.5 border-t border-atlas-border flex justify-between items-center text-[11px] font-mono text-atlas-textMuted">
            <span>{t('metrics.overlapRate')}</span>
            <span className="text-sky-400 font-semibold">{summary?.multiple_transaction_parcels || 0} {t('metrics.plots')}</span>
          </div>
        </div>

        {/* Metric 4: Review Cases Queue */}
        <div className="rounded-2xl border border-amber-500/30 bg-atlas-surface p-4 shadow-atlas-md hover:border-amber-500/60 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
              {t('metrics.reviewQueue')}
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>

          {isSummaryLoading ? (
            <Skeleton className="h-8 w-24 mt-2" />
          ) : (
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono tracking-tight text-amber-500">
                {summary?.review_cases.toLocaleString()}
              </span>
              <span className="text-xs font-mono text-atlas-textMuted">{t('metrics.cases')}</span>
            </div>
          )}

          <div className="mt-3 pt-2.5 border-t border-atlas-border flex justify-between items-center text-[11px] font-mono text-atlas-textMuted">
            <span>{t('metrics.awaitingReview')}</span>
            <span className="text-amber-500 font-semibold">1,188 {t('metrics.cases')}</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 4: RESULTS TABLE & SCENARIO DISTRIBUTION (Directly matching Reference 3)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 8 Cols: Forensic Transactions Table (Matching Reference 3 Results) */}
        <div className="lg:col-span-8 rounded-2xl border border-atlas-border bg-atlas-surface p-4 shadow-atlas-md space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-atlas-border">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-atlas-textPrimary tracking-tight">
                  {t('results.title')}: {transactionData?.total || 0} {t('results.conveyances')}
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-atlas-cyan/15 text-atlas-cyan font-mono text-[10px] font-bold border border-atlas-cyan/30">
                  {t('results.liveApi')}
                </span>
              </div>
              <p className="text-xs text-atlas-textMuted font-mono mt-0.5">
                {t('filters.scenario')}: <strong className="text-atlas-textSecondary">{selectedScenario.toUpperCase()}</strong> &bull; {t('filters.district')}: {isBn ? currentDistrictInfo.nameBn : currentDistrictInfo.nameEn}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                leftIcon={<Download className="w-3.5 h-3.5 text-atlas-cyan" />}
                className="text-xs font-mono border-atlas-border hover:bg-atlas-cyan hover:text-slate-950"
              >
                {t('results.exportCsv')}
              </Button>
            </div>
          </div>

          {/* High-Density Results Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-atlas-border text-atlas-textMuted text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">{t('results.index')}</th>
                  <th className="py-2.5 px-3">{t('results.txId')}</th>
                  <th className="py-2.5 px-3">{t('results.parcelId')}</th>
                  <th className="py-2.5 px-3">{t('results.scenarioRisk')}</th>
                  <th className="py-2.5 px-3">{t('results.parties')}</th>
                  <th className="py-2.5 px-3">{t('results.area')}</th>
                  <th className="py-2.5 px-3 text-right">{t('results.action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-atlas-border">
                {isTxLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-atlas-textMuted">
                      {t('results.loading')}
                    </td>
                  </tr>
                ) : (transactionData?.items || []).length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-atlas-textMuted">
                      {t('results.empty')}
                    </td>
                  </tr>
                ) : (
                  (transactionData?.items || []).map((tx, idx) => (
                    <tr
                      key={tx.transaction_id}
                      className="hover:bg-atlas-elevated transition-colors group cursor-pointer"
                      onClick={() => navigate(`/assess/${tx.transaction_id}`)}
                    >
                      <td className="py-2.5 px-3 text-atlas-textMuted">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-atlas-textPrimary group-hover:text-atlas-cyan transition-colors">
                        {tx.transaction_id}
                      </td>
                      <td className="py-2.5 px-3 text-atlas-textSecondary">
                        {tx.parcel_id}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.scenario === 'conflicting_sale'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                              : tx.scenario === 'normal'
                              ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {t(`scenarios.${tx.scenario}`, tx.scenario)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-atlas-textMuted truncate max-w-[140px]">
                        {tx.seller_alias} &rarr; {tx.buyer_alias}
                      </td>
                      <td className="py-2.5 px-3 text-atlas-cyan font-semibold">
                        {tx.sale_area_acres.toFixed(2)} ac
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/assess/${tx.transaction_id}`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-atlas-cyan/15 hover:bg-atlas-cyan text-atlas-cyan hover:text-slate-950 font-bold transition-all text-[11px]"
                        >
                          {t('results.inspect')} &rarr;
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 4 Cols: Scenario Distribution Chart */}
        <div className="lg:col-span-4 rounded-2xl border border-atlas-border bg-atlas-surface p-4 shadow-atlas-md space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-atlas-border">
            <div>
              <h3 className="font-extrabold text-sm text-atlas-textPrimary tracking-tight">
                {t('charts.scenarioDistribution')}
              </h3>
              <p className="text-[11px] text-atlas-textMuted font-mono mt-0.5">
                {summary?.transactions || 0} {t('charts.conveyancesTotal')}
              </p>
            </div>
            <span className="text-[10px] font-mono text-atlas-cyan bg-atlas-cyan/10 px-2 py-0.5 rounded border border-atlas-cyan/20">
              {t('charts.clickToFilter')}
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={scenarioData}
                layout="vertical"
                margin={{ top: 0, right: 15, left: 85, bottom: 0 }}
              >
                <XAxis type="number" tick={{ fontSize: 10, fill: '#829EA9' }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 10, fill: '#AFC5CE' }}
                  width={85}
                />
                <Tooltip
                  formatter={(val: number) => [`${val} transactions`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#102533',
                    borderColor: '#20C7D4',
                    color: '#F1F8FB',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                />
                <Bar
                  dataKey="count"
                  radius={[0, 4, 4, 0]}
                  onClick={(entry) => {
                    if (entry && entry.rawKey) {
                      setSelectedScenario(entry.rawKey);
                    }
                  }}
                  className="cursor-pointer"
                >
                  {scenarioData.map((entry) => (
                    <Cell
                      key={`cell-${entry.rawKey}`}
                      fill={getScenarioColor(entry.rawKey)}
                      className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-atlas-border flex flex-wrap items-center justify-between text-[10px] font-mono text-atlas-textMuted">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-atlas-cyan" />
              {t('charts.normalShare')}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              {t('charts.conflicts')}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              {t('charts.mismatches')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
