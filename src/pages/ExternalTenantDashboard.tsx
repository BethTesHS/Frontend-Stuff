import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/contexts/ThemeContext";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Menu, ChevronLeft, ChevronRight, Sun, Moon } from "lucide-react";

// Dashboard Components
import ExternalTenantSidebar from "@/components/ExternalTenant/ExternalTenantSidebar";
import ExternalTenantCalendar from "@/components/ExternalTenant/ExternalTenantCalendar";
import { ExternalTenantOverview } from "@/components/ExternalTenant/ExternalTenantOverview";
import ExternalTenantProfile from "@/components/ExternalTenant/ExternalTenantProfile";
import ExternalTenantComplaints from "@/components/ExternalTenant/ExternalTenantComplaints";
import ExternalTenantMaintenanceRequests from "@/components/ExternalTenant/ExternalTenantMaintenanceRequests";
import ExternalTenantHistory from "@/components/ExternalTenant/ExternalTenantHistory";
import ExternalTenantDocuments from "@/components/ExternalTenant/ExternalTenantDocuments";
import ExternalTenantReviews from "@/components/ExternalTenant/ExternalTenantReviews";
import ExternalTenantMessages from "@/components/Messages/Messages";
import { ExternalTenantNotificationDropdown } from "@/components/ExternalTenant/ExternalTenantNotificationDropdown";
import ExternalTenantNotifications from '@/components/ExternalTenant/ExternalTenantNotifications';
import ExternalTenantChecklists from "@/components/ExternalTenant/ExternalTenantChecklists";
import ExternalTenantTenancy from "@/components/ExternalTenant/ExternalTenantTenancy";
// Placeholder cards for deferred sections
const PlaceholderSection = ({ title, description }: { title: string; description: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-6">
    <div className="size-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
      <span className="text-2xl">🚧</span>
    </div>
    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{title}</h2>
    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">{description}</p>
  </div>
);

const TAB_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  "tenancy-overview": "Tenancy Overview",
  documents: "Documents",
  payments: "Payments",
  maintenance: "Maintenance",
  complaints: "Complaints",
  checklists: "Checklists",
  support: "Support",
  notifications: "Notifications",
  calendar: "Calendar",
  history: "History",
  profile: "Profile",
  reviews: "My Review",
  "end-of-tenancy": "End of Tenancy",
};

const ExternalTenantDashboard = () => {
  const { loading, hasAccess, user } = useAuthGuard(['tenant'], false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState(
    () => sessionStorage.getItem('externalTenantDashboard_tab') || "dashboard"
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // Redirect platform tenants away
  useEffect(() => {
    if (!loading && hasAccess && user?.isPlatformTenant === true) {
      navigate('/tenant-dashboard', { replace: true });
    }
  }, [loading, hasAccess, user?.isPlatformTenant, navigate]);

  useEffect(() => {
    sessionStorage.setItem('externalTenantDashboard_tab', activeTab);
  }, [activeTab]);

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
    if (!user) return;
    const fetchDashboardData = async () => {
      try {
        setDashboardLoading(true);
        const { externalTenantApi } = await import('@/services/api');
        const [dashboardRes, profileRes] = await Promise.all([
          externalTenantApi.getDashboard().catch(() => ({ success: false, data: null })),
          externalTenantApi.getProfile().catch(() => ({ success: false, data: null })),
        ]);
        if (dashboardRes.success && dashboardRes.data) {
          setDashboardData(dashboardRes.data);
        } else if (profileRes.success && profileRes.data?.external_tenant_profile) {
          const p = profileRes.data.external_tenant_profile;
          setDashboardData({
            user,
            property_summary: {
              address: p.property_address || null,
              postcode: p.postcode || null,
              type: p.property_type || null,
            },
            tenancy_timeline: { move_in_date: p.move_in_date, status: 'active' },
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setDashboardLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  if (loading || !hasAccess) return null;

  const isDashboardTab = activeTab === 'dashboard';

  const renderContent = () => {
    switch (activeTab) {
      case "calendar":
        return <ExternalTenantCalendar user={user} />;
      case "profile":
        return <ExternalTenantProfile />;
      case "complaints":
        return <ExternalTenantComplaints onGoToMessages={() => setActiveTab('support')} />;
      case "maintenance":
        return <ExternalTenantMaintenanceRequests onGoToMessages={() => setActiveTab('support')} />;
      case "history":
        return <ExternalTenantHistory />;
      case "support":
        return <ExternalTenantMessages supportMode={true} />;
      case "notifications":
        return <ExternalTenantNotifications />;
      case "tenancy-overview":
        return (
          <ExternalTenantOverview
            user={user}
            setActiveTab={setActiveTab}
            navigate={navigate}
            dashboardData={dashboardData}
            dashboardLoading={dashboardLoading}
          />
        );
      case "documents":
        return <ExternalTenantDocuments />;
      case "checklists":
        return <ExternalTenantChecklists />;
      case "end-of-tenancy":
        return <ExternalTenantTenancy />;
      case "reviews":
        return <ExternalTenantReviews />;
      case "payments":
        return (
          <PlaceholderSection
            title="Payments"
            description="Rent payment history and upcoming payments will be available here soon."
          />
        );
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

  const sidebarProps = {
    activeTab,
    setActiveTab,
    isOpen: true,
    onClose: () => setSidebarOpen(false),
    isCollapsed: false,
    user,
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* Mobile sidebar */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <ExternalTenantSidebar {...sidebarProps} />
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop sidebar */}
      {!isMobile && (
        <ExternalTenantSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={sidebarOpen}
          isCollapsed={sidebarCollapsed}
          user={user}
        />
      )}

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* ── Header ── */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 flex-shrink-0">
          <div className="px-5 py-3">
            <div className="flex items-center justify-between">
              {/* Left */}
              <div className="flex items-center gap-3">
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
                  {sidebarCollapsed
                    ? <ChevronRight size={18} className="text-gray-500" />
                    : <ChevronLeft size={18} className="text-gray-500" />
                  }
                </button>

                <div>
                  {isDashboardTab ? (
                    <>
                      <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                        Welcome back 👋
                      </h1>
                      <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                        Your home at a glance
                      </p>
                    </>
                  ) : (
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                      {TAB_TITLES[activeTab] ?? "Dashboard"}
                    </h1>
                  )}
                </div>
              </div>

              {/* Right */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark'
                    ? <Sun size={18} className="text-yellow-500" />
                    : <Moon size={18} className="text-gray-600" />
                  }
                </button>
                <ExternalTenantNotificationDropdown onShowAll={() => setActiveTab('notifications')} />
              </div>
            </div>
          </div>
        </header>

        {/* ── Content ── */}
        <div className={`flex-1 bg-gray-50 dark:bg-gray-950 ${activeTab === 'support' ? 'overflow-hidden' : 'overflow-y-auto p-6'}`}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default ExternalTenantDashboard;
