import {
  Calendar,
  UserCheck,
  MessageCircle,
  AlertTriangle,
  Bell,
  UserCog,
  LogOut,
  HelpCircle,
  Home,
  DoorClosed,
  X,
  Building
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface AgentSidebarProps {
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

export function AgentSidebar({ activeTab, onTabChange, isOpen = true, onClose, isCollapsed = false }: AgentSidebarProps) {
  const { user, logout } = useAuth()

  const navigationItems: NavigationItem[] = [
    { title: "Dashboard", value: "dashboard", icon: Home },
    { title: "Properties", value: "properties", icon: Building },
    { title: "Rooms", value: "spare-rooms", icon: DoorClosed },
    { title: "Messages", value: "messages", icon: MessageCircle },
    { title: "Requests", value: "requests", icon: Bell },
    { title: "Approvals", value: "approvals", icon: UserCheck },
    { title: "Viewings", value: "viewings", icon: Calendar },
    { title: "Inquiries", value: "inquiries", icon: HelpCircle },
    { title: "Complaints", value: "complaints", icon: AlertTriangle },
    { title: "Notifications", value: "notifications", icon: Bell },
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
    if (!user?.firstName && !user?.lastName) return "BJ"
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
          <div className="w-12 h-12 bg-gradient-to-r from-gray-400 to-gray-600 dark:from-gray-600 dark:to-gray-800 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-lg">{getUserInitials()}</span>
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-semibold text-gray-800 dark:text-gray-100">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Real Estate Agent</p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">Here's what's happening with your business today</p>
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
              <item.icon className={activeTab === item.value ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'} size={20} />
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