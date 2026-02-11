import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AdminProfile } from '@/services/adminApi';

export const useAdmin = () => {
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadAdminDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to get from localStorage first
      const storedAdmin = localStorage.getItem('admin_profile');
      if (storedAdmin) {
        setAdmin(JSON.parse(storedAdmin));
      }

      // Then fetch fresh data from API
      const { adminApi } = await import('@/services/adminApi');
      const response = await adminApi.getAdminDetails();
      setAdmin(response.admin);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load admin details';
      setError(errorMessage);

      // If unauthorized, redirect to login
      if (errorMessage.includes('Session expired') || errorMessage.includes('No admin token')) {
        navigate('/admin-login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminDetails();
  }, []);

  const logout = async () => {
    try {
      const { adminApi } = await import('@/services/adminApi');
      await adminApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_profile');
      setAdmin(null);
      navigate('/admin-login');
    }
  };

  const refreshAdmin = () => {
    loadAdminDetails();
  };

  return {
    admin,
    isLoading,
    error,
    logout,
    refreshAdmin,
    isAuthenticated: !!admin,
  };
};
