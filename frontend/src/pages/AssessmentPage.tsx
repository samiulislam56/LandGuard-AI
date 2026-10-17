import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  Calendar,
  Layers,
  Sparkles,
  ArrowLeft,
  Search,
  AlertOctagon,
  CheckCircle2,
  Download,
  Scale,
  SlidersHorizontal,
} from 'lucide-react';

import { api } from '../lib/api';
import { Badge, getStatusBadgeVariant } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { UnderstandMyResult } from '../components/assessment/UnderstandMyResult';
import { SmartDocumentChecklist } from '../components/assessment/SmartDocumentChecklist';

export const AssessmentPage: React.FC = () => {
  const { id = 'TX-002911-2' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  const [asOfDate, setAsOfDate] = useState('2026-10-15');
  const [targetId, setTargetId] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [experienceMode, setExperienceMode] = useState<'simple' | 'advanced'>('simple');

  const {
    data: assessment,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['assessment', id, asOfDate],
    queryFn: () => api.getAssessment(id, asOfDate),
    staleTime: 30000,
  });

  const handleIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetId.trim()) {
      navigate(`/assess/${targetId.trim().toUpperCase()}`);
      setTargetId('');
    }
  };

  const findings = assessment?.evidence_verification?.findings || [];
  const warnings = assessment?.evidence_verification?.warnings || [];
  const finalStatus = assessment?.final_status || 'NO_REVIEW_FLAG_DETECTED';
  const rfPred = assessment?.random_forest?.prediction || '';
  const isoStatus = assessment?.isolation_forest?.status || '';
  const isoScore = assessment?.isolation_forest?.decision_score ?? 0;

  return (
    <div className="space-y-4 select-none pb-8">
      {/* Top Header & Fast Switcher */}
      <div className="rounded-2xl border border-atlas-border bg-atlas-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-atlas-md">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/transactions')}
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            className="text-xs font-mono"
          >
            {t('common.back')}
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold font-mono tracking-tight text-atlas-textPrimary">
                {t('nav.assessment')}: {id}
              </h1>
            </div>
            <p className="text-xs text-atlas-textMuted font-mono mt-0.5">
              Dual-Model Inference &amp; Forensic Evidence Verification
            </p>
          </div>
        </div>

        {/* Date Selector & Fast Transaction Lookup */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-mono bg-atlas-elevated border border-atlas-border rounded-xl px-3 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-atlas-cyan shrink-0" aria-hidden="true" />
            <span className="text-[10px] text-atlas-textMuted uppercase">AS OF:</span>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="bg-transparent text-xs font-mono focus:outline-none text-atlas-textPrimary cursor-pointer"
            />
          </div>

          <form onSubmit={handleIdSubmit} className="flex items-center gap-1">
            <input
              type="text"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              placeholder="e.g. TX-002911-1"
              className="text-xs font-mono bg-atlas-elevated border border-atlas-border hover:border-atlas-cyan/60 rounded-xl px-3 py-1.5 focus:outline-none w-36 text-atlas-textPrimary placeholder:text-atlas-textMuted"
            />
            <Button variant="outline" size="sm" type="submit" title="Load assessment" className="px-2.5">
              <Search className="w-3.5 h-3.5" />
            </Button>
          </form>

          <Button
            variant="primary"
            size="sm"
            onClick={async () => {
              try {
                setIsDownloading(true);
                await api.downloadAssessmentPdf(id, asOfDate);
              } catch (err) {
                console.error(err);
              } finally {
                setIsDownloading(false);
              }
            }}
            isLoading={isDownloading}
            leftIcon={<Download className="w-3.5 h-3.5" />}
            className="text-xs font-mono"
          >
            PDF Report
          </Button>
        </div>
      </div>

      {/* Benchmark Fast Links (AC-04 Requirements) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
        <span className="text-atlas-textMuted text-[11px] shrink-0 font-bold">
          AC-04 Ground-Truth Benchmarks:
        </span>
        <button
          type="button"
          onClick={() => navigate('/assess/TX-002911-1')}
          className={`px-3 py-1.5 rounded-xl border transition-colors shrink-0 text-xs font-mono ${
            id === 'TX-002911-1'
              ? 'bg-amber-500/20 text-amber-500 border-amber-500 font-bold'
              : 'border-atlas-border bg-atlas-surface text-atlas-textSecondary hover:border-atlas-cyan'
          }`}
        >
          TX-002911-1 (Insufficient Evidence)
        </button>
        <button
          type="button"
          onClick={() => navigate('/assess/TX-002911-2')}
          className={`px-3 py-1.5 rounded-xl border transition-colors shrink-0 text-xs font-mono ${
            id === 'TX-002911-2'
              ? 'bg-red-500/20 text-red-400 border-red-500 font-bold'
              : 'border-atlas-border bg-atlas-surface text-atlas-textSecondary hover:border-atlas-cyan'
          }`}
        >
          TX-002911-2 (Review Required - Conflicting Sale)
        </button>
        <button
          type="button"
          onClick={() => navigate('/assess/TX-002911-3')}
          className={`px-3 py-1.5 rounded-xl border transition-colors shrink-0 text-xs font-mono ${
            id === 'TX-002911-3'
              ? 'bg-sky-500/20 text-sky-400 border-sky-500 font-bold'
              : 'border-atlas-border bg-atlas-surface text-atlas-textSecondary hover:border-atlas-cyan'
          }`}
        >
          TX-002911-3 (Pending Date Verification)
        </button>
      </div>

      {/* Experience Mode Toggle (সহজ মোড vs বিস্তারিত মোড) */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {isBn ? "প্রদর্শন মোড নির্বাচন:" : "Select Experience Mode:"}
          </span>
        </div>

        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-700">
          <button
            type="button"
            onClick={() => setExperienceMode('simple')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              experienceMode === 'simple'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            {isBn ? "সহজ মোড (নাগরিক)" : "Simple Mode"}
          </button>
          <button
            type="button"
            onClick={() => setExperienceMode('advanced')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              experienceMode === 'advanced'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            {isBn ? "বিস্তারিত মোড (বিশ্লেষক)" : "Advanced Mode"}
          </button>
        </div>
      </div>

      {isError ? (
        <ErrorState
          title="Assessment Computation Failed"
          message={error instanceof Error ? error.message : 'Unable to evaluate transaction assessment.'}
          onRetry={() => refetch()}
        />
      ) : (
        <>
          {/* Simple Mode: Understand My Result & Smart Document Checklist */}
          {experienceMode === 'simple' && assessment && (
            <div className="space-y-6">
              <UnderstandMyResult assessment={assessment} />
              <SmartDocumentChecklist
                transactionId={id}
                hasDeedRecord={true}
                hasKhatianRecord={true}
                hasMutationRecord={finalStatus !== 'INSUFFICIENT_EVIDENCE'}
                isAreaConsistent={finalStatus !== 'REVIEW_REQUIRED'}
                isLineageConsistent={finalStatus !== 'REVIEW_REQUIRED'}
                isDateValid={finalStatus !== 'PENDING_DATE_VERIFICATION'}
                sellerRepeatCount={finalStatus === 'REVIEW_REQUIRED' ? 3 : 1}
              />
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to={`/rmd?tx=${id}`}>
                  <Button variant="primary" size="sm" className="gap-2 bg-emerald-700 hover:bg-emerald-800">
                    <Scale className="w-4 h-4" />
                    {isBn ? "RMD ধারাবাহিকতা অডিট দেখুন" : "View RMD Triangulation"}
                  </Button>
                </Link>
                {assessment.parcel_id && (
                  <Link to={`/parcels/${assessment.parcel_id}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Layers className="w-4 h-4" />
                      {isBn ? "জমির ইতিহাস দেখুন" : "View Parcel History"}
                    </Button>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setExperienceMode('advanced')}
                  className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-semibold ml-auto"
                >
                  {isBn ? "প্রযুক্তিগত বিস্তারিত বিশ্লেষণ দেখুন &rarr;" : "View Technical Analysis &rarr;"}
                </button>
              </div>
            </div>
          )}

          {/* Top Status Hero Banner (Always visible in Advanced Mode) */}
          {experienceMode === 'advanced' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                    Hierarchical Policy Screening Result
                  </span>
                  <div className="flex items-center gap-3 mt-1.5">
                    {isLoading ? (
                      <Skeleton className="h-8 w-48" />
                    ) : (
                      <Badge variant={getStatusBadgeVariant(finalStatus)} size="md" className="text-sm px-4 py-1.5 font-bold font-mono">
                        {finalStatus.replace(/_/g, ' ')}
                      </Badge>
                    )}
                    {assessment?.human_review_recommended && (
                      <span className="text-xs font-semibold text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                        Human Review Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-2 font-mono">
                    Parcel Reference:{' '}
                    <button
                      type="button"
                      onClick={() => navigate(`/parcels/${assessment?.parcel_id}`)}
                      className="text-emerald-700 dark:text-emerald-400 font-bold underline hover:opacity-80"
                    >
                      {assessment?.parcel_id}
                    </button>{' '}
                    &bull; Assessment Date: {assessment?.assessment_date}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link to={`/rmd?tx=${id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-mono gap-1.5 border-emerald-300 text-emerald-800 dark:text-emerald-300"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      RMD Audit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/transactions/${id}`)}
                    leftIcon={<FileCheck2 className="w-3.5 h-3.5" />}
                    className="text-xs font-mono"
                  >
                    View Deed Record
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/parcels/${assessment?.parcel_id}`)}
                    leftIcon={<Layers className="w-3.5 h-3.5" />}
                    className="text-xs font-mono"
                  >
                    Parcel History
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Model Inference & Findings Grid (Advanced Mode) */}
          {experienceMode === 'advanced' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left 6 cols: Dual Model Evaluation Panel */}
            <div className="lg:col-span-6 space-y-4">
              {/* Model 1: Random Forest Classifier */}
              <div className="rounded-2xl border border-atlas-border bg-atlas-surface p-4 shadow-atlas-md space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-atlas-border">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-atlas-cyan" />
                    <h3 className="font-bold text-sm text-atlas-textPrimary">
                      Random Forest Classification Engine
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-atlas-cyan bg-atlas-cyan/10 px-2 py-0.5 rounded border border-atlas-cyan/25">
                    Supervised 3-Class
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-atlas-elevated">
                    <span className="text-atlas-textMuted">Statistical Class Prediction:</span>
                    <strong className="text-atlas-textPrimary font-bold text-sm">
                      {rfPred || 'Analyzing...'}
                    </strong>
                  </div>
                  <p className="text-[11px] text-atlas-textMuted leading-relaxed">
                    Evaluates multi-feature cadastral indicators including historical seller-owner consistency, claimed shares, and prior transactions.
                  </p>
                </div>
              </div>

              {/* Model 2: Isolation Forest Anomaly Detection */}
              <div className="rounded-2xl border border-atlas-border bg-atlas-surface p-4 shadow-atlas-md space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-atlas-border">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <h3 className="font-bold text-sm text-atlas-textPrimary">
                      Isolation Forest Anomaly Scoring
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25">
                    Unsupervised Outlier
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-atlas-elevated">
                      <span className="text-[10px] text-atlas-textMuted block">SIGNAL STATUS</span>
                      <strong className={`text-sm ${isoStatus === 'ANOMALY' ? 'text-amber-500' : 'text-emerald-400'}`}>
                        {isoStatus || 'N/A'}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-atlas-elevated">
                      <span className="text-[10px] text-atlas-textMuted block">DECISION SCORE</span>
                      <strong className="text-sm text-atlas-cyan">
                        {isoScore.toFixed(4)}
                      </strong>
                    </div>
                  </div>
                  <p className="text-[11px] text-atlas-textMuted leading-relaxed">
                    Isolation score &lt; 0 flags an outlier conveyance pattern compared to normative baseline conveyances.
                  </p>
                </div>
              </div>
            </div>

            {/* Right 6 cols: Heuristic Evidence Verification Findings */}
            <div className="lg:col-span-6 space-y-4">
              <div className="rounded-2xl border border-atlas-border bg-atlas-surface p-4 shadow-atlas-md space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-atlas-border">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-bold text-sm text-atlas-textPrimary">
                      Forensic Evidence Verification Matrix
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                    Rule-Based Precedence
                  </span>
                </div>

                {findings.length > 0 ? (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-red-400 block font-mono">
                      Critical Discrepancies ({findings.length}):
                    </span>
                    <ul className="space-y-1.5">
                      {findings.map((f, i) => (
                        <li
                          key={`find-${i}`}
                          className="p-2.5 rounded-xl bg-red-950/20 border border-red-500/30 text-xs font-mono text-slate-200 flex items-start gap-2"
                        >
                          <AlertOctagon className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs font-mono text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>No critical evidence anomalies detected.</span>
                  </div>
                )}

                {warnings.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-atlas-border">
                    <span className="text-[11px] font-bold text-amber-400 block font-mono">
                      Warnings ({warnings.length}):
                    </span>
                    {warnings.map((w, i) => (
                      <p key={`warn-${i}`} className="text-xs font-mono text-amber-300/90 pl-2 border-l-2 border-amber-500">
                        {w}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          )}
        </>
      )}
    </div>
  );
};
