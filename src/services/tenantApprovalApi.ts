import { getAuthToken } from '@/utils/tokenStorage';
import { API_BASE_URL, API_ENDPOINTS } from "@/constants/apiEndpoints"

export interface PageInfo {
  current_page: number;
  total_pages: number;
  page_limit: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  pageinfo?: PageInfo;
  type: string;
  status: number;
}

export interface TenantVerificationRequest {
  id: number;
  request_id: string;
  verification_method: "pin" | "manual";
  status: "pending" | "approved" | "rejected";
  tenant_full_name: string;
  tenant_email?: string;
  tenant_phone?: string;
  property_address?: string;
  property_code?: string;
  agent_landlord_name?: string;
  monthly_rent?: number;
  security_deposit?: number;
  tenancy_length_months?: number;
  move_in_date?: string;
  created_at: string;
  rejection_reason?: string;
  admin_notes?: string;
}

export interface AgentPin {
  id: number;
  pin_code: string;
  agent_name: string;
  property_address: string;
  property_id: number;
  max_uses: number;
  current_uses: number;
  is_active: boolean;
  expires_at?: string;
}

const getHeaders = () => {
  const token = getAuthToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};
export const tenantApprovalApi = {
  async validatePin(pin: string): Promise<ApiResponse<{ isValid: boolean; agentName?: string; propertyAddress?: string }>> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TENANT_VERIFICATION.VALIDATE_PIN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    return response.json();
  },

  
  async submitRequest(data: any): Promise<ApiResponse<TenantVerificationRequest>> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TENANT_VERIFICATION.SUBMIT_REQUEST}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getMyRequests(page = 1, limit = 10, status?: string): Promise<ApiResponse<TenantVerificationRequest[]>> {
    const query = new URLSearchParams({ page_no: page.toString(), limit: limit.toString() });
    if (status) query.append('status', status);
    
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TENANT_VERIFICATION.MY_REQUESTS}?${query}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },


  async approveRequest(requestId: number, notes?: string): Promise<ApiResponse<TenantVerificationRequest>> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TENANT_VERIFICATION.APPROVE(requestId)}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ notes }),
    });
    return response.json();
  },

  async rejectRequest(requestId: number, reason: string, notes?: string): Promise<ApiResponse<TenantVerificationRequest>> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TENANT_VERIFICATION.REJECT(requestId)}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reason, notes }),
    });
    return response.json();
  },

  async createPin(data: { propertyId: number; maxUses: number; expiresInHours: number }): Promise<ApiResponse<AgentPin>> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TENANT_VERIFICATION.CREATE_PIN}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getAgentPins(page = 1, limit = 10): Promise<ApiResponse<AgentPin[]>> {
    const query = new URLSearchParams({ page_no: page.toString(), limit: limit.toString() });
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TENANT_VERIFICATION.GET_PINS}?${query}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  // --- Admin Specific Functions ---
  async adminListRequests(page = 1, limit = 10): Promise<ApiResponse<TenantVerificationRequest[]>> {
    const query = new URLSearchParams({ page_no: page.toString(), limit: limit.toString() });
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.TENANT_VERIFICATION.LIST}?${query}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  async adminGetRequest(requestId: number): Promise<ApiResponse<TenantVerificationRequest>> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.TENANT_VERIFICATION.GET_ITEM(requestId)}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  async adminUpdateRequest(data: { id: number; status?: string; admin_notes?: string; rejection_reason?: string }): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.TENANT_VERIFICATION.UPDATE}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async adminDeleteRequest(requestId: number): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.TENANT_VERIFICATION.DELETE}`, {
      method: 'DELETE',
      headers: getHeaders(),
      body: JSON.stringify({ id: requestId }),
    });
    return response.json();
  },
};