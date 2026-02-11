// Tenant Messaging API Service
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://homedapp1.azurewebsites.net';

// HTTP client helper
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: Record<string, string> = {};
  
  // Only set Content-Type for non-FormData requests
  const isFormData = options.body instanceof FormData;
  if (!isFormData) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  // Add auth token if available
  const token = localStorage.getItem('auth_token');
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

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}: Request failed`);
  }

  // For file downloads, return blob
  if (endpoint.includes('/download/')) {
    return response.blob() as T;
  }

  return response.json();
};

// Types
export interface TenantMessage {
  id: number;
  conversation_id: number;
  sender_id: string;
  sender_name: string;
  sender_type: string;
  message_text: string;
  attachment_url?: string;
  attachment_name?: string;
  attachment_size?: number;
  attachment_type?: string;
  created_at: string;
  is_read_by_tenant: boolean;
  is_read_by_agent: boolean;
  is_own_message?: boolean;
}

export interface TenantConversation {
  id: number;
  subject: string;
  status: 'open' | 'closed' | 'pending';
  unread_count: number;
  last_message_at?: string;
  created_at: string;
  property?: {
    id: string;
    title: string;
    address: string;
    city: string;
    postcode: string;
  };
  other_participant?: {
    id: string;
    name: string;
    type: 'agent' | 'owner';
  };
  latest_message?: {
    text: string;
    sender_name: string;
    created_at: string;
    has_attachment: boolean;
  };
}

export interface TenantMessagingStats {
  total_conversations: number;
  open_conversations: number;
  closed_conversations: number;
  total_unread: number;
}

// Tenant Messaging API functions
export const tenantMessagingApi = {
  // Upload file for message
  uploadFile: async (file: File, conversationId?: number): Promise<{ 
    success: boolean; 
    file_url: string; 
    file_name: string; 
    file_size: number; 
    file_type: string 
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    if (conversationId) {
      formData.append('conversation_id', conversationId.toString());
    }

    const response = await apiRequest<any>('/api/tenant-messaging/upload', {
      method: 'POST',
      body: formData,
    });
    
    // Extract and transform the nested response structure
    return {
      success: response.success,
      file_url: response.data?.file_url,
      file_name: response.data?.file_name,
      file_size: response.data?.file_size,
      file_type: response.data?.file_type
    };
  },

  // Send a message (create conversation or add to existing)
  sendMessage: async (data: {
    conversation_id?: number;
    message_text?: string;
    subject?: string;
    attachment_url?: string;
    attachment_name?: string;
    attachment_size?: number;
    attachment_type?: string;
    metadata?: any;
  }): Promise<{ 
    success: boolean; 
    message: TenantMessage;
      conversation?: {
        id: number;
        subject: string;
        status: string;
      };
    }> => {
      const response = await apiRequest<any>('/api/tenant-messaging/send', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      // Extract and transform the nested response structure
      return {
        success: response.success,
        message: response.data?.message,
        conversation: response.data?.conversation
      };
  },

  // Get conversations list
  getConversations: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {}): Promise<{ 
    success: boolean; 
    conversations: TenantConversation[]; 
    total: number; 
    page: number; 
    pages: number; 
    has_next: boolean; 
    has_prev: boolean 
  }> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.status) queryParams.set('status', params.status);
    if (params.search) queryParams.set('search', params.search);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/tenant-messaging/conversations?${queryString}` : '/api/tenant-messaging/conversations';
    
    const response = await apiRequest<any>(endpoint);
    
    // Extract and transform the nested response structure
    return {
      success: response.success,
      conversations: response.data?.conversations || [],
      total: response.data?.pagination?.total || 0,
      page: response.data?.pagination?.page || 1,
      pages: response.data?.pagination?.pages || 0,
      has_next: response.data?.pagination?.has_next || false,
      has_prev: response.data?.pagination?.has_prev || false
    };
  },

  // Get messages in a conversation
  getConversationMessages: async (
    conversationId: number,
    params: { page?: number; limit?: number } = {}
  ): Promise<{ 
    success: boolean; 
    conversation: TenantConversation;
    messages: TenantMessage[]; 
    total: number; 
    page: number; 
    pages: number; 
    has_next: boolean; 
    has_prev: boolean 
  }> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString 
      ? `/api/tenant-messaging/conversations/${conversationId}/messages?${queryString}` 
      : `/api/tenant-messaging/conversations/${conversationId}/messages`;
    
    const response = await apiRequest<any>(endpoint);
    
    // Extract and transform the nested response structure
    return {
      success: response.success,
      conversation: response.data?.conversation,
      messages: response.data?.messages || [],
      total: response.data?.total || 0,
      page: response.data?.page || 1,
      pages: response.data?.pages || 0,
      has_next: response.data?.has_next || false,
      has_prev: response.data?.has_prev || false
    };
  },

  // Update conversation status
  updateConversationStatus: async (
    conversationId: number,
    status: 'open' | 'closed' | 'pending'
  ): Promise<{ 
    success: boolean; 
    conversation: {
      id: number;
      status: string;
      updated_at: string;
    }
  }> => {
    const response = await apiRequest<any>(`/api/tenant-messaging/conversations/${conversationId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    
    // Extract and transform the nested response structure
    return {
      success: response.success,
      conversation: response.data?.conversation
    };
  },

  // Download file securely
  downloadFile: async (filename: string): Promise<Blob> => {
    return apiRequest(`/api/tenant-messaging/download/${filename}`);
  },

  // Send typing indicator
  sendTypingIndicator: async (conversationId: number, isTyping: boolean = true): Promise<{ success: boolean }> => {
    const response = await apiRequest<any>('/api/tenant-messaging/typing', {
      method: 'POST',
      body: JSON.stringify({ 
        conversation_id: conversationId,
        is_typing: isTyping 
      }),
    });
    
    return {
      success: response.success
    };
  },

  // Get dashboard statistics
  getDashboardStats: async (): Promise<{
    success: boolean;
    stats: TenantMessagingStats
  }> => {
    const response = await apiRequest<any>('/api/tenant-messaging/stats');

    return {
      success: response.success,
      stats: response.data?.stats
    };
  },

  // Send chat message (universal endpoint for all user types)
  sendChatMessage: async (data: {
    recipient_id: string;
    recipient_type: string;
    initial_message: string;
    property_id?: string;
    property_title?: string;
    room_id?: string;
    room_title?: string;
    conversation_id?: string;
  }): Promise<{
    success: boolean;
    data?: {
      conversation_id: string;
      message: any;
      recipient: {
        id: string;
        name: string;
        type: string;
      };
    };
    message?: string;
    error?: string;
  }> => {
    const response = await apiRequest<any>('/api/buyer/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return response;
  },
};