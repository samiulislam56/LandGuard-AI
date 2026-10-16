import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MapPin,
  RotateCcw,
  Table as TableIcon,
  Columns,
  Map as MapIcon,
} from 'lucide-react';

import { api } from '../lib/api';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { CadastralMap } from '../components/gis/CadastralMap';
import { generateCadastralPolygon, CadastralPlotGeo } from '../lib/geo';

type ViewMode = 'table' | 'split' | 'map';

export const TransactionsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const querySearch = searchParams.get('search') || '';
  const queryScenario = searchParams.get('scenario') || '';
  const queryOffset = parseInt(searchParams.get('offset') || '0', 10);
  const pageSize = 20;

  const [searchInput, setSearchInput] = useState(querySearch);
  const [prevQuerySearch, setPrevQuerySearch] = useState(querySearch);
  if (querySearch !== prevQuerySearch) {
    setPrevQuerySearch(querySearch);
    setSearchInput(querySearch);
  }

  const selectedScenario = queryScenario;
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== querySearch) {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          if (searchInput.trim()) next.set('search', searchInput.trim());
          else next.delete('search');
          next.set('offset', '0'); // Reset page
          return next;
        });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, querySearch, setSearchParams]);

  const handleScenarioChange = (scenario: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (scenario) next.set('scenario', scenario);
      else next.delete('scenario');
      next.set('offset', '0');
      return next;
    });
  };

  const handlePageChange = (newOffset: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('offset', Math.max(0, newOffset).toString());
      return next;
    });
  };

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['transactions', querySearch, queryScenario, queryOffset, pageSize],
    queryFn: () =>
      api.getTransactions({
        search: querySearch || undefined,
        scenario: queryScenario || undefined,
        limit: pageSize,
        offset: queryOffset,
      }),
    staleTime: 30000,
  });

  const total = data?.total || 0;
  const items = useMemo(() => data?.items || [], [data?.items]);
  const currentPage = Math.floor(queryOffset / pageSize) + 1;
  const totalPages = Math.ceil(total / pageSize) || 1;

  // Generate cadastral plots for the current page items to render on the map
  const mapPlots: CadastralPlotGeo[] = useMemo(() => {
    return items.map((tx) => {
      const numPart = parseInt(tx.parcel_id.replace(/\D/g, ''), 10) || 101;
      return generateCadastralPolygon(
        tx.parcel_id,
        'Dhaka',
        numPart,
        numPart + 2000,
        tx.sale_area_acres,
        tx.scenario
      );
    });
  }, [items]);

  const getScenarioBadgeVariant = (scenario: string) => {
    switch (scenario) {
      case 'conflicting_sale':
        return 'danger';
      case 'owner_mismatch':
      case 'area_mismatch':
      case 'mutation_mismatch':
      case 'document_tamper':
        return 'warning';
      case 'incomplete':
        return 'default';
      case 'normal':
        return 'success';
      case 'legitimate_resale':
      default:
        return 'info';
    }
  };

  const scenarioChips = [
    { key: '', label: t('scenarios.all') },
    { key: 'conflicting_sale', label: t('scenarios.conflicting_sale') },
    { key: 'owner_mismatch', label: t('scenarios.owner_mismatch') },
    { key: 'area_mismatch', label: t('scenarios.area_mismatch') },
    { key: 'mutation_mismatch', label: t('scenarios.mutation_mismatch') },
    { key: 'document_tamper', label: t('scenarios.document_tamper') },
    { key: 'incomplete', label: t('scenarios.incomplete') },
    { key: 'normal', label: t('scenarios.normal') },
  ];

  return (
    <div className="space-y-4 select-none pb-6">
      {/* Page Header & View Toggle (God Mode Style) */}
      <div className="rounded-2xl border border-atlas-border bg-atlas-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-atlas-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-atlas-cyan/15 text-atlas-cyan">
              <MapPin className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-atlas-textPrimary">
              {t('nav.transactions')}
            </h1>
          </div>
          <p className="text-xs text-atlas-textMuted font-mono mt-0.5">
            Real-time geospatial conveyance registry with synchronized Dag boundary inspection.
          </p>
        </div>

        {/* View Mode Selector: Table, Split, Map */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-atlas-elevated border border-atlas-border">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                viewMode === 'table'
                  ? 'bg-atlas-cyan text-slate-950 font-bold shadow-sm'
                  : 'text-atlas-textSecondary hover:text-atlas-textPrimary'
              }`}
              title="Full Data Table"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                viewMode === 'split'
                  ? 'bg-atlas-cyan text-slate-950 font-bold shadow-sm'
                  : 'text-atlas-textSecondary hover:text-atlas-textPrimary'
              }`}
              title="Split Table & GIS Map"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split 50/50</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                viewMode === 'map'
                  ? 'bg-atlas-cyan text-slate-950 font-bold shadow-sm'
                  : 'text-atlas-textSecondary hover:text-atlas-textPrimary'
              }`}
              title="Full Cadastral Map"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Map</span>
            </button>
          </div>

          {(querySearch || queryScenario || queryOffset > 0) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchInput('');
                setSearchParams({});
              }}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-xs font-mono"
            >
              {t('filters.reset')}
            </Button>
          )}
        </div>
      </div>

      {/* Search & Scenario Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Full-text search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-atlas-cyan" aria-hidden="true" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('topbar.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 bg-atlas-surface border border-atlas-border hover:border-atlas-cyan/60 rounded-xl text-xs font-mono text-atlas-textPrimary placeholder:text-atlas-textMuted focus:outline-none focus:ring-1 focus:ring-atlas-cyan shadow-inner"
          />
        </div>

        {/* Results Count Badge */}
        <div className="flex items-center gap-2 self-end md:self-auto text-xs font-mono text-atlas-textMuted px-3.5 py-2 rounded-xl bg-atlas-surface border border-atlas-border shrink-0">
          <span>{t('results.conveyances')}:</span>
          <strong className="text-atlas-cyan">{total.toLocaleString()}</strong>
        </div>
      </div>

      {/* Scenario Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {scenarioChips.map((chip) => {
          const isActive = selectedScenario === chip.key;
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => handleScenarioChange(chip.key)}
              className={`px-3 py-1 rounded-full whitespace-nowrap border transition-all text-xs font-medium font-mono ${
                isActive
                  ? 'bg-atlas-cyan text-slate-950 border-atlas-cyan font-bold shadow-sm'
                  : 'bg-atlas-surface border-atlas-border text-atlas-textSecondary hover:border-atlas-cyan/50'
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Error state */}
      {isError && (
        <ErrorState
          title="Failed to Load Transaction Records"
          message={error instanceof Error ? error.message : 'Backend connection error.'}
          onRetry={() => refetch()}
        />
      )}

      {/* Main Content Workspace (Split / Table / Map) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Cadastral Map Viewport (Displayed in Split & Map modes) */}
        {(viewMode === 'split' || viewMode === 'map') && (
          <div className={`${viewMode === 'split' ? 'lg:col-span-6' : 'lg:col-span-12'} sticky top-4`}>
            <div className="rounded-2xl border border-atlas-border bg-atlas-surface p-2 shadow-atlas-md overflow-hidden">
              <CadastralMap
                height={viewMode === 'split' ? '600px' : '650px'}
                plots={mapPlots.length > 0 ? mapPlots : undefined}
                selectedParcelId={selectedTxId ? items.find((t) => t.transaction_id === selectedTxId)?.parcel_id : undefined}
                onSelectParcel={(plot) => {
                  const match = items.find((t) => t.parcel_id === plot.parcelId);
                  if (match) setSelectedTxId(match.transaction_id);
                }}
              />
            </div>
          </div>
        )}

        {/* Transaction Data Table Viewport (Displayed in Split & Table modes) */}
        {(viewMode === 'split' || viewMode === 'table') && (
          <div className={`${viewMode === 'split' ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-3`}>
            <Card className="overflow-hidden border-atlas-border bg-atlas-surface shadow-atlas-md">
              <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead className="sticky top-0 bg-atlas-elevated text-atlas-textMuted border-b border-atlas-border z-10 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">{t('results.txId')}</th>
                      <th className="py-2.5 px-3">{t('common.date')}</th>
                      <th className="py-2.5 px-3">{t('results.parcelId')}</th>
                      <th className="py-2.5 px-3">{t('results.area')}</th>
                      <th className="py-2.5 px-3">{t('results.scenarioRisk')}</th>
                      <th className="py-2.5 px-3 text-right">{t('results.action')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-atlas-border">
                    {isLoading ? (
                      Array.from({ length: 10 }).map((_, idx) => (
                        <tr key={`skel-${idx}`}>
                          <td className="py-3 px-3"><Skeleton className="h-4 w-24" /></td>
                          <td className="py-3 px-3"><Skeleton className="h-4 w-20" /></td>
                          <td className="py-3 px-3"><Skeleton className="h-4 w-24" /></td>
                          <td className="py-3 px-3"><Skeleton className="h-4 w-12" /></td>
                          <td className="py-3 px-3"><Skeleton className="h-5 w-24" /></td>
                          <td className="py-3 px-3 text-right"><Skeleton className="h-6 w-14 ml-auto" /></td>
                        </tr>
                      ))
                    ) : items.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12">
                          <EmptyState
                            title={t('results.empty')}
                            description="No records found matching your filters. Try clearing search or scenario criteria."
                            action={{
                              label: t('filters.reset'),
                              onClick: () => {
                                setSearchInput('');
                                setSearchParams({});
                              },
                            }}
                          />
                        </td>
                      </tr>
                    ) : (
                      items.map((tx) => {
                        const isSelected = selectedTxId === tx.transaction_id;
                        return (
                          <tr
                            key={tx.transaction_id}
                            onClick={() => setSelectedTxId(tx.transaction_id)}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-atlas-cyan/15 font-medium'
                                : 'hover:bg-atlas-elevated'
                            }`}
                          >
                            <td className="py-2.5 px-3 font-bold text-atlas-cyan">
                              {tx.transaction_id}
                            </td>
                            <td className="py-2.5 px-3 text-atlas-textSecondary">
                              {tx.transaction_date}
                            </td>
                            <td className="py-2.5 px-3 text-atlas-textPrimary font-semibold">
                              {tx.parcel_id}
                            </td>
                            <td className="py-2.5 px-3 text-atlas-textSecondary font-semibold">
                              {tx.sale_area_acres.toFixed(2)} ac
                            </td>
                            <td className="py-2.5 px-3">
                              <Badge variant={getScenarioBadgeVariant(tx.scenario)} size="sm">
                                {t(`scenarios.${tx.scenario}`, tx.scenario)}
                              </Badge>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/assess/${tx.transaction_id}`);
                                }}
                                className="px-2 py-1 rounded-lg bg-atlas-cyan/15 hover:bg-atlas-cyan text-atlas-cyan hover:text-slate-950 font-bold transition-all text-[11px]"
                              >
                                {t('results.inspect')} &rarr;
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination bar */}
              {total > pageSize && (
                <div className="p-3 border-t border-atlas-border flex items-center justify-between text-xs font-mono bg-atlas-elevated">
                  <span className="text-atlas-textMuted">
                    Page {currentPage} of {totalPages} ({total} total)
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={queryOffset === 0 || isLoading}
                      onClick={() => handlePageChange(queryOffset - pageSize)}
                      leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                    >
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= totalPages || isLoading}
                      onClick={() => handlePageChange(queryOffset + pageSize)}
                      rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
