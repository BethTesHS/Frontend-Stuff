import { getAuthToken } from '@/utils/tokenStorage';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://api.homeduk.property';

export type EOTStatus =
  | 'NOTICE_SENT'
  | 'ACKNOWLEDGED'
  | 'INSPECTION_SET'
  | 'DEPOSIT_REFUND'
  | 'COMPLETED';

export interface EOTRecord {
  id: number;
  eot_id: string;
  ticket_number: string;
  status: EOTStatus;
  move_out_date: string | null;
  notice_reason: string | null;
  required_notice_days: number;
  property_address: string | null;
  postcode: string | null;
  landlord_name: string | null;
  inspection_date: string | null;
  landlord_notes: string | null;
  reschedule_requested: boolean;
  reschedule_requested_date: string | null;
  // Inspection completion & damage
  inspection_completed_at: string | null;
  damage_reported: boolean;
  damage_description: string | null;
  repair_contractor_name: string | null;
  repair_quotation_url: string | null;
  repair_quotation_filename: string | null;
  repair_cost: number | null;
  deposit_amount: number | null;
  deposit_deduction: number | null;
  deposit_refund_amount: number | null;
  tenant_agreed_damage: boolean;
  tenant_agreed_damage_at: string | null;
  // Deposit refund
  deposit_refund_confirmed: boolean;
  deposit_refund_confirmed_at: string | null;
  // Review
  review_submitted: boolean;
  landlord_rating: number | null;
  landlord_review: string | null;
  property_rating: number | null;
  property_review: string | null;
  review_submitted_at: string | null;
  // Timestamps
  notice_submitted_at: string | null;
  acknowledged_at: string | null;
  inspection_set_at: string | null;
  completed_at: string | null;
  created_at: string | null;
  // Landlord view extras
  can_acknowledge?: boolean;
  can_set_inspection?: boolean;
  can_complete_inspection?: boolean;
  can_complete?: boolean;
  reschedule_pending?: boolean;
}

interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ── Authenticated tenant requests ─────────────────────────────────────────────

const tenantRequest = async <T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getAuthToken();
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {};
  if (!isFormData) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
  return data;
};

// ── Token-based landlord requests (no auth) ───────────────────────────────────

const landlordRequest = async <T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
  return data;
};

const landlordRequestFormData = async <T>(
  path: string,
  formData: FormData
): Promise<ApiResponse<T>> => {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
  return data;
};

// ── Tenant API ────────────────────────────────────────────────────────────────

export const extEOTApi = {
  /** Get the current end-of-tenancy status for the logged-in external tenant. */
  getStatus: (): Promise<ApiResponse<EOTRecord | null>> =>
    tenantRequest('/ext-eot/status'),

  /** Submit a notice to vacate. */
  submitNotice: (data: { move_out_date: string; reason?: string }): Promise<ApiResponse<EOTRecord>> =>
    tenantRequest('/ext-eot/notice', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** Request an inspection reschedule. */
  requestReschedule: (requested_date: string): Promise<ApiResponse<EOTRecord>> =>
    tenantRequest('/ext-eot/reschedule', {
      method: 'PATCH',
      body: JSON.stringify({ requested_date }),
    }),

  /** Agree to the repair cost deduction from deposit (only when damage has been reported). */
  agreeToRepairCost: (): Promise<ApiResponse<EOTRecord>> =>
    tenantRequest('/ext-eot/agree-damage', { method: 'PATCH' }),

  /** Confirm deposit has been refunded and complete the tenancy. */
  confirmDepositRefund: (): Promise<ApiResponse<EOTRecord>> =>
    tenantRequest('/ext-eot/confirm-deposit-refund', { method: 'PATCH' }),

  /** Submit end-of-tenancy review (only available once status = COMPLETED). */
  submitReview: (data: {
    landlord_rating: number;
    landlord_review?: string;
    property_rating: number;
    property_review?: string;
  }): Promise<ApiResponse<EOTRecord>> =>
    tenantRequest('/ext-eot/review', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ── Landlord token-based API (no login) ───────────────────────────────────────

export const landlordEOTApi = {
  /** View EOT details via unique token (from email link). */
  getEOT: (token: string): Promise<ApiResponse<EOTRecord>> =>
    landlordRequest(`/ext-eot/landlord/${token}`),

  /** Acknowledge the notice to vacate. */
  acknowledge: (token: string, notes?: string): Promise<ApiResponse<EOTRecord>> =>
    landlordRequest(`/ext-eot/landlord/${token}/acknowledge`, {
      method: 'PATCH',
      body: JSON.stringify({ notes: notes || null }),
    }),

  /** Set the exit inspection date. */
  setInspection: (token: string, inspection_date: string, notes?: string): Promise<ApiResponse<EOTRecord>> =>
    landlordRequest(`/ext-eot/landlord/${token}/inspection`, {
      method: 'PATCH',
      body: JSON.stringify({ inspection_date, notes: notes || null }),
    }),

  /** Mark inspection as complete — optionally report damage with quotation details. */
  completeInspection: (
    token: string,
    data: {
      damage_reported: boolean;
      damage_description?: string;
      repair_contractor_name?: string;
      repair_cost?: number;
      deposit_amount?: number;
      quotation_url?: string;
      quotation_filename?: string;
      notes?: string;
    }
  ): Promise<ApiResponse<EOTRecord>> =>
    landlordRequest(`/ext-eot/landlord/${token}/complete-inspection`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  /** Upload a repair quotation document. Returns { quotation_url, quotation_filename }. */
  uploadQuotation: (
    token: string,
    file: File
  ): Promise<ApiResponse<{ quotation_url: string; quotation_filename: string }>> => {
    const formData = new FormData();
    formData.append('file', file);
    return landlordRequestFormData(`/ext-eot/landlord/${token}/upload-quotation`, formData);
  },
};
