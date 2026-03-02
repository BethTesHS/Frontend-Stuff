import { getAuthToken } from '@/utils/tokenStorage';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://homedapp1.azurewebsites.net/api';

export interface MaintenanceSchedule {
  id?: number;
  complaint_id: number;
  scheduled_date: string; // YYYY-MM-DD
  scheduled_time: string; // HH:MM
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
  schedules?: T;
}

const maintenanceApi = {
  /**
   * Get all maintenance schedules for owner/agent
   */
  async getAllSchedules(): Promise<MaintenanceSchedule[]> {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/maintenance-schedules`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch maintenance schedules: ${response.statusText}`);
      }

      const data = await response.json() as ApiResponse<MaintenanceSchedule[]>;
      return data.data || data.schedules || [];
    } catch (error) {
      console.error('Error fetching maintenance schedules:', error);
      throw error;
    }
  },

  /**
   * Get schedules for a specific complaint
   */
  async getSchedulesForComplaint(complaintId: number): Promise<MaintenanceSchedule[]> {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/maintenance-schedules?complaint_id=${complaintId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch schedules for complaint: ${response.statusText}`);
      }

      const data = await response.json() as ApiResponse<MaintenanceSchedule[]>;
      return data.data || data.schedules || [];
    } catch (error) {
      console.error('Error fetching complaint schedules:', error);
      throw error;
    }
  },

  /**
   * Create a new maintenance schedule
   */
  async createSchedule(schedule: MaintenanceSchedule): Promise<MaintenanceSchedule> {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/maintenance-schedules`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          complaint_id: schedule.complaint_id,
          scheduled_date: schedule.scheduled_date,
          scheduled_time: schedule.scheduled_time,
          notes: schedule.notes || ''
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create maintenance schedule');
      }

      const data = await response.json() as ApiResponse<MaintenanceSchedule>;
      return data.data || data as unknown as MaintenanceSchedule;
    } catch (error) {
      console.error('Error creating maintenance schedule:', error);
      throw error;
    }
  },

  /**
   * Update a maintenance schedule
   */
  async updateSchedule(scheduleId: number, updates: Partial<MaintenanceSchedule>): Promise<MaintenanceSchedule> {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/maintenance-schedules/${scheduleId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update maintenance schedule');
      }

      const data = await response.json() as ApiResponse<MaintenanceSchedule>;
      return data.data || data as unknown as MaintenanceSchedule;
    } catch (error) {
      console.error('Error updating maintenance schedule:', error);
      throw error;
    }
  },

  /**
   * Delete a maintenance schedule
   */
  async deleteSchedule(scheduleId: number): Promise<void> {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/maintenance-schedules/${scheduleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete maintenance schedule');
      }
    } catch (error) {
      console.error('Error deleting maintenance schedule:', error);
      throw error;
    }
  }
};

export default maintenanceApi;
