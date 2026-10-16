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

export interface UserProfile {
  username: string;
  role: 'admin' | 'reviewer' | 'viewer';
  authenticated: boolean;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
  expires_at: string;
}

export interface RegisterPayload {
  name?: string;
  username: string;
  email?: string;
  role?: string;
  password: string;
  confirm_password?: string;
}

export interface ReviewAuditLog {
  id: number;
  case_id: string;
  previous_status: string;
  new_status: string;
  changed_by: string;
  notes: string;
  timestamp: string;
}

export interface ReviewCase {
  case_id: string;
  transaction_id: string;
  parcel_id: string;
  flagged_scenario: string;
  review_status: 'UNREVIEWED' | 'IN_REVIEW' | 'APPROVED_VALID' | 'FLAGGED_DISPUTE' | 'REJECTED';
  reviewer_notes?: string;
  assigned_reviewer?: string;
  created_at: string;
  updated_at: string;
  transaction_details?: Transaction;
  history?: ReviewAuditLog[];
}

export interface ReviewListResponse {
  total: number;
  limit: number;
  offset: number;
  items: ReviewCase[];
}

export interface ReviewQueryFilters {
  status?: string;
  scenario?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ReviewUpdateRequest {
  status?: string;
  reviewer_notes?: string;
  notes?: string;
  assigned_reviewer?: string;
}

// ---------------------------------------------------------------------------
// RMD (Record Mutation Deed / Discrepancy) Interfaces
// ---------------------------------------------------------------------------
export interface RMDPillarKhatian {
  khatian_no?: string;
  dag_no?: string;
  district?: string;
  upazila?: string;
  mouza?: string;
  jl_no?: string;
  total_area_acres?: number;
  recorded_owners: string[];
  status: string;
}

export interface RMDPillarDeed {
  transaction_id: string;
  transaction_date: string;
  seller_alias: string;
  buyer_alias: string;
  sale_area_acres: number;
  registered: boolean;
  claimed_share?: number;
}

export interface RMDPillarMutation {
  records_count: number;
  records: Array<{
    mutation_id?: string;
    transaction_id?: string;
    parcel_id?: string;
    record_consistency?: string;
    status?: string;
  }>;
  has_mutation: boolean;
  consistency: string;
}

export interface RMDDiscrepancy {
  code: string;
  pillar: string;
  message_en: string;
  message_bn: string;
}

export interface RMDAuditResponse {
  transaction_id: string;
  parcel_id: string;
  audit_timestamp: string;
  rmd_status: 'RMD_ALIGNED' | 'RMD_CHAIN_DISCREPANCY' | 'RMD_MUTATION_MISSING' | 'RMD_AREA_OVERCLAIM' | 'RMD_UNRESOLVED_TRANSFER';
  rmd_status_bn: string;
  risk_severity: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendation_bn: string;
  discrepancies: RMDDiscrepancy[];
  pillars: {
    khatian: RMDPillarKhatian;
    deed: RMDPillarDeed;
    mutation: RMDPillarMutation;
  };
  disclaimer: string;
}

export interface RMDParcelResponse {
  parcel_id: string;
  parcel_meta: Record<string, any>;
  transactions_count: number;
  overall_rmd_health: 'DISCREPANCIES_DETECTED' | 'ALIGNED_OR_REVIEW';
  audits: RMDAuditResponse[];
  disclaimer: string;
}

