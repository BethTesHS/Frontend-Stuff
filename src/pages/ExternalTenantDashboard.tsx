import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Menu, ChevronLeft, ChevronRight, HelpCircle, Sun, Moon } from "lucide-react";

// Dashboard Components
import ExternalTenantSidebar from "@/components/ExternalTenant/ExternalTenantSidebar";
import ExternalTenantCalendar from "@/components/ExternalTenant/ExternalTenantCalendar";
import { ExternalTenantOverview } from "@/components/ExternalTenant/ExternalTenantOverview";
import ExternalTenantProfile from "@/components/ExternalTenant/ExternalTenantProfile";
import ExternalTenantComplaints from "@/components/ExternalTenant/ExternalTenantComplaints";
import ExternalTenantMaintenanceRequests from "@/components/ExternalTenant/ExternalTenantMaintenanceRequests";
import ExternalTenantHistory from "@/components/ExternalTenant/ExternalTenantHistory";
import ExternalTenantMessages from "@/components/Messages/Messages";
import { TenantNotificationDropdown } from "@/components/TenantDashboard/TenantNotificationDropdown"; 
import NotificationsComponent from '@/components/TenantDashboard/TenantNotifications';
import { SpareRoomListings } from "@/components/SpareRoom/SpareRoomListings";

const ExternalTenantDashboard = () => {
  const { loading, hasAccess, user } = useAuthGuard(['tenant'], false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  
  // Handle special tab navigation cases
  const handleTabChange = (tab: string) => {
    if (tab === 'post-spare-room') {
      navigate('/post-spare-room');
      return;
    }
    setActiveTab(tab);
  };

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#notifications') {
        setActiveTab('notifications');
        window.history.replaceState(null, '', window.location.pathname);
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (!isMobile) setSidebarOpen(true);
    else setSidebarOpen(false);
  }, [isMobile]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDashboardLoading(true);
        const { externalTenantApi } = await import('@/services/api');
        const [dashboardResponse, profileResponse] = await Promise.all([
          externalTenantApi.getDashboard().catch(() => ({ success: false, data: null })),
          externalTenantApi.getProfile().catch(() => ({ success: false, data: null }))
        ]);
        
        if (dashboardResponse.success && dashboardResponse.data) {
          setDashboardData(dashboardResponse.data);
        } else if (profileResponse.success && profileResponse.data?.external_tenant_profile) {
          const profile = profileResponse.data.external_tenant_profile;
          setDashboardData({
            user: user,
            property_summary: {
              address: profile.property_address || 'N/A',
              postcode: profile.postcode || 'N/A',
              type: profile.property_type || 'N/A',
            },
            tenancy_timeline: {
              move_in_date: profile.move_in_date,
              status: 'active'
            }
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setDashboardLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!hasAccess) return null;

  const getTabTitle = (tab: string) => {
    const titles: Record<string, string> = {
      dashboard: "Dashboard",
      calendar: "Calendar",
      profile: "Profile",
      complaints: "My Complaints",
      maintenance: "Maintenance Requests",
      history: "History",
      messages: "Messages",
      notifications: "Notifications",
      "spare-rooms": "My Spare Room",
    };
    return titles[tab] || "Dashboard Overview";
  };

  const renderContent = () => {
    switch (activeTab) {
      case "calendar":
        return <ExternalTenantCalendar user={user} />;
      case "profile":
        return <ExternalTenantProfile />;
      case "complaints":
        return <ExternalTenantComplaints onGoToMessages={(context) => setActiveTab('messages')} />;
      case "maintenance":
        return <ExternalTenantMaintenanceRequests onGoToMessages={(context) => setActiveTab('messages')} />;
      case "history":
        return <ExternalTenantHistory />;
      case "messages":
        return <ExternalTenantMessages />;
      case "notifications":
        // Utilizing the shared TenantNotifications component
        return <NotificationsComponent user={user} />;
      case "spare-rooms":
        return <SpareRoomListings userRole="tenant" />;
      default:
        return (
          <ExternalTenantOverview 
            user={user} 
            setActiveTab={setActiveTab} 
            navigate={navigate} 
            dashboardData={dashboardData} 
            dashboardLoading={dashboardLoading} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <ExternalTenantSidebar
              activeTab={activeTab}
              setActiveTab={handleTabChange}
              isOpen={true}
              onClose={() => setSidebarOpen(false)}
              isCollapsed={false}
              user={user}
            />
          </SheetContent>
        </Sheet>
      )}

      {!isMobile && (
        <ExternalTenantSidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          isOpen={sidebarOpen}
          isCollapsed={sidebarCollapsed}
          user={user}
        />
      )}

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 flex-shrink-0">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Menu size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden lg:block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>

                <div className="flex flex-col gap-1">
                  {activeTab === "dashboard" ? (
                    <>
                      <h1 className="text-gray-800 dark:text-gray-100 tracking-light text-2xl font-bold leading-tight">
                        Welcome back, {user?.name || "Tenant"}
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400 text-sm hidden sm:block">
                        Here's what's happening with your tenancy today
                      </p>
                    </>
                  ) : (
                    <h2 className="text-gray-800 dark:text-gray-100 text-xl font-bold leading-tight tracking-[-0.015em]">
                      {getTabTitle(activeTab)}
                    </h2>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={toggleTheme}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {theme === 'dark' ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} />}
                </button>
                
                <TenantNotificationDropdown 
                  onShowAll={() => setActiveTab('notifications')} 
                />
                
                <Button variant="ghost" size="icon" className="bg-muted hover:bg-muted/80 hidden sm:flex">
                  <HelpCircle className="w-5 h-5 text-muted-foreground" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className={`flex-1 bg-gray-50 dark:bg-gray-950 ${activeTab === 'messages' ? 'overflow-hidden' : 'overflow-y-auto p-6'}`}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default ExternalTenantDashboard;