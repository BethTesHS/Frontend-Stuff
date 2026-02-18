import { getAuthToken } from '@/utils/tokenStorage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://homedapp1.azurewebsites.net';

export interface SpareRoomData {
  id?: number;
  title: string;
  description: string;
  rent: number;
  deposit: number;
  available_from: string;
  room_type: string;
  size_sqft?: number;
  furnished: boolean;
  bills_included: boolean;
  internet_included: boolean;
  parking_available: boolean;
  garden_access: boolean;
  property_id?: string;
  property_address: string;
  property_type: string;
  postcode: string;
  preferences: {
    gender?: string;
    age_range?: string;
    profession: string[];
    smoking: boolean;
    pets: boolean;
  };
  house_rules: string[];
  current_housemates: number;
  total_housemates: number;
  nearest_station?: string;
  transport_links: string[];
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  posted_by_role: string;
  posted_by_id: string;
  status?: string;
  images?: string[];
  created_at?: string;
  updated_at?: string;
}

class SpareRoomApiService {
  private getToken(): string | null {
    return getAuthToken();
  }

  private async request(url: string, options: RequestInit = {}) {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers,
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  private async requestFormData(url: string, formData: FormData, method: string = 'POST') {
    const token = this.getToken();
    const headers: HeadersInit = {};

    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method,
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async createSpareRoom(data: SpareRoomData, images: File[]) {
    const formData = new FormData();

    // Add all form fields
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'preferences' || key === 'house_rules' || key === 'transport_links') {
        formData.append(key, JSON.stringify(value));
      } else if (typeof value === 'boolean') {
        formData.append(key, value.toString());
      } else if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    // Add images
    images.forEach((image) => {
      formData.append('images', image);
    });

    // Use create-with-files endpoint if images are provided, otherwise use create endpoint
    const endpoint = images.length > 0
      ? '/api/spare-rooms/create-with-files'
      : '/api/spare-rooms/create';

    return this.requestFormData(endpoint, formData);
  }

  async getSpareRooms(userId?: string) {
    if (userId) {
      const response = await this.request('/api/spare-rooms/my-spare-rooms');
      // Handle backend response format: { success: true, data: { spare_rooms: [], pagination: {} } }
      return response?.data?.spare_rooms || response?.spare_rooms || response?.data || [];
    }
    const response = await this.request('/api/spare-rooms/');
    // Handle backend response format: { success: true, data: { spare_rooms: [], pagination: {} } }
    return response?.data?.spare_rooms || response?.spare_rooms || response?.data || [];
  }

  async getSpareRoom(id: number) {
    const response = await this.request(`/api/spare-rooms/${id}`);
    // Handle backend response format: { success: true, data: { spare_room: {} } }
    return response?.data?.spare_room || response?.spare_room || response?.data || response;
  }

  async updateSpareRoom(id: number, data: SpareRoomData, images: File[], existingImages: string[] = []) {
    const formData = new FormData();

    // Add all form fields
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'preferences' || key === 'house_rules' || key === 'transport_links') {
        formData.append(key, JSON.stringify(value));
      } else if (typeof value === 'boolean') {
        formData.append(key, value.toString());
      } else if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    // Add existing images
    formData.append('existing_images', JSON.stringify(existingImages));

    // Add new images
    images.forEach((image) => {
      formData.append('images', image);
    });

    return this.requestFormData(`/api/spare-rooms/${id}/update`, formData, 'PUT');
  }

  async deleteSpareRoom(id: number) {
    return this.request(`/api/spare-rooms/${id}`, { method: 'DELETE' });
  }

  async getFeaturedSpareRooms() {
    const response = await this.request('/api/spare-rooms/featured');
    return response?.data?.spare_rooms || response?.spare_rooms || response?.data || [];
  }

  async searchSpareRooms(filters: Record<string, any>) {
    const params = new URLSearchParams(filters).toString();
    const response = await this.request(`/api/spare-rooms/search?${params}`);
    return response?.data?.spare_rooms || response?.spare_rooms || response?.data || [];
  }

  async getMySpareRoomsStats() {
    const response = await this.request('/api/spare-rooms/my-spare-rooms/stats');
    return response?.data || response;
  }

  async getRoomInquiries(roomId: number) {
    const response = await this.request(`/api/spare-rooms/${roomId}/inquiries`);
    return response?.data?.inquiries || response?.inquiries || response?.data || [];
  }

  async submitInquiry(roomId: number, inquiryData: any) {
    return this.request(`/api/spare-rooms/${roomId}/inquire`, {
      method: 'POST',
      body: JSON.stringify(inquiryData),
    });
  }

  async uploadAdditionalImages(roomId: number, images: File[]) {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });
    return this.requestFormData(`/api/spare-rooms/${roomId}/upload-images`, formData);
  }

  async setPrimaryImage(roomId: number, imageId: number) {
    return this.request(`/api/spare-rooms/${roomId}/set-primary-image/${imageId}`, {
      method: 'POST',
    });
  }

  async getRoomImages(roomId: number) {
    const response = await this.request(`/api/spare-rooms/${roomId}/images`);
    return response?.data?.images || response?.images || response?.data || [];
  }

  async getUserProperties(userId: string) {
    return this.request(`/api/user-properties?user_id=${userId}`);
  }

  async createUserProperty(data: {
    user_id: string;
    title: string;
    address: string;
    postcode: string;
    property_type: string;
    bedrooms: number;
    bathrooms: number;
  }) {
    return this.request('/api/user-properties', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPlatformStats() {
    const response = await this.request('/properties/platform-stats');
    return response?.data || response;
  }
}

export const spareRoomApi = new SpareRoomApiService();