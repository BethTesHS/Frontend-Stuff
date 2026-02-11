
interface TenantApprovalData {
  requestId: number;
  tenantName: string;
  email: string;
  propertyAddress: string;
  propertyCode: string;
}

interface TenantRejectionData {
  requestId: number;
  tenantName: string;
  email: string;
  reason?: string;
}

const API_BASE_URL = 'https://homedapp1.azurewebsites.net';

export const sendTenantApprovalEmail = async (data: TenantApprovalData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tenant/approve-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to send approval email: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Approval email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending approval email:', error);
    throw error;
  }
};

export const sendTenantRejectionEmail = async (data: TenantRejectionData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tenant/reject-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to send rejection email: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Rejection email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending rejection email:', error);
    throw error;
  }
};
