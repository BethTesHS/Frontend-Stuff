import { getAuthToken } from '@/utils/tokenStorage';

// Base API configuration
const API_BASE_URL = 'https://homedapp1.azurewebsites.net';

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

  const response = await fetch(url, config);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Request failed`);
  }

  // For file downloads, return blob
  if (endpoint.includes('/files/')) {
    return response.blob() as T;
  }

  return response.json();
};

// Messaging API types
export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_name: string;
  sender_type: string;
  message_text: string;
  attachment_url?: string;
  attachment_name?: string;
  attachment_size?: number;
  attachment_type?: string;
  created_at: string;
  is_read: boolean;
  metadata?: any;
}

export interface Conversation {
  id: number;
  user_id: number;
  user_name: string;
  subject: string;
  status: 'open' | 'closed' | 'pending';
  last_message_at?: string;
  unread_count: number;
  created_at: string;
}

export interface TypingIndicator {
  user_id: number;
  user_name: string;
  is_typing: boolean;
}

export interface MessagingStats {
  total_conversations: number;
  open_conversations: number;
  pending_conversations: number;
  closed_conversations: number;
  total_messages: number;
  avg_response_time: number;
}

// Messaging API functions
export const messagingApi = {
  // Upload file for message
  uploadFile: async (file: File, conversationId?: number): Promise<{ success: boolean; file_url: string; file_name: string; file_size: number; file_type: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    if (conversationId) {
      formData.append('conversation_id', conversationId.toString());
    }

    return apiRequest('/api/upload-file', {
      method: 'POST',
      body: formData,
    });
  },

  // Send a message
  sendMessage: async (data: {
    conversation_id?: number;
    message_text?: string;
    subject?: string;
    attachment_url?: string;
    attachment_name?: string;
    attachment_size?: number;
    attachment_type?: string;
    metadata?: any;
  }): Promise<{ success: boolean; message: Message }> => {
    return apiRequest('/api/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get conversations list
  getConversations: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {}): Promise<{ success: boolean; conversations: Conversation[]; total: number; page: number; pages: number; has_next: boolean; has_prev: boolean }> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.status) queryParams.set('status', params.status);
    if (params.search) queryParams.set('search', params.search);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/conversations?${queryString}` : '/api/conversations';
    return apiRequest(endpoint);
  },

  // Get messages in a conversation
  getConversationMessages: async (
    conversationId: number,
    params: { page?: number; limit?: number } = {}
  ): Promise<{ success: boolean; messages: Message[]; conversation: Conversation; total: number; page: number; pages: number; has_next: boolean; has_prev: boolean }> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString 
      ? `/api/conversations/${conversationId}/messages?${queryString}` 
      : `/api/conversations/${conversationId}/messages`;
    return apiRequest(endpoint);
  },

  // Update conversation status (admin only)
  updateConversationStatus: async (
    conversationId: number,
    status: 'open' | 'closed' | 'pending'
  ): Promise<{ success: boolean; conversation: Conversation }> => {
    return apiRequest(`/api/conversations/${conversationId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Download file securely
  downloadFile: async (filename: string): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/api/files/${filename}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to download file');
    }
    
    return response.blob();
  },

  // Send typing indicator
  sendTypingIndicator: async (conversationId: number, isTyping: boolean = true): Promise<{ success: boolean }> => {
    return apiRequest(`/api/conversations/${conversationId}/typing`, {
      method: 'POST',
      body: JSON.stringify({ is_typing: isTyping }),
    });
  },

  // Get dashboard statistics
  getDashboardStats: async (): Promise<{ success: boolean; stats: MessagingStats }> => {
    return apiRequest('/api/dashboard/stats');
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
    return apiRequest('/api/buyer/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};