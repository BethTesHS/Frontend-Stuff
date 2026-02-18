// services/api.ts
import { API_BASE_URL, API_ENDPOINTS } from '../constants/apiEndpoints';
import { tokenStorage, getAuthToken, setAuthToken, getRefreshToken, setRefreshToken } from '@/utils/tokenStorage';

// API response types
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

interface LoginResponse {
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    is_active: boolean;
    is_verified: boolean;
    full_name: string;
    role?: string;
  };
  profile?: {
    role: string;
    role_id: number;
    is_profile_complete: boolean;
    [key: string]: any;
  };
  access_token: string;
  refresh_token: string;
  token_type: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

// Find Agent API types
interface Agent {
  id: number;
  name: string;
  specialization: string;
  location: string;
  rating: number;
  reviews: number;
  description: string;
  type: 'estate' | 'letting';
  phone?: string;
  email?: string;
  company?: string;
  agency?: string;
  experience?: string;
  years_experience?: number;
  office_address?: string;
  service_areas?: string;
  profile_picture?: string;
  profile_picture_url?: string;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
  recent_reviews?: AgentReview[];
  rating_breakdown?: Record<string, number>;
}

interface AgentReview {
  id: number;
  agent_id: number;
  rating: number;
  review_text?: string;
  client_name: string;
  transaction_type?: string;
  property_address?: string;
  is_verified: boolean;
  is_published: boolean;
  helpful_votes: number;
  created_at: string;
}

interface AgentSearchParams {
  location?: string;
  agentName?: string;
  agentType?: 'both' | 'estate' | 'letting';
  radius?: 'this-area' | '1-mile' | '3-miles' | '5-miles' | '10-miles';
  featured?: boolean;
  page?: number;
  per_page?: number;
}

interface ContactInquiryData {
  agent_id: string;
  property_id?: string;
  fullName: string;
  email: string;
  phone?: string;
  message?: string;
  buyerType: string;
  optOutMarketing?: boolean;
}

interface AgentReviewData {
  rating: number;
  review_text?: string;
  client_name: string;
  client_email: string;
  transaction_type?: 'sale' | 'purchase' | 'rental' | 'letting' | 'valuation';
  property_address?: string;
}

interface PaginationInfo {
  page: number;
  per_page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface Notification {
  id: string;
  user_id: number;
  type: 'booking' | 'complaint' | 'resolved' | 'message' | 'viewing' | 'inquiry' | 'contact' | 'review' | 'approval' | 'general';
  title: string;
  message: string;
  description?: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  requires_action: boolean;
  action_url?: string;
  metadata: Record<string, any>;
  time: string; 
  created_at: string;
  updated_at: string;
  related_entity_type?: string;
  related_entity_id?: string;
  email_sent: boolean;
}

export interface NotificationListResponse {
  notifications: Notification[];
  current_page: number;
  per_page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
  unread_count: number;
}

export interface NotificationPreferences {
  booking_notifications: boolean;
  complaint_notifications: boolean;
  viewing_notifications: boolean;
  inquiry_notifications: boolean;
  general_notifications: boolean;
  email_enabled: boolean;
  email_frequency: 'instant' | 'daily' | 'weekly';
  push_enabled: boolean;
}

export interface NotificationFilters {
  page?: number;
  per_page?: number;
  type?: string;
  search?: string;
  unread_only?: boolean;
  priority?: 'low' | 'medium' | 'high';
}

export interface CreateNotificationData {
  user_id: number;
  type: string;
  title: string;
  message: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  requires_action?: boolean;
  action_url?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  metadata?: Record<string, any>;
  send_email?: boolean;
}

export interface ExternalTenantProfile {
  id: number;
  user_id: number;
  property_address: string;
  postcode: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  landlord_name: string;
  landlord_email: string;
  landlord_phone?: string;
  move_in_date: string;
  tenancy_length: string;
  monthly_rent: number;
  deposit?: number;
  additional_info?: string;
  is_verified: boolean;
  is_active: boolean;
  verification_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExternalTenantSetupData {
  tenant_type: 'external';
  role: 'tenant';
  property_data: {
    propertyAddress: string;
    postcode: string;
    propertyType: string;
    bedrooms: number;
    bathrooms: number;
    landlordName: string;
    landlordEmail: string;
    landlordPhone?: string;
    moveInDate: string;
    tenancyLength: string;
    monthlyRent: number;
    deposit?: number;
    additionalInfo?: string;
  };
}

export interface ExternalTenantDashboardData {
  user: any;
  user_profile: any;
  external_tenant_profile: ExternalTenantProfile;
  property_summary: {
    address: string;
    postcode: string;
    type: string;
    bedrooms: number;
    bathrooms: number;
    monthly_rent: number;
    deposit: number;
    total_upfront_cost: number;
  };
  landlord_info: {
    name: string;
    email: string;
    phone?: string;
  };
  tenancy_timeline: {
    move_in_date: string;
    tenancy_length: string;
    tenancy_end_date?: string;
    days_since_move_in: number;
    days_remaining?: number;
    is_fixed_term: boolean;
    status: 'active' | 'upcoming';
  };
  financial_summary: {
    monthly_rent: number;
    annual_rent: number;
    deposit_paid: number;
    estimated_total_rent_paid: number;
    months_of_tenancy: number;
  };
  account_status: {
    is_verified: boolean;
    is_active: boolean;
    verification_email_sent: boolean;
    profile_created: string;
    last_updated: string;
  };
  recent_notifications: Array<{
    id: number;
    type: string;
    email_sent: boolean;
    created_at: string;
    email_sent_at?: string;
  }>;
  quick_stats: {
    total_notifications: number;
    successful_emails: number;
    tenancy_progress_percentage: number;
    is_new_tenant: boolean;
  };
  additional_info?: string;
  available_features: {
    property_insights: boolean;
    tenant_community: boolean;
    support_resources: boolean;
    rent_tracking: boolean;
    document_storage: boolean;
    maintenance_requests: boolean;
    rent_payment: boolean;
  };
}

// HTTP client helper with automatic token refresh
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry: boolean = false
): Promise<ApiResponse<T>> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: Record<string, string> = {};

  // Only set Content-Type for non-FormData requests
  const isFormData = options.body instanceof FormData;
  if (!isFormData) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  // Add auth token if available, but NOT for login/register/reset-password endpoints
  const publicEndpoints: string[] = [
    API_ENDPOINTS.AUTH.LOGIN,
    API_ENDPOINTS.AUTH.REGISTER,
    API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
    API_ENDPOINTS.AUTH.RESET_PASSWORD,
    API_ENDPOINTS.AUTH.VERIFY_EMAIL,
    API_ENDPOINTS.AUTH.RESEND_VERIFICATION
  ];

  const isPublicEndpoint = publicEndpoints.includes(endpoint);
  const token = getAuthToken();

  if (token && !isPublicEndpoint) {
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
    console.log(`API Request Details:`);
    console.log(`URL: ${url}`);
    console.log(`Method: ${config.method || 'GET'}`);
    console.log(`Headers:`, config.headers);
    console.log(`Body:`, config.body);
    
    const response = await fetch(url, config);
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    // Check if response has content before trying to parse JSON
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
        console.log('Parsed JSON data:', data);
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        throw new Error('Server returned invalid JSON response - likely a CORS issue');
      }
    } else {
      // Handle non-JSON responses (like CORS errors)
      const text = await response.text();
      console.log('Non-JSON response received:', text);
      
      if (!response.ok) {
        throw new Error(`CORS Error: Server returned ${response.status}. Check if your backend has proper CORS headers for ${url}`);
      }
      
      data = { success: true, message: 'Operation completed' };
    }
    
    console.log(`API response from ${endpoint}:`, { status: response.status, data });

    if (!response.ok) {
      // Handle token expiration with automatic refresh attempt
      // Check for 401 errors (token expired, invalid, or missing)
      const isTokenError = response.status === 401 && !isRetry && endpoint !== API_ENDPOINTS.AUTH.REFRESH;
      const errorMsg = data.msg || data.message || data.error || '';
      const isExpiredToken = errorMsg.toLowerCase().includes('expired') ||
                             errorMsg.toLowerCase().includes('invalid') ||
                             errorMsg.toLowerCase().includes('token');

      if (isTokenError && isExpiredToken) {
        console.log('Token error detected, attempting to refresh...', { errorMsg });

        try {
          // Attempt to refresh the token
          const refreshTokenValue = getRefreshToken();
          if (refreshTokenValue) {
            const refreshResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
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

                console.log('Token refreshed successfully, retrying original request');
                // Retry the original request with new token
                return apiRequest(endpoint, options, true);
              }
            }
          }

          console.log('Token refresh failed, clearing auth data and redirecting to login');
          tokenStorage.removeItem('auth_token');

          tokenStorage.removeItem('refresh_token');
          tokenStorage.removeItem('homedUser');
          window.location.href = '/login';
          throw new Error('Session expired. Please log in again.');
        } catch (refreshError) {
          console.error('Token refresh error:', refreshError);
          tokenStorage.removeItem('auth_token');
          tokenStorage.removeItem('refresh_token');
          tokenStorage.removeItem('homedUser');
          window.location.href = '/login';
          throw new Error('Session expired. Please log in again.');
        }
      }
      
      const errorMessage = data.error || data.message || data.msg || `HTTP ${response.status}: Request failed`;
      
      console.error(`API Error for ${endpoint}:`, {
        status: response.status,
        error: errorMessage,
        data
      });
      
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

export const authApi = {
  register: async (userData: RegisterData): Promise<ApiResponse<{ user: any; message: string }>> => {
    return apiRequest(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify({
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        password: userData.password,
        confirm_password: userData.password,
        phone: userData.phone,
      }),
    });
  },

  login: async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
    return apiRequest(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  verifyEmail: async (token: string): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
      method: 'POST',
      body: JSON.stringify({ token }),
      
    });
  },

  resendVerification: async (email: string): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  forgotPassword: async (email: string): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, newPassword: string, confirmPassword: string): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword, confirm_password: confirmPassword }),
    });
  },

  getCurrentUser: async (): Promise<ApiResponse<LoginResponse['user']>> => {
    return apiRequest(API_ENDPOINTS.AUTH.ME);
  },

  logout: async (): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest(API_ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
    });
  },

  refreshToken: async (): Promise<ApiResponse<{ access_token: string; refresh_token: string }>> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    return apiRequest(API_ENDPOINTS.AUTH.REFRESH, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
      },
    });
  },
};

export const propertyApi = {
  createProperty: async (propertyData: FormData): Promise<ApiResponse<{ property: any; images: any[]; documents: any[] }>> => {
    return apiRequest(API_ENDPOINTS.PROPERTIES.CREATE_WITH_FILES, {
      method: 'POST',
      body: propertyData,
    });
  },

  createPropertyJson: async (propertyData: any): Promise<ApiResponse<{ property: any }>> => {
    return apiRequest(API_ENDPOINTS.PROPERTIES.CREATE, {
      method: 'POST',
      body: JSON.stringify(propertyData),
    });
  },

  getMyProperties: async (params: {
    page?: number;
    per_page?: number;
    status?: string;
  } = {}): Promise<ApiResponse<{
    properties: any[];
    pagination: PaginationInfo;
  }>> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.per_page) queryParams.set('per_page', params.per_page.toString());
    if (params.status) queryParams.set('status', params.status);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_ENDPOINTS.PROPERTIES.MY_PROPERTIES}?${queryString}` : API_ENDPOINTS.PROPERTIES.MY_PROPERTIES;
    return apiRequest(endpoint);
  },

  getProperties: async (params: {
    page?: number;
    per_page?: number;
    location?: string;
    property_type?: string[];
    listing_type?: string;
    min_price?: number;
    max_price?: number;
    bedrooms?: number;
    featured?: boolean;
  } = {}): Promise<ApiResponse<{
    properties: any[];
    pagination: PaginationInfo;
    filters: any;
  }>> => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.per_page) queryParams.set('per_page', params.per_page.toString());
    if (params.location) queryParams.set('location', params.location);
    if (params.property_type && params.property_type.length > 0) {
      params.property_type.forEach(type => queryParams.append('property_type', type));
    }
    if (params.listing_type) queryParams.set('listing_type', params.listing_type);
    if (params.min_price) queryParams.set('min_price', params.min_price.toString());
    if (params.max_price) queryParams.set('max_price', params.max_price.toString());
    if (params.bedrooms) queryParams.set('bedrooms', params.bedrooms.toString());
    if (params.featured) queryParams.set('featured', 'true');

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_ENDPOINTS.PROPERTIES.BASE}?${queryString}` : API_ENDPOINTS.PROPERTIES.BASE;
    return apiRequest(endpoint);
  },

  getFeaturedProperties: async (limit: number = 6): Promise<ApiResponse<{
    properties: any[];
    total_count: number;
  }>> => {
    return apiRequest(`${API_ENDPOINTS.PROPERTIES.FEATURED}?limit=${limit}`);
  },

  searchProperties: async (params: {
    page?: number;
    per_page?: number;
    location?: string;
    property_type?: string[];
    listing_type?: string;
    min_price?: number;
    max_price?: number;
    bedrooms?: number;
  } = {}): Promise<ApiResponse<{
    properties: any[];
    pagination: PaginationInfo;
    search_params: any;
  }>> => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.per_page) queryParams.set('per_page', params.per_page.toString());
    if (params.location) queryParams.set('location', params.location);
    if (params.property_type && params.property_type.length > 0) {
      params.property_type.forEach(type => queryParams.append('property_type', type));
    }
    if (params.listing_type) queryParams.set('listing_type', params.listing_type);
    if (params.min_price) queryParams.set('min_price', params.min_price.toString());
    if (params.max_price) queryParams.set('max_price', params.max_price.toString());
    if (params.bedrooms) queryParams.set('bedrooms', params.bedrooms.toString());

    const queryString = queryParams.toString();
    return apiRequest(`${API_ENDPOINTS.PROPERTIES.SEARCH}?${queryString}`);
  },

  getProperty: async (propertyId: number): Promise<ApiResponse<{
    property: any;
  }>> => {
    return apiRequest(`${API_ENDPOINTS.PROPERTIES.BASE}/${propertyId}`);
  },

  updateProperty: async (propertyId: number, propertyData: any): Promise<ApiResponse<{
    property: any;
  }>> => {
    return apiRequest(API_ENDPOINTS.PROPERTIES.UPDATE(propertyId), {
      method: 'PUT',
      body: JSON.stringify(propertyData),
    });
  },

  uploadPropertyImages: async (propertyId: number, imageFiles: FileList): Promise<ApiResponse<{
    images: any[];
  }>> => {
    const formData = new FormData();
    Array.from(imageFiles).forEach(file => {
      formData.append('images', file);
    });

    return apiRequest(API_ENDPOINTS.PROPERTIES.UPLOAD_IMAGES(propertyId), {
      method: 'POST',
      body: formData,
      headers: {},
    });
  },

  setPrimaryImage: async (propertyId: number, imageId: number): Promise<ApiResponse<{
    image: any;
  }>> => {
    return apiRequest(API_ENDPOINTS.PROPERTIES.SET_PRIMARY_IMAGE(propertyId, imageId), {
      method: 'POST',
    });
  },

  getPropertyImages: async (propertyId: number): Promise<ApiResponse<{
    images: any[];
    total_count: number;
  }>> => {
    return apiRequest(API_ENDPOINTS.PROPERTIES.IMAGES(propertyId));
  },

  getAgentProperties: async (agentId?: string): Promise<ApiResponse<{ properties: any[]; total: number }>> => {
    console.warn('getAgentProperties is deprecated, use getMyProperties instead');
    const response = await propertyApi.getMyProperties();
    return {
      ...response,
      data: response.data ? {
        properties: response.data.properties,
        total: response.data.pagination.total
      } : undefined
    };
  },

  getTenantDashboard: async (): Promise<ApiResponse<{
    status: 'active' | 'no_property';
    tenant: {
      id: number;
      name: string;
      email: string;
      phone: string;
      member_since?: string;
    };
    property?: {
      id: number;
      title: string;
      address: string;
      street: string;
      city: string;
      postcode: string;
      property_type: string;
      bedrooms: number;
      bathrooms: number;
      monthly_rent: number;
      tenancy_start_date: string;
      tenancy_end_date: string;
    };
    agent?: {
      id: number;
      name: string;
      email: string;
      phone: string;
      company?: string;
      office_address?: string;
      description?: string;
    };
    tenancy?: {
      monthly_rent: number;
      security_deposit: number;
      start_date: string;
      end_date: string;
      length_months: number;
      is_active: boolean;
    };
  }>> => {
    return apiRequest(API_ENDPOINTS.PROPERTIES.TENANT_DASHBOARD);
  },

  getAgentStats: async (): Promise<ApiResponse<{
    activeListings: number;
    totalClients: number;
    monthSales: number;
    scheduledViewings: number;
    totalViews: number;
    totalInquiries: number;
  }>> => {
    return apiRequest(API_ENDPOINTS.PROPERTIES.AGENT_STATS);
  },

  getAgentActivities: async (): Promise<ApiResponse<{
    activities: Array<{
      id: string;
      action: string;
      property: string;
      time: string;
      type: 'listing' | 'viewing' | 'sale' | 'inquiry' | 'complaint';
    }>;
  }>> => {
    return apiRequest(API_ENDPOINTS.PROPERTIES.AGENT_ACTIVITIES);
  },

  getOwnerStats: async (): Promise<ApiResponse<{
    total_properties: number;
    active_properties: number;
    sold_properties: number;
    rented_properties: number;
  }>> => {
    return apiRequest(API_ENDPOINTS.PROPERTIES.OWNER_STATS);
  },

  getOwnerActivities: async (): Promise<ApiResponse<{
    activities: Array<{
      id: string;
      action: string;
      property: string;
      time: string;
      type: 'listing' | 'viewing' | 'rental' | 'inquiry' | 'maintenance';
    }>;
  }>> => {
    return apiRequest(API_ENDPOINTS.PROPERTIES.OWNER_ACTIVITIES);
  },

  updatePropertyStatus: async (propertyId: string, status: string): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest(API_ENDPOINTS.PROPERTIES.STATUS(propertyId), {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

export const profileApi = {
  getProfile: async (): Promise<ApiResponse<{
    profile: any;
    user: any;
  }>> => {
    return apiRequest(API_ENDPOINTS.PROFILES.ME);
  },

  setupProfileWithImage: async (formData: FormData): Promise<ApiResponse<{
    profile: any;
    user: any;
  }>> => {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PROFILES.SETUP}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();
    console.log(`Profile setup response:`, { status: response.status, data });
    
    if (!response.ok) {
      const errorMessage = data.error || data.message || `HTTP ${response.status}: Request failed`;
      throw new Error(errorMessage);
    }

    return data;
  },

  setupProfile: async (profileData: any): Promise<ApiResponse<{
    profile: any;
    user: any;
  }>> => {
    return apiRequest(API_ENDPOINTS.PROFILES.SETUP, {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },

  selectRole: async (role: string): Promise<ApiResponse<{
    user: any;
    profile: any;
    role: any;
    needs_profile_setup: boolean;
  }>> => {
    return apiRequest(API_ENDPOINTS.PROFILES.SELECT_ROLE, {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  },

  getCurrentRole: async (): Promise<ApiResponse<{
    user: any;
    profile: any;
    role: any;
    has_role: boolean;
    needs_profile_setup: boolean;
  }>> => {
    return apiRequest(API_ENDPOINTS.PROFILES.CURRENT_ROLE);
  },

  updateProfile: async (profileData: any): Promise<ApiResponse<{
    profile: any;
  }>> => {
    return apiRequest(API_ENDPOINTS.PROFILES.UPDATE, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  checkCompletion: async (): Promise<ApiResponse<{
    is_complete: boolean;
    missing_fields: string[];
    profile_exists: boolean;
  }>> => {
    return apiRequest(API_ENDPOINTS.PROFILES.CHECK_COMPLETION);
  },
};

export const findAgentApi = {
  searchAgents: async (params: AgentSearchParams = {}): Promise<ApiResponse<{
    agents: Agent[];
    pagination: PaginationInfo;
  }>> => {
    const queryParams = new URLSearchParams();
    
    if (params.location) queryParams.set('location', params.location);
    if (params.agentName) queryParams.set('agentName', params.agentName);
    if (params.agentType && params.agentType !== 'both') queryParams.set('agentType', params.agentType);
    if (params.radius) queryParams.set('radius', params.radius);
    if (params.featured) queryParams.set('featured', 'true');
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.per_page) queryParams.set('per_page', params.per_page.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_ENDPOINTS.AGENTS.BASE}?${queryString}` : API_ENDPOINTS.AGENTS.BASE;
    
    return apiRequest(endpoint);
  },

  getFeaturedAgents: async (limit: number = 6): Promise<ApiResponse<{
    agents: Agent[];
  }>> => {
    return apiRequest(`${API_ENDPOINTS.AGENTS.FEATURED}?limit=${limit}`);
  },

  getAgentDetails: async (agentId: number): Promise<ApiResponse<{
    agent: Agent;
  }>> => {
    return apiRequest(API_ENDPOINTS.AGENTS.DETAILS(agentId));
  },

  contactAgent: async (inquiryData: ContactInquiryData): Promise<ApiResponse<{
    inquiry_id: string;
    agent_name?: string;
    agent_company?: string;
  }>> => {
    console.log('Attempting to contact agent with data:', inquiryData);
    console.log('Making request to:', API_ENDPOINTS.AGENTS.CONTACT);
    
    return apiRequest(API_ENDPOINTS.AGENTS.CONTACT, {
      method: 'POST',
      body: JSON.stringify(inquiryData),
    });
  },

  addAgentReview: async (agentId: number, reviewData: AgentReviewData): Promise<ApiResponse<{
    review_id: number;
    agent_name: string;
    new_average_rating: number;
    total_reviews: number;
  }>> => {
    return apiRequest(API_ENDPOINTS.AGENTS.REVIEWS(agentId), {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  getAgentReviews: async (
    agentId: number, 
    page: number = 1, 
    perPage: number = 10,
    ratingFilter?: number,
    verifiedOnly: boolean = false
  ): Promise<ApiResponse<{
    reviews: AgentReview[];
    rating_stats: {
      average_rating: number;
      total_reviews: number;
      rating_breakdown: Record<string, number>;
    };
    pagination: PaginationInfo;
  }>> => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });
    
    if (ratingFilter) queryParams.set('rating_filter', ratingFilter.toString());
    if (verifiedOnly) queryParams.set('verified_only', 'true');

    return apiRequest(`${API_ENDPOINTS.AGENTS.REVIEWS(agentId)}?${queryParams.toString()}`);
  },

  getAgentInquiries: async (
    agentId: number,
    page: number = 1,
    perPage: number = 20,
    statusFilter?: string
  ): Promise<ApiResponse<{
    agent_name: string;
    inquiries: Array<{
      id: number;
      full_name: string;
      email: string;
      phone: string;
      property_title: string;
      buyer_type: string;
      status: 'pending' | 'responded' | 'closed';
      message: string;
      created_at: string;
      agent_name?: string;
      agent_company?: string;
    }>;
    inquiry_stats: any;
    pagination: PaginationInfo;
  }>> => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });
    
    if (statusFilter) queryParams.set('status', statusFilter);

    return apiRequest(`${API_ENDPOINTS.AGENTS.INQUIRIES(agentId)}?${queryParams.toString()}`);
  },

  healthCheck: async (): Promise<ApiResponse<{
    service: string;
    status: string;
    timestamp: string;
    version: string;
  }>> => {
    return apiRequest(API_ENDPOINTS.AGENTS.HEALTH);
  },
};

export const notificationApi = {
  getNotifications: async (params: {
    page?: number;
    per_page?: number;
    type?: string;
    search?: string;
    unread_only?: boolean;
    user_role?: string;
  } = {}): Promise<ApiResponse<NotificationListResponse>> => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.per_page) queryParams.set('per_page', params.per_page.toString());
    if (params.type && params.type !== 'all') queryParams.set('type', params.type);
    if (params.search) queryParams.set('search', params.search);
    if (params.unread_only) queryParams.set('unread_only', 'true');
    if (params.user_role) queryParams.set('user_role', params.user_role);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_ENDPOINTS.NOTIFICATIONS.BASE}?${queryString}` : API_ENDPOINTS.NOTIFICATIONS.BASE;
    
    return apiRequest(endpoint);
  },

  getUnreadCount: async (): Promise<ApiResponse<{ unread_count: number }>> => {
    return apiRequest(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
  },

  markAsRead: async (notificationId: string): Promise<ApiResponse<{ 
    message: string; 
    unread_count: number; 
  }>> => {
    return apiRequest(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId), {
      method: 'PUT',
    });
  },

  markAllAsRead: async (): Promise<ApiResponse<{ 
    message: string; 
    marked_count: number; 
  }>> => {
    return apiRequest(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, {
      method: 'PUT',
    });
  },

  deleteNotification: async (notificationId: string): Promise<ApiResponse<{ 
    message: string; 
    unread_count: number; 
  }>> => {
    return apiRequest(API_ENDPOINTS.NOTIFICATIONS.DELETE(notificationId), {
      method: 'DELETE',
    });
  },

  getPreferences: async (): Promise<ApiResponse<{
    preferences: NotificationPreferences;
  }>> => {
    return apiRequest(API_ENDPOINTS.NOTIFICATIONS.PREFERENCES);
  },

  updatePreferences: async (preferences: Partial<NotificationPreferences>): Promise<ApiResponse<{
    message: string;
  }>> => {
    return apiRequest(API_ENDPOINTS.NOTIFICATIONS.PREFERENCES, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  },

  createNotification: async (data: CreateNotificationData): Promise<ApiResponse<{
    message: string;
    notification: Notification;
  }>> => {
    return apiRequest(API_ENDPOINTS.NOTIFICATIONS.BASE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  testNotification: async (): Promise<ApiResponse<{
    message: string;
    notification_id: string;
  }>> => {
    return apiRequest(API_ENDPOINTS.NOTIFICATIONS.TEST, {
      method: 'POST',
    });
  },
};

export const externalTenantApi = {
  setupProfile: async (data: ExternalTenantSetupData): Promise<ApiResponse<{
    user: any;
    profile: any;
    external_tenant_profile: ExternalTenantProfile;
    role: any;
    needs_profile_setup: boolean;
    needs_tenant_verification: boolean;
    tenant_type: 'external';
  }>> => {
    return apiRequest(API_ENDPOINTS.EXTERNAL_TENANT.SETUP, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getProfile: async (): Promise<ApiResponse<{
    external_tenant_profile: ExternalTenantProfile;
    user: any;
  }>> => {
    return apiRequest(API_ENDPOINTS.EXTERNAL_TENANT.PROFILE);
  },

  updateProfile: async (data: Partial<{
    property_address: string;
    postcode: string;
    property_type: string;
    bedrooms: number;
    bathrooms: number;
    landlord_name: string;
    landlord_email: string;
    landlord_phone: string;
    tenancy_length: string;
    monthly_rent: number;
    deposit: number;
    additional_info: string;
    move_in_date: string;
  }>): Promise<ApiResponse<{
    external_tenant_profile: ExternalTenantProfile;
    updated_fields: string[];
  }>> => {
    return apiRequest(API_ENDPOINTS.EXTERNAL_TENANT.UPDATE, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  checkProfile: async (): Promise<ApiResponse<{
    has_external_profile: boolean;
    is_tenant_role: boolean;
    user_role: string;
    redirect_to: 'dashboard' | 'external_tenant_setup' | 'role_selection';
    setup_required: boolean;
    profile_complete: boolean;
    profile_summary?: {
      property_address: string;
      postcode: string;
      monthly_rent: number;
      is_verified: boolean;
      created_at: string;
    };
  }>> => {
    return apiRequest(API_ENDPOINTS.EXTERNAL_TENANT.CHECK_PROFILE);
  },

  getDashboard: async (): Promise<ApiResponse<ExternalTenantDashboardData>> => {
    return apiRequest(API_ENDPOINTS.EXTERNAL_TENANT.DASHBOARD);
  },

  getSummary: async (): Promise<ApiResponse<{
    tenant_name: string;
    property_address: string;
    postcode: string;
    monthly_rent: number;
    move_in_date: string;
    days_since_move_in?: number;
    tenancy_length: string;
    is_verified: boolean;
    is_active: boolean;
    landlord_name: string;
    property_type: string;
    bedrooms: number;
  }>> => {
    return apiRequest(API_ENDPOINTS.EXTERNAL_TENANT.DASHBOARD_SUMMARY);
  },

  resendWelcomeEmail: async (): Promise<ApiResponse<{
    email_sent: boolean;
  }>> => {
    return apiRequest(API_ENDPOINTS.EXTERNAL_TENANT.RESEND_WELCOME, {
      method: 'POST',
    });
  },
};

// Owner Dashboard API
export interface RevenueStats {
  total_revenue: number;
  average_monthly_revenue: number;
  period: {
    start_date: string;
    end_date: string;
  };
  monthly_trends: Array<{
    period: string;
    revenue: number;
  }>;
  revenue_by_type: Array<{
    type: string;
    amount: number;
  }>;
  property_breakdown: Array<{
    property_id: number;
    property_title: string;
    property_address: string;
    revenue: number;
    percentage: number;
  }>;
  total_transactions: number;
}

export interface PropertyViewing {
  id: number;
  property_id: number;
  viewer_id: number;
  scheduled_date: string;
  duration_minutes: number;
  viewing_type: 'in_person' | 'virtual' | 'video_call';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  contact_phone?: string;
  special_requirements?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  property?: {
    id: number;
    title: string;
    address: string;
    property_type?: string;
  };
}

export interface CalendarEvent {
  id: number;
  owner_id: number;
  property_id?: number;
  title: string;
  description?: string;
  event_type: 'viewing' | 'maintenance' | 'inspection' | 'meeting' | 'reminder' | 'other';
  start_datetime: string;
  end_datetime: string;
  all_day: boolean;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  location?: string;
  notes?: string;
  attendees?: string;
  reminder_sent: boolean;
  reminder_minutes_before?: number;
  created_at: string;
  updated_at: string;
  property?: {
    id: number;
    title: string;
    address: string;
  };
}

export const ownerDashboardApi = {
  // Revenue Statistics
  getRevenueStats: async (params: {
    start_date?: string;
    end_date?: string;
    property_id?: number;
    period?: 'month' | 'quarter' | 'year';
  } = {}): Promise<ApiResponse<RevenueStats>> => {
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.set('start_date', params.start_date);
    if (params.end_date) queryParams.set('end_date', params.end_date);
    if (params.property_id) queryParams.set('property_id', params.property_id.toString());
    if (params.period) queryParams.set('period', params.period);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_ENDPOINTS.OWNER.REVENUE_STATS}?${queryString}` : API_ENDPOINTS.OWNER.REVENUE_STATS;
    return apiRequest(endpoint);
  },

  // Property Viewings/Bookings
  getViewings: async (params: {
    property_id?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
  } = {}): Promise<ApiResponse<PropertyViewing[]>> => {
    const queryParams = new URLSearchParams();
    if (params.property_id) queryParams.set('property_id', params.property_id.toString());
    if (params.status) queryParams.set('status', params.status);
    if (params.start_date) queryParams.set('start_date', params.start_date);
    if (params.end_date) queryParams.set('end_date', params.end_date);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_ENDPOINTS.OWNER.VIEWINGS}?${queryString}` : API_ENDPOINTS.OWNER.VIEWINGS;
    return apiRequest(endpoint);
  },

  createViewing: async (data: {
    property_id: number;
    viewer_id?: number;
    scheduled_date: string;
    duration_minutes?: number;
    viewing_type?: 'in_person' | 'virtual' | 'video_call';
    contact_phone?: string;
    special_requirements?: string;
    notes?: string;
  }): Promise<ApiResponse<PropertyViewing>> => {
    return apiRequest(API_ENDPOINTS.OWNER.VIEWINGS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateViewing: async (viewingId: number, data: {
    scheduled_date?: string;
    duration_minutes?: number;
    viewing_type?: 'in_person' | 'virtual' | 'video_call';
    status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
    contact_phone?: string;
    special_requirements?: string;
    notes?: string;
  }): Promise<ApiResponse<PropertyViewing>> => {
    return apiRequest(API_ENDPOINTS.OWNER.VIEWING_DETAILS(viewingId), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteViewing: async (viewingId: number): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest(API_ENDPOINTS.OWNER.VIEWING_DETAILS(viewingId), {
      method: 'DELETE',
    });
  },

  // Calendar Events
  getCalendarEvents: async (params: {
    start_date?: string;
    end_date?: string;
    property_id?: number;
    event_type?: string;
    status?: string;
  } = {}): Promise<ApiResponse<CalendarEvent[]>> => {
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.set('start_date', params.start_date);
    if (params.end_date) queryParams.set('end_date', params.end_date);
    if (params.property_id) queryParams.set('property_id', params.property_id.toString());
    if (params.event_type) queryParams.set('event_type', params.event_type);
    if (params.status) queryParams.set('status', params.status);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_ENDPOINTS.OWNER.CALENDAR_EVENTS}?${queryString}` : API_ENDPOINTS.OWNER.CALENDAR_EVENTS;
    return apiRequest(endpoint);
  },

  createCalendarEvent: async (data: {
    property_id?: number;
    title: string;
    description?: string;
    event_type: 'viewing' | 'maintenance' | 'inspection' | 'meeting' | 'reminder' | 'other';
    start_datetime: string;
    end_datetime: string;
    all_day?: boolean;
    location?: string;
    notes?: string;
    attendees?: string;
    reminder_minutes_before?: number;
  }): Promise<ApiResponse<CalendarEvent>> => {
    return apiRequest(API_ENDPOINTS.OWNER.CALENDAR_EVENTS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateCalendarEvent: async (eventId: number, data: {
    property_id?: number;
    title?: string;
    description?: string;
    event_type?: 'viewing' | 'maintenance' | 'inspection' | 'meeting' | 'reminder' | 'other';
    start_datetime?: string;
    end_datetime?: string;
    all_day?: boolean;
    status?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
    location?: string;
    notes?: string;
    attendees?: string;
    reminder_minutes_before?: number;
  }): Promise<ApiResponse<CalendarEvent>> => {
    return apiRequest(API_ENDPOINTS.OWNER.CALENDAR_EVENT_DETAILS(eventId), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteCalendarEvent: async (eventId: number): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest(API_ENDPOINTS.OWNER.CALENDAR_EVENT_DETAILS(eventId), {
      method: 'DELETE',
    });
  },
};

export default authApi;