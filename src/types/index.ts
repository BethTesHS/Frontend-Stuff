export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role?: 'user' | 'agent' | 'tenant' | 'buyer' | 'owner' | 'manager' | 'agency_admin';
  avatar?: string;
  phone?: string;
  createdAt?: string;
  isActive?: boolean;
  isVerified?: boolean;
  profileComplete?: boolean;
  tenantVerified?: boolean;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  type: 'house' | 'flat' | 'bungalow' | 'maisonette' | 'land';
  bedrooms: number;
  bathrooms: number;
  receptions: number;
  propertySize?: number;
  landSize?: number;
  address: {
    street: string;
    city: string;
    postcode: string;
    county: string;
    coordinates?: { lat: number; lng: number };
  };

  latitude?: number;
  longitude?: number; 
  images: string[];
  features: string[];
  energyRating?: string;
  councilTaxBand?: string;
  tenure: 'freehold' | 'leasehold';
  yearBuilt?: number;
  listingType: 'sale' | 'rent';
  status: 'active' | 'sold' | 'under_offer' | 'let' | 'withdrawn';
  agentId: string;
  createdAt: string;
  updatedAt: string;
  passportRating?: number;
  primary_image_url?: string;
  image_count?: number;
}

export interface PropertyHistory {
  id: string;
  propertyId: string;
  date: string;
  event: 'listing' | 'price_change' | 'status_change' | 'sold' | 'let';
  details: string;
  price?: number;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  propertyId?: string;
  content: string;
  timestamp: string;
  read: boolean;
  type: 'inquiry' | 'viewing_request' | 'offer' | 'general';
}

export interface Document {
  id: string;
  propertyId: string;
  uploadedBy: string;
  filename: string;
  fileType: string;
  fileSize: number;
  category: 'epc' | 'floor_plan' | 'title_deed' | 'survey' | 'other';
  uploadDate: string;
  secured: boolean;
}

export interface SearchFilters {
  location?: string;
  postcode?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string[];
  listingType?: 'sale' | 'rent';
  passportRating?: number;
}

export interface Complaint {
  id: string;
  ticketNumber: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  propertyId: string;
  agentId: string;
  houseNumber: string;
  issueType: string;
  description: string;
  imageUrl?: string;
  status: 'open' | 'in_progress' | 'closed';
  createdAt: string;
  closedAt?: string;
  resolutionDays?: number;
}

export interface TenantProperty {
  id: string;
  property: Property;
  agent: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    company?: string;
  };
  leaseStartDate: string;
  leaseEndDate: string;
  monthlyRent: number;
  depositAmount: number;
  houseNumber: string;
}
