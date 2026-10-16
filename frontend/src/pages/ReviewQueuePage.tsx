import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ClipboardList,
  Search,
  Filter,
  CheckCircle2,
  ShieldCheck,
  UserCheck,
  LogIn,
  LogOut,
  ExternalLink,
  History,
  FileText,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { api } from '../lib/api';
import { ReviewCase, UserProfile } from '../types/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';

export const ReviewQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 15;

  // Selected Case for Modal / Drawer
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Auth Dialog State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Review Form Mutation State
  const [newStatus, setNewStatus] = useState<string>('APPROVED_VALID');
  const [notes, setNotes] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // 1. Fetch Current User Profile
  const { data: userProfile, refetch: refetchUser } = useQuery<UserProfile>({
    queryKey: ['authMe'],
    queryFn: () => api.getMe(),
  });

  // 2. Fetch Review Cases
  const { data: reviewsData, isLoading, isError } = useQuery({
    queryKey: ['reviewCases', statusFilter, search, page],
    queryFn: () =>
      api.getReviews({
        status: statusFilter || undefined,
        search: search || undefined,
        limit: pageSize,
        offset: page * pageSize,
      }),
  });

  // 3. Fetch Selected Case Details (when modal opened)
  const { data: caseDetail, isLoading: isDetailLoading, refetch: refetchDetail } = useQuery({
    queryKey: ['reviewDetail', selectedCaseId],
    queryFn: () => (selectedCaseId ? api.getReviewDetail(selectedCaseId) : null),
    enabled: !!selectedCaseId,
  });

  // Login Mutation
  const loginMutation = useMutation({
    mutationFn: () => api.login(loginUsername, loginPassword),
    onSuccess: () => {
      setLoginError('');
      setShowLoginModal(false);
      refetchUser();
      queryClient.invalidateQueries({ queryKey: ['reviewCases'] });
    },
    onError: (err: unknown) => {
      setLoginError(err instanceof Error ? err.message : 'Login failed. Check credentials.');
    },
  });

  // Logout Mutation
  const logoutMutation = useMutation({
    mutationFn: () => api.logout(),
    onSuccess: () => {
      refetchUser();
      queryClient.invalidateQueries({ queryKey: ['reviewCases'] });
    },
  });

  // Update Review Mutation
  const updateMutation = useMutation({
    mutationFn: ({ caseId, status, reviewer_notes }: { caseId: string; status: string; reviewer_notes: string }) =>
      api.updateReview(caseId, { status, reviewer_notes }),
    onSuccess: () => {
      setActionSuccess('Review case saved to persistent database!');
      setActionError('');
      queryClient.invalidateQueries({ queryKey: ['reviewCases'] });
      queryClient.invalidateQueries({ queryKey: ['reviewDetail', selectedCaseId] });
      refetchDetail();
      setTimeout(() => setActionSuccess(''), 4000);
    },
    onError: (err: unknown) => {
      setActionError(err instanceof Error ? err.message : 'Failed to update review case.');
    },
  });

  const handleOpenReview = (c: ReviewCase) => {
    setSelectedCaseId(c.case_id);
    setNewStatus(c.review_status === 'UNREVIEWED' ? 'APPROVED_VALID' : c.review_status);
    setNotes(c.reviewer_notes || '');
    setActionError('');
    setActionSuccess('');
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId) return;
    if (!userProfile?.authenticated) {
      setShowLoginModal(true);
      return;
    }
    updateMutation.mutate({
      caseId: selectedCaseId,
      status: newStatus,
      reviewer_notes: notes,
    });
  };

  const totalPages = reviewsData ? Math.ceil(reviewsData.total / pageSize) : 1;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED_VALID':
      case 'APPROVED':
        return <Badge variant="clean">APPROVED VALID</Badge>;
      case 'FLAGGED_DISPUTE':
      case 'DISPUTED':
        return <Badge variant="review">FLAGGED DISPUTE</Badge>;
      case 'IN_REVIEW':
        return <Badge variant="insufficient">IN REVIEW</Badge>;
      case 'REJECTED':
        return <Badge variant="review">REJECTED</Badge>;
      default:
        return <Badge variant="neutral">UNREVIEWED</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-atlas-border">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-atlas-cyan" aria-hidden="true" />
            <h1 className="text-2xl font-bold tracking-tight text-atlas-textPrimary font-mono">
              {t('nav.reviewWorkspace')}
            </h1>
          </div>
          <p className="text-sm text-atlas-textMuted mt-1">
            Stage 4 Persistent Review Workspace &bull; Real Database Mutation &amp; Forensic Audit Trail
          </p>
        </div>

        {/* User Auth Control Pill */}
        <div className="flex items-center gap-3">
          {userProfile?.authenticated ? (
            <div className="flex items-center gap-2 bg-atlas-surface border border-emerald-500/40 px-3 py-1.5 rounded-xl text-xs font-mono">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-bold">{userProfile.username}</span>
              <span className="text-atlas-textMuted">({userProfile.role})</span>
              <button
                onClick={() => logoutMutation.mutate()}
                title="Log out"
                className="ml-2 text-atlas-textMuted hover:text-red-400 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLoginModal(true)}
              leftIcon={<LogIn className="w-3.5 h-3.5" />}
              className="font-mono text-xs border-atlas-cyan/50 text-atlas-cyan hover:bg-atlas-cyan/10"
            >
              Sign In to Review (Auditor)
            </Button>
          )}

          <Badge variant="insufficient" size="md">
            {reviewsData ? `${reviewsData.total.toLocaleString()} Cases in Registry` : 'Loading Cases...'}
          </Badge>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-atlas-surface p-3 rounded-2xl border border-atlas-border">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-atlas-textMuted" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search Case ID, Transaction ID, or Parcel ID..."
            className="w-full pl-9 pr-4 py-2 bg-atlas-elevated border border-atlas-border rounded-xl text-xs font-mono text-atlas-textPrimary placeholder:text-atlas-textMuted focus:outline-none focus:border-atlas-cyan"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs font-mono">
          <Filter className="w-3.5 h-3.5 text-atlas-textMuted mr-1 shrink-0" />
          {[
            { label: 'ALL', val: '' },
            { label: 'UNREVIEWED', val: 'UNREVIEWED' },
            { label: 'IN REVIEW', val: 'IN_REVIEW' },
            { label: 'APPROVED', val: 'APPROVED_VALID' },
            { label: 'DISPUTE', val: 'FLAGGED_DISPUTE' },
            { label: 'REJECTED', val: 'REJECTED' },
          ].map((tab) => (
            <button
              key={tab.label}
              onClick={() => {
                setStatusFilter(tab.val);
                setPage(0);
              }}
              className={`px-2.5 py-1.5 rounded-lg border transition-colors shrink-0 ${
                statusFilter === tab.val
                  ? 'bg-atlas-cyan text-atlas-app border-atlas-cyan font-bold'
                  : 'border-atlas-border bg-atlas-elevated text-atlas-textMuted hover:text-atlas-textPrimary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Case Queue Table */}
      <Card className="border-atlas-border bg-atlas-surface">
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <CardTitle className="text-sm font-mono">
            Persistent Review Queue (Page {page + 1} of {Math.max(totalPages, 1)})
          </CardTitle>
          <span className="text-xs font-mono text-atlas-textMuted">
            Database: SQLite &bull; Audit Trail Active
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : isError || !reviewsData ? (
            <div className="p-8 text-center text-red-400 font-mono text-xs">
              Failed to load review cases from the API. Check backend connectivity.
            </div>
          ) : reviewsData.items.length === 0 ? (
            <div className="p-8 text-center text-atlas-textMuted font-mono text-xs">
              No review cases found matching the specified filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-atlas-elevated text-atlas-textMuted uppercase text-[11px] border-b border-atlas-border">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Case ID</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Transaction ID</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Parcel ID</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Flagged Scenario</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Review Status</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Auditor Notes</th>
                    <th scope="col" className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-atlas-border">
                  {reviewsData.items.map((item) => (
                    <tr key={item.case_id} className="hover:bg-atlas-elevated/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-atlas-textPrimary">
                        {item.case_id}
                      </td>
                      <td className="px-4 py-3 text-atlas-cyan font-bold hover:underline cursor-pointer"
                        onClick={() => navigate(`/assess/${item.transaction_id}`)}
                      >
                        {item.transaction_id}
                      </td>
                      <td className="px-4 py-3 text-atlas-textMuted">
                        {item.parcel_id}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px]">
                          {item.flagged_scenario.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(item.review_status)}
                      </td>
                      <td className="px-4 py-3 text-atlas-textMuted truncate max-w-[180px]">
                        {item.reviewer_notes || '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenReview(item)}
                            className="text-[11px] font-mono h-7 px-2.5"
                          >
                            Inspect / Audit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/assess/${item.transaction_id}`)}
                            title="Open Assessment View"
                            className="h-7 w-7 p-0"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-atlas-cyan" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {reviewsData && reviewsData.total > pageSize && (
            <div className="flex items-center justify-between p-3 border-t border-atlas-border bg-atlas-elevated/40 text-xs font-mono">
              <span className="text-atlas-textMuted">
                Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, reviewsData.total)} of {reviewsData.total} cases
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                  className="h-7 px-2"
                >
                  Prev
                </Button>
                <span className="text-atlas-textPrimary font-bold">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                  className="h-7 px-2"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Case Audit Drawer / Modal */}
      {selectedCaseId && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-atlas-surface border border-atlas-border rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-atlas-border pb-3">
              <div>
                <span className="text-xs font-mono text-atlas-cyan font-bold block">
                  REVIEW AUDIT DOSSIER
                </span>
                <h3 className="text-lg font-bold font-mono text-atlas-textPrimary">
                  {selectedCaseId}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCaseId(null)}
                className="text-atlas-textMuted hover:text-atlas-textPrimary font-mono text-lg font-bold px-2"
              >
                &times;
              </button>
            </div>

            {isDetailLoading || !caseDetail ? (
              <div className="space-y-3 py-6">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <div className="space-y-4 text-xs font-mono">
                {/* Meta Summary Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-atlas-elevated p-3 rounded-xl border border-atlas-border">
                  <div>
                    <span className="text-atlas-textMuted block text-[10px]">TRANSACTION ID</span>
                    <span className="text-atlas-cyan font-bold">{caseDetail.transaction_id}</span>
                  </div>
                  <div>
                    <span className="text-atlas-textMuted block text-[10px]">PARCEL ID</span>
                    <span className="text-atlas-textPrimary font-bold">{caseDetail.parcel_id}</span>
                  </div>
                  <div>
                    <span className="text-atlas-textMuted block text-[10px]">SCENARIO</span>
                    <span className="text-amber-400 font-bold">{caseDetail.flagged_scenario}</span>
                  </div>
                  <div>
                    <span className="text-atlas-textMuted block text-[10px]">CURRENT STATUS</span>
                    {getStatusBadge(caseDetail.review_status)}
                  </div>
                </div>

                {/* Transaction Snapshot */}
                {caseDetail.transaction_details && (
                  <div className="p-3 bg-atlas-elevated/40 rounded-xl border border-atlas-border space-y-2">
                    <span className="text-[11px] font-bold text-atlas-textPrimary flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-atlas-cyan" />
                      Transaction Verification Record
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-atlas-textMuted">
                      <div>Sale Area: <b className="text-atlas-textPrimary">{caseDetail.transaction_details.sale_area_acres} acres</b></div>
                      <div>Claimed Share: <b className="text-atlas-textPrimary">{caseDetail.transaction_details.claimed_share}</b></div>
                      <div>Seller: <b className="text-atlas-textPrimary">{caseDetail.transaction_details.seller_alias}</b></div>
                      <div>Buyer: <b className="text-atlas-textPrimary">{caseDetail.transaction_details.buyer_alias}</b></div>
                      <div>Date: <b className="text-atlas-textPrimary">{caseDetail.transaction_details.transaction_date}</b></div>
                      <div>Registered: <b className="text-atlas-textPrimary">{caseDetail.transaction_details.registered ? 'YES' : 'NO'}</b></div>
                    </div>
                  </div>
                )}

                {/* Audit Mutation Form */}
                <form onSubmit={handleSaveReview} className="space-y-3 pt-2 border-t border-atlas-border">
                  <span className="text-xs font-bold text-atlas-textPrimary block">
                    Record Auditor Resolution (Persistent Mutation)
                  </span>

                  <div>
                    <label className="text-atlas-textMuted block mb-1">New Review Status:</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full bg-atlas-elevated border border-atlas-border rounded-xl px-3 py-2 text-atlas-textPrimary focus:outline-none focus:border-atlas-cyan font-mono"
                    >
                      <option value="UNREVIEWED">UNREVIEWED</option>
                      <option value="IN_REVIEW">IN_REVIEW (Auditor Investigation In Progress)</option>
                      <option value="APPROVED_VALID">APPROVED_VALID (Chain of Title Verified)</option>
                      <option value="FLAGGED_DISPUTE">FLAGGED_DISPUTE (Cadastral Overlap Confirmed)</option>
                      <option value="REJECTED">REJECTED (Deed Cancelled / Void)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-atlas-textMuted block mb-1">Reviewer Forensic Notes:</label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Enter legal findings, registry verification details, or auditor commentary..."
                      className="w-full bg-atlas-elevated border border-atlas-border rounded-xl p-3 text-atlas-textPrimary focus:outline-none focus:border-atlas-cyan font-mono"
                    />
                  </div>

                  {actionError && (
                    <div className="p-2.5 rounded-xl bg-red-950/30 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{actionError}</span>
                    </div>
                  )}

                  {actionSuccess && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{actionSuccess}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/assess/${caseDetail.transaction_id}`)}
                      leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                    >
                      Full Assessment
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCaseId(null)}
                      >
                        Close
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        isLoading={updateMutation.isPending}
                        leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
                      >
                        Save Auditor Decision
                      </Button>
                    </div>
                  </div>
                </form>

                {/* Audit Trail History */}
                {caseDetail.history && caseDetail.history.length > 0 && (
                  <div className="pt-3 border-t border-atlas-border space-y-2">
                    <span className="text-[11px] font-bold text-atlas-textMuted flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-atlas-cyan" />
                      Immutable Audit Log History ({caseDetail.history.length} records)
                    </span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {caseDetail.history.map((h) => (
                        <div
                          key={h.id}
                          className="p-2 bg-atlas-elevated/40 rounded-lg border border-atlas-border text-[10px] space-y-1"
                        >
                          <div className="flex items-center justify-between text-atlas-textMuted">
                            <span>Auditor: <b className="text-atlas-cyan">{h.changed_by}</b></span>
                            <span>{new Date(h.timestamp).toLocaleString()}</span>
                          </div>
                          <div>
                            Status transition: <span className="text-atlas-textMuted">{h.previous_status}</span> &rarr; <b className="text-emerald-400">{h.new_status}</b>
                          </div>
                          {h.notes && (
                            <p className="text-atlas-textPrimary italic">"{h.notes}"</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-atlas-surface border border-atlas-border rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-atlas-border pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-atlas-cyan" />
                <h3 className="text-sm font-bold font-mono text-atlas-textPrimary">
                  Reviewer Authentication
                </h3>
              </div>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-atlas-textMuted hover:text-atlas-textPrimary font-mono font-bold"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-atlas-textMuted font-mono">
              Sign in with institutional reviewer credentials to authorize case mutations.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                loginMutation.mutate();
              }}
              className="space-y-3 font-mono text-xs"
            >
              <div>
                <label className="text-atlas-textMuted block mb-1">Username</label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full bg-atlas-elevated border border-atlas-border rounded-xl px-3 py-2 text-atlas-textPrimary focus:outline-none focus:border-atlas-cyan"
                  required
                />
              </div>

              <div>
                <label className="text-atlas-textMuted block mb-1">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-atlas-elevated border border-atlas-border rounded-xl px-3 py-2 text-atlas-textPrimary focus:outline-none focus:border-atlas-cyan"
                  required
                />
              </div>

              {loginError && (
                <div className="p-2 rounded bg-red-950/30 border border-red-500/40 text-red-300 text-[11px]">
                  {loginError}
                </div>
              )}

              <div className="p-2.5 rounded-xl bg-atlas-elevated border border-atlas-border text-[11px] text-atlas-textMuted space-y-1">
                <span className="text-atlas-cyan font-bold block">Institutional Access Control:</span>
                <p>Authorized reviewer and administrator accounts are provisioned securely via host environment secrets.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLoginModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={loginMutation.isPending}
                >
                  Sign In
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
