import {
  Home,
  User,
  Clock,
  MessageSquare,
  LogOut,
  X,
  Wrench,
  Calendar,
  Bell,
  ClipboardList
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface ExternalTenantSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  user: any;
}

interface NavigationItem {
  title: string;
  value: string;
  icon: any;
  color?: string;
  badge?: boolean;
}

export default function ExternalTenantSidebar({
  
  activeTab,
  setActiveTab,
  isOpen = true,
  onClose,
  isCollapsed = false,
  user
}: ExternalTenantSidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navigationItems: NavigationItem[] = [
    { title: "Dashboard", value: "dashboard", icon: Home },
    { title: "My Complaints", value: "complaints", icon: ClipboardList },
    { title: "Maintenance", value: "maintenance", icon: Wrench },
    { title: "Messages", value: "messages", icon: MessageSquare },
    { title: "Calendar", value: "calendar", icon: Calendar },
    { title: "Profile", value: "profile", icon: User },
    { title: "History", value: "history", icon: Clock },
    { title: "My Spare Room", value: "spare-rooms", icon: Home },
    { title: "Notifications", value: "notifications", icon: Bell },
  ];

  const handleTabClick = (tabValue: string) => {
    setActiveTab(tabValue);
    if (onClose && window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const getUserInitials = () => {
    if (user?.name) {
      const parts = user.name.split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return parts[0][0].toUpperCase();
    }
    if (!user?.firstName && !user?.lastName) return "ET";
    return `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase();
  };

  return (
    <aside className={`fixed lg:relative h-screen bg-white dark:bg-gray-900 shadow-lg border-r border-gray-200 dark:border-gray-800 z-50 transition-all duration-300 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Close Button (Mobile only) */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-end lg:hidden flex-shrink-0">
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <X className="text-xl" />
        </button>
      </div>

      {/* User Profile Area */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        <div
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2 -mx-2 transition-colors`}
          onClick={() => handleTabClick("profile")}
          title="View Profile"
        >
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-emerald-400 to-emerald-600 dark:from-emerald-600 dark:to-emerald-800 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-lg">{getUserInitials()}</span>
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-semibold text-gray-800 dark:text-gray-100 truncate w-32">
                {user?.name || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "External Tenant"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">External Tenant</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {navigationItems.map((item) => (
          <div
            key={item.value}
            onClick={() => handleTabClick(item.value)}
            className={`p-3 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} cursor-pointer rounded-lg transition-all ${
              activeTab === item.value
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300'
            }`}
            title={isCollapsed ? item.title : undefined}
          >
            <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
              <item.icon
                className={
                  item.color 
                    ? item.color 
                    : (activeTab === item.value ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400')
                }
                size={20}
              />
              {!isCollapsed && (
                <span className="font-medium flex-1">{item.title}</span>
              )}
              {!isCollapsed && item.badge && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0.5">!</Badge>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex-shrink-0 space-y-3">
        <button
          onClick={() => navigate('/')}
          className={`w-full p-3 flex items-center ${isCollapsed ? 'justify-center' : 'justify-center space-x-2'} bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors`}
          title={isCollapsed ? "Back to Homepage" : undefined}
        >
          <Home className="text-gray-600 dark:text-gray-400" size={20} />
          {!isCollapsed && <span className="font-medium text-gray-700 dark:text-gray-300">Homepage</span>}
        </button>

        <button
          onClick={handleLogout}
          className={`w-full p-3 flex items-center ${isCollapsed ? 'justify-center' : 'justify-center space-x-2'} bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors`}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}