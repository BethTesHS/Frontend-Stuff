import {
  Home,
  UserCheck,
  MessageSquare,
  Bell,
  LogOut,
  X,
  Users,
  Heart,
  User
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface RoommateSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  user: any;
  unreadMessages?: number;
  unreadNotifications?: number;
}

interface NavigationItem {
  title: string;
  value: string;
  icon: any;
  badge?: boolean;
  badgeCount?: number;
  color?: string;
}

export function RoommateSidebar({
  activeTab,
  onTabChange,
  isOpen = true,
  onClose,
  isCollapsed = false,
  user,
  unreadMessages = 0,
  unreadNotifications = 0
}: RoommateSidebarProps) {
  const { logout } = useAuth()

  const navigationItems: NavigationItem[] = [
    { title: "Dashboard", value: "dashboard", icon: Home },
    { title: "Find Roommates", value: "find", icon: Users },
    { title: "Messages", value: "messages", icon: MessageSquare, badgeCount: unreadMessages },
    { title: "Notifications", value: "notifications", icon: Bell, badgeCount: unreadNotifications },
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
    if (!user?.firstName && !user?.lastName) return "U"
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

      {/* Homed Branding */}
      <div className={`px-6 py-6 border-b border-gray-100 dark:border-gray-800 flex-shrink-0 ${isCollapsed ? 'px-3' : ''}`}>
        <Link to="/" className={`flex items-center gap-2 group transition ${isCollapsed ? 'justify-center' : 'pl-2'}`}>
          <img src="/logo.svg" alt="Homed Logo" className="h-8 w-auto transition-transform duration-200 group-hover:rotate-6" />
          {!isCollapsed && <span className="text-2xl font-bold text-blue-1000 dark:text-whitee transition-transform duration-200 group-hover:scale-105">Homed</span>}
        </Link>
      </div>

      {/* Navigation Items - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {navigationItems.map((item) => (
          <div
            key={item.value}
            onClick={() => handleTabClick(item.value)}
            className={`p-3 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} cursor-pointer rounded-lg transition-all ${
              activeTab === item.value
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300'
            }`}
            title={isCollapsed ? item.title : undefined}
          >
            <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
              <item.icon
                className={
                  activeTab === item.value 
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                }
                size={20}
              />
              {!isCollapsed && (
                <span className="font-medium flex-1">{item.title}</span>
              )}
              {!isCollapsed && item.badgeCount !== undefined && item.badgeCount > 0 && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                  {item.badgeCount}
                </Badge>
              )}
              {!isCollapsed && item.badge && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0.5">!</Badge>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* User Profile */}
      <div className="px-6 pt-4 pb-2 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
        <div
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2 -mx-2 transition-colors`}
          onClick={() => handleTabClick("profile")}
          title="View Profile"
        >
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-700 dark:from-blue-600 dark:to-blue-800 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-lg">{getUserInitials()}</span>
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-semibold text-gray-800 dark:text-gray-100">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Roommate Seeker</p>
            </div>
          )}
        </div>
      </div>

      {/* Logout Button */}
      <div className="px-6 pb-6 pt-2 flex-shrink-0">
        <button
          onClick={handleLogout}
          className={`w-full p-3 flex items-center ${isCollapsed ? 'justify-center' : 'justify-center space-x-2'} bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors`}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut size={18} />
          {!isCollapsed && <span className="font-semibold text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  )
}
