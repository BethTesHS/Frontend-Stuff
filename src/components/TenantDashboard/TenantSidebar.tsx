import {
  Home,
  UserCheck,
  MessageSquare,
  ClipboardList,
  Bell,
  User,
  LogOut,
  X
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface TenantSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  user: any;
}

interface NavigationItem {
  title: string;
  value: string;
  icon: any;
  badge?: boolean;
  color?: string;
}

export function TenantSidebar({
  activeTab,
  onTabChange,
  isOpen = true,
  onClose,
  isCollapsed = false,
  user
}: TenantSidebarProps) {
  const { logout } = useAuth()

  const navigationItems: NavigationItem[] = [
    { title: "Dashboard", value: "dashboard", icon: Home },
    { title: "Verify Tenancy", value: "verification", icon: UserCheck, badge: !user?.tenantVerified && user?.isPlatformTenant },
    { title: "My Complaints", value: "complaints", icon: ClipboardList },
    { title: "Messages", value: "messages", icon: MessageSquare },
    { title: "Agent", value: "agent", icon: UserCheck },
    { title: "Notifications", value: "notifications", icon: Bell },
    { title: "Profile", value: "profile", icon: User },
  ]

  const handleTabClick = (tabValue: string) => {
    onTabChange(tabValue)
    if (onClose && window.innerWidth < 1024) {
      onClose()
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Logged out successfully")
    } catch (error) {
      toast.error("Failed to logout")
    }
  }

  const getUserInitials = () => {
    if (!user?.firstName && !user?.lastName) return "T"
    return `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase()
  }

  return (
    <aside className={`fixed lg:relative h-screen bg-white dark:bg-gray-900 shadow-lg border-r border-gray-200 dark:border-gray-800 z-50 transition-all duration-300 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Close Button */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-end lg:hidden flex-shrink-0">
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <X className="text-xl" />
        </button>
      </div>

      {/* User Profile */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 dark:from-blue-600 dark:to-blue-800 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-lg">{getUserInitials()}</span>
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-semibold text-gray-800 dark:text-gray-100">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tenant</p>
            </div>
          )}
        </div>
        {!isCollapsed && user?.isPlatformTenant && !user?.tenantVerified && (
          <div className="mt-4 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p className="text-xs text-orange-800 dark:text-orange-400 font-medium">
              Please verify your tenancy
            </p>
          </div>
        )}
      </div>

      {/* Navigation Items - Scrollable */}
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

      {/* Logout Button */}
      <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
        <button
          onClick={handleLogout}
          className={`w-full p-3 flex items-center ${isCollapsed ? 'justify-center' : 'justify-center space-x-2'} bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors`}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className="text-gray-600 dark:text-gray-400" size={20} />
          {!isCollapsed && <span className="font-medium text-gray-700 dark:text-gray-300">Logout</span>}
        </button>
      </div>
    </aside>
  )
}