import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
// Removed Card imports - using glass morphism divs instead
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import NotificationDropdown from "@/components/Notifications/NotificationDropdown";
import ExternalTenantSidebar from "@/components/ExternalTenant/ExternalTenantSidebar";
import ExternalTenantCalendar from "@/components/ExternalTenant/ExternalTenantCalendar";
import {
  Home,
  User,
  FileText,
  Clock,
  MessageCircle,
  HelpCircle,
  Sun,
  Moon,
  Search
} from "lucide-react";

// Import pages that will be created
import ExternalTenantProfile from "@/components/ExternalTenant/ExternalTenantProfile";
import ExternalTenantComplaints from "@/components/ExternalTenant/ExternalTenantComplaints";
import ExternalTenantHistory from "@/components/ExternalTenant/ExternalTenantHistory";
import ExternalTenantMessages from "@/components/ExternalTenant/ExternalTenantMessages";
import { SpareRoomListings } from "@/components/SpareRoom/SpareRoomListings";

const ExternalTenantDashboard = () => {
  const { loading, hasAccess, user } = useAuthGuard(['tenant'], false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("dashboard");
  console.log('ExternalTenantDashboard: Current activeTab state:', activeTab);
  
  // Handle special tab navigation cases
  const handleTabChange = (tab: string) => {
    if (tab === 'post-spare-room') {
      navigate('/post-spare-room');
      return;
    }
    setActiveTab(tab);
  };
  
  // Remove the redirect check that was causing endless loading
  // External tenants are already properly routed here by the AuthContext
  // No additional checks needed since AuthContext handles tenant type detection

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, color: "text-gray-600 dark:text-gray-400" },
    { id: "calendar", label: "Calendar", icon: Clock, color: "text-gray-600 dark:text-gray-400" },
    { id: "profile", label: "Profile", icon: User, color: "text-gray-600 dark:text-gray-400" },
    { id: "complaints", label: "Complaints", icon: FileText, color: "text-gray-600 dark:text-gray-400" },
    { id: "history", label: "History", icon: Clock, color: "text-gray-600 dark:text-gray-400" },
    { id: "messages", label: "Messages", icon: MessageCircle, color: "text-gray-600 dark:text-gray-400" },
    { id: "spare-rooms", label: "My Spare Room", icon: Home, color: "text-gray-600 dark:text-gray-400" },
  ];

  const renderContent = () => {
    console.log('Rendering content for activeTab:', activeTab);
    switch (activeTab) {
      case "calendar":
        console.log('Rendering ExternalTenantCalendar');
        return <ExternalTenantCalendar user={user} />;
      case "profile":
        console.log('Rendering ExternalTenantProfile');
        return <ExternalTenantProfile user={user} />;
      case "complaints":
        console.log('Rendering ExternalTenantComplaints');
        return <ExternalTenantComplaints />;
      case "history":
        console.log('Rendering ExternalTenantHistory');
        return <ExternalTenantHistory />;
      case "messages":
        console.log('Rendering ExternalTenantMessages');
        return <ExternalTenantMessages />;
      case "spare-rooms":
        return <SpareRoomListings userRole="tenant" />;
      default:
        console.log('Rendering DashboardContent (default)');
        return <DashboardContent user={user} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <ExternalTenantSidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          user={user}
        />
        <SidebarInset className="flex flex-col">
          <header className="flex items-center justify-between border-b border-border px-8 py-4 bg-card">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="mr-2" />
              <h2 className="text-foreground text-xl font-bold leading-tight tracking-[-0.015em]">
                {sidebarItems.find((item) => item.id === activeTab)?.label ||
                  "Dashboard Overview"}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <Sun size={20} className="text-yellow-500" />
                ) : (
                  <Moon size={20} className="text-gray-600" />
                )}
              </button>
              <NotificationDropdown />
              <Button
                variant="ghost"
                size="icon"
                className="bg-muted hover:bg-muted/80"
              >
                <HelpCircle className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6 bg-background overflow-auto">
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

// Dashboard Content Component
const DashboardContent = ({ user, setActiveTab }: any) => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Import API dynamically to avoid circular imports
        const { externalTenantApi } = await import('@/services/api');
        const [dashboardResponse, profileResponse] = await Promise.all([
          externalTenantApi.getDashboard().catch(() => ({ success: false, data: null })),
          externalTenantApi.getProfile().catch(() => ({ success: false, data: null }))
        ]);
        
        if (dashboardResponse.success && dashboardResponse.data) {
          setDashboardData(dashboardResponse.data);
        } else if (profileResponse.success && profileResponse.data?.external_tenant_profile) {
          // Fallback: Create dashboard data from profile if dashboard API fails
          const profile = profileResponse.data.external_tenant_profile;
          setDashboardData({
            user: user,
            property_summary: {
              address: profile.property_address || 'N/A',
              postcode: profile.postcode || 'N/A',
              type: profile.property_type || 'N/A',
              bedrooms: profile.bedrooms || 0,
              bathrooms: profile.bathrooms || 0,
              monthly_rent: profile.monthly_rent || 0,
            },
            tenancy_timeline: {
              move_in_date: profile.move_in_date,
              days_since_move_in: profile.move_in_date ? 
                Math.floor((new Date().getTime() - new Date(profile.move_in_date).getTime()) / (1000 * 60 * 60 * 24)) : 0,
              status: 'active'
            }
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // Empty dependency array - only run once on mount

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <h1 className="text-gray-800 dark:text-gray-100 tracking-light text-3xl font-bold leading-tight">
            Welcome back, {dashboardData?.user?.name || user?.name || "Tenant"}! 🏠
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {dashboardData?.property_summary?.address ?
              `Managing your tenancy at ${dashboardData.property_summary.address}` :
              "Here's what's happening with your tenancy today"
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-gray-500 dark:bg-gray-600"></div>
          <p className="text-muted-foreground text-sm">
            {dashboardData?.tenancy_timeline?.status === 'active' ? 'Active Tenant' : 'External Tenant'}
          </p>
        </div>
      </div>

      {dashboardData?.property_summary && (
        <div className="glass-card p-6 glass-hover bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h3 className="text-lg text-gray-800 dark:text-gray-100 font-semibold">Your Property</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {dashboardData.property_summary.address}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  £{dashboardData.property_summary.monthly_rent?.toLocaleString()}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">per month</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Type:</span>
                <span className="ml-2 font-medium">{dashboardData.property_summary.type}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Bedrooms:</span>
                <span className="ml-2 font-medium">{dashboardData.property_summary.bedrooms}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Move-in:</span>
                <span className="ml-2 font-medium">
                  {dashboardData.tenancy_timeline?.move_in_date ?
                    new Date(dashboardData.tenancy_timeline.move_in_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Days living here:</span>
                <span className="ml-2 font-medium">
                  {dashboardData.tenancy_timeline?.days_since_move_in || 0} days
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-foreground text-xl font-bold leading-tight tracking-[-0.015em] mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 glass-hover cursor-pointer group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow hover:shadow-lg transition-shadow" onClick={() => setActiveTab("complaints")}>
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-8 rounded-xl bg-gray-600 dark:bg-gray-700 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-3 h-3" />
                </div>
                <h3 className="text-base text-gray-800 dark:text-gray-100 font-semibold">File a Complaint</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm mt-2">
                Submit a formal complaint about your rental property
              </p>
            </div>
            <div>
              <Button className="bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white shadow-md hover:shadow-lg transition-all duration-300">
                Get Started
              </Button>
            </div>
          </div>

          <div className="glass-card p-6 glass-hover cursor-pointer group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow hover:shadow-lg transition-shadow" onClick={() => setActiveTab("complaints")}>
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-8 rounded-xl bg-gray-600 dark:bg-gray-700 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-3 h-3" />
                </div>
                <h3 className="text-base text-gray-800 dark:text-gray-100 font-semibold">Track Complaint</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm mt-2">
                Check the status of your submitted complaints
              </p>
            </div>
            <div>
              <Button className="bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white shadow-md hover:shadow-lg transition-all duration-300">
                View Status
              </Button>
            </div>
          </div>

          <div className="glass-card p-6 glass-hover cursor-pointer group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow hover:shadow-lg transition-shadow" onClick={() => setActiveTab("profile")}>
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-8 rounded-xl bg-gray-600 dark:bg-gray-700 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <User className="w-3 h-3" />
                </div>
                <h3 className="text-base text-gray-800 dark:text-gray-100 font-semibold">My Profile</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm mt-2">
                View and update your personal and property details
              </p>
            </div>
            <div>
              <Button className="bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white shadow-md hover:shadow-lg transition-all duration-300">
                View Details
              </Button>
            </div>
          </div>

          <div className="glass-card p-6 glass-hover cursor-pointer group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow hover:shadow-lg transition-shadow" onClick={() => setActiveTab("messages")}>
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-8 rounded-xl bg-gray-600 dark:bg-gray-700 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <MessageCircle className="w-3 h-3" />
                </div>
                <h3 className="text-base text-gray-800 dark:text-gray-100 font-semibold">Messages</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm mt-2">
                Communicate with your landlord or property manager
              </p>
            </div>
            <div>
              <Button className="bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white shadow-md hover:shadow-lg transition-all duration-300">
                View Messages
              </Button>
            </div>
          </div>

          <div className="glass-card p-6 glass-hover cursor-pointer group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow hover:shadow-lg transition-shadow" onClick={() => navigate('/properties')}>
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-8 rounded-xl bg-gray-600 dark:bg-gray-700 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Search className="w-3 h-3" />
                </div>
                <h3 className="text-base text-gray-800 dark:text-gray-100 font-semibold">Browse Properties</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm mt-2">
                Explore available rental properties in your area
              </p>
            </div>
            <div>
              <Button className="bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white shadow-md hover:shadow-lg transition-all duration-300">
                Browse Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExternalTenantDashboard;