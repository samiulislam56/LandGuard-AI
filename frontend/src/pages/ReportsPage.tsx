import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { api } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Badge, getStatusBadgeVariant } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';

export const ReportsPage: React.FC = () => {
  const [selectedTx, setSelectedTx] = useState('TX-002911-2');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const { t } = useTranslation();

  const { data: assessment, isLoading } = useQuery({
    queryKey: ['assessmentReport', selectedTx],
    queryFn: () => api.getAssessment(selectedTx, '2026-10-15'),
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      await api.downloadAssessmentPdf(selectedTx, '2026-10-15');
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('PDF download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-atlas-border">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-atlas-cyan" aria-hidden="true" />
            <h1 className="text-2xl font-bold tracking-tight text-atlas-textPrimary font-mono">
              {t('nav.reports')}
            </h1>
          </div>
          <p className="text-sm text-atlas-textMuted mt-1">
            Forensic Cadastral Dossier &bull; Real Backend PDF Stream via ReportLab
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
          >
            {t('common.export')} / Print
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleDownloadPdf}
            isLoading={isDownloading}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Download PDF Report
          </Button>
        </div>
      </div>

      {/* Stage 4 PDF Active Notice */}
      <Card className="border-emerald-500/30 bg-emerald-950/20 p-4">
        <div className="flex items-start gap-3 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <h4 className="font-bold text-emerald-400 flex items-center gap-2">
              <span>Stage 4 Server-Side PDF Stream Active</span>
              {downloadSuccess && (
                <span className="text-emerald-300 flex items-center gap-1 font-normal">
                  <CheckCircle2 className="w-3.5 h-3.5" /> PDF generated and downloaded!
                </span>
              )}
            </h4>
            <p className="text-atlas-textMuted leading-relaxed">
              Real institutional PDF reports are compiled on the FastAPI backend using ReportLab at <code className="text-atlas-cyan font-mono">GET /api/reports/assessment/:tx_id</code>. Includes forensic assessment status, dual-model signals, evidence verification findings, and mandatory legal disclaimers.
            </p>
          </div>
        </div>
      </Card>

      {/* Report Selector Controls */}
      <div className="flex items-center gap-2 text-xs font-mono">
        <span className="text-atlas-textMuted">Sample Dossier:</span>
        {['TX-002911-2', 'TX-002911-1', 'TX-002911-3', 'TX-000001-1'].map((txId) => (
          <button
            key={txId}
            type="button"
            onClick={() => setSelectedTx(txId)}
            className={`px-2.5 py-1 rounded border transition-colors ${
              selectedTx === txId
                ? 'bg-atlas-cyan text-atlas-app border-atlas-cyan font-bold'
                : 'border-atlas-border hover:border-atlas-cyan text-atlas-textMuted'
            }`}
          >
            {txId}
          </button>
        ))}
      </div>

      {/* Printable Report Canvas */}
      <Card className="p-8 max-w-4xl mx-auto bg-atlas-surface border border-atlas-border shadow-lg font-sans">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Report Header */}
            <div className="border-b-2 border-atlas-border pb-4 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-atlas-cyan font-bold">
                  LANDGUARD ATLAS &bull; FORENSIC SCREENING DOSSIER
                </span>
                <h2 className="text-xl font-bold font-mono text-atlas-textPrimary mt-1">
                  Transaction Audit: {assessment?.transaction_id}
                </h2>
                <p className="text-xs text-atlas-textMuted mt-0.5">
                  Cadastral Plot: {assessment?.parcel_id} &bull; Timestamp: {assessment?.assessment_date}
                </p>
              </div>

              <div className="text-right font-mono text-xs">
                <Badge variant={getStatusBadgeVariant(assessment?.final_status || '')} size="md">
                  {assessment?.final_status.replace(/_/g, ' ')}
                </Badge>
                <span className="text-[10px] text-atlas-textMuted block mt-1">
                  Report ID: RPT-{assessment?.transaction_id}
                </span>
              </div>
            </div>

            {/* Model Outputs */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono p-4 rounded-lg bg-atlas-elevated border border-atlas-border">
              <div>
                <span className="text-[10px] text-atlas-textMuted uppercase block">
                  Random Forest Classifier
                </span>
                <span className="font-bold text-sm text-atlas-cyan">
                  {assessment?.random_forest?.prediction}
                </span>
                <p className="text-[10px] text-atlas-textMuted mt-0.5">
                  Model: rf_baseline_v1 (200 trees)
                </p>
              </div>

              <div>
                <span className="text-[10px] text-atlas-textMuted uppercase block">
                  Isolation Forest Anomaly
                </span>
                <span className="font-bold text-sm text-atlas-amber">
                  {assessment?.isolation_forest?.status} (Score: {assessment?.isolation_forest?.decision_score.toFixed(4)})
                </span>
                <p className="text-[10px] text-atlas-textMuted mt-0.5">
                  Pipeline: StandardScaler + IsoForest
                </p>
              </div>
            </div>

            {/* Findings & Evidence */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-atlas-textPrimary">
                Evidence Findings Summary
              </h4>
              {assessment?.evidence_verification?.findings.length === 0 ? (
                <p className="text-xs text-atlas-teal font-mono">
                  No discrepancy findings recorded for this transaction.
                </p>
              ) : (
                <ul className="list-disc list-inside space-y-1 text-xs text-atlas-red font-medium">
                  {assessment?.evidence_verification?.findings.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Warnings */}
            {assessment?.evidence_verification?.warnings && assessment.evidence_verification.warnings.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-atlas-textPrimary">
                  Administrative Warnings
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-atlas-amber">
                  {assessment.evidence_verification.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Mandatory Synthetic Disclaimer */}
            <div className="pt-4 border-t border-atlas-border text-[11px] font-mono text-center text-atlas-textMuted">
              {assessment?.disclaimer || t('app.syntheticDisclaimer')}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
