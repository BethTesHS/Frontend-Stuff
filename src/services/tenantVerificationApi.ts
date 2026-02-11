import { TenantVerificationData, PinValidationResponse } from '@/types/tenant-verification';

const API_BASE_URL = 'https://homedapp1.azurewebsites.net/api/tenant';

export const tenantVerificationApi = {
  async checkClaimStatus(data: { access_code?: string; pin_code?: string; full_address?: string }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return { success: false, error: 'Authentication required. Please log in again.' };
      }

      const response = await fetch(`${API_BASE_URL}/check-claim-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('Check claim status error:', result);
        return { success: false, error: result.error || result.message || 'Failed to check claim status' };
      }

      return { success: true, data: result.data };
    } catch (error) {
      console.error('Check claim status error:', error);
      return { success: false, error: 'Failed to check claim status' };
    }
  },

  async shouldRedirectToDashboard(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return { success: false, error: 'Authentication required. Please log in again.' };
      }

      const response = await fetch(`${API_BASE_URL}/should-redirect`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('Should redirect check error:', result);
        return { success: false, error: result.error || result.message || 'Failed to check redirect status' };
      }

      return { success: true, data: result.data };
    } catch (error) {
      console.error('Should redirect check error:', error);
      return { success: false, error: 'Failed to check redirect status' };
    }
  },

  async validatePin(pinCode: string): Promise<PinValidationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/validate-pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin: pinCode }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('PIN validation error:', result);
        return { isValid: false };
      }

      if (result.data.isValid) {
        return {
          isValid: true,
          agentId: result.data.pinId,
          propertyId: result.data.propertyId,
          agentName: result.data.agentName,
          propertyAddress: result.data.propertyAddress
        };
      } else {
        return { isValid: false };
      }
    } catch (error) {
      console.error('PIN validation error:', error);
      return { isValid: false };
    }
  },

  async submitVerificationRequest(data: TenantVerificationData, pinValidation?: PinValidationResponse): Promise<{ success: boolean; error?: string }> {
    try {
      // Debug token retrieval
      const token = localStorage.getItem('auth_token');
      console.log('Token from localStorage:', token);
      console.log('All localStorage keys:', Object.keys(localStorage));
      
      if (!token) {
        console.error('No auth token found in localStorage');
        return { success: false, error: 'Authentication required. Please log in again.' };
      }

      // Create FormData for file upload support
      const formData = new FormData();
      
      // Add form fields
      formData.append('verificationMethod', data.verificationMethod);
      formData.append('tenantFullName', data.tenantFullName);
      
      if (data.tenantEmail) formData.append('tenantEmail', data.tenantEmail);
      if (data.tenantPhone) formData.append('tenantPhone', data.tenantPhone);
      if (data.agentPin) formData.append('pin_code', data.agentPin); // Backend expects pin_code
      if (data.propertyAddress) formData.append('propertyAddress', data.propertyAddress);
      if (data.propertyCode) formData.append('access_code', data.propertyCode); // Backend expects access_code
      if (data.agentLandlordName) formData.append('agentLandlordName', data.agentLandlordName);
      if (data.agentLandlordEmail) formData.append('agentLandlordEmail', data.agentLandlordEmail);
      if (data.agentLandlordPhone) formData.append('agentLandlordPhone', data.agentLandlordPhone);
      if (data.moveInDate) formData.append('moveInDate', data.moveInDate.toISOString());
      if (data.tenancyLengthMonths) formData.append('tenancyLengthMonths', data.tenancyLengthMonths.toString());
      if (data.monthlyRent) formData.append('monthlyRent', data.monthlyRent.toString());
      if (data.securityDeposit) formData.append('securityDeposit', data.securityDeposit.toString());
      
      // Add file if presentsss
      if (data.tenancyProof) {
        formData.append('tenancyProof', data.tenancyProof);
      }

      console.log('Making request to:', `${API_BASE_URL}/claim-property`);
      console.log('Authorization header:', `Bearer ${token}`);

      const response = await fetch(`${API_BASE_URL}/claim-property`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const result = await response.json();
      console.log('Response body:', result);
      
      if (!response.ok) {
        console.error('API Error:', result);
        return { success: false, error: result.error || result.message || 'Failed to submit verification request' };
      }

      return { success: true };
    } catch (error) {
      console.error('Verification submission error:', error);
      return { success: false, error: 'Failed to submit verification request' };
    }
  }
};