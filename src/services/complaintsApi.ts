import { tokenStorage, getAuthToken, setAuthToken, getRefreshToken, setRefreshToken } from '@/utils/tokenStorage';

const API_BASE_URL = 'https://homedapp1.azurewebsites.net/api';


interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
  complaints?: T;
  complaint?: T;
  stats?: any;
  pagination?: PaginationInfo;
  image?: any;
  note?: any;
}

interface PaginationInfo {
  page: number;
  pages: number;
  per_page: number;
  total: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface Complaint {
  id: number;
  tenant_id: string;
  tenant_name: string;
  tenant_email: string;
  house_number: string;
  issue_type: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  agent_id?: string;
  priority: number;
  ticket_number: string;
  created_at: string;
  updated_at: string;
  assigned_at?: string;
  resolved_at?: string;
  resolved_by?: string;
  resolution_description?: string;
  rating_score?: number;
  rating_review?: string;
  rated_at?: string;
  images?: ComplaintImage[];
  notes?: ComplaintNote[];
}

export interface ComplaintImage {
  id: number;
  complaint_id: number;
  filename: string;
  url: string;
  created_at: string;
}

export interface ComplaintNote {
  id: number;
  complaint_id: number;
  note: string;
  added_by: string;
  created_at: string;
}

export interface ComplaintStats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  closed?: number;
  urgent?: number;
  unassigned?: number;
}


const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry: boolean = false
): Promise<ApiResponse<T>> => {
  const url = `${API_BASE_URL}${endpoint}`;


  const defaultHeaders: Record<string, string> = {};


  const isFormData = options.body instanceof FormData;
  if (!isFormData) {
    defaultHeaders['Content-Type'] = 'application/json';
  }


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
    console.log(`Making complaints API request to: ${url}`, config);
    const response = await fetch(url, config);
    const data = await response.json();

    console.log(`Complaints API response from ${endpoint}:`, { status: response.status, data });

    if (!response.ok) {
      // Handle token expiration with automatic refresh attempt
      const isTokenError = response.status === 401 && !isRetry && endpoint !== '/auth/refresh';
      const errorMsg = data.msg || data.message || data.error || '';
      const isExpiredToken = errorMsg.toLowerCase().includes('expired') ||
                             errorMsg.toLowerCase().includes('invalid') ||
                             errorMsg.toLowerCase().includes('token');

      if (isTokenError && isExpiredToken) {
        console.log('Token error in complaints API, attempting to refresh...', { errorMsg });

        try {
          // Attempt to refresh the token
          const refreshTokenValue = getRefreshToken();
          if (refreshTokenValue) {
            const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${refreshTokenValue}`,
              },
            });

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              if (refreshData.success && refreshData.data) {
                // Update tokens
                setAuthToken(refreshData.data.access_token);
                if (refreshData.data.refresh_token) {
                  setRefreshToken(refreshData.data.refresh_token);
                }

                console.log('Token refreshed successfully, retrying complaints API request');
                // Retry the original request with new token
                return apiRequest(endpoint, options, true);
              }
            }
          }

          console.log('Token refresh failed in complaints API, clearing auth data');
          tokenStorage.removeItem('auth_token');
          tokenStorage.removeItem('refresh_token');
          tokenStorage.removeItem('homedUser');
          window.location.href = '/login';
          throw new Error('Session expired. Please log in again.');
        } catch (refreshError) {
          console.error('Token refresh error in complaints API:', refreshError);
          tokenStorage.removeItem('auth_token');
          tokenStorage.removeItem('refresh_token');
          tokenStorage.removeItem('homedUser');
          window.location.href = '/login';
          throw new Error('Session expired. Please log in again.');
        }
      }

      const errorMessage = data.error || data.message || `HTTP ${response.status}: Request failed`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('Complaints API request error:', error);
    throw error;
  }
};


export const complaintsApi = {
 
  createComplaint: async (complaintData: {
    tenantName: string;
    tenantEmail: string;
    houseNumber: string;
    issueType: string;
    description: string;
    urgency?: string;
  }): Promise<ApiResponse<Complaint>> => {
    return apiRequest('/complaints', {
      method: 'POST',
      body: JSON.stringify(complaintData),
    });
  },

  
  uploadComplaintImage: async (complaintId: number, imageFile: File): Promise<ApiResponse<ComplaintImage>> => {
    const formData = new FormData();
    formData.append('image', imageFile);

    return apiRequest(`/complaints/upload-image/${complaintId}`, {
      method: 'POST',
      body: formData,
    });
  },

  
  getMyComplaints: async (params: {
    page?: number;
    per_page?: number;
    status?: string;
  } = {}): Promise<ApiResponse<{
    complaints: Complaint[];
    pagination: PaginationInfo;
    stats: ComplaintStats;
  }>> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.per_page) queryParams.set('per_page', params.per_page.toString());
    if (params.status) queryParams.set('status', params.status);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/complaints/my-complaints?${queryString}` : '/complaints/my-complaints';
    return apiRequest(endpoint);
  },

  // Get complaints for agent dashboard
  getAgentComplaints: async (params: {
    page?: number;
    per_page?: number;
    status?: string;
    urgency?: string;
    assigned_to_me?: boolean;
  } = {}): Promise<ApiResponse<{
    complaints: Complaint[];
    pagination: PaginationInfo;
    stats: ComplaintStats;
  }>> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.per_page) queryParams.set('per_page', params.per_page.toString());
    if (params.status) queryParams.set('status', params.status);
    if (params.urgency) queryParams.set('urgency', params.urgency);
    if (params.assigned_to_me !== undefined) queryParams.set('assigned_to_me', params.assigned_to_me.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/complaints/agent-dashboard?${queryString}` : '/complaints/agent-dashboard';
    return apiRequest(endpoint);
  },

  // Get complaint details
  getComplaintDetails: async (complaintId: number): Promise<ApiResponse<Complaint>> => {
    return apiRequest(`/complaints/${complaintId}`);
  },

  // Update complaint status (agents only)
  updateComplaintStatus: async (complaintId: number, status: string, resolutionDescription?: string): Promise<ApiResponse<Complaint>> => {
    return apiRequest(`/complaints/${complaintId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ 
        status, 
        resolutionDescription 
      }),
    });
  },

  // Assign complaint to agent
  assignComplaint: async (complaintId: number, agentId?: string): Promise<ApiResponse<Complaint>> => {
    return apiRequest(`/complaints/${complaintId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ agentId }),
    });
  },

  // Add note to complaint
  addComplaintNote: async (complaintId: number, note: string): Promise<ApiResponse<ComplaintNote>> => {
    return apiRequest(`/complaints/${complaintId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  },

  // Rate a resolved complaint (tenants only)
  rateComplaint: async (complaintId: number, score: number, review?: string): Promise<ApiResponse<Complaint>> => {
    return apiRequest(`/complaints/${complaintId}/rating`, {
      method: 'POST',
      body: JSON.stringify({ score, review }),
    });
  },

  
};

export default complaintsApi;