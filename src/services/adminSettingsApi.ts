type ValueType = 'String' | 'Number' | 'Boolean' | 'JSON';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/apiEndpoints';
import { getAdminToken } from "@/utils/adminAuth";

interface Setting {
  id: string;
  slug: string;
  value: string;
  description: string;
  type: ValueType;
}

interface SettingsResult {
  data?: Setting[];
  message?: string,
  pageinfo?: {
    current_page: number,
    total_pages: number,
    page_limit: number
  },
  type: string,
  status: number
}

class AdminSettingsApiService {
  private getAuthHeaders(): HeadersInit {
    const token = getAdminToken();
    if (!token) throw new Error("No admin token available");

    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };
  }
  async getSettings(page: number = 1, limit: number = 10): Promise<SettingsResult> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.SETTINGS_LIST}?page_no=${page}&limit=${limit}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });
      const respData = await response.json();
      const settingsData: Setting[] = (respData?.data ?? []).map(
        (row: any) => ({
          id: row.settings_uuid,
          slug: row.settings_name,
          value:
            typeof row.settings_value === "object"
              ? JSON.stringify(row.settings_value, null, 2)
              : String(row.settings_value ?? ""),
          description: row.description || "",
          type: row.value_type,
        }),
      );
      return { ...respData, data: settingsData }
    } catch (error) {
      console.error('Postcode lookup error:', error);
      return {
        status: 200,
        type: "error",
        message: error instanceof Error ? error.message : 'Failed to lookup admin settings'
      };
    }
  }

  async createSetting(data: any): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.SETTINGS_BASE}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
        credentials: 'include'
      });
      return await response.json();
    } catch (error) {
      console.error('Create setting error:', error);
      return { status: 500, type: "error", message: error instanceof Error ? error.message : 'Failed to create setting' };
    }
  }

  async updateSetting(id: string, data: any): Promise<any> {
    try {
      const payload = { ...data, settings_uuid: id };
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.SETTINGS_BASE}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      return await response.json();
    } catch (error) {
      console.error('Update setting error:', error);
      return { status: 500, type: "error", message: error instanceof Error ? error.message : 'Failed to update setting' };
    }
  }

  async deleteSetting(id: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.SETTINGS_BASE}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ settings_uuid: id }),
        credentials: 'include'
      });
      return await response.json();
    } catch (error) {
      console.error('Delete setting error:', error);
      return { status: 500, type: "error", message: error instanceof Error ? error.message : 'Failed to delete setting' };
    }
  }
}

export const adminSettingsApi = new AdminSettingsApiService();