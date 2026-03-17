import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { navigationDropdowns } from './Navigation/navigationConfig';
import {
  Bell,
  User,
  Heart,
  Info,
  LayoutDashboard,
  Building2,
  Users,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Shield,
  ShoppingCart
} from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const MobileMenu = ({ isOpen, onClose, onLogout }: MobileMenuProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleMenu = (key: string) => {
    setExpandedKey(expandedKey === key ? null : key);
  };

  // Get dashboard icon and label based on user role
  const getDashboardConfig = () => {
    switch (user?.role) {
      case 'agent':
        return { icon: Users, label: 'Agent Dashboard', to: '/dashboard' };
      case 'owner':
      case 'manager':
        return { icon: Building2, label: 'Owner Dashboard', to: '/dashboard' };
      case 'tenant':
        return { icon: UserCheck, label: 'Tenant Dashboard', to: '/dashboard' };
      case 'buyer':
        return { icon: ShoppingCart, label: 'Buyer Dashboard', to: '/buyer-dashboard' };
      default:
        if (user && !user.role) {
          return { icon: Shield, label: 'Tenancy Hub', to: '/external-tenant-dashboard' };
        }
        return { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' };
    }
  };

  return (
    <div className="lg:hidden">
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t overflow-y-auto max-h-[calc(100vh-64px)]">
        
        {/* Grouped Navigation Dropdowns */}
        {navigationDropdowns.map(dropdown => {
          const Icon = dropdown.icon;
          const isExpanded = expandedKey === dropdown.key;
          
          return (
            <div key={dropdown.key} className="py-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between text-gray-700 hover:text-emerald-600 hover:bg-emerald-50"
                onClick={() => toggleMenu(dropdown.key)}
              >
                <div className="flex items-center">
                  <Icon className="w-4 h-4 mr-2" />
                  {dropdown.label}
                </div>
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              
              {isExpanded && (
                <div className="pl-6 flex flex-col space-y-1 mt-1">
                  {dropdown.options.map(option => {
                    const isActive = location.pathname === option.to;
                    return (
                      <Link key={option.to} to={option.to} onClick={onClose}>
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          size="sm"
                          className={`w-full justify-start ${
                            isActive 
                              ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                              : "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
                          }`}
                        >
                          {option.label}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Standalone Items */}
        <div className="pt-2 pb-2">
            <Link to="/about-us" onClick={onClose}>
              <Button variant={location.pathname === '/about-us' ? "default" : "ghost"} size="sm" className={`w-full justify-start ${location.pathname === '/about-us' ? "bg-emerald-600 text-white" : "text-gray-700"}`}>
                <Info className="w-4 h-4 mr-2" /> About Us
              </Button>
            </Link>
            <Link to="/saved" onClick={onClose}>
              <Button variant={location.pathname === '/saved' ? "default" : "ghost"} size="sm" className={`w-full justify-start ${location.pathname === '/saved' ? "bg-emerald-600 text-white" : "text-gray-700"}`}>
                <Heart className="w-4 h-4 mr-2" /> Saved
              </Button>
            </Link>
        </div>

        {/* User Specific Items */}
        {user && ['agent', 'owner', 'tenant', 'manager', 'buyer'].includes(user.role || '') && (
            <>
              <Link to="/notifications" onClick={onClose}>
                <Button variant="ghost" size="sm" className="w-full justify-start text-gray-700">
                  <Bell className="w-4 h-4 mr-2" /> Notifications
                </Button>
              </Link>
              <Link to={getDashboardConfig().to} onClick={onClose}>
                <Button variant="ghost" size="sm" className="w-full justify-start text-gray-700">
                  {(() => {
                    const DashboardIcon = getDashboardConfig().icon;
                    return <DashboardIcon className="w-4 h-4 mr-2" />;
                  })()}
                  {getDashboardConfig().label}
                </Button>
              </Link>
            </>
        )}

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