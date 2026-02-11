import { Navigate } from 'react-router-dom';
import { getAdminToken } from '@/utils/adminAuth';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
  const token = getAdminToken();

  if (!token) {
    return <Navigate to="/admin-login" replace />;
  }

  return <>{children}</>;
};
