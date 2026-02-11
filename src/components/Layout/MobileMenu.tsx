
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { navigationDropdowns } from './Navigation/navigationConfig';
import {
  Building,
  Search,
  Bell,
  User,
  Heart,
  TrendingUp,
  Info,
  LayoutDashboard,
  Building2,
  Users,
  UserCheck,
  Bed
} from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const MobileMenu = ({ isOpen, onClose, onLogout }: MobileMenuProps) => {
  const location = useLocation();
  const { user } = useAuth();

  if (!isOpen) return null;

  const getNavItems = () => {
    const baseItems: Array<{ to: string; label: string; icon: any }> = [];

    // Add all navigation dropdown items as flat items for mobile
    navigationDropdowns.forEach(dropdown => {
      dropdown.options.forEach(option => {
        baseItems.push({
          to: option.to,
          label: option.label,
          icon: dropdown.icon
        });
      });
    });

    // Add additional pages
    baseItems.push(
      { to: '/about-us', label: 'About Us', icon: Info },
      { to: '/saved', label: 'Saved', icon: Heart }
    );

    // Only add role-specific items if user has appropriate role
    if (user && ['agent', 'owner', 'tenant', 'manager'].includes(user.role || '')) {
      baseItems.push({ to: '/notifications', label: 'Notifications', icon: Bell });
      
      // Add role-specific dashboard
      const dashboardConfig = getDashboardConfig();
      baseItems.push({ 
        to: '/dashboard', 
        label: dashboardConfig.label, 
        icon: dashboardConfig.icon 
      });
    }

    return baseItems;
  };

  // Get dashboard icon and label based on user role
  const getDashboardConfig = () => {
    switch (user?.role) {
      case 'agent':
        return { icon: Users, label: 'Agent Dashboard' };
      case 'owner':
      case 'manager':
        return { icon: Building2, label: 'Owner Dashboard' };
      case 'tenant':
        return { icon: UserCheck, label: 'Tenant Dashboard' };
      default:
        return { icon: LayoutDashboard, label: 'Dashboard' };
    }
  };

  const navItems = getNavItems();

  return (
    <div className="md:hidden">
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.to} 
              to={item.to}
              onClick={onClose}
            >
              <Button
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={`w-full justify-start ${
                  isActive 
                    ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                    : "text-gray-700 hover:text-emerald-600 hover:bg-emerald-50"
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {item.label || <span className="sr-only">{item.to.replace('/', '')}</span>}
              </Button>
            </Link>
          );
        })}
        
        {user ? (
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={onLogout}
            >
              <User className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        ) : (
          <div className="pt-4 border-t space-y-2">
            <Link to="/login" onClick={onClose}>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
              >
                Login
              </Button>
            </Link>
            <Link to="/register" onClick={onClose}>
              <Button
                size="sm"
                className="w-full bg-[#0d5a3d] hover:bg-[#094a32]"
              >
                Sign up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
