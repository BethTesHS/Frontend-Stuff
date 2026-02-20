import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useIsMobile } from "@/hooks/use-mobile";
import { propertyApi } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getAuthToken } from '@/utils/tokenStorage';

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Menu, ChevronLeft, ChevronRight, HelpCircle, Sun, Moon } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Sub-components
import { TenantSidebar } from "@/components/TenantDashboard/TenantSidebar";
import { TenantOverview } from "@/components/TenantDashboard/TenantOverview";
import { TenantProfile } from "@/components/TenantDashboard/TenantProfile";
import { TenantAgent } from "@/components/TenantDashboard/TenantAgent";
import { TenantVerificationContent } from "@/components/TenantDashboard/TenantVerificationContent";
import { TenantNotificationDropdown } from "@/components/TenantDashboard/TenantNotificationDropdown";
import MyComplaints from "@/components/TenantDashboard/MyComplaints";
import TenantMessages from "@/components/TenantDashboard/TenantMessages";
import NotificationsComponent from "@/components/TenantDashboard/TenantNotifications";
import VerificationStatusCircle from "@/components/TenantDashboard/VerificationStatusCircle";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://homedapp1.azurewebsites.net/api';

const TenantDashboard = () => {
  const { loading, hasAccess, user } = useAuthGuard(['tenant'], false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [isExternalTenantCheck, setIsExternalTenantCheck] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkExternalTenant = async () => {
      if (!hasAccess || loading || !user) {
        return;
      }

      try {
        const token = getAuthToken();
        if (!token) {
          setIsExternalTenantCheck(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/external-tenant/check-profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.has_external_profile) {
            navigate('/external-tenant-dashboard', { replace: true });
            return;
          }
        } else if (response.status === 404) {
          setIsExternalTenantCheck(false);
          return;
        }

        setIsExternalTenantCheck(false);
      } catch (error) {
        console.error('Error checking external tenant status:', error);
        setIsExternalTenantCheck(false);
      }
    };

    checkExternalTenant();
  }, [hasAccess, loading, user, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDashboardLoading(true);
        const response = await propertyApi.getTenantDashboard();

        if (response.success && response.data) {
          setDashboardData(response.data);
        } else {
          setDashboardData({ status: 'no_property' });
        }
      } catch (error) {
        setDashboardData({
          status: 'no_property',
          error: 'Unable to connect to server. Please check if the backend is running.'
        });
        toast({
          title: "Connection Error",
          description: "Unable to connect to server. Some features may be limited.",
          variant: "destructive"
        });
      } finally {
        setDashboardLoading(false);
      }
    };

    if (hasAccess && !loading && !isExternalTenantCheck) {
      fetchDashboardData();
    }
  }, [hasAccess, loading, isExternalTenantCheck, toast]);

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

  if (loading || isExternalTenantCheck) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-500"></div>
          <p className="text-sm text-muted-foreground">
            {isExternalTenantCheck ? 'Verifying tenant status...' : 'Authenticating...'}
          </p>
        </div>
      </div>
    );
  }

  if (!hasAccess) return null;

  const getTabTitle = (tab: string) => {
    const titles: Record<string, string> = {
      dashboard: "Dashboard",
      verification: "Verify Tenancy",
      complaints: "My Complaints",
      messages: "Messages",
      agent: "Agent",
      notifications: "Notifications",
      profile: "Profile",
    };
    return titles[tab] || "Dashboard Overview";
  };

  const renderContent = () => {
    switch (activeTab) {
      case "verification": return <TenantVerificationContent user={user} navigate={navigate} />;
      case "complaints": return <MyComplaints />;
      case "messages": return <TenantMessages />;
      case "agent": return <TenantAgent user={user} dashboardData={dashboardData} setActiveTab={setActiveTab} />;
      case "notifications": return <NotificationsComponent user={user} />;
      case "profile": return <TenantProfile user={user} />;
      default: return <TenantOverview user={user} setActiveTab={setActiveTab} navigate={navigate} dashboardData={dashboardData} dashboardLoading={dashboardLoading} />;
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-40 lg:hidden bg-background shadow-lg">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <TenantSidebar activeTab={activeTab} onTabChange={setActiveTab} isOpen={true} onClose={() => setSidebarOpen(false)} isCollapsed={false} user={user} />
          </SheetContent>
        </Sheet>
      )}

      {!isMobile && (
        <>
          <TenantSidebar activeTab={activeTab} onTabChange={setActiveTab} isOpen={sidebarOpen} isCollapsed={sidebarCollapsed} user={user} />
          <Button variant="ghost" size="icon" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="fixed left-64 top-6 bg-background border border-border shadow-lg z-10 transition-all duration-300" style={{ left: sidebarCollapsed ? '5rem' : '16rem' }}>
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </>
      )}

      <main className="flex-1 overflow-auto">
        <div className="flex flex-col h-full">
          <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-8 py-4 bg-white dark:bg-gray-900">
            <div className="flex flex-col gap-1">
              {activeTab === "dashboard" ? (
                <>
                  <h1 className="text-gray-800 dark:text-gray-100 tracking-light text-2xl font-bold leading-tight">
                    Welcome back, {user?.name || "Tenant"}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {dashboardData?.status === 'active' ? 'Manage your tenancy and property' : 'Find your perfect home and manage your platform experience'}
                  </p>
                </>
              ) : (
                <h2 className="text-gray-800 dark:text-gray-100 text-xl font-bold leading-tight tracking-[-0.015em]">
                  {getTabTitle(activeTab)}
                </h2>
              )}
            </div>
            <div className="flex items-center gap-4">
              {user?.isPlatformTenant && (
                <VerificationStatusCircle isVerified={user?.tenantVerified || false} isPending={user?.manualVerificationStatus === 'pending'} size="md" showLabel={true} />
              )}
              <button onClick={toggleTheme} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
                {theme === 'dark' ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-gray-600" />}
              </button>
              
              <TenantNotificationDropdown onShowAll={() => setActiveTab('notifications')} userRole={user?.role || 'tenant'} />
              
              <Button variant="ghost" size="icon" className="bg-muted hover:bg-muted/80">
                <HelpCircle className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>
          </header>

          <div className="flex-1 p-6 bg-background">{renderContent()}</div>
        </div>
      </main>
    </div>
  );
};

export default TenantDashboard;