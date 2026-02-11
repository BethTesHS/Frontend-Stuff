export interface SpareRoom {
  id: string;
  title: string;
  description: string;
  rent: number;
  deposit: number;
  available_from: string;
  room_type: 'single' | 'double' | 'ensuite' | 'studio';
  size_sqft?: number;
  furnished: boolean;
  bills_included: boolean;
  internet_included: boolean;
  parking_available: boolean;
  garden_access: boolean;
  images: string[];
  
  // Property details (auto-filled or manual)
  property_id?: string; // If linked to existing property
  property_address: string;
  property_type: string;
  postcode: string;
  
  // Housemate preferences
  preferences: {
    gender?: 'male' | 'female' | 'any';
    age_range?: string;
    profession?: string[];
    smoking?: boolean;
    pets?: boolean;
  };
  
  // House rules and info
  house_rules: string[];
  current_housemates: number;
  total_housemates: number;
  nearest_station?: string;
  transport_links: string[];
  
  // Contact info
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  
  // Metadata
  posted_by_role: 'agent' | 'landlord' | 'tenant';
  posted_by_id: string;
  status: 'active' | 'rented' | 'withdrawn';
  created_at: string;
  updated_at: string;
}

export interface UserProperty {
  id: string;
  title: string;
  address: string;
  postcode: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
}

export interface SpareRoomFormData {
  title: string;
  description: string;
  rent: string;
  deposit: string;
  available_from: string;
  room_type: string;
  size_sqft: string;
  furnished: boolean;
  bills_included: boolean;
  internet_included: boolean;
  parking_available: boolean;
  garden_access: boolean;
  
  // Property selection
  use_existing_property: boolean;
  selected_property_id: string;
  property_address: string;
  property_type: string;
  postcode: string;
  
  // Preferences
  preferences: {
    gender: string;
    age_range: string;
    profession: string[];
    smoking: boolean;
    pets: boolean;
  };
  
  // House details
  house_rules: string[];
  current_housemates: string;
  total_housemates: string;
  nearest_station: string;
  transport_links: string[];
  
  // Contact (auto-filled based on role)
  contact_name: string;
  contact_email: string;
  contact_phone: string;
}