
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://homedapp1.azurewebsites.net';

const getAuthHeaders = () => {
  const token = localStorage.getItem('agencyToken');
  return {
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export interface AgencyLoginRequest {
  email: string;
  password: string;
}

export interface AgencyLoginResponse {
  access_token: string;
  agency: {
    id: string;
    name: string;
    slug: string;
    email: string;
    phone: string;
    address: string;
    city?: string;
    postcode?: string;
    website?: string;
    description?: string;
    logo_url?: string;
    established_year?: string;
    license_number?: string;
    status: string;
    is_active: boolean;
    is_verified: boolean;
    theme?: {
      primary_color?: string;
      secondary_color?: string;
      logo_url?: string;
    };
    created_at?: string;
    agents?: any[];
    specializations?: string[];
  };
  message: string;
  redirect_url?: string;
}

export interface AgencyRegistrationRequest {
  name: string;
  slug: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  website?: string;
  description?: string;
  agents: Array<{
    name: string;
    email: string;
    role: string;
    phone?: string;
  }>;
  specializations: string[];
}

export interface AgencyProfile {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  description?: string;
  logo?: string;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const agencyApi = {
  // Authentication
  login: async (credentials: AgencyLoginRequest): Promise<AgencyLoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/agencies/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    
    // Store the token from Flask backend
    if (data.access_token) {
      localStorage.setItem('agencyToken', data.access_token);
    }
    
    // Return the full response from backend
    return data;
  },

  register: async (data: AgencyRegistrationRequest) => {
    // Your Flask backend expects JSON, not FormData
    const registrationData: any = {
      agencyName: data.name,
      slug: data.slug,
      email: data.email,
      password: data.password,
      confirmPassword: data.password, // Backend validates this
      phone: data.phone,
      address: data.address,
      specializations: data.specializations,
      agents: data.agents,
    };

    if (data.website && data.website.trim()) {
      registrationData.website = data.website;
    }
    if (data.description && data.description.trim()) {
      registrationData.description = data.description;
    }

    const response = await fetch(`${API_BASE_URL}/api/agencies/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(registrationData),
    });

    const responseClone = response.clone();

    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();

        let errorMessage = errorData.error || 'Registration failed';
        if (errorData.details) {
          const validationErrors = Object.entries(errorData.details)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('; ');
          errorMessage += ` - ${validationErrors}`;
        }

        throw new Error(errorMessage);
      } catch (e) {
        try {
          const errorText = await responseClone.text();
          throw new Error(`Registration failed (${response.status}): ${errorText || 'Unknown error'}`);
        } catch (textError) {
          throw new Error(`Registration failed (${response.status}): Unable to read error response`);
        }
      }
    }

    return response.json();
  },

  forgotPassword: async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/api/agencies/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send reset email');
    }

    return response.json();
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await fetch(`${API_BASE_URL}/api/agencies/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        password: newPassword,
        confirmPassword: newPassword  // Backend expects both fields
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Password reset failed');
    }

    return response.json();
  },

  // Protected endpoints (require authentication)
  getProfile: async (): Promise<AgencyProfile> => {
    const response = await fetch(`${API_BASE_URL}/api/agencies/profile`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch profile');
    }

    const data = await response.json();
    return data.agency; // Flask backend returns {agency: {...}}
  },

  updateProfile: async (data: Partial<AgencyProfile>): Promise<AgencyProfile> => {
    const response = await fetch(`${API_BASE_URL}/api/agencies/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update profile');
    }

    const responseData = await response.json();
    return responseData.agency; // Flask backend returns {message: ..., agency: {...}}
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await fetch(`${API_BASE_URL}/api/agencies/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmPassword: newPassword  // Backend expects both fields
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to change password');
    }

    return response.json();
  },

  // Public endpoint to get agency by slug
  getBySlug: async (slug: string): Promise<AgencyProfile> => {
    const response = await fetch(`${API_BASE_URL}/api/agencies/${slug}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Agency not found');
    }

    const data = await response.json();
    return data.agency; // Flask backend returns {agency: {...}}
  },

  // Logout helper
  logout: () => {
    localStorage.removeItem('agencyToken');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('agencyToken');
  },
};

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization?: string;
  avatar_url?: string;
  monthly_target?: number;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  type: 'buy' | 'rent';
  property_type: 'house' | 'flat' | 'commercial';
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  sqft: number;
  agent_id?: string;
  status: 'available' | 'pending' | 'sold' | 'rented';
  images: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Tenant {
  id: string;
  property_id: string;
  name: string;
  email: string;
  phone: string;
  lease_start_date: string;
  lease_end_date: string;
  monthly_rent: number;
  status?: string;
  created_at?: string;
}

export interface Viewing {
  id: string;
  property_id: string;
  agent_id?: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  viewing_date: string;
  viewing_time: string;
  duration_minutes?: number;
  notes?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  created_at?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface DashboardAnalytics {
  total_agents: number;
  total_properties: number;
  total_viewings: number;
  total_tenants: number;
  total_revenue: number;
  period: string;
}

export interface Conversation {
  id: string;
  type: string;
  title?: string;
  participants: Participant[];
  last_message?: Message;
  unread_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: string;
  type: string;
  role?: string;
  status?: string;
  name?: string;
  avatar_url?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  content: string;
  sender_id?: string;
  sender_name?: string;
  sender_avatar_url?: string;
  read: boolean;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data?: T[];
  total: number;
  page: number;
  pages: number;
}

const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.message || `HTTP ${response.status}`);
  }

  return response.json();
};

export const agencyAgentsApi = {
  getAll: async (status: string = 'active'): Promise<{ agents: Agent[]; total: number }> => {
    return apiRequest(`/api/agency/agents?status=${status}`);
  },

  create: async (agentData: {
    name: string;
    email: string;
    phone: string;
    specialization?: string;
    avatar_url?: string;
    monthly_target?: number;
  }): Promise<{ agent: Agent }> => {
    return apiRequest('/api/agency/agents', {
      method: 'POST',
      body: JSON.stringify(agentData),
    });
  },

  getById: async (agentId: string): Promise<{ agent: Agent }> => {
    return apiRequest(`/api/agency/agents/${agentId}`);
  },

  update: async (
    agentId: string,
    agentData: Partial<Agent>
  ): Promise<{ agent: Agent }> => {
    return apiRequest(`/api/agency/agents/${agentId}`, {
      method: 'PUT',
      body: JSON.stringify(agentData),
    });
  },

  deactivate: async (agentId: string): Promise<{ message: string }> => {
    return apiRequest(`/api/agency/agents/${agentId}`, {
      method: 'DELETE',
    });
  },
};

export const agencyPropertiesApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    agent_id?: string;
    search?: string;
  }): Promise<PaginatedResponse<Property> & { properties: Property[] }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.status) queryParams.set('status', params.status);
    if (params?.type) queryParams.set('type', params.type);
    if (params?.agent_id) queryParams.set('agent_id', params.agent_id);
    if (params?.search) queryParams.set('search', params.search);

    const query = queryParams.toString();
    return apiRequest(`/api/agency/properties${query ? `?${query}` : ''}`);
  },

  create: async (propertyData: {
    title: string;
    address: string;
    price: number;
    type: 'buy' | 'rent';
    property_type: 'house' | 'flat' | 'commercial';
    bedrooms?: number;
    bathrooms?: number;
    parking?: number;
    sqft: number;
    agent_id?: string;
    images: string[];
  }): Promise<{ property: Property }> => {
    return apiRequest('/api/agency/properties', {
      method: 'POST',
      body: JSON.stringify(propertyData),
    });
  },

  update: async (
    propertyId: string,
    propertyData: Partial<Property>
  ): Promise<{ property: Property }> => {
    return apiRequest(`/api/agency/properties/${propertyId}`, {
      method: 'PUT',
      body: JSON.stringify(propertyData),
    });
  },
};

export const agencyTenantsApi = {
  getAll: async (params?: {
    status?: string;
    property_id?: string;
  }): Promise<{ tenants: Tenant[]; total: number }> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.set('status', params.status);
    if (params?.property_id) queryParams.set('property_id', params.property_id);

    const query = queryParams.toString();
    return apiRequest(`/api/agency/tenants${query ? `?${query}` : ''}`);
  },

  create: async (tenantData: {
    property_id: string;
    name: string;
    email: string;
    phone: string;
    lease_start_date: string;
    lease_end_date: string;
    monthly_rent: number;
  }): Promise<{ tenant: Tenant }> => {
    return apiRequest('/api/agency/tenants', {
      method: 'POST',
      body: JSON.stringify(tenantData),
    });
  },
};

export const agencyViewingsApi = {
  getAll: async (params?: {
    status?: string;
    agent_id?: string;
    property_id?: string;
    date?: string;
  }): Promise<{ viewings: Viewing[]; total: number }> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.set('status', params.status);
    if (params?.agent_id) queryParams.set('agent_id', params.agent_id);
    if (params?.property_id) queryParams.set('property_id', params.property_id);
    if (params?.date) queryParams.set('date', params.date);

    const query = queryParams.toString();
    return apiRequest(`/api/agency/viewings${query ? `?${query}` : ''}`);
  },

  create: async (viewingData: {
    property_id: string;
    agent_id?: string;
    client_name: string;
    client_email: string;
    client_phone: string;
    viewing_date: string;
    viewing_time: string;
    duration_minutes?: number;
    notes?: string;
  }): Promise<{ viewing: Viewing }> => {
    return apiRequest('/api/agency/viewings', {
      method: 'POST',
      body: JSON.stringify(viewingData),
    });
  },

  updateStatus: async (
    viewingId: string,
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show'
  ): Promise<{ viewing: Viewing }> => {
    return apiRequest(`/api/agency/viewings/${viewingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

export const agencyNotificationsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    unread_only?: boolean;
  }): Promise<PaginatedResponse<Notification> & { notifications: Notification[] }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.unread_only) queryParams.set('unread_only', 'true');

    const query = queryParams.toString();
    return apiRequest(`/api/agency/notifications${query ? `?${query}` : ''}`);
  },

  markAsRead: async (notificationId: string): Promise<{ message: string }> => {
    return apiRequest(`/api/agency/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  },
};

export const agencyAnalyticsApi = {
  getDashboard: async (
    period: '7d' | '30d' | '90d' | '1y' = '30d'
  ): Promise<DashboardAnalytics> => {
    return apiRequest(`/api/agency/analytics/dashboard?period=${period}`);
  },
};

export const agencyConversationsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Conversation> & { conversations: Conversation[] }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const query = queryParams.toString();
    return apiRequest(`/api/agency/conversations${query ? `?${query}` : ''}`);
  },

  create: async (conversationData: {
    type: string;
    title?: string;
    participants?: Participant[];
  }): Promise<{ conversation: Conversation }> => {
    return apiRequest('/api/agency/conversations', {
      method: 'POST',
      body: JSON.stringify(conversationData),
    });
  },

  getById: async (conversationId: string): Promise<{ conversation: Conversation }> => {
    return apiRequest(`/api/agency/conversations/${conversationId}`);
  },

  getMessages: async (
    conversationId: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<Message> & { messages: Message[] }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const query = queryParams.toString();
    return apiRequest(
      `/api/agency/conversations/${conversationId}/messages${query ? `?${query}` : ''}`
    );
  },

  sendMessage: async (
    conversationId: string,
    messageData: {
      content: string;
      sender_id?: string;
      sender_name?: string;
      sender_avatar_url?: string;
    }
  ): Promise<{ data: Message }> => {
    return apiRequest(`/api/agency/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  },

  markMessageAsRead: async (
    conversationId: string,
    messageId: string
  ): Promise<{ message: Message }> => {
    return apiRequest(
      `/api/agency/conversations/${conversationId}/messages/${messageId}/read`,
      {
        method: 'PUT',
      }
    );
  },

  addParticipant: async (
    conversationId: string,
    participantData: {
      participant_id: string;
      participant_type: string;
      role?: string;
      status?: string;
    }
  ): Promise<{ participant: Participant }> => {
    return apiRequest(`/api/agency/conversations/${conversationId}/participants`, {
      method: 'POST',
      body: JSON.stringify(participantData),
    });
  },

  removeParticipant: async (
    conversationId: string,
    participantId: string,
    participantType: string
  ): Promise<{ message: string }> => {
    return apiRequest(
      `/api/agency/conversations/${conversationId}/participants/${participantId}`,
      {
        method: 'DELETE',
        body: JSON.stringify({ participant_type: participantType }),
      }
    );
  },
};