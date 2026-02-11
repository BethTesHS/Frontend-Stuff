import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDropdownHover } from '@/hooks/useDropdownHover';
import {
  LayoutDashboard,
  Building2,
  Users,
  UserCheck,
  Shield,
  ShoppingCart
} from 'lucide-react';
import SimpleNavItem from './Navigation/SimpleNavItem';
import DropdownNavItem from './Navigation/DropdownNavItem';
import { navigationDropdowns } from './Navigation/navigationConfig';

const NavigationMenuComponent = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { openDropdown, handleMouseEnter, handleMouseLeave } = useDropdownHover();

  const isActive = (path: string) => location.pathname === path;
  const hasPrivilegedAccess = user?.role && ['agent', 'owner', 'manager', 'tenant', 'buyer'].includes(user.role);
  const isExternalTenant = user && !user.role; // External tenants don't have a role property
  
  // Get dashboard icon based on user role
  const getDashboardConfig = () => {
    switch (user?.role) {
      case 'agent':
        return { 
          icon: Users, 
          isActive: isActive('/agent-dashboard') || isActive('/dashboard')
        };
      case 'owner':
      case 'manager':
        return { 
          icon: Building2, 
          isActive: isActive('/owner-dashboard') || isActive('/dashboard')
        };
      case 'tenant':
        return {
          icon: UserCheck,
          isActive: isActive('/tenant-dashboard') || isActive('/dashboard')
        };
      case 'buyer':
        return {
          icon: ShoppingCart,
          isActive: isActive('/buyer-dashboard')
        };
      default:
        // For external tenants (users without roles)
        if (isExternalTenant) {
          return { 
            icon: Shield, 
            isActive: isActive('/external-tenant-dashboard')
          };
        }
        return { 
          icon: LayoutDashboard, 
          isActive: isActive('/dashboard')
        };
    }
  };

  return (
    <div className="hidden lg:flex items-center gap-10">
      <div className="flex items-center gap-10">
        {/* Dropdown Navigation Items */}
        {navigationDropdowns.map((navItem) => (
          <DropdownNavItem
            key={navItem.key}
            icon={navItem.icon}
            label={navItem.label}
            dropdownKey={navItem.key}
            options={navItem.options}
            isOpen={openDropdown === navItem.key}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            iconColor={navItem.iconColor}
          />
        ))}

        {/* User-specific items when logged in with specific roles OR external tenants */}
        {(user && ['agent', 'owner', 'tenant', 'manager', 'buyer'].includes(user.role || '')) || isExternalTenant ? (
          <div className="flex items-center space-x-4 ml-6">            
            {/* Dashboard - role-specific icon only */}
            {(() => {
              const dashboardConfig = getDashboardConfig();
              let roleLabel = 'Dashboard';
              let dashboardPath = '/dashboard';
              
              if (user?.role === 'agent') {
                roleLabel = 'Agent Dashboard';
              } else if (user?.role === 'tenant') {
                roleLabel = 'Tenant Dashboard';
              } else if (user?.role === 'owner' || user?.role === 'manager') {
                roleLabel = 'Owner Dashboard';
              } else if (user?.role === 'buyer') {
                roleLabel = 'Buyer Dashboard';
                dashboardPath = '/buyer-dashboard';
              } else if (isExternalTenant) {
                roleLabel = 'Tenancy Hub';
                dashboardPath = '/external-tenant-dashboard';
              }
              
              return (
                <SimpleNavItem 
                  to={dashboardPath}
                  icon={dashboardConfig.icon}
                  label={roleLabel}
                  isActive={dashboardConfig.isActive}
                  iconColor={user?.role === 'agent' ? 'text-blue-600' :
                           user?.role === 'tenant' ? 'text-green-600' :
                           (user?.role === 'owner' || user?.role === 'manager') ? 'text-purple-600' :
                           user?.role === 'buyer' ? 'text-orange-600' :
                           isExternalTenant ? 'text-emerald-600' : 'text-gray-600'}
                />
              );
            })()}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default NavigationMenuComponent;
