import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export const useAdminGuard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAdminAuth();

  useEffect(() => {
    // If not loading and not authenticated, redirect to admin login
    if (!loading && !isAuthenticated) {
      console.log('[useAdminGuard] Admin not authenticated, redirecting to admin-login');
      navigate('/admin-login');
    }
  }, [loading, isAuthenticated, navigate]);

  return { isAdminAuthenticated: isAuthenticated, loading };
};
