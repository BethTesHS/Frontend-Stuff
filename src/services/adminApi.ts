import { API_BASE_URL, API_ENDPOINTS } from '../constants/apiEndpoints';

interface AdminLoginRequest {
  username: string;
  password: string;
  secret?: string;
}

interface AdminLoginResponse {
  success: boolean;
  message: string;
  token: string;
  admin: AdminProfile;
  session_id: string;
}

interface AdminProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login_at: string;
  login_count: number;
}

interface AdminSession {
  id: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
  logged_out_at: string | null;
  is_current: boolean;
}

interface AdminStats {
  pending_verifications: number;
  unread_messages: number;
  total_users: number;
  active_properties: number;
  total_admins: number;
  active_sessions: number;
}

interface AdminStatsResponse {
  success: boolean;
  stats: AdminStats;
  recent_activity: {
    recent_logins: number;
    today_logins: number;
  };
  generated_at: string;
}

class AdminApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('admin_token');
    console.log(' Admin token from localStorage:', token ? `${token.substring(0, 20)}...` : 'null');
    
    if (!token) {
      console.error(' No admin token found in localStorage');
      throw new Error('No admin token available');
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    console.log('Authorization header being sent:', headers.Authorization.substring(0, 30) + '...');
    return headers;
  }

  async login(credentials: AdminLoginRequest): Promise<AdminLoginResponse> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    return {
      ...data,
      admin: data.admin || data.user,
    };
  }

  async getProfile(): Promise<{ admin: AdminProfile; recent_sessions: AdminSession[] }> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.PROFILE}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get profile');
    }

    const data = await response.json();
    return {
      admin: data.admin,
      recent_sessions: data.recent_sessions
    };
  }

  async getAdminDetails(): Promise<{ admin: AdminProfile; recent_sessions: AdminSession[] }> {
    const token = localStorage.getItem('admin_token');

    if (!token) {
      throw new Error('No admin token found');
    }

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.PROFILE}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_profile');
        throw new Error('Session expired. Please login again.');
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch admin details');
    }

    const data = await response.json();

    // Update localStorage with fresh data
    if (data.admin) {
      localStorage.setItem('admin_profile', JSON.stringify(data.admin));
    }

    return {
      admin: data.admin,
      recent_sessions: data.recent_sessions
    };
  }

  async getStats(): Promise<AdminStatsResponse> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.STATS}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      console.error('Stats API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: `${API_BASE_URL}${API_ENDPOINTS.ADMIN.STATS}`
      });
      
      try {
        const errorData = await response.json();
        console.error('Stats error details:', errorData);
        throw new Error(errorData.error?.message || errorData.message || 'Failed to get stats');
      } catch (jsonError) {
        // If JSON parsing fails, throw a simpler error
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }

    return response.json();
  }

  async logout(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.LOGOUT}`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Logout failed');
    }
  }

  async getSessions(): Promise<AdminSession[]> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.SESSIONS}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get sessions');
    }

    const data = await response.json();
    return data.sessions;
  }

  async revokeSession(sessionId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.REVOKE_SESSION(sessionId)}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to revoke session');
    }
  }

  // Messaging endpoints for admin
  async getDashboardMessages(params: {
    page?: number;
    limit?: number;
    unread_only?: boolean;
  } = {}): Promise<{
    success: boolean;
    messages: any[];
    pagination: any;
    stats: any;
  }> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.unread_only) queryParams.set('unread_only', params.unread_only.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString 
      ? `${API_ENDPOINTS.ADMIN.DASHBOARD_MESSAGES}?${queryString}`
      : API_ENDPOINTS.ADMIN.DASHBOARD_MESSAGES;
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch dashboard messages');
    }

    return response.json();
  }

  async getDashboardConversations(params: {
    limit?: number;
    status?: string;
  } = {}): Promise<{
    success: boolean;
    conversations: any[];
  }> {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.status) queryParams.set('status', params.status);
    
    const queryString = queryParams.toString();
    const endpoint = queryString 
      ? `${API_ENDPOINTS.ADMIN.DASHBOARD_CONVERSATIONS}?${queryString}`
      : API_ENDPOINTS.ADMIN.DASHBOARD_CONVERSATIONS;
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch dashboard conversations');
    }

    return response.json();
  }

  async getDashboardSummary(): Promise<{
    success: boolean;
    summary: {
      total_conversations: number;
      open_conversations: number;
      pending_conversations: number;
      closed_conversations: number;
      unread_messages: number;
      messages_today: number;
      messages_this_week: number;
      active_conversations: number;
      most_active_conversation?: any;
    };
  }> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.DASHBOARD_SUMMARY}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch dashboard summary');
    }

    return response.json();
  }

  async getConversations(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {}): Promise<{
    success: boolean;
    conversations: any[];
    total: number;
    page: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  }> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.status) queryParams.set('status', params.status);
    if (params.search) queryParams.set('search', params.search);
    
    const queryString = queryParams.toString();
    const endpoint = queryString 
      ? `${API_ENDPOINTS.ADMIN.DASHBOARD_CONVERSATIONS}?${queryString}`
      : API_ENDPOINTS.ADMIN.DASHBOARD_CONVERSATIONS;
    
    console.log('Admin API calling endpoint:', `${API_BASE_URL}${endpoint}`);
    console.log('Admin API headers:', this.getAuthHeaders());
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        url: `${API_BASE_URL}${endpoint}`
      });
      
      try {
        const errorData = await response.json();
        console.error('Error details:', errorData);
        throw new Error(errorData.error?.message || errorData.message || 'Failed to fetch conversations');
      } catch (jsonError) {
        // If JSON parsing fails, throw a simpler error
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }

    return response.json();
  }

  async getConversationMessages(
    conversationId: number,
    params: { page?: number; limit?: number } = {}
  ): Promise<{
    success: boolean;
    messages: any[];
    conversation: any;
    total: number;
    page: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  }> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString 
      ? `${API_ENDPOINTS.ADMIN.CONVERSATION_MESSAGES(conversationId)}?${queryString}`
      : API_ENDPOINTS.ADMIN.CONVERSATION_MESSAGES(conversationId);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch conversation messages');
    }

    return response.json();
  }

  async sendMessage(data: {
    conversation_id?: number;
    message_text?: string;
    subject?: string;
    attachment_url?: string;
    attachment_name?: string;
    attachment_size?: number;
    attachment_type?: string;
    metadata?: any;
  }): Promise<{ success: boolean; message: any }> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.SEND_MESSAGE}`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send message');
    }

    return response.json();
  }

  async updateConversationStatus(
    conversationId: number,
    status: 'open' | 'closed' | 'pending'
  ): Promise<{ success: boolean; conversation: any }> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.UPDATE_CONVERSATION_STATUS(conversationId)}`, {
      method: 'PUT',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update conversation status');
    }

    return response.json();
  }

  async uploadFile(file: File, conversationId?: number): Promise<{
    success: boolean;
    file_url: string;
    file_name: string;
    file_size: number;
    file_type: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    if (conversationId) {
      formData.append('conversation_id', conversationId.toString());
    }

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.UPLOAD_FILE}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload file');
    }

    return response.json();
  }

  async downloadFile(filename: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.DOWNLOAD_FILE(filename)}`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to download file');
    }
    
    return response.blob();
  }

  async getMessagingStats(): Promise<{
    success: boolean;
    stats: {
      total_conversations: number;
      open_conversations: number;
      pending_conversations: number;
      closed_conversations: number;
      unread_messages: number;
    };
  }> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.MESSAGING_STATS}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch messaging stats');
    }

    return response.json();
  }

  async getExternalTenantProfile(userId: string): Promise<{
    success: boolean;
    profile: any;
  }> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.EXTERNAL_TENANT_PROFILE(userId)}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch external tenant profile');
    }

    return response.json();
  }

  // User management endpoints
  async getUsers(params?: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    users: any[];
    total?: number;
    page?: number;
    pages?: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.set('search', params.search);
    if (params?.role && params.role !== 'all') queryParams.set('role', params.role);
    if (params?.status && params.status !== 'all') queryParams.set('status', params.status);
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.ADMIN.USERS}?${queryString}`
      : API_ENDPOINTS.ADMIN.USERS;

    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log('[AdminAPI] Calling GET', fullUrl);

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    console.log('[AdminAPI] Response status:', response.status, response.statusText);

    if (!response.ok) {
      console.error('[AdminAPI] Users API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: fullUrl
      });

      try {
        const errorData = await response.json();
        console.error('[AdminAPI] Error details:', errorData);
        throw new Error(errorData.error?.message || errorData.message || 'Failed to fetch users');
      } catch (jsonError) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log('[AdminAPI] Users data received:', data);
    return data;
  }

  async suspendUser(
    userId: string,
    suspensionType: 'temp' | 'perm',
    suspensionReason: string,
    suspendedUntil?: string
  ): Promise<{
    success: boolean;
    message: string;
    user: any;
  }> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.SUSPEND_USER(userId)}`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        suspension_type: suspensionType,
        suspension_reason: suspensionReason,
        suspended_until: suspendedUntil
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to suspend user');
    }

    return response.json();
  }

  async unsuspendUser(userId: string): Promise<{
    success: boolean;
    message: string;
    user: any;
  }> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.UNSUSPEND_USER(userId)}`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to unsuspend user');
    }

    return response.json();
  }
}

export const adminApi = new AdminApiService();
export type { AdminProfile, AdminSession, AdminStats, AdminStatsResponse, AdminLoginRequest };