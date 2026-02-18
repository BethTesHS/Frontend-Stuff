import { getAuthToken } from '@/utils/tokenStorage';

const API_BASE_URL = 'https://homedapp1.azurewebsites.net/api/external-tenant-complaints';

// API response types
interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface PaginationInfo {
  total: number;
  pages: number;
  current_page: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ExternalTenantComplaint {
  id: number;
  tenant_profile_id: number;
  tenant_id: string;
  tenant_name: string;
  tenant_email: string;
  house_number: string;
  issue_type: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: number;
  ticket_number: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  resolved_by?: string;
  resolution_description?: string;
  rating_score?: number;
  rating_review?: string;
  rated_at?: string;
  images?: ComplaintImage[];
  notes?: ComplaintNote[];
  status_history?: ComplaintStatusHistory[];
}

export interface ComplaintImage {
  id: number;
  complaint_id: number;
  filename: string;
  url: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export interface ComplaintNote {
  id: number;
  complaint_id: number;
  note: string;
  added_by: string;
  added_by_type: 'tenant' | 'landlord' | 'agent';
  is_internal: boolean;
  created_at: string;
}

export interface ComplaintStatusHistory {
  id: number;
  complaint_id: number;
  old_status?: string;
  new_status: string;
  changed_by: string;
  changed_by_type: 'tenant' | 'landlord' | 'agent';
  change_reason?: string;
  created_at: string;
}

export interface ComplaintStats {
  total_complaints: number;
  open_complaints: number;
  in_progress_complaints: number;
  resolved_complaints: number;
  resolution_rate: number;
  average_rating?: number;
  rated_complaints_count: number;
}

export interface ComplaintDashboardSummary {
  summary: ComplaintStats;
  recent_complaints: ExternalTenantComplaint[];
  has_active_complaints: boolean;
}

// HTTP client helper
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: Record<string, string> = {};
  
  // Only set Content-Type for non-FormData requests
  const isFormData = options.body instanceof FormData;
  if (!isFormData) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  // Add auth token if available
  const token = getAuthToken();
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    console.log(`Making external tenant complaints API request to: ${url}`, config);
    const response = await fetch(url, config);
    const data = await response.json();
    
    console.log(`External tenant complaints API response from ${endpoint}:`, { status: response.status, data });

    if (!response.ok) {
      const errorMessage = data.error || data.message || `HTTP ${response.status}: Request failed`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('External tenant complaints API request error:', error);
    throw error;
  }
};

// External Tenant Complaints API functions
export const externalTenantComplaintsApi = {
  // Submit a new complaint
  submitComplaint: async (complaintData: {
    issue_type: string;
    description: string;
    urgency?: string;
    additional_notes?: string;
  }): Promise<ApiResponse<{
    complaint: ExternalTenantComplaint;
    ticket_number: string;
    estimated_response_time: string;
    landlord_notified: boolean;
    confirmation_sent: boolean;
  }>> => {
    return apiRequest('/submit', {
      method: 'POST',
      body: JSON.stringify(complaintData),
    });
  },

  // Get all complaints for current external tenant
  getComplaints: async (params: {
    page?: number;
    per_page?: number;
    status?: string;
    issue_type?: string;
  } = {}): Promise<ApiResponse<{
    complaints: ExternalTenantComplaint[];
    pagination: PaginationInfo;
    summary: {
      total_complaints: number;
      open_complaints: number;
      resolved_complaints: number;
    };
  }>> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.per_page) queryParams.set('per_page', params.per_page.toString());
    if (params.status) queryParams.set('status', params.status);
    if (params.issue_type) queryParams.set('issue_type', params.issue_type);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/list?${queryString}` : '/list';
    return apiRequest(endpoint);
  },

  // Get detailed information about a specific complaint
  getComplaintDetails: async (complaintId: number): Promise<ApiResponse<{
    complaint: ExternalTenantComplaint;
    images: ComplaintImage[];
    notes: ComplaintNote[];
    status_history: ComplaintStatusHistory[];
    landlord_info: {
      name: string;
      email: string;
      phone: string;
    };
  }>> => {
    return apiRequest(`/${complaintId}`);
  },

  // Add a note to a complaint
  addComplaintNote: async (complaintId: number, note: string): Promise<ApiResponse<{
    note: ComplaintNote;
  }>> => {
    return apiRequest(`/${complaintId}/add-note`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  },

  // Upload an image for a complaint
  uploadComplaintImage: async (complaintId: number, imageFile: File): Promise<ApiResponse<{
    image: ComplaintImage;
  }>> => {
    const formData = new FormData();
    formData.append('image', imageFile);

    return apiRequest(`/${complaintId}/upload-image`, {
      method: 'POST',
      body: formData,
    });
  },

  // Rate the resolution of a complaint
  rateComplaintResolution: async (complaintId: number, rating_score: number, rating_review?: string): Promise<ApiResponse<{
    rating_score: number;
    rating_review: string;
    rated_at: string;
  }>> => {
    return apiRequest(`/${complaintId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating_score, rating_review }),
    });
  },

  // Get complaints summary for dashboard
  getDashboardSummary: async (): Promise<ApiResponse<ComplaintDashboardSummary>> => {
    return apiRequest('/dashboard-summary');
  },
};

export default externalTenantComplaintsApi;