import {
  Building2,
  MessageCircle,
  Calendar,
  BarChart3,
  Eye,
  Bell,
  LogOut,
  X,
  Wrench,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  List,
  BarChart2,
  Scale,
  UserCheck,
  BedDouble,
} from "lucide-react"
import { useState } from "react"

import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

interface OwnerSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCollapseChange?: (isCollapsed: boolean) => void;
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
}

const navigationItems = [
  { title: "Managers", value: "property-managers", icon: UserCheck },
  { title: "Messages", value: "messages", icon: MessageCircle },
  { title: "Calendar", value: "calendar", icon: Calendar },
  { title: "Complaints", value: "complaints", icon: AlertTriangle },
  { title: "Maintenance", value: "maintenance", icon: Wrench },
  { title: "Notifications", value: "notifications", icon: Bell },
]

export function OwnerSidebar({ 
  activeTab, 
  onTabChange, 
  onCollapseChange, 
  isOpen = true, 
  onClose,
  isCollapsed = false 
}: OwnerSidebarProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const propertiesActive = activeTab === "properties" || activeTab === "property-performance" || activeTab === "compare-market"
  const [propertiesExpanded, setPropertiesExpanded] = useState(propertiesActive)
  const roomsActive = activeTab === "spare-rooms" || activeTab === "room-performance" || activeTab === "room-compare-market"
  const [roomsExpanded, setRoomsExpanded] = useState(roomsActive)

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
    if (!user?.name) return "OW"
    const names = user.name.split(' ')
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
    }
    return user.name.substring(0, 2).toUpperCase()
  }

  return (
    <aside className={`fixed lg:relative h-screen bg-white dark:bg-gray-900 shadow-lg border-r border-gray-200 dark:border-gray-800 z-50 transition-all duration-300 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Close Button for Mobile */}
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

        {/* Overview */}
        <div
          onClick={() => handleTabClick("overview")}
          className={`p-3 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} cursor-pointer rounded-lg transition-all ${
            activeTab === "overview"
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
              : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300'
          }`}
          title={isCollapsed ? "Overview" : undefined}
        >
          <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
            <BarChart3 className={activeTab === "overview" ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'} size={20} />
            {!isCollapsed && <span className="font-medium">Overview</span>}
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
              <Building2 className={propertiesActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'} size={20} />
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

        {/* Rooms - expandable group */}
        <div>
          <div
            onClick={() => {
              if (isCollapsed) {
                handleTabClick("spare-rooms")
              } else {
                setRoomsExpanded(!roomsExpanded)
              }
            }}
            className={`p-3 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} cursor-pointer rounded-lg transition-all ${
              roomsActive
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300'
            }`}
            title={isCollapsed ? "Rooms" : undefined}
          >
            <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
              <BedDouble className={roomsActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'} size={20} />
              {!isCollapsed && <span className="font-medium">Rooms</span>}
            </div>
            {!isCollapsed && (
              roomsExpanded
                ? <ChevronDown size={16} className="text-gray-400 dark:text-gray-500" />
                : <ChevronRight size={16} className="text-gray-400 dark:text-gray-500" />
            )}
          </div>

          {!isCollapsed && roomsExpanded && (
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-3">
              <div
                onClick={() => handleTabClick("spare-rooms")}
                className={`p-2 flex items-center space-x-2 cursor-pointer rounded-lg transition-all text-sm ${
                  activeTab === "spare-rooms"
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400'
                }`}
              >
                <List size={15} className={activeTab === "spare-rooms" ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'} />
                <span className="font-medium">My Rooms</span>
              </div>
              <div
                onClick={() => handleTabClick("room-performance")}
                className={`p-2 flex items-center space-x-2 cursor-pointer rounded-lg transition-all text-sm ${
                  activeTab === "room-performance"
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400'
                }`}
              >
                <BarChart2 size={15} className={activeTab === "room-performance" ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'} />
                <span className="font-medium">Performance</span>
              </div>
              <div
                onClick={() => handleTabClick("room-compare-market")}
                className={`p-2 flex items-center space-x-2 cursor-pointer rounded-lg transition-all text-sm ${
                  activeTab === "room-compare-market"
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400'
                }`}
              >
                <Scale size={15} className={activeTab === "room-compare-market" ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'} />
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
                {user?.name || "Owner"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Property Owner</p>
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