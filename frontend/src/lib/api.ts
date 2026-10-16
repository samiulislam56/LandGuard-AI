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
  TransactionQueryFilters
} from '../types/api';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

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
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
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
  }
};
