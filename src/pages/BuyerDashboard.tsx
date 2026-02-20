// src/pages/BuyerDashboard.tsx
import { useState, useEffect } from "react";
import { flushSync } from "react-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

import { BuyerSidebar } from "@/components/BuyerDashboard/BuyerSidebar";
import { BuyerNotificationDropdown } from "@/components/BuyerDashboard/BuyerNotificationDropdown";
import { BuyerOverview } from "@/components/BuyerDashboard/BuyerOverview";
import { BuyerSavedProperties } from "@/components/BuyerDashboard/BuyerSavedProperties";
import { BuyerCalendar } from "@/components/BuyerDashboard/BuyerCalendar";
import { BuyerHistory } from "@/components/BuyerDashboard/BuyerHistory";
import { BuyerProfile } from "@/components/BuyerDashboard/BuyerProfile";
import Messages from "@/components/Messages/Messages";
import NotificationsComponent from "@/components/TenantDashboard/TenantNotifications";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Moon,
  Sun,
  ChevronDown,
  User,
  Settings,
  Search
} from "lucide-react";

const BuyerDashboard = () => {
  const { loading, hasAccess, user } = useAuthGuard(['buyer'], false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const { theme, toggleTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('activeTab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const handleTabChange = (tab: string) => {
    flushSync(() => {
      setActiveTab(tab);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
          <p className="text-sm text-muted-foreground">Loading Buyer Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <BuyerOverview user={user} />;
      case "saved":
        return <BuyerSavedProperties />;
      case "messages":
        const propertyId = searchParams.get('propertyId');
        const propertyTitle = searchParams.get('propertyTitle');
        const agentId = searchParams.get('agentId');
        const agentName = searchParams.get('agentName');
        const roomId = searchParams.get('roomId');
        const roomTitle = searchParams.get('roomTitle');
        const landlordId = searchParams.get('landlordId');
        const landlordName = searchParams.get('landlordName');

        return <Messages
          initialContext={{
            propertyId,
            propertyTitle,
            agentId,
            agentName,
            roomId,
            roomTitle,
            landlordId,
            landlordName
          }}
        />;
      case "calendar":
        return <BuyerCalendar />;
      case "notifications":
        return <NotificationsComponent user={user} />;
      case "history":
        return <BuyerHistory />;
      case "profile":
        return <BuyerProfile user={user} />;
      default:
        return <BuyerOverview user={user} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <BuyerSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  <Menu className="text-xl" />
                </button>

                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden lg:block text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>

                <div className="relative hidden md:block">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-gray-400 dark:text-gray-500" size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search properties..."
                    className="pl-10 pr-4 py-2 w-64 lg:w-80 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent"
                    onClick={() => navigate('/properties')}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <BuyerNotificationDropdown onShowAll={() => handleTabChange('notifications')} />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-emerald-600 dark:from-emerald-600 dark:to-emerald-800 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {user?.firstName?.[0] || 'B'}{user?.lastName?.[0] || 'Y'}
                        </span>
                      </div>
                      <div className="hidden md:block text-left">
                        <p className="font-medium text-gray-800 dark:text-gray-200">{user?.firstName || ''} {user?.lastName || ''}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Buyer</p>
                      </div>
                      <ChevronDown size={16} className="hidden md:block text-gray-600 dark:text-gray-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <DropdownMenuLabel className="text-gray-900 dark:text-gray-100">My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                    <DropdownMenuItem
                      onClick={() => setActiveTab('profile')}
                      className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSettingsOpen(true)}
                      className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                    <DropdownMenuItem
                      onClick={logout}
                      className="cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950">
          {renderContent()}
        </main>
      </div>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Settings</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Customize your dashboard preferences
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Appearance</h3>
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center space-x-3">
                  {theme === 'dark' ? (
                    <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <Sun className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Theme</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {theme === 'dark' ? 'Dark mode' : 'Light mode'}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={toggleTheme}
                  variant="outline"
                  size="sm"
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="h-4 w-4 mr-2" />
                      Light
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4 mr-2" />
                      Dark
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BuyerDashboard;