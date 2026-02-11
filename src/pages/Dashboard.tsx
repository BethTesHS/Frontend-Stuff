
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { useAuthGuard } from '@/hooks/useAuthGuard';

const Dashboard = () => {
  const { loading, hasAccess, user } = useAuthGuard(['agent', 'owner', 'manager', 'tenant', 'buyer', 'agency_admin'], false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && hasAccess && user?.role) {
      console.log('Dashboard - Redirecting based on user role:', user.role);
      console.log('Dashboard - User tenantType:', (user as any)?.tenantType);

      // Redirect to role-specific dashboard
      switch (user.role) {
        case 'agent':
          navigate('/agent-dashboard');
          break;
        case 'owner':
          navigate('/owner-dashboard');
          break;
        case 'buyer':
          navigate('/buyer-dashboard');
          break;
        case 'tenant':
          // Check if this is an external tenant
          if ((user as any)?.tenantType === 'external') {
            console.log('Dashboard - External tenant detected, redirecting to external dashboard');
            navigate('/external-tenant-dashboard');
          } else {
            console.log('Dashboard - Internal tenant, redirecting to tenant dashboard');
            navigate('/tenant-dashboard');
          }
          break;
        case 'manager':
          // For now, managers use the same dashboard as owners
          navigate('/owner-dashboard');
          break;
        case 'agency_admin':
          console.log('Dashboard - Agency admin detected, staying on dashboard page (agency mode)');
          // For agency admins, stay on current dashboard page as it will be handled by agency routing
          // The routing system will serve AgencyDashboard component when isAgencyMode is true
          break;
        default:
          console.log('Dashboard - Unknown role, staying on current page');
      }
    }
  }, [loading, hasAccess, user, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
        </div>
      </Layout>
    );
  }

  if (!hasAccess) {
    console.log('Dashboard - Access denied, redirecting...');
    return null;
  }

  // Show a brief loading state while redirecting
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
