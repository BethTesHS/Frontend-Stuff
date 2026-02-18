import { API_BASE_URL, API_ENDPOINTS } from '../constants/apiEndpoints';
import { getAuthToken } from '@/utils/tokenStorage';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

interface PaginationInfo {
  page: number;
  per_page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface BuyerDashboardStats {
  saved_properties: number;
  scheduled_viewings: number;
  properties_viewed: number;
  new_messages: number;
  total_inquiries?: number;
  pending_viewings?: number;
}

export interface SavedProperty {
  id: number;
  property_id: number;
  buyer_id: number;
  saved_at: string;
  property?: {
    id: number;
    title: string;
    address: string;
    city: string;
    postcode: string;
    property_type: string;
    listing_type: string;
    bedrooms: number;
    bathrooms: number;
    price: number;
    primary_image_url?: string;
    status: string;
  };
}

export interface BuyerViewing {
  id: number;
  property_id: number;
  buyer_id: number;
  agent_id?: number;
  viewing_date: string;
  viewing_time: string;
  viewing_type: 'in_person' | 'virtual' | 'video_call';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  special_requirements?: string;
  created_at: string;
  updated_at: string;
  property?: {
    id: number;
    title: string;
    address: string;
    city: string;
    postcode: string;
    property_type: string;
    primary_image_url?: string;
  };
}

export interface ViewingHistory {
  id: number;
  viewing_id: number;
  property_id: number;
  viewing_date: string;
  viewing_time: string;
  viewing_type: string;
  status: string;
  feedback_submitted: boolean;
  rating?: number;
  feedback?: string;
  property?: {
    id: number;
    title: string;
    address: string;
    city: string;
    postcode: string;
    property_type: string;
    primary_image_url?: string;
  };
}

export interface CalendarEvent {
  id: number;
  buyer_id: number;
  property_id?: number;
  title: string;
  description?: string;
  event_type: 'viewing' | 'meeting' | 'reminder' | 'other';
  start_datetime: string;
  end_datetime: string;
  all_day: boolean;
  status: 'scheduled' | 'completed' | 'cancelled';
  location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BuyerMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_type: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export interface Conversation {
  id: number;
  buyer_id: number;
  agent_id?: number;
  property_id?: number;
  subject: string;
  status: 'active' | 'closed';
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
  property?: {
    id: number;
    title: string;
    address: string;
  };
  agent?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface BuyerNotification {
  id: number;
  buyer_id: number;
  type: 'viewing' | 'message' | 'property' | 'inquiry' | 'general';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
  metadata?: Record<string, any>;
}

export interface BuyerProfile {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  preferences?: {
    property_types?: string[];
    min_price?: number;
    max_price?: number;
    bedrooms?: number;
    locations?: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface BuyerInquiry {
  id: number;
  property_id: number;
  buyer_id: number;
  agent_id?: number;
  inquiry_type: 'general' | 'viewing' | 'offer' | 'information';
  message: string;
  status: 'pending' | 'responded' | 'closed';
  created_at: string;
  updated_at: string;
  property?: {
    id: number;
    title: string;
    address: string;
  };
}

export interface PropertyRecommendation {
  id: number;
  property_id: number;
  match_score: number;
  match_reasons: string[];
  property: {
    id: number;
    title: string;
    address: string;
    city: string;
    postcode: string;
    property_type: string;
    listing_type: string;
    bedrooms: number;
    bathrooms: number;
    price: number;
    primary_image_url?: string;
    status: string;
  };
}

export interface SpareRoomViewing {
  id: number;
  spare_room_id: number;
  spare_room_title?: string;
  spare_room_address?: string;
  rent?: number;
  scheduled_date: string;
  viewing_type: 'in_person' | 'virtual' | 'video_call';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  poster_name?: string;
  poster_email?: string;
  poster_phone?: string;
  created_at: string;
  updated_at?: string;
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
    method: 'GET',
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      data = { success: true, message: 'Operation completed' };
    }

    if (!response.ok) {
      const errorMessage = data.error || data.message || data.msg || `HTTP ${response.status}: Request failed`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Network error or server unavailable');
  }
};

export const buyerApi = {
  getDashboardStats: async (): Promise<ApiResponse<BuyerDashboardStats>> => {
    return apiRequest(API_ENDPOINTS.BUYER.DASHBOARD_STATS);
  },

  getViewings: async (params: {
    page?: number;
    per_page?: number;
    status?: string;
  } = {}): Promise<ApiResponse<{
    viewings: BuyerViewing[];
    pagination?: PaginationInfo;
  }>> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.per_page) queryParams.set('per_page', params.per_page.toString());
    if (params.status) queryParams.set('status', params.status);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_ENDPOINTS.BUYER.VIEWINGS}?${queryString}` : API_ENDPOINTS.BUYER.VIEWINGS;
    return apiRequest(endpoint);
  },

  getViewingDetails: async (viewingId: number): Promise<ApiResponse<{ viewing: BuyerViewing }>> => {
    return apiRequest(API_ENDPOINTS.BUYER.VIEWING_DETAILS(viewingId));
  },

  scheduleViewing: async (data: {
    property_id: number;
    viewing_date: string;
    viewing_time: string;
    viewing_type: 'in_person' | 'virtual' | 'video_call';
    notes?: string;
    special_requirements?: string;
  }): Promise<ApiResponse<{ viewing: BuyerViewing }>> => {
    return apiRequest(API_ENDPOINTS.BUYER.VIEWINGS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateViewing: async (viewingId: number, data: {
    viewing_date?: string;
    viewing_time?: string;
    viewing_type?: 'in_person' | 'virtual' | 'video_call';
    notes?: string;
    special_requirements?: string;
  }): Promise<ApiResponse<{ viewing: BuyerViewing }>> => {
    return apiRequest(API_ENDPOINTS.BUYER.VIEWING_DETAILS(viewingId), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  cancelViewing: async (viewingId: number): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest(API_ENDPOINTS.BUYER.VIEWING_DETAILS(viewingId), {
      method: 'DELETE',
    });
  },

  getSavedProperties: async (params: {
    page?: number;
    per_page?: number;
  } = {}): Promise<ApiResponse<{
    properties: SavedProperty[];
    pagination?: PaginationInfo;
  }>> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.per_page) queryParams.set('per_page', params.per_page.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_ENDPOINTS.BUYER.SAVED_PROPERTIES}?${queryString}` : API_ENDPOINTS.BUYER.SAVED_PROPERTIES;
    return apiRequest(endpoint);
  },

  saveProperty: async (propertyId: number): Promise<ApiResponse<{ message: string; saved_property: SavedProperty }>> => {
    return apiRequest(API_ENDPOINTS.BUYER.SAVE_PROPERTY, {
      method: 'POST',
      body: JSON.stringify({ property_id: propertyId }),
    });
  },

  unsaveProperty: async (propertyId: number): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest(API_ENDPOINTS.BUYER.UNSAVE_PROPERTY(propertyId), {
      method: 'DELETE',
    });
  },

  getViewingHistory: async (params: {
    page?: number;
    per_page?: number;
  } = {}): Promise<ApiResponse<{
    history: ViewingHistory[];
    pagination?: PaginationInfo;
  }>> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.per_page) queryParams.set('per_page', params.per_page.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_ENDPOINTS.BUYER.VIEWING_HISTORY}?${queryString}` : API_ENDPOINTS.BUYER.VIEWING_HISTORY;
    return apiRequest(endpoint);
  },

  submitViewingFeedback: async (viewingId: number, data: {
    rating: number;
    feedback?: string;
  }): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest(API_ENDPOINTS.BUYER.VIEWING_FEEDBACK(viewingId), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getCalendarEvents: async (params: {
    start_date?: string;
    end_date?: string;
  } = {}): Promise<ApiResponse<{
    events: CalendarEvent[];
  }>> => {
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.set('start_date', params.start_date);
    if (params.end_date) queryParams.set('end_date', params.end_date);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_ENDPOINTS.BUYER.CALENDAR_EVENTS}?${queryString}` : API_ENDPOINTS.BUYER.CALENDAR_EVENTS;
    return apiRequest(endpoint);
  },

  createCalendarEvent: async (data: {
    property_id?: number;
    title: string;
    description?: string;
    event_type: 'viewing' | 'meeting' | 'reminder' | 'other';
    start_datetime: string;
    end_datetime: string;
    all_day?: boolean;
    location?: string;
    notes?: string;
  }): Promise<ApiResponse<{ event: CalendarEvent }>> => {
    return apiRequest(API_ENDPOINTS.BUYER.CALENDAR_EVENTS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateCalendarEvent: async (eventId: number, data: {
    title?: string;
    description?: string;
    event_type?: 'viewing' | 'meeting' | 'reminder' | 'other';
    start_datetime?: string;
    end_datetime?: string;
    all_day?: boolean;
    status?: 'scheduled' | 'completed' | 'cancelled';
    location?: string;
    notes?: string;
  }): Promise<ApiResponse<{ event: CalendarEvent }>> => {
    return apiRequest(API_ENDPOINTS.BUYER.CALENDAR_EVENT_DETAILS(eventId), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteCalendarEvent: async (eventId: number): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest(API_ENDPOINTS.BUYER.CALENDAR_EVENT_DETAILS(eventId), {
      method: 'DELETE',
    });
  },

  getConversations: async (params: {
    page?: number;
    per_page?: number;
    unread_only?: boolean;
  } = {}): Promise<ApiResponse<{
    conversations: Conversation[];
    pagination?: PaginationInfo;
  }>> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.per_page) queryParams.set('per_page', params.per_page.toString());
    if (params.unread_only) queryParams.set('unread_only', 'true');

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_ENDPOINTS.BUYER.CHAT}?${queryString}` : API_ENDPOINTS.BUYER.CHAT;
    return apiRequest(endpoint);
  },

  getMessages: async (conversationId: number, params: {
    page?: number;
    per_page?: number;
  } = {}): Promise<ApiResponse<{
    messages: BuyerMessage[];
    pagination?: PaginationInfo;
  }>> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.per_page) queryParams.set('per_page', params.per_page.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_ENDPOINTS.BUYER.CONVERSATION_MESSAGES(conversationId)}?${queryString}` : API_ENDPOINTS.BUYER.CONVERSATION_MESSAGES(conversationId);
    return apiRequest(endpoint);
  },

  sendMessage: async (conversationId: number, message: string): Promise<ApiResponse<{ message: BuyerMessage }>> => {
    return apiRequest(API_ENDPOINTS.BUYER.SEND_MESSAGE(conversationId), {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  startConversation: async (data: {
    agent_id?: number;
    property_id?: number;
    subject: string;
    message: string;
  }): Promise<ApiResponse<{ conversation: Conversation; message: BuyerMessage }>> => {
    return apiRequest(API_ENDPOINTS.BUYER.START_CONVERSATION, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  markConversationAsRead: async (conversationId: number): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest(API_ENDPOINTS.BUYER.MARK_AS_READ(conversationId), {
      method: 'PUT',
    });
  },

  getNotifications: async (params: {
    page?: number;
    per_page?: number;
    unread_only?: boolean;
  } = {}): Promise<ApiResponse<{
    notifications: BuyerNotification[];
    pagination?: PaginationInfo;
  }>> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.per_page) queryParams.set('per_page', params.per_page.toString());
    if (params.unread_only) queryParams.set('unread_only', 'true');

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_ENDPOINTS.BUYER.NOTIFICATIONS}?${queryString}` : API_ENDPOINTS.BUYER.NOTIFICATIONS;
    return apiRequest(endpoint);
  },

  getUnreadNotificationsCount: async (): Promise<ApiResponse<{ unread_count: number }>> => {
    return apiRequest(API_ENDPOINTS.BUYER.NOTIFICATIONS_UNREAD_COUNT);
  },

  markNotificationAsRead: async (notificationId: number): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest(API_ENDPOINTS.BUYER.NOTIFICATION_MARK_READ(notificationId), {
      method: 'PUT',
    });
  },

  markAllNotificationsAsRead: async (): Promise<ApiResponse<{ message: string; marked_count: number }>> => {
    return apiRequest(API_ENDPOINTS.BUYER.NOTIFICATIONS_MARK_ALL_READ, {
      method: 'PUT',
    });
  },

  deleteNotification: async (notificationId: number): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest(API_ENDPOINTS.BUYER.NOTIFICATION_DELETE(notificationId), {
      method: 'DELETE',
    });
  },

  getProfile: async (): Promise<ApiResponse<{ profile: BuyerProfile }>> => {
    return apiRequest(API_ENDPOINTS.BUYER.PROFILE);
  },

  updateProfile: async (data: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    preferences?: {
      property_types?: string[];
      min_price?: number;
      max_price?: number;
      bedrooms?: number;
      locations?: string[];
    };
  }): Promise<ApiResponse<{ profile: BuyerProfile }>> => {
    return apiRequest(API_ENDPOINTS.BUYER.PROFILE, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getInquiries: async (params: {
    page?: number;
    per_page?: number;
    status?: string;
  } = {}): Promise<ApiResponse<{
    inquiries: BuyerInquiry[];
    pagination?: PaginationInfo;
  }>> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.per_page) queryParams.set('per_page', params.per_page.toString());
    if (params.status) queryParams.set('status', params.status);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_ENDPOINTS.BUYER.INQUIRIES}?${queryString}` : API_ENDPOINTS.BUYER.INQUIRIES;
    return apiRequest(endpoint);
  },

  submitInquiry: async (data: {
    property_id: number;
    inquiry_type: 'general' | 'viewing' | 'offer' | 'information';
    message: string;
  }): Promise<ApiResponse<{ inquiry: BuyerInquiry }>> => {
    return apiRequest(API_ENDPOINTS.BUYER.INQUIRIES, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getRecommendations: async (params: {
    page?: number;
    per_page?: number;
    min_score?: number;
  } = {}): Promise<ApiResponse<{
    recommendations: PropertyRecommendation[];
    pagination?: PaginationInfo;
  }>> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.per_page) queryParams.set('per_page', params.per_page.toString());
    if (params.min_score) queryParams.set('min_score', params.min_score.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_ENDPOINTS.BUYER.RECOMMENDATIONS}?${queryString}` : API_ENDPOINTS.BUYER.RECOMMENDATIONS;
    return apiRequest(endpoint);
  },

  sendChatMessage: async (data: {
    recipient_id: string;
    recipient_type: string;
    initial_message: string;
    property_id?: string;
    property_title?: string;
    room_id?: string;
    room_title?: string;
  }): Promise<ApiResponse<{
    conversation_id: string;
    message: any;
    recipient: {
      id: string;
      name: string;
      type: string;
    };
  }>> => {
    return apiRequest(API_ENDPOINTS.BUYER.CHAT, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getConversationMessages: async (conversationId: string | number, params?: {
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<any>> => {
    const queryParams = new URLSearchParams();
    queryParams.set('conversation_id', conversationId.toString());
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.per_page) queryParams.set('per_page', params.per_page.toString());

    const endpoint = `${API_ENDPOINTS.BUYER.CHAT}?${queryParams.toString()}`;
    return apiRequest(endpoint);
  },

  // Spare Room Viewing Methods
  getSpareRoomViewings: async (params: {
    page?: number;
    per_page?: number;
    status?: string;
    spare_room_id?: number;
    from_date?: string;
    to_date?: string;
  } = {}): Promise<ApiResponse<{
    viewings: SpareRoomViewing[];
    pagination?: PaginationInfo;
  }>> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.per_page) queryParams.set('per_page', params.per_page.toString());
    if (params.status) queryParams.set('status', params.status);
    if (params.spare_room_id) queryParams.set('spare_room_id', params.spare_room_id.toString());
    if (params.from_date) queryParams.set('from_date', params.from_date);
    if (params.to_date) queryParams.set('to_date', params.to_date);

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.BUYER.SPARE_ROOM_VIEWINGS}?${queryString}`
      : API_ENDPOINTS.BUYER.SPARE_ROOM_VIEWINGS;
    return apiRequest(endpoint);
  },

  getSpareRoomViewingDetails: async (viewingId: number): Promise<ApiResponse<SpareRoomViewing>> => {
    return apiRequest(API_ENDPOINTS.BUYER.SPARE_ROOM_VIEWING_DETAILS(viewingId));
  },

  scheduleSpareRoomViewing: async (data: {
    spare_room_id: number;
    viewing_date: string;
    viewing_time: string;
    viewing_type: 'in_person' | 'virtual' | 'video_call';
    notes?: string;
  }): Promise<ApiResponse<SpareRoomViewing>> => {
    return apiRequest(API_ENDPOINTS.BUYER.SPARE_ROOM_VIEWINGS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateSpareRoomViewing: async (viewingId: number, data: {
    viewing_date?: string;
    viewing_time?: string;
    viewing_type?: 'in_person' | 'virtual' | 'video_call';
    notes?: string;
  }): Promise<ApiResponse<SpareRoomViewing>> => {
    return apiRequest(API_ENDPOINTS.BUYER.SPARE_ROOM_VIEWING_DETAILS(viewingId), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  cancelSpareRoomViewing: async (viewingId: number): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest(API_ENDPOINTS.BUYER.SPARE_ROOM_VIEWING_DETAILS(viewingId), {
      method: 'DELETE',
    });
  },
};

export default buyerApi;
