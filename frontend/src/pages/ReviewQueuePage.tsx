import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ClipboardList,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const ReviewQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Reference review case scenarios from synthetic review_cases.csv
  const mockReviewQueue = [
    { caseId: 'CASE-TX-000001-3', txId: 'TX-000001-3', scenario: 'document_tamper', status: 'UNREVIEWED', parcelId: 'LG-P-000001' },
    { caseId: 'CASE-TX-000002-1', txId: 'TX-000002-1', scenario: 'area_mismatch', status: 'UNREVIEWED', parcelId: 'LG-P-000002' },
    { caseId: 'CASE-TX-000004-1', txId: 'TX-000004-1', scenario: 'owner_mismatch', status: 'UNREVIEWED', parcelId: 'LG-P-000004' },
    { caseId: 'CASE-TX-002911-2', txId: 'TX-002911-2', scenario: 'conflicting_sale', status: 'UNREVIEWED', parcelId: 'LG-P-002911' },
    { caseId: 'CASE-TX-002911-1', txId: 'TX-002911-1', scenario: 'incomplete', status: 'UNREVIEWED', parcelId: 'LG-P-002911' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-atlas-border">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-atlas-cyan" aria-hidden="true" />
            <h1 className="text-2xl font-bold tracking-tight text-atlas-textPrimary">
              {t('nav.reviewWorkspace')}
            </h1>
          </div>
          <p className="text-sm text-atlas-textMuted mt-1">
            Auditor case triage and manual reconciliation for flagged land transaction anomalies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="insufficient" size="md">
            1,188 Synthetic Cases Pending
          </Badge>
        </div>
      </div>

      {/* Phase 2 Boundary Callout Notice */}
      <Card className="border-atlas-amber/30 bg-atlas-amber/10 p-4">
        <div className="flex items-start gap-3 text-xs">
          <Lock className="w-4 h-4 text-atlas-amber shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <h4 className="font-bold text-atlas-amber">
              Stage 3 Architecture Boundary — Read-Only Demonstration Queue
            </h4>
            <p className="text-atlas-textMuted leading-relaxed">
              Per <strong>SRS v1.1 Section 11</strong>, mutable case resolution (`PATCH /review-cases/:id`), persistent auditor notes, and authentication are strictly scheduled for Stage 4/5 backend database migration. Below is the demonstration queue displaying unreviewed cases from synthetic baseline datasets.
            </p>
          </div>
        </div>
      </Card>

      {/* Case Queue Table */}
      <Card className="border-atlas-border bg-atlas-surface">
        <CardHeader>
          <CardTitle>Demonstration Case Queue</CardTitle>
          <span className="text-xs font-mono text-atlas-textMuted">
            Source: review_cases.csv
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-atlas-elevated text-atlas-textMuted font-mono uppercase text-[11px] border-b border-atlas-border">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Case ID</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Transaction ID</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Parcel ID</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Flagged Scenario</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Audit Status</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-atlas-border font-sans">
                {mockReviewQueue.map((item) => (
                  <tr key={item.caseId} className="hover:bg-atlas-elevated/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-atlas-textPrimary">
                      {item.caseId}
                    </td>
                    <td className="px-4 py-3 font-mono text-atlas-cyan font-bold">
                      {item.txId}
                    </td>
                    <td className="px-4 py-3 font-mono text-atlas-textMuted">
                      {item.parcelId}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="review" size="sm">
                        {item.scenario.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-atlas-amber/15 text-atlas-amber border border-atlas-amber/30">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/assess/${item.txId}`)}
                        rightIcon={<ArrowRight className="w-3 h-3" />}
                        className="text-xs text-atlas-cyan hover:text-atlas-cyan/80"
                      >
                        {t('common.audit')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
