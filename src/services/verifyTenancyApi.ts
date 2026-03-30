import { getAuthToken } from "@/utils/tokenStorage";
import { API_BASE_URL, API_ENDPOINTS } from "@/constants/apiEndpoints";

export interface PageInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  pageinfo?: PageInfo;
  type: string;
  status: number;
}

export type DocumentType =
  | "tenancy_agreement"
  | "council_tax"
  | "utility_bill"
  | "driving_licence"
  | "bank_statement"
  | "passport";

export interface SubmitVerificationPayload {
  verificationMethod: "pin" | "manual";
  tenantFullName: string;
  tenantEmail?: string;
  tenantPhone?: string;
  isPresentTenancy: boolean;
  startDate: string;
  endDate?: string;
  tenancyLengthMonths?: number;
  monthlyRent?: number;
  securityDeposit?: number;
  landlordName?: string;
  landlordEmail?: string;
  landlordPhone?: string;
  agentPin?: string;
  propertyAddress?: string;
  propertyCode?: string;
  documentPaths: {
    type: DocumentType;
    path: string;
  }[];
}

const getHeaders = () => {
  const token = getAuthToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const verifyTenancyApi = {
  async shouldRedirectToDashboard(): Promise<
    ApiResponse<{ shouldRedirect: boolean; target: string }>
  > {
    const response = await fetch(`${API_BASE_URL}/api/tenant/should-redirect`, {
      method: "GET",
      headers: getHeaders(),
    });
    return response.json();
  },

  async validatePin(pin: string): Promise<
    ApiResponse<{
      isValid: boolean;
      propertyAddress: string;
      agentName: string;
      agentEmail: string;
      agentPhone: string;
      propertyId?: string;
    }>
  > {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.TENANT_VERIFICATION.VALIDATE_PIN}`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ pin }),
      },
    );
    return response.json();
  },

  async uploadDocument(
    file: File,
    documentType: DocumentType,
  ): Promise<ApiResponse<{ file_path: string }>> {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", documentType);

    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.TENANT_VERIFICATION.UPLOAD_DOCUMENT}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      },
    );
    return response.json();
  },

  async submitVerification(
    data: SubmitVerificationPayload,
  ): Promise<ApiResponse<{ request_id: string }>> {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.TENANT_VERIFICATION.SUBMIT_REQUEST}`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      },
    );
    return response.json();
  },

  async getStatus(): Promise<
    ApiResponse<{
      status: "pending" | "approved" | "rejected" | "unverified";
      rejection_reason?: string;
      rating?: number;
    }>
  > {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.TENANT_VERIFICATION.CHECK_STATUS}`,
      {
        method: "GET",
        headers: getHeaders(),
      },
    );
    return response.json();
  },

  async deleteDocument(documentId: string): Promise<ApiResponse<null>> {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.TENANT_VERIFICATION.DELETE_DOCUMENT(documentId)}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      },
    );
    return response.json();
  },
};
