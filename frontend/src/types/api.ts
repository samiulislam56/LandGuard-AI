// ---------------------------------------------------------------------------
// LandGuard AI — Strict API Contract Types
// ---------------------------------------------------------------------------

export interface HealthStatus {
  status: string;
  models_loaded: number;
  datasets_loaded: number;
}

export interface ScenarioCounts {
  normal?: number;
  owner_mismatch?: number;
  area_mismatch?: number;
  mutation_mismatch?: number;
  incomplete?: number;
  document_tamper?: number;
  conflicting_sale?: number;
  legitimate_resale?: number;
  [key: string]: number | undefined;
}

export interface DashboardSummary {
  parcels: number;
  transactions: number;
  review_cases: number;
  multiple_transaction_parcels: number;
  scenario_counts: ScenarioCounts;
  data_origin: string;
}

export interface Transaction {
  transaction_id: string;
  parcel_id: string;
  transaction_date: string;
  seller_alias: string;
  buyer_alias: string;
  sale_area_acres: number;
  claimed_share: number;
  registered: number;
  prior_transaction_exists: number;
  legitimate_resale_evidence: number;
  seller_owner_mismatch: number;
  area_mismatch: number;
  mutation_mismatch: number;
  document_hash_mismatch: number;
  overlapping_claim: number;
  missing_evidence: number;
  scenario: string;
  data_origin: string;
}

export interface TransactionListResponse {
  total: number;
  limit: number;
  offset: number;
  items: Transaction[];
}

export interface ParcelDetail {
  parcel_id: string;
  district: string;
  upazila: string;
  mouza: string;
  jl_no: string;
  dag_no: number;
  khatian_no: number;
  total_area_acres: number;
  data_origin: string;
}

export interface ParcelHistoryResponse {
  parcel: ParcelDetail;
  total_transactions: number;
  transactions: Transaction[];
}

export interface EvidenceVerification {
  status: 'REVIEW_REQUIRED' | 'INSUFFICIENT_EVIDENCE' | 'NO_REVIEW_FLAG_DETECTED';
  findings: string[];
  warnings: string[];
  evidence: {
    parcel_area_acres?: number;
    sale_area_acres?: number;
    previous_transaction_ids?: string[];
    [key: string]: unknown;
  };
}

export interface AssessmentResponse {
  transaction_id: string;
  parcel_id: string;
  assessment_date: string;
  final_status: 'REVIEW_REQUIRED' | 'INSUFFICIENT_EVIDENCE' | 'PENDING_DATE_VERIFICATION' | 'NO_REVIEW_FLAG_DETECTED';
  random_forest: {
    prediction: string;
  };
  isolation_forest: {
    status: 'ANOMALY' | 'NORMAL_PATTERN';
    decision_score: number;
  };
  evidence_verification: EvidenceVerification;
  human_review_recommended: boolean;
  disclaimer: string;
}

export interface TransactionQueryFilters {
  search?: string;
  scenario?: string;
  limit?: number;
  offset?: number;
}
