import {
  Calendar,
  MessageCircle,
  Bell,
  UserCog,
  LogOut,
  Home,
  X,
  History,
  Heart
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

interface BuyerSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
}

interface NavigationItem {
  title: string;
  value: string;
  icon: any;
  badge?: number;
  badgeColor?: string;
}

export function BuyerSidebar({ activeTab, onTabChange, isOpen = true, onClose, isCollapsed = false }: BuyerSidebarProps) {
  const { user, logout } = useAuth()

  const navigationItems: NavigationItem[] = [
    { title: "Dashboard", value: "dashboard", icon: Home },
    { title: "Saved Properties", value: "saved", icon: Heart },
    { title: "Messages", value: "messages", icon: MessageCircle },
    { title: "Calendar", value: "calendar", icon: Calendar },
    { title: "Notifications", value: "notifications", icon: Bell },
    { title: "History", value: "history", icon: History },
    { title: "Profile", value: "profile", icon: UserCog },
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
    if (!user?.firstName && !user?.lastName) return "BY"
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
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-emerald-400 to-emerald-600 dark:from-emerald-600 dark:to-emerald-800 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-lg">{getUserInitials()}</span>
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-semibold text-gray-800 dark:text-gray-100">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Buyer</p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">Find your dream property</p>
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
                ? 'bg-emerald-100 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300'
            }`}
            title={isCollapsed ? item.title : undefined}
          >
            <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
              <item.icon className={activeTab === item.value ? 'text-emerald-900 dark:text-emerald-100' : 'text-gray-500 dark:text-gray-400'} size={20} />
              {!isCollapsed && <span className="font-medium">{item.title}</span>}
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