import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import Layout from "@/components/Layout/Layout";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Menu, ChevronLeft, ChevronRight, Sun, Moon } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";

// Sub-components
import { RoommateSidebar } from "@/components/FindRoomie/RoommateSidebar";
import { RoommateOverview } from "@/components/FindRoomie/RoommateOverview";
import { FindRoommatesContent } from "@/components/FindRoomie/FindRoommatesContent";
import { RoommateProfile } from "@/components/FindRoomie/RoommateProfile";
import NotificationsComponent from "@/components/Notifications/Notifications";
import NotificationDropdown from "@/components/Notifications/NotificationDropdown";
import Messages from "@/components/Messages/Messages";
import { CreateProfileModal } from "@/components/FindRoomie/CreateProfileModal";

const FindRoomie = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const storageKey = user ? `roomie_profile_complete_${user.id}` : null;
  const hasCompletedProfile = storageKey
    ? localStorage.getItem(storageKey) === "true"
    : false;

  useEffect(() => {
    if (!isMobile) setSidebarOpen(true);
    else setSidebarOpen(false);
  }, [isMobile]);

  // Guest view - show roomies list with original navbar
  if (!isAuthenticated || (isAuthenticated && !hasCompletedProfile)) {
    return (
      <Layout>
        <div className="animate-fade-in py-8">
          <div className="px-6 max-w-7xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Find Your Potential Roomie
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Browse profiles of people looking for their ideal living
                  situation
                </p>
              </div>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 h-12 rounded-lg"
              >
                Create Profile
              </Button>
            </div>
            <FindRoommatesContent
              onMessageClick={(roommate) => {
                toast({
                  title: "Login Required",
                  description: "Please log in to message roommates",
                });
              }}
            />
            <CreateProfileModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      </Layout>
    );
  }

  // Authenticated view - show full dashboard
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-500"></div>
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const getTabTitle = (tab: string) => {
    const titles: Record<string, string> = {
      dashboard: "Dashboard",
      find: "Find Roommates",
      messages: "Messages",
      notifications: "Notifications",
    };
    return titles[tab] || "Dashboard Overview";
  };

  const renderContent = () => {
    switch (activeTab) {
      case "find":
        return (
          <FindRoommatesContent
            onMessageClick={(roommate) => {
              setActiveTab("messages");
              toast({
                title: "Opening messages",
                description: `Chat with ${roommate.name}`,
              });
            }}
          />
        );
      case "messages":
        return <Messages />;
      case "notifications":
        return <NotificationsComponent />;
      case "profile":
        return <RoommateProfile />;
      default:
        return (
          <RoommateOverview
            user={user}
            setActiveTab={setActiveTab}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <RoommateSidebar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              isOpen={true}
              onClose={() => setSidebarOpen(false)}
              isCollapsed={false}
              user={user}
            />
          </SheetContent>
        </Sheet>
      )}

      {!isMobile && (
        <RoommateSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOpen={sidebarOpen}
          isCollapsed={sidebarCollapsed}
          user={user}
        />
      )}

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 flex-shrink-0">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
              {!isMobile && (
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden lg:block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  {sidebarCollapsed ? (
                    <ChevronRight className="w-5 h-5" />
                  ) : (
                    <ChevronLeft className="w-5 h-5" />
                  )}
                </button>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {getTabTitle(activeTab)}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Welcome back, {user?.firstName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NotificationDropdown onViewAll={() => setActiveTab('notifications')} />
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="w-10 h-10 p-0"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default FindRoomie;