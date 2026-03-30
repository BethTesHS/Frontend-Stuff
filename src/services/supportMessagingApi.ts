import { getAuthToken, getAdminToken } from '@/utils/tokenStorage';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://api.homeduk.property';

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getAdminToken() || getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export interface SupportConversation {
  id: number;
  conversation_id: string;
  user_id: number;
  user_name: string;
  user_role: string;
  subject: string;
  status: 'open' | 'closed' | 'pending';
  unread_count: number;
  last_message_at: string | null;
  created_at: string;
  latest_message?: {
    text: string;
    sender_name: string;
    sender_type: string;
    created_at: string;
  };
}

export interface SupportMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_name: string;
  sender_type: 'user' | 'admin';
  message_text: string;
  is_read: boolean;
  created_at: string;
}

export const supportMessagingApi = {
  /** List support conversations for the current user (or all if admin). */
  getConversations: async (params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<{
    success: boolean;
    data: {
      conversations: SupportConversation[];
      pagination: { total: number; page: number; pages: number; has_next: boolean; has_prev: boolean };
    };
  }> => {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.status) q.set('status', params.status);
    const qs = q.toString();
    return apiRequest(qs ? `${API_ENDPOINTS.ADMIN_MESSAGING.CONVERSATIONS}?${qs}` : API_ENDPOINTS.ADMIN_MESSAGING.CONVERSATIONS);
  },

  /** Open a new support conversation (non-admin users only). */
  createConversation: async (data: { subject: string; message_text: string }): Promise<{
    success: boolean;
    data: { conversation: SupportConversation; message: SupportMessage };
    message?: string;
  }> => {
    return apiRequest(API_ENDPOINTS.ADMIN_MESSAGING.CONVERSATIONS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** Get messages in a support conversation. */
  getMessages: async (conversationId: number, params: { page?: number; limit?: number } = {}): Promise<{
    success: boolean;
    data: {
      conversation: SupportConversation;
      messages: SupportMessage[];
      pagination: { total: number; page: number; pages: number; has_next: boolean; has_prev: boolean };
    };
  }> => {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    const qs = q.toString();
    const base = API_ENDPOINTS.ADMIN_MESSAGING.MESSAGES(conversationId);
    return apiRequest(qs ? `${base}?${qs}` : base);
  },

  /** Send a reply in a support conversation. */
  sendReply: async (conversationId: number, message_text: string): Promise<{
    success: boolean;
    data: { message: SupportMessage };
  }> => {
    return apiRequest(API_ENDPOINTS.ADMIN_MESSAGING.MESSAGES(conversationId), {
      method: 'POST',
      body: JSON.stringify({ message_text }),
    });
  },

  /** Get unread support message count for the current user. */
  getUnreadCount: async (): Promise<{ success: boolean; data: { unread_count: number } }> => {
    return apiRequest(API_ENDPOINTS.ADMIN_MESSAGING.UNREAD_COUNT);
  },

  /** Close a support conversation (admin action). */
  closeConversation: async (conversationId: number): Promise<{ success: boolean; data: any }> => {
    return apiRequest(API_ENDPOINTS.ADMIN_MESSAGING.CLOSE(conversationId), { method: 'POST' });
  },

  /** Reopen a closed support conversation (admin action). */
  reopenConversation: async (conversationId: number): Promise<{ success: boolean; data: any }> => {
    return apiRequest(API_ENDPOINTS.ADMIN_MESSAGING.REOPEN(conversationId), { method: 'POST' });
  },
};
