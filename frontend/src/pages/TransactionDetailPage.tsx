import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  ShieldAlert,
  ArrowLeft,
  Calendar,
  User,
  CheckCircle2,
  AlertTriangle,
  History,
  FileText,
} from 'lucide-react';

import { api } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { CadastralMap } from '../components/gis/CadastralMap';
import { generateCadastralPolygon } from '../lib/geo';

export const TransactionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    data: tx,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['transactionDetail', id],
    queryFn: () => (id ? api.getTransactionDetail(id) : Promise.reject(new Error('No ID provided'))),
    enabled: !!id,
  });

  if (isError) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/transactions')}
          leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
        >
          {t('common.back')}
        </Button>
        <ErrorState
          title={t('common.noData')}
          message={error instanceof Error ? error.message : `Deed record ${id} could not be loaded.`}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const indicatorRules = [
    { key: 'seller_owner_mismatch', label: 'Seller & Owner Snapshot Mismatch', value: tx?.seller_owner_mismatch },
    { key: 'area_mismatch', label: 'Conveyance Area Bounds Exceeded', value: tx?.area_mismatch },
    { key: 'mutation_mismatch', label: 'Mutation Record Discrepancy', value: tx?.mutation_mismatch },
    { key: 'document_hash_mismatch', label: 'Deed Document Integrity Flag', value: tx?.document_hash_mismatch },
    { key: 'overlapping_claim', label: 'Concurrent / Overlapping Claim Candidate', value: tx?.overlapping_claim },
    { key: 'missing_evidence', label: 'Incomplete Supporting Evidence Chain', value: tx?.missing_evidence },
  ];

  return (
    <div className="space-y-6">
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-atlas-border">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/transactions')}
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            {t('common.back')}
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-mono text-atlas-textPrimary">
                {isLoading ? <Skeleton className="h-6 w-32" /> : tx?.transaction_id}
              </h1>
              {tx && (
                <Badge variant={tx.scenario === 'normal' ? 'clean' : 'review'} size="sm">
                  {tx.scenario.replace(/_/g, ' ')}
                </Badge>
              )}
            </div>
            <p className="text-xs text-atlas-textMuted mt-0.5">
              Forensic Deed Attribute Inspector &bull; Synthetic Registry Event
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {tx && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/parcels/${tx.parcel_id}`)}
                leftIcon={<MapPin className="w-3.5 h-3.5" />}
              >
                {t('nav.parcelIntelligence')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/assess/${tx.transaction_id}`)}
                leftIcon={<ShieldAlert className="w-3.5 h-3.5" />}
              >
                {t('common.audit')}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Grid: Details & Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Deed Metadata */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-atlas-border bg-atlas-surface">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-atlas-cyan" />
                <CardTitle>{t('dossier.overview')}</CardTitle>
              </div>
              <span className="text-xs font-mono text-atlas-cyan">
                Deed Origin: {tx?.data_origin || 'SYNTHETIC'}
              </span>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
              ) : (
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-atlas-elevated border border-atlas-border">
                    <dt className="text-atlas-textMuted uppercase text-[10px]">
                      {t('dossier.parcelId')}
                    </dt>
                    <dd className="font-bold text-sm text-atlas-cyan mt-1 flex items-center justify-between">
                      <span>{tx?.parcel_id}</span>
                      <button
                        type="button"
                        onClick={() => navigate(`/parcels/${tx?.parcel_id}`)}
                        className="text-xs text-atlas-textMuted hover:text-atlas-cyan"
                        title="Open parcel dossier"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>
                    </dd>
                  </div>

                  <div className="p-3 rounded-lg bg-atlas-elevated border border-atlas-border">
                    <dt className="text-atlas-textMuted uppercase text-[10px] flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Event Date
                    </dt>
                    <dd className="font-bold text-sm text-atlas-textPrimary mt-1">
                      {tx?.transaction_date}
                    </dd>
                  </div>

                  <div className="p-3 rounded-lg bg-atlas-elevated border border-atlas-border">
                    <dt className="text-atlas-textMuted uppercase text-[10px] flex items-center gap-1">
                      <User className="w-3 h-3" /> Grantor ({t('dossier.seller')})
                    </dt>
                    <dd className="font-bold text-sm text-atlas-textPrimary mt-1">
                      {tx?.seller_alias}
                    </dd>
                  </div>

                  <div className="p-3 rounded-lg bg-atlas-elevated border border-atlas-border">
                    <dt className="text-atlas-textMuted uppercase text-[10px] flex items-center gap-1">
                      <User className="w-3 h-3" /> Grantee ({t('dossier.buyer')})
                    </dt>
                    <dd className="font-bold text-sm text-atlas-textPrimary mt-1">
                      {tx?.buyer_alias}
                    </dd>
                  </div>

                  <div className="p-3 rounded-lg bg-atlas-elevated border border-atlas-border">
                    <dt className="text-atlas-textMuted uppercase text-[10px]">
                      {t('dossier.areaTransferred')}
                    </dt>
                    <dd className="font-bold text-sm text-atlas-textPrimary mt-1">
                      {tx?.sale_area_acres.toFixed(3)} acres
                    </dd>
                  </div>

                  <div className="p-3 rounded-lg bg-atlas-elevated border border-atlas-border">
                    <dt className="text-atlas-textMuted uppercase text-[10px]">
                      Claimed Fractional Share
                    </dt>
                    <dd className="font-bold text-sm text-atlas-textPrimary mt-1">
                      {((tx?.claimed_share || 0) * 100).toFixed(1)}% (share: {tx?.claimed_share})
                    </dd>
                  </div>
                </dl>
              )}
            </CardContent>
          </Card>

          {/* Registration & Historical Transfer Chain Card */}
          <Card className="border-atlas-border bg-atlas-surface">
            <CardHeader>
              <CardTitle>Transfer Chain &amp; Registration Flags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-atlas-elevated border border-atlas-border">
                  <span className="text-atlas-textMuted text-[10px] uppercase">
                    OFFICIALLY REGISTERED
                  </span>
                  <p className="font-bold text-sm mt-1">
                    {tx?.registered === 1 ? (
                      <span className="text-atlas-teal">Yes (Deed Sealed)</span>
                    ) : (
                      <span className="text-atlas-amber">No (Unregistered)</span>
                    )}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-atlas-elevated border border-atlas-border">
                  <span className="text-atlas-textMuted text-[10px] uppercase">
                    PRIOR DEEDS RECORDED
                  </span>
                  <p className="font-bold text-sm mt-1">
                    {tx?.prior_transaction_exists === 1 ? (
                      <span className="text-atlas-cyan">Yes (Historical Sales)</span>
                    ) : (
                      <span className="text-atlas-textMuted">None (First Event)</span>
                    )}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-atlas-elevated border border-atlas-border">
                  <span className="text-atlas-textMuted text-[10px] uppercase">
                    RESALE EVIDENCE PRESENT
                  </span>
                  <p className="font-bold text-sm mt-1">
                    {tx?.legitimate_resale_evidence === 1 ? (
                      <span className="text-atlas-cyan">Yes (Transfer Link)</span>
                    ) : (
                      <span className="text-atlas-textMuted">No Documented Chain</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Rule Indicator Checklist */}
        <div className="space-y-6">
          <Card className="border-atlas-border bg-atlas-surface">
            <CardHeader>
              <CardTitle>Synthetic Indicators Check</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-atlas-textMuted">
                Binary indicators derived from synthetic scenario injection:
              </p>

              <div className="space-y-2.5">
                {indicatorRules.map((rule) => {
                  const isFlagged = rule.value === 1;
                  return (
                    <div
                      key={rule.key}
                      className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 transition-colors ${
                        isFlagged
                          ? 'border-atlas-red/30 bg-atlas-red/10 text-atlas-red'
                          : 'border-atlas-border bg-atlas-elevated text-atlas-textPrimary'
                      }`}
                    >
                      {isFlagged ? (
                        <AlertTriangle className="w-4 h-4 text-atlas-red shrink-0 mt-0.5" aria-hidden="true" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-atlas-teal shrink-0 mt-0.5" aria-hidden="true" />
                      )}
                      <div>
                        <span className="font-semibold block">{rule.label}</span>
                        <span className="text-[10px] font-mono opacity-75">
                          Value: {rule.value ?? 0} ({isFlagged ? 'FLAGGED' : 'CLEAR'})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button
                variant="primary"
                size="sm"
                className="w-full mt-4"
                onClick={() => navigate(`/assess/${tx?.transaction_id}`)}
                leftIcon={<ShieldAlert className="w-4 h-4" />}
              >
                {t('common.audit')}
              </Button>
            </CardContent>
          </Card>

          {/* Cadastral Boundary Spatial View */}
          {tx && (
            <Card className="overflow-hidden border-atlas-border bg-atlas-surface">
              <CardHeader className="py-2.5 px-4">
                <CardTitle className="text-xs uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-atlas-cyan" />
                  Cadastral Plot Bounds ({tx.parcel_id})
                </CardTitle>
              </CardHeader>
              <div className="p-2">
                <CadastralMap
                  height="220px"
                  plots={[
                    generateCadastralPolygon(
                      tx.parcel_id,
                      'Dhaka',
                      parseInt(tx.parcel_id.replace(/\D/g, ''), 10) || 101,
                      3001,
                      tx.sale_area_acres,
                      tx.scenario
                    ),
                  ]}
                  selectedParcelId={tx.parcel_id}
                  showControls={false}
                />
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
