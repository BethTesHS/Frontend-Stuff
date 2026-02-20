// src/pages/OwnerDashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

import { OwnerSidebar } from '@/components/OwnerDashboard/OwnerSidebar';
import { OwnerNotificationDropdown } from '@/components/OwnerDashboard/OwnerNotificationDropdown';
import { OwnerOverview } from '@/components/OwnerDashboard/OwnerOverview';
import { OwnerProperties } from '@/components/OwnerDashboard/OwnerProperties';
import { OwnerProfile } from '@/components/OwnerDashboard/OwnerProfile';
import { OwnerBookings } from '@/components/OwnerDashboard/OwnerBookings';
import { OwnerCalendar } from '@/components/OwnerDashboard/OwnerCalendar';
import NotificationsComponent from '@/components/TenantDashboard/TenantNotifications';
import { SpareRoomListings } from '@/components/SpareRoom/SpareRoomListings';
import Messages from "@/components/Messages/Messages";

import { Menu, Search, Sun, Moon, Bell, ChevronLeft, ChevronRight, LogOut, UserCircle, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const OwnerDashboard = () => {
  const { loading, hasAccess, user } = useAuthGuard(['owner'], false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { theme, toggleTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Handle success message from property listing
  useEffect(() => {
    const state = location.state as any;
    if (state?.message) {
      toast.success(state.message);
      // Clear the state to prevent showing the message again
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  const handleTabChange = (tab: string) => {
    if (tab === 'add-property') {
      navigate('/list-property');
      return;
    }
    if (tab === 'post-spare-room') {
      navigate('/post-spare-room');
      return;
    }
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'properties':
        return <OwnerProperties />;
      case 'messages':
        return <Messages />;
      case 'bookings':
        return <OwnerBookings />;
      case 'calendar':
        return <OwnerCalendar />;
      case 'notifications':
        return <NotificationsComponent user={user} />;
      case 'spare-rooms':
        return (
          <div className="space-y-6">
            <SpareRoomListings userRole="owner" />
          </div>
        );
      case 'profile':
        return <OwnerProfile />;
      default:
        return <OwnerOverview user={user} hasAccess={hasAccess} />;
    }
  };

  const getUserInitials = () => {
    if (!user?.name) return "OW"
    const names = user.name.split(' ')
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
    }
    return user.name.substring(0, 2).toUpperCase()
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Logged out successfully")
      navigate('/')
    } catch (error) {
      toast.error("Failed to logout")
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1">
        {/* Sidebar */}
        <OwnerSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onCollapseChange={setIsSidebarCollapsed}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                {/* Left: Menu Button, Collapse Toggle and Search */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    <Menu className="text-xl" />
                  </button>

                  {/* Sidebar Collapse Toggle (Desktop only) */}
                  <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="hidden lg:block text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                  >
                    {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                  </button>

                  {/* Search Bar */}
                  <div className="relative hidden md:block">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="text-gray-400 dark:text-gray-500" size={18} />
                    </div>
                    <input
                      type="text"
                      placeholder="Search properties..."
                      className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 w-64"
                    />
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center space-x-3">
                  {/* Theme Toggle */}
                  <button
                    onClick={toggleTheme}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    title="Toggle theme"
                  >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                  </button>

                  {/* Notifications Dropdown Wrapper */}
                  <OwnerNotificationDropdown onShowAll={() => handleTabChange('notifications')} />

                  {/* Profile Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                        <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-600 dark:from-gray-600 dark:to-gray-800 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">{getUserInitials()}</span>
                        </div>
                        <ChevronDown size={16} className="text-gray-600 dark:text-gray-400" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="font-semibold text-gray-800 dark:text-gray-100">{user?.name || "Owner"}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                      </div>
                      <DropdownMenuItem onClick={() => handleTabChange('profile')}>
                        <UserCircle className="mr-2" size={16} />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTabChange('notifications')}>
                        <Bell className="mr-2" size={16} />
                        Notifications
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2" size={16} />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className={`flex-1 overflow-auto bg-gray-50 dark:bg-gray-950 w-full ${activeTab === 'overview' ? 'p-0' : 'p-6'}`}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;