// ---------------------------------------------------------------------------
// LandGuard AI — Typed API Service Layer
// ---------------------------------------------------------------------------

import {
  HealthStatus,
  DashboardSummary,
  Transaction,
  TransactionListResponse,
  ParcelHistoryResponse,
  AssessmentResponse,
  TransactionQueryFilters,
  UserProfile,
  LoginResponse,
  ReviewCase,
  ReviewListResponse,
  ReviewQueryFilters,
  ReviewUpdateRequest,
  ReviewAuditLog,
  RMDAuditResponse,
  RMDParcelResponse
} from '../types/api';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
const TOKEN_KEY = 'landguard_auth_token';

export const authStorage = {
  getToken: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setToken: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // storage unavailable
    }
  },
  clearToken: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // storage unavailable
    }
  }
};

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public detail?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = authStorage.getToken();
  const authHeaders: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers,
      },
    });

    if (!res.ok) {
      let detailMsg = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errorData = await res.json();
        if (errorData && typeof errorData.detail === 'string') {
          detailMsg = errorData.detail;
        } else if (errorData && typeof errorData.detail === 'object') {
          detailMsg = JSON.stringify(errorData.detail);
        }
      } catch {
        // Fall back to HTTP status
      }
      throw new ApiError(detailMsg, res.status, detailMsg);
    }

    return await res.json() as T;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : 'Unknown network failure';
    throw new ApiError(
      `Unable to connect to LandGuard API at ${API_BASE}. Ensure the FastAPI backend is running. Details: ${message}`,
      0,
      message
    );
  }
}

export const api = {
  getApiUrl: () => API_BASE,

  checkHealth: async (): Promise<HealthStatus> => {
    return request<HealthStatus>('/health');
  },

  getDashboardSummary: async (): Promise<DashboardSummary> => {
    return request<DashboardSummary>('/dashboard/summary');
  },

  getTransactions: async (filters: TransactionQueryFilters = {}): Promise<TransactionListResponse> => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.scenario) params.append('scenario', filters.scenario);
    if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
    if (filters.offset !== undefined) params.append('offset', filters.offset.toString());

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request<TransactionListResponse>(`/transactions${queryString}`);
  },

  getTransactionDetail: async (transactionId: string): Promise<Transaction> => {
    return request<Transaction>(`/transactions/${encodeURIComponent(transactionId)}`);
  },

  getParcelHistory: async (parcelId: string): Promise<ParcelHistoryResponse> => {
    return request<ParcelHistoryResponse>(`/parcels/${encodeURIComponent(parcelId)}/history`);
  },

  getAssessment: async (transactionId: string, asOfDate?: string): Promise<AssessmentResponse> => {
    const params = asOfDate ? `?as_of_date=${encodeURIComponent(asOfDate)}` : '';
    return request<AssessmentResponse>(`/assess/${encodeURIComponent(transactionId)}${params}`);
  },

  // -------------------------------------------------------------------------
  // Stage 4 — Authentication & RBAC
  // -------------------------------------------------------------------------
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const res = await request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    if (res.token) {
      authStorage.setToken(res.token);
    }
    return res;
  },

  logout: async (): Promise<void> => {
    try {
      await request<{ status: string }>('/api/auth/logout', { method: 'POST' });
    } finally {
      authStorage.clearToken();
    }
  },

  getMe: async (): Promise<UserProfile> => {
    return request<UserProfile>('/api/auth/me');
  },

  // -------------------------------------------------------------------------
  // Stage 4 — Persistent Review Case Workspace
  // -------------------------------------------------------------------------
  getReviews: async (filters: ReviewQueryFilters = {}): Promise<ReviewListResponse> => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.scenario) params.append('scenario', filters.scenario);
    if (filters.search) params.append('search', filters.search);
    if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
    if (filters.offset !== undefined) params.append('offset', filters.offset.toString());

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request<ReviewListResponse>(`/api/reviews${queryString}`);
  },

  getReviewDetail: async (caseId: string): Promise<ReviewCase> => {
    return request<ReviewCase>(`/api/reviews/${encodeURIComponent(caseId)}`);
  },

  updateReview: async (caseId: string, update: ReviewUpdateRequest): Promise<ReviewCase> => {
    return request<ReviewCase>(`/api/reviews/${encodeURIComponent(caseId)}`, {
      method: 'PATCH',
      body: JSON.stringify(update)
    });
  },

  getReviewHistory: async (caseId: string): Promise<ReviewAuditLog[]> => {
    return request<ReviewAuditLog[]>(`/api/reviews/${encodeURIComponent(caseId)}/history`);
  },

  // -------------------------------------------------------------------------
  // Stage 4 — Real Downloadable Assessment PDF Report
  // -------------------------------------------------------------------------
  getAssessmentPdfUrl: (transactionId: string, asOfDate?: string): string => {
    const params = asOfDate ? `?as_of_date=${encodeURIComponent(asOfDate)}` : '';
    return `${API_BASE}/api/reports/assessment/${encodeURIComponent(transactionId)}${params}`;
  },

  downloadAssessmentPdf: async (transactionId: string, asOfDate?: string): Promise<void> => {
    const url = api.getAssessmentPdfUrl(transactionId, asOfDate);
    const token = authStorage.getToken();
    const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new ApiError(`Failed to download PDF report: ${res.statusText}`, res.status);
    }
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `LandGuard_Assessment_${transactionId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  },

  // -------------------------------------------------------------------------
  // RMD (Record Mutation Deed / Discrepancy) Triangulation Audit
  // -------------------------------------------------------------------------
  getRMDAudit: async (transactionId: string): Promise<RMDAuditResponse> => {
    return request<RMDAuditResponse>(`/api/rmd/audit/${encodeURIComponent(transactionId)}`);
  },

  getRMDParcel: async (parcelId: string): Promise<RMDParcelResponse> => {
    return request<RMDParcelResponse>(`/api/rmd/parcel/${encodeURIComponent(parcelId)}`);
  }
};
