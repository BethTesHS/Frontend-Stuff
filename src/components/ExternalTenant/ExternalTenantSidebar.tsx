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
  ClipboardList,
  LayoutDashboard,
  FileText,
  CreditCard,
  ChevronDown,
  ChevronRight,
  Star,
  ClipboardCheck,
  DoorOpen,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ExternalTenantSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  user: any;
}

interface NavItem {
  title: string;
  value: string;
  icon: any;
}

interface NavGroup {
  label: string;
  icon: any;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Home",
    icon: Home,
    items: [
      { title: "Dashboard", value: "dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "My Tenancy",
    icon: FileText,
    items: [
      { title: "Overview", value: "tenancy-overview", icon: Home },
      { title: "Documents", value: "documents", icon: FileText },
      { title: "Checklists", value: "checklists", icon: ClipboardCheck },
      { title: "EoT", value: "end-of-tenancy", icon: DoorOpen },
      { title: "Payments", value: "payments", icon: CreditCard },
    ],
  },
  {
    label: "Support",
    icon: Wrench,
    items: [
      { title: "Maintenance", value: "maintenance", icon: Wrench },
      { title: "Complaints", value: "complaints", icon: ClipboardList },
    ],
  },
  {
    label: "Communication",
    icon: MessageSquare,
    items: [
      { title: "Support", value: "support", icon: MessageSquare },
      { title: "Notifications", value: "notifications", icon: Bell },
    ],
  },
  {
    label: "Activity",
    icon: Calendar,
    items: [
      { title: "Calendar", value: "calendar", icon: Calendar },
      { title: "History", value: "history", icon: Clock },
    ],
  },
  {
    label: "Account",
    icon: User,
    items: [
      { title: "Profile", value: "profile", icon: User },
      { title: "My Review", value: "reviews", icon: Star },
    ],
  },
];

// All tab values that are navigable (for determining which group is active)
const ALL_TABS = NAV_GROUPS.flatMap((g) => g.items.map((i) => i.value));

export default function ExternalTenantSidebar({
  activeTab,
  setActiveTab,
  isOpen = true,
  onClose,
  isCollapsed = false,
  user,
}: ExternalTenantSidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Auto-expand the group containing the active tab; default all open
  const getDefaultOpenGroups = () => {
    const open: Record<string, boolean> = {};
    NAV_GROUPS.forEach((g) => {
      open[g.label] = g.items.some((i) => i.value === activeTab) || true;
    });
    return open;
  };

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    getDefaultOpenGroups
  );

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

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
    } catch {
      toast.error("Failed to logout");
    }
  };

  const getUserInitials = () => {
    if (user?.name) {
      const parts = user.name.split(" ");
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return parts[0][0].toUpperCase();
    }
    if (!user?.firstName && !user?.lastName) return "ET";
    return `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase();
  };

  return (
    <aside
      className={`fixed lg:relative h-screen bg-white dark:bg-gray-900 shadow-lg border-r border-gray-200 dark:border-gray-800 z-50 transition-all duration-300 flex flex-col ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      } ${isCollapsed ? "w-20" : "w-64"}`}
    >
      {/* Mobile close button */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-end lg:hidden flex-shrink-0">
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
        >
          <X size={20} />
        </button>
      </div>

      {/* Branding */}
      <div
        className={`px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0 ${
          isCollapsed ? "px-3" : ""
        }`}
      >
        <Link
          to="/"
          className={`flex items-center gap-2 group transition ${
            isCollapsed ? "justify-center" : "pl-1"
          }`}
        >
          <img
            src="/logo.svg"
            alt="Homed"
            className="h-8 w-auto transition-transform duration-200 group-hover:rotate-6"
          />
          {!isCollapsed && (
            <span className="text-2xl font-bold text-blue-900 dark:text-white transition-transform duration-200 group-hover:scale-105">
              Homed
            </span>
          )}
        </Link>
      </div>

      {/* Navigation groups */}
      <div className="flex-1 overflow-y-auto py-2 space-y-0.5">
        {NAV_GROUPS.map((group) => {
          const isGroupOpen = openGroups[group.label] ?? true;
          const GroupIcon = group.icon;

          if (isCollapsed) {
            return group.items.map((item) => (
              <button
                key={item.value}
                onClick={() => handleTabClick(item.value)}
                title={item.title}
                className={`w-full flex justify-center p-3 transition-all ${
                  activeTab === item.value
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400"
                }`}
              >
                <item.icon size={20} />
              </button>
            ));
          }

          return (
            <div key={group.label}>
              {/* Group header */}
              <button
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/30"
              >
                <div className="flex items-center gap-2">
                  <GroupIcon size={13} />
                  <span>{group.label}</span>
                </div>
                {isGroupOpen ? (
                  <ChevronDown size={13} />
                ) : (
                  <ChevronRight size={13} />
                )}
              </button>

              {/* Group items — wall-to-wall */}
              {isGroupOpen && (
                <div className="space-y-0">
                  {group.items.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => handleTabClick(item.value)}
                      className={`w-full flex items-center gap-3 px-5 py-2.5 transition-all text-sm font-medium border-l-2 ${
                        activeTab === item.value
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-emerald-500"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 border-transparent"
                      }`}
                    >
                      <item.icon
                        size={16}
                        className={
                          activeTab === item.value
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-gray-500 dark:text-gray-400"
                        }
                      />
                      {item.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* User profile */}
      <div className="px-4 pt-3 pb-2 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
        <button
          onClick={() => handleTabClick("profile")}
          className={`w-full flex items-center ${
            isCollapsed ? "justify-center" : "gap-3"
          } p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
          title={isCollapsed ? "Profile" : undefined}
        >
          <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {getUserInitials()}
            </span>
          </div>
          {!isCollapsed && (
            <div className="text-left min-w-0">
              <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm truncate max-w-[140px]">
                {user?.name ||
                  `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
                  "Tenant"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                External Tenant
              </p>
            </div>
          )}
        </button>
      </div>

      {/* Footer */}
      <div className="px-4 pb-5 pt-1 flex-shrink-0 space-y-2">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${
            isCollapsed ? "justify-center" : "gap-2 justify-center"
          } p-2.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium`}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut size={16} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
