
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export const useAuthGuard = (allowedRoles: string[] = [], requireProfileComplete: boolean = true) => {
  const { user, isAuthenticated, loading, updateUser } = useAuth();
  const navigate = useNavigate();
  const [checkingTenantStatus] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated && user?.role === 'tenant' && user.tenantVerified === undefined) {
      const updatedUser = { ...user, tenantVerified: false };
      updateUser(updatedUser);
    }
  }, [loading, isAuthenticated, user, updateUser]);

  useEffect(() => {
    if (loading || checkingTenantStatus) {
      return;
    }

    if (!hasInitialized) {
      setHasInitialized(true);
      return;
    }

    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    if (isAuthenticated && !user) {
      return;
    }

    if (isAuthenticated && user && allowedRoles.length > 0 && !user.role) {
      navigate('/select-role');
      return;
    }

    if (allowedRoles.length > 0 && user?.role && !allowedRoles.includes(user.role)) {
      navigate('/');
      return;
    }
  }, [user, isAuthenticated, loading, allowedRoles, navigate, requireProfileComplete, checkingTenantStatus, hasInitialized]);

  const hasAccess = !loading && !checkingTenantStatus && isAuthenticated && (
    allowedRoles.length === 0 ||
    (user?.role && allowedRoles.includes(user.role))
  );

  return { user, loading: loading || checkingTenantStatus, hasAccess };
};
