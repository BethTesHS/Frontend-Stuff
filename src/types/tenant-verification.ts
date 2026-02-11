
export interface TenantVerificationData {
  // Verification method
  verificationMethod: 'pin' | 'manual';
  
  // PIN-based verification
  agentPin?: string;
  
  // Property details (for manual entry)
  propertyAddress?: string;
  propertyCode?: string;
  
  // Tenant information
  tenantFullName: string;
  tenantEmail?: string;
  tenantPhone?: string;
  
  // Agent/Landlord information (for manual entry)
  agentLandlordName?: string;
  agentLandlordEmail?: string;
  agentLandlordPhone?: string;
  
  // Tenancy details (for manual entry)
  moveInDate?: Date;
  tenancyLengthMonths?: number;
  monthlyRent?: number;
  securityDeposit?: number;
  
  // Documents
  tenancyProof?: File | null;
}

export interface PinValidationResponse {
  isValid: boolean;
  agentId?: string;
  propertyId?: string;
  agentName?: string;
  propertyAddress?: string;
}
