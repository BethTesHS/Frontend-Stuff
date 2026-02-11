export interface Room {
  id: string;
  title: string;
  description: string;
  rent: number;
  deposit: number;
  available_from: string;
  property_address: string;
  room_type: 'single' | 'double' | 'ensuite' | 'studio';
  size_sqft?: number;
  furnished: boolean;
  bills_included: boolean;
  internet_included: boolean;
  parking_available: boolean;
  garden_access: boolean;
  images: string[];
  landlord_id?: string;
  landlord_name: string;
  landlord_email: string;
  landlord_phone?: string;
  preferences: {
    gender?: 'male' | 'female' | 'any';
    age_range?: string;
    profession?: string[];
    smoking?: boolean;
    pets?: boolean;
  };
  house_rules: string[];
  current_housemates: number;
  total_housemates: number;
  nearest_station?: string;
  transport_links: string[];
  created_at: string;
  updated_at: string;
}

export interface RoomFilters {
  min_rent?: number;
  max_rent?: number;
  room_type?: string[];
  furnished?: boolean;
  bills_included?: boolean;
  available_from?: string;
  location?: string;
  transport_links?: string[];
  preferences?: {
    gender?: string;
    smoking?: boolean;
    pets?: boolean;
  };
}