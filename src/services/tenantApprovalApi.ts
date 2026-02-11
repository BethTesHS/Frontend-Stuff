const API_BASE_URL = 'https://homedapp1.azurewebsites.net/api/tenant-verification';

export interface TenantVerificationRequest {
  id: number;
  verification_method: string;
  tenant_full_name: string;
  tenant_email?: string;
  tenant_phone?: string;
  property_address?: string;
  property_code?: string;
  agent_landlord_name?: string;
  agent_landlord_email?: string;
  agent_landlord_phone?: string;
  monthly_rent?: number;
  security_deposit?: number;
  tenancy_length_months?: number;
  move_in_date?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  processed_at?: string;
  processed_by?: string;
  rejection_reason?: string;
  admin_notes?: string;
  tenancy_proof_filename?: string;
}

export interface TenantRequestsResponse {
  requests: TenantVerificationRequest[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export const tenantApprovalApi = {
  async getRequests(status?: string, page: number = 1, perPage: number = 50): Promise<TenantRequestsResponse> {
    console.log('tenantApprovalApi.getRequests called with:', { status, page, perPage });
    
    const token = localStorage.getItem('auth_token');
    console.log('Auth token found:', !!token);
    if (!token) {
      console.error('No authentication token found in localStorage');
      throw new Error('No authentication token found');
    }

    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (status) {
      params.append('status', status);
    }

    console.log('Making API request to:', `${API_BASE_URL}/requests?${params}`);

    const response = await fetch(`${API_BASE_URL}/requests?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('API response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`Failed to fetch requests: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('API result:', result);
    return result.data;
  },

  async approveRequest(requestId: number, notes?: string): Promise<{ success: boolean }> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/approve/${requestId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notes: notes || '' }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to approve request: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  },

  async rejectRequest(requestId: number, reason: string, notes?: string): Promise<{ success: boolean }> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/reject/${requestId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        reason: reason || 'Request did not meet verification requirements',
        notes: notes || '' 
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to reject request: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }
};