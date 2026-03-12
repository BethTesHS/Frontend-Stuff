import {
  Calendar,
  UserCheck,
  MessageCircle,
  AlertTriangle,
  Bell,
  LogOut,
  HelpCircle,
  Home,
  DoorClosed,
  X,
  Building,
  ClipboardList,
  Wrench,
  ChevronDown,
  ChevronRight,
  List,
  BarChart2,
  Scale,
} from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
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
  const propertiesActive = activeTab === "properties" || activeTab === "property-performance" || activeTab === "compare-market"
  const [propertiesExpanded, setPropertiesExpanded] = useState(propertiesActive)

  const navigationItems: NavigationItem[] = [
    { title: "Rooms", value: "spare-rooms", icon: DoorClosed },
    { title: "Messages", value: "messages", icon: MessageCircle },
    { title: "Requests", value: "requests", icon: Bell },
    { title: "Approvals", value: "approvals", icon: UserCheck },
    { title: "Viewings", value: "viewings", icon: Calendar },
    {title: "Tenancies", value: "tenancies", icon: ClipboardList},
    { title: "Inquiries", value: "inquiries", icon: HelpCircle },
    { title: "Complaints", value: "complaints", icon: AlertTriangle },
    { title: "Maintenance", value: "maintenance", icon: Wrench },
    { title: "Notifications", value: "notifications", icon: Bell },
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

      {/* Homed Branding */}
      <div className={`px-6 py-6 border-b border-gray-100 dark:border-gray-800 flex-shrink-0 ${isCollapsed ? 'px-3' : ''}`}>
        <Link to="/" className={`flex items-center gap-2 group transition ${isCollapsed ? 'justify-center' : 'pl-2'}`}>
          <img src="/logo.svg" alt="Homed Logo" className="h-8 w-auto transition-transform duration-200 group-hover:rotate-6" />
          {!isCollapsed && <span className="text-2xl font-bold text-blue-1000 dark:text-whitee transition-transform duration-200 group-hover:scale-105">Homed</span>}
        </Link>
      </div>

      {/* Navigation Items - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">

        {/* Dashboard */}
        <div
          onClick={() => handleTabClick("dashboard")}
          className={`p-3 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} cursor-pointer rounded-lg transition-all ${
            activeTab === "dashboard"
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
              : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300'
          }`}
          title={isCollapsed ? "Dashboard" : undefined}
        >
          <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
            <Home className={activeTab === "dashboard" ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'} size={20} />
            {!isCollapsed && <span className="font-medium">Dashboard</span>}
          </div>
        </div>

        {/* Properties - expandable group */}
        <div>
          <div
            onClick={() => {
              if (isCollapsed) {
                handleTabClick("properties")
              } else {
                setPropertiesExpanded(!propertiesExpanded)
              }
            }}
            className={`p-3 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} cursor-pointer rounded-lg transition-all ${
              propertiesActive
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300'
            }`}
            title={isCollapsed ? "Properties" : undefined}
          >
            <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
              <Building className={propertiesActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'} size={20} />
              {!isCollapsed && <span className="font-medium">Properties</span>}
            </div>
            {!isCollapsed && (
              propertiesExpanded
                ? <ChevronDown size={16} className="text-gray-400 dark:text-gray-500" />
                : <ChevronRight size={16} className="text-gray-400 dark:text-gray-500" />
            )}
          </div>

          {/* Sub-links */}
          {!isCollapsed && propertiesExpanded && (
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-3">
              <div
                onClick={() => handleTabClick("properties")}
                className={`p-2 flex items-center space-x-2 cursor-pointer rounded-lg transition-all text-sm ${
                  activeTab === "properties"
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400'
                }`}
              >
                <List size={15} className={activeTab === "properties" ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'} />
                <span className="font-medium">My Properties</span>
              </div>
              <div
                onClick={() => handleTabClick("property-performance")}
                className={`p-2 flex items-center space-x-2 cursor-pointer rounded-lg transition-all text-sm ${
                  activeTab === "property-performance"
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400'
                }`}
              >
                <BarChart2 size={15} className={activeTab === "property-performance" ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'} />
                <span className="font-medium">Performance</span>
              </div>
              <div
                onClick={() => handleTabClick("compare-market")}
                className={`p-2 flex items-center space-x-2 cursor-pointer rounded-lg transition-all text-sm ${
                  activeTab === "compare-market"
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400'
                }`}
              >
                <Scale size={15} className={activeTab === "compare-market" ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'} />
                <span className="font-medium">Compare Market</span>
              </div>
            </div>
          )}
        </div>

        {/* Remaining nav items */}
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

      {/* User Profile */}
      <div className="px-6 pt-4 pb-2 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
        <div
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2 -mx-2 transition-colors`}
          onClick={() => handleTabClick("profile")}
          title="View Profile"
        >
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-gray-400 to-gray-600 dark:from-gray-600 dark:to-gray-800 rounded-full flex items-center justify-center">
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
      </div>

      {/* Logout Button */}
      <div className="px-6 pb-6 pt-2 flex-shrink-0">
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