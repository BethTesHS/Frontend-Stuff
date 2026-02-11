import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useIsMobile } from "@/hooks/use-mobile";
import { propertyApi } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

// Backend API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://homedapp1.azurewebsites.net/api';
// Removed Card imports - using glass morphism divs instead
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Home,
  AlertTriangle,
  MessageSquare,
  User,
  FileText,
  Search,
  Calendar,
  Menu,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Phone,
  Edit,
  Save,
  X,
  Bell,
  ClipboardList,
  UserCheck,
  MapPin,
  Building,
  CalendarDays,
  PoundSterling,
  CheckCircle2,
  Sun,
  Moon
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import NotificationDropdown from "@/components/Notifications/NotificationDropdown";
import NotificationsComponent from "@/components/TenantDashboard/NotificationsComponent";
import MyComplaints from "@/components/TenantDashboard/MyComplaints";
import TenantMessages from "@/components/TenantDashboard/TenantMessages";
import VerificationStatusCircle from "@/components/TenantDashboard/VerificationStatusCircle";
import TenantVerification from "@/components/TenantVerification/TenantVerification";
import { TenantSidebar } from "@/components/TenantDashboard/TenantSidebar";

const TenantDashboard = () => {
  const { loading, hasAccess, user } = useAuthGuard(['tenant'], false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setIsExternalTenantCheck(false);
          return;
        }

        // Always make a fresh API call to check current profile status
        const response = await fetch(`${API_BASE_URL}/external-tenant/check-profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();

          if (data.success && data.data.has_external_profile) {
            // User has an external tenant profile, redirect them
            navigate('/external-tenant-dashboard', { replace: true });
            return;
          }
        } else if (response.status === 404) {
          // No external profile found - this is normal for platform tenants
          setIsExternalTenantCheck(false);
          return;
        }

        // If we get here, the user is a platform tenant
        setIsExternalTenantCheck(false);
      } catch (error) {
        console.error('Error checking external tenant status:', error);
        // On error, default to platform tenant (allow access)
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

  // Manage sidebar state for desktop/mobile
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }
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

  if (!hasAccess) {
    return null;
  }

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
      case "verification":
        return <VerificationContent user={user} navigate={navigate} />;
      case "complaints":
        return <MyComplaints />;
      case "messages":
        return <TenantMessages />;
      case "agent":
        return <AgentContent user={user} dashboardData={dashboardData} setActiveTab={setActiveTab} />;
      case "notifications":
        return <NotificationsComponent user={user} />;
      case "profile":
        return <ProfileContent user={user} />;
      default:
        return <DashboardContent user={user} setActiveTab={setActiveTab} navigate={navigate} dashboardData={dashboardData} dashboardLoading={dashboardLoading} />;
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* Mobile Sidebar */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 left-4 z-40 lg:hidden bg-background shadow-lg"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <TenantSidebar
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

      {/* Desktop Sidebar */}
      {!isMobile && (
        <>
          <TenantSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isOpen={sidebarOpen}
            isCollapsed={sidebarCollapsed}
            user={user}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="fixed left-64 top-6 bg-background border border-border shadow-lg z-10 transition-all duration-300"
            style={{ left: sidebarCollapsed ? '5rem' : '16rem' }}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
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
                <VerificationStatusCircle
                  isVerified={user?.tenantVerified || false}
                  isPending={user?.manualVerificationStatus === 'pending'}
                  size="md"
                  showLabel={true}
                />
              )}
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

          <div className="flex-1 p-6 bg-background">{renderContent()}</div>
        </div>
      </main>
    </div>
  );
};

const DashboardContent = ({ user, setActiveTab, navigate, dashboardData, dashboardLoading }: any) => {
  const [currentPage, setCurrentPage] = useState(1);
  const activitiesPerPage = 3;
  const isVerified = user?.tenantVerified || false;

  // Sample activities data - replace with actual data
  const allActivities = [
    {
      id: 1,
      icon: Search,
      bgColor: "from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700",
      iconColor: "text-gray-600 dark:text-gray-400",
      title: "Searched for properties in London",
      time: "2 hours ago"
    },
    {
      id: 2,
      icon: Calendar,
      bgColor: "from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700",
      iconColor: "text-gray-600 dark:text-gray-400",
      title: "Scheduled property viewing",
      time: "1 day ago"
    },
    {
      id: 3,
      icon: User,
      bgColor: "from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700",
      iconColor: "text-gray-600 dark:text-gray-400",
      title: "Updated profile information",
      time: "3 days ago"
    },
    {
      id: 4,
      icon: MessageSquare,
      bgColor: "from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700",
      iconColor: "text-gray-600 dark:text-gray-400",
      title: "Sent message to agent",
      time: "5 days ago"
    },
    {
      id: 5,
      icon: AlertTriangle,
      bgColor: "from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700",
      iconColor: "text-gray-600 dark:text-gray-400",
      title: "Submitted maintenance request",
      time: "1 week ago"
    },
    {
      id: 6,
      icon: FileText,
      bgColor: "from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700",
      iconColor: "text-gray-600 dark:text-gray-400",
      title: "Viewed lease agreement",
      time: "2 weeks ago"
    }
  ];

  // Calculate pagination
  const totalPages = Math.ceil(allActivities.length / activitiesPerPage);
  const indexOfLastActivity = currentPage * activitiesPerPage;
  const indexOfFirstActivity = indexOfLastActivity - activitiesPerPage;
  const currentActivities = allActivities.slice(indexOfFirstActivity, indexOfLastActivity);

  // Calculate rent payment countdown
  const calculateRentCountdown = () => {
    const moveInDate = dashboardData?.tenancy?.start_date
      ? new Date(dashboardData.tenancy.start_date)
      : new Date();

    const today = new Date();
    const daysSinceMoveIn = Math.floor((today.getTime() - moveInDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysUntilRent = 31 - (daysSinceMoveIn % 31);
    const nextRentDate = new Date(today);
    nextRentDate.setDate(today.getDate() + daysUntilRent);

    return {
      daysUntilRent,
      nextRentDate,
      daysPassed: daysSinceMoveIn % 31,
      moveInDate
    };
  };

  const rentInfo = calculateRentCountdown();

  // Pie chart data
  const pieData = [
    { name: 'Days Passed', value: rentInfo.daysPassed, color: '#6B7280' }, // Gray-500
    { name: 'Days Remaining', value: rentInfo.daysUntilRent, color: '#9CA3AF' }, // Gray-400
  ];

  if (dashboardLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
        <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  // Show error state if there's a connection error
  if (dashboardData?.error) {
    return (
      <div className="space-y-6">
        <Alert className="border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
          <AlertTriangle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <AlertDescription className="text-gray-800 dark:text-gray-200">
            {dashboardData.error}
            <br />
            <span className="text-sm">You can still browse properties and use other platform features.</span>
          </AlertDescription>
        </Alert>
        
        {/* Fallback quick actions */}
        <div>
          <h2 className="text-foreground text-xl font-bold leading-tight tracking-[-0.015em] mb-4">
            Available Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-gray-500 dark:border-l-gray-600" onClick={() => navigate('/properties')}>
              <div className="mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">Browse Properties</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Find your next home from our platform properties
                </p>
              </div>
              <div>
                <Button variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">
                  Start Searching
                </Button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-gray-500 dark:border-l-gray-600" onClick={() => navigate('/select-role')}>
              <div className="mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">Verify Your Tenancy</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Connect your rental property to access full features
                </p>
              </div>
              <div>
                <Button variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isVerified && user?.isPlatformTenant && (
        <Alert className="border-orange-300 dark:border-orange-700 bg-orange-100 dark:bg-orange-900/30">
          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            Your tenancy is not yet verified. Some features are limited.
            <Button
              variant="link"
              className="p-0 h-auto font-semibold text-orange-800 dark:text-orange-200 hover:text-orange-900 dark:hover:text-orange-100 ml-1"
              onClick={() => setActiveTab('verification')}
            >
              Verify now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {dashboardData?.status === 'no_property' && isVerified && (
        <Alert className="border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
          <AlertTriangle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <AlertDescription className="text-gray-800 dark:text-gray-200">
            Complete your profile to unlock all platform features and get better property recommendations.
            <Button
              variant="link"
              className="p-0 h-auto font-semibold text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100 ml-1"
              onClick={() => setActiveTab('profile')}
            >
              Complete now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Rent Payment Countdown and Property Information Cards */}
      {dashboardData?.status === 'active' && dashboardData?.property && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Rent Payment Countdown Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-4">
            <div className="mb-3">
              <h3 className="flex items-center gap-2 text-base font-semibold text-foreground/90">
                <CalendarDays className="h-4 w-4 text-primary drop-shadow-sm" />
                Rent Countdown
              </h3>
              <p className="text-xs text-foreground/70 mt-1">
                Due in {rentInfo.daysUntilRent} days
              </p>
            </div>
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ value }) => `${value}d`}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 w-full mt-2">
                <div className="glass text-center p-2 rounded-lg backdrop-blur-md">
                  <p className="text-xs text-foreground/70 mb-1">Move-in</p>
                  <p className="font-semibold text-xs text-gray-700 dark:text-gray-300">
                    {rentInfo.moveInDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
                <div className="glass text-center p-2 rounded-lg backdrop-blur-md">
                  <p className="text-xs text-foreground/70 mb-1">Next Due</p>
                  <p className="font-semibold text-xs text-gray-700 dark:text-gray-300">
                    {rentInfo.nextRentDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Property Information Card */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-4 border-l-4 border-l-gray-500 dark:border-l-gray-600">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="flex items-center gap-2 text-base font-semibold text-foreground/90">
                  <Building className="h-4 w-4 text-gray-600 dark:text-gray-400 drop-shadow-sm" />
                  Your Property
                </h3>
                <p className="text-xs text-foreground/70 mt-1">
                  Current rental property details
                </p>
              </div>
              <Badge variant="secondary" className="glass text-primary border border-primary/30 text-xs backdrop-blur-md">
                {dashboardData?.status === 'active' ? 'Active Tenant' : 'Platform Tenant'}
              </Badge>
            </div>
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-sm text-foreground/90">{dashboardData.property.title}</h3>
                    <div className="flex items-center gap-2 text-foreground/70">
                      <MapPin className="h-3 w-3" />
                      <p className="text-xs">{dashboardData.property.address}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <div className="flex items-center gap-1 text-foreground/80">
                      <Building className="h-3 w-3 text-foreground/70" />
                      <span>{dashboardData.property.bedrooms} bed, {dashboardData.property.bathrooms} bath</span>
                    </div>
                    <Badge variant="outline" className="glass-dark text-xs backdrop-blur-sm border-white/20">{dashboardData.property.property_type}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="glass text-center p-2 rounded-lg backdrop-blur-md">
                    <div className="flex items-center justify-center gap-1 text-xs text-foreground/70 mb-1">
                      <PoundSterling className="h-3 w-3" />
                      Monthly Rent
                    </div>
                    <p className="font-semibold text-sm text-foreground/90">£{dashboardData.tenancy?.monthly_rent?.toLocaleString()}</p>
                  </div>
                  <div className="glass text-center p-2 rounded-lg backdrop-blur-md">
                    <div className="flex items-center justify-center gap-1 text-xs text-foreground/70 mb-1">
                      <CalendarDays className="h-3 w-3" />
                      Lease End
                    </div>
                    <p className="font-semibold text-sm text-foreground/90">
                      {dashboardData.tenancy?.end_date ? new Date(dashboardData.tenancy.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activities and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-5">
          <div className="mb-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-foreground/90">
              <FileText className="h-4 w-4 text-primary drop-shadow-sm" />
              Recent Activity
            </h3>
            <p className="text-xs text-foreground/70 mt-1">
              Your latest platform interactions
            </p>
          </div>
          <div>
            <div className="space-y-3">
              {currentActivities.map((activity, index) => {
                const IconComponent = activity.icon;
                const isLast = index === currentActivities.length - 1;
                return (
                  <div
                    key={activity.id}
                    className={`flex items-center justify-between py-2 ${!isLast ? 'border-b border-white/20' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${activity.bgColor} flex items-center justify-center shadow-md`}>
                        <IconComponent className={`h-4 w-4 ${activity.iconColor}`} />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground/90">{activity.title}</p>
                        <p className="text-xs text-foreground/60">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/20">
                <p className="text-xs text-foreground/70">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="h-8 text-xs glass-dark backdrop-blur-sm border-white/30"
                  >
                    <ChevronLeft className="h-3 w-3" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 text-xs glass-dark backdrop-blur-sm border-white/30"
                  >
                    Next
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-foreground/90 text-base font-bold leading-tight tracking-[-0.015em] mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setActiveTab("messages")}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-lg group border border-gray-200 dark:border-gray-700"
              title="Messages"
            >
              <div className="flex items-center justify-center size-12 rounded-full bg-white dark:bg-gray-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800 transition-colors shadow-lg">
                <MessageSquare className="w-6 h-6 drop-shadow-sm" />
              </div>
              <span className="text-xs font-medium">Messages</span>
            </button>

            <button
              onClick={() => navigate('/properties')}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-lg group border border-gray-200 dark:border-gray-700"
              title="Browse Properties"
            >
              <div className="flex items-center justify-center size-12 rounded-full bg-white dark:bg-gray-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800 transition-colors shadow-lg">
                <Search className="w-6 h-6 drop-shadow-sm" />
              </div>
              <span className="text-xs font-medium">Properties</span>
            </button>

            <button
              onClick={() => {
                if (!isVerified) {
                  setActiveTab('verification');
                } else {
                  navigate('/submit-complaint');
                }
              }}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-lg group border border-gray-200 dark:border-gray-700 ${!isVerified ? 'opacity-60' : ''}`}
              title={!isVerified ? "Verify your tenancy to submit complaints" : "Submit Complaint"}
            >
              <div className="flex items-center justify-center size-12 rounded-full bg-white dark:bg-gray-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800 transition-colors shadow-lg relative">
                <AlertTriangle className="w-6 h-6 drop-shadow-sm" />
                {!isVerified && (
                  <div className="absolute -top-1 -right-1 bg-orange-500 rounded-full w-3 h-3 border-2 border-white dark:border-gray-800" />
                )}
              </div>
              <span className="text-xs font-medium">Complaints</span>
            </button>

            <button
              onClick={() => setActiveTab("notifications")}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-lg group border border-gray-200 dark:border-gray-700"
              title="Notifications"
            >
              <div className="flex items-center justify-center size-12 rounded-full bg-white dark:bg-gray-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800 transition-colors shadow-lg">
                <Bell className="w-6 h-6 drop-shadow-sm" />
              </div>
              <span className="text-xs font-medium">Notifications</span>
            </button>

            <button
              onClick={() => setActiveTab("agent")}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-lg group border border-gray-200 dark:border-gray-700"
              title="Agent"
            >
              <div className="flex items-center justify-center size-12 rounded-full bg-white dark:bg-gray-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800 transition-colors shadow-lg">
                <UserCheck className="w-6 h-6 drop-shadow-sm" />
              </div>
              <span className="text-xs font-medium">Agent</span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-lg group border border-gray-200 dark:border-gray-700"
              title="Profile"
            >
              <div className="flex items-center justify-center size-12 rounded-full bg-white dark:bg-gray-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800 transition-colors shadow-lg">
                <User className="w-6 h-6 drop-shadow-sm" />
              </div>
              <span className="text-xs font-medium">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Messages Content Component - Now using TenantMessages

// Profile Content Component
const ProfileContent = ({ user }: any) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postcode: '',
    county: '',
    dateOfBirth: '',
    employmentStatus: '',
    employerName: '',
    annualIncome: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    nationality: '',
    rightToRentStatus: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      // Here you would typically call an API to save the profile data
      // For now, we'll just show a success toast
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      postcode: '',
      county: '',
      dateOfBirth: '',
      employmentStatus: '',
      employerName: '',
      annualIncome: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: '',
      nationality: '',
      rightToRentStatus: ''
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <h1 className="text-foreground tracking-light text-3xl font-bold leading-tight">
            Profile
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your personal information and tenant verification details
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-6">
          <div className="mb-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <User className="h-5 w-5" />
              Personal Information
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your basic personal details
            </p>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                value={formData.nationality}
                onChange={(e) => handleInputChange('nationality', e.target.value)}
                disabled={!isEditing}
                placeholder="e.g., British, American"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-6">
          <div className="mb-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Home className="h-5 w-5" />
              Address Information
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your current residential address
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="addressLine1">Address Line 1</Label>
              <Input
                id="addressLine1"
                value={formData.addressLine1}
                onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                disabled={!isEditing}
                placeholder="Street address"
              />
            </div>
            <div>
              <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
              <Input
                id="addressLine2"
                value={formData.addressLine2}
                onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                disabled={!isEditing}
                placeholder="Apartment, suite, etc."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="postcode">Postcode</Label>
                <Input
                  id="postcode"
                  value={formData.postcode}
                  onChange={(e) => handleInputChange('postcode', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="county">County</Label>
              <Input
                id="county"
                value={formData.county}
                onChange={(e) => handleInputChange('county', e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        {/* Employment Information */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-6">
          <div className="mb-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <FileText className="h-5 w-5" />
              Employment Information
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your employment and income details
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="employmentStatus">Employment Status</Label>
              <Input
                id="employmentStatus"
                value={formData.employmentStatus}
                onChange={(e) => handleInputChange('employmentStatus', e.target.value)}
                disabled={!isEditing}
                placeholder="e.g., Full-time, Part-time, Self-employed"
              />
            </div>
            <div>
              <Label htmlFor="employerName">Employer Name</Label>
              <Input
                id="employerName"
                value={formData.employerName}
                onChange={(e) => handleInputChange('employerName', e.target.value)}
                disabled={!isEditing}
                placeholder="Company or organization name"
              />
            </div>
            <div>
              <Label htmlFor="annualIncome">Annual Income (£)</Label>
              <Input
                id="annualIncome"
                type="number"
                value={formData.annualIncome}
                onChange={(e) => handleInputChange('annualIncome', e.target.value)}
                disabled={!isEditing}
                placeholder="e.g., 35000"
              />
            </div>
            <div>
              <Label htmlFor="rightToRentStatus">Right to Rent Status</Label>
              <Input
                id="rightToRentStatus"
                value={formData.rightToRentStatus}
                onChange={(e) => handleInputChange('rightToRentStatus', e.target.value)}
                disabled={!isEditing}
                placeholder="e.g., British Citizen, EU Settled Status"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-6">
          <div className="mb-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Phone className="h-5 w-5" />
              Emergency Contact
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Emergency contact information
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="emergencyContactName">Contact Name</Label>
              <Input
                id="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                disabled={!isEditing}
                placeholder="Full name"
              />
            </div>
            <div>
              <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
              <Input
                id="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                disabled={!isEditing}
                placeholder="Phone number"
              />
            </div>
            <div>
              <Label htmlFor="emergencyContactRelationship">Relationship</Label>
              <Input
                id="emergencyContactRelationship"
                value={formData.emergencyContactRelationship}
                onChange={(e) => handleInputChange('emergencyContactRelationship', e.target.value)}
                disabled={!isEditing}
                placeholder="e.g., Parent, Sibling, Friend"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Verification Status */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-6">
        <div className="mb-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <AlertTriangle className="h-5 w-5" />
            Verification Status
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Your tenant verification and platform status
          </p>
        </div>
        <div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={user?.isVerified ? "default" : "secondary"}>
                {user?.isVerified ? "Email Verified" : "Email Pending"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={user?.tenantVerified ? "default" : "secondary"}>
                {user?.tenantVerified ? "Tenant Verified" : "Tenant Verification Pending"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={user?.profileComplete ? "default" : "secondary"}>
                {user?.profileComplete ? "Profile Complete" : "Profile Incomplete"}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Agent Content Component
const AgentContent = ({ user, dashboardData, setActiveTab }: any) => {
  const agent = dashboardData?.agent;
  const isVerified = user?.tenantVerified || false;

  const handleSendMessage = () => {
    if (!isVerified) {
      setActiveTab('verification');
      return;
    }

    // Store agent info in sessionStorage for the messages component
    if (agent) {
      sessionStorage.setItem('messageToAgent', JSON.stringify({
        id: agent.id,
        name: agent.name,
        email: agent.email,
        type: 'agent'
      }));
    }
    // Switch to messages tab
    setActiveTab("messages");
  };

  return (
    <div className="space-y-6">
      {!isVerified && (
        <Alert className="border-orange-300 dark:border-orange-700 bg-orange-100 dark:bg-orange-900/30">
          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            Please verify your tenancy to contact your agent.
            <Button
              variant="link"
              className="p-0 h-auto font-semibold text-orange-800 dark:text-orange-200 hover:text-orange-900 dark:hover:text-orange-100 ml-1"
              onClick={() => setActiveTab('verification')}
            >
              Verify now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <h1 className="text-foreground tracking-light text-3xl font-bold leading-tight">
            Your Agent
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Information about the agent managing your property
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-6">
        <div className="mb-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <UserCheck className="h-5 w-5" />
            Agent Information
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Details about your assigned property agent
          </p>
        </div>
        <div>
          {agent ? (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                  {agent.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground">{agent.name}</h3>
                  {agent.company && (
                    <p className="text-muted-foreground">{agent.company}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant="secondary">Property Agent</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{agent.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{agent.phone}</span>
                    </div>
                    {agent.office_address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-sm">{agent.office_address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">About</h4>
                  {agent.description ? (
                    <p className="text-sm text-muted-foreground">{agent.description}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">No description available.</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1"
                  onClick={handleSendMessage}
                  disabled={!isVerified}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <Button
                  variant="outline"
                  disabled={!isVerified}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Agent Assigned
              </h3>
              <p className="text-muted-foreground mb-4">
                You don't have an agent assigned to your property yet. This information will appear once you have a property assignment.
              </p>
              <Button onClick={() => window.location.href = '/find-agent'}>
                Find an Agent
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Verification Content Component
const VerificationContent = ({ user, navigate }: any) => {
  const { updateUser } = useAuth();
  const { toast } = useToast();

  const handleVerificationComplete = async () => {
    try {
      // Update user verification status
      const updatedUser = {
        ...user,
        tenantVerified: true,
        manualVerificationStatus: 'verified' as const
      };

      updateUser(updatedUser);

      toast({
        title: "Verification Submitted",
        description: "Your tenancy verification has been submitted for review.",
      });

      // Reload the dashboard to refresh data
      window.location.reload();
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Error",
        description: "Failed to submit verification. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (user?.tenantVerified) {
    return (
      <div className="space-y-6">
        <Alert className="border-green-300 dark:border-green-700 bg-green-100 dark:bg-green-900/30">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Your tenancy has been verified! You have full access to all platform features.
          </AlertDescription>
        </Alert>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-6">
          <div className="text-center py-8">
            <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Verification Complete
            </h3>
            <p className="text-muted-foreground mb-6">
              Your tenancy verification has been approved. You can now access all features.
            </p>
            <Button onClick={() => navigate('/tenant-dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert className="border-orange-300 dark:border-orange-700 bg-orange-100 dark:bg-orange-900/30">
        <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        <AlertDescription className="text-orange-800 dark:text-orange-200">
          Please complete your tenancy verification to access all features. Some functionality is limited until verified.
        </AlertDescription>
      </Alert>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-6">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-foreground mb-2">
            Verify Your Tenancy
          </h3>
          <p className="text-muted-foreground">
            Complete the verification process below to unlock all features and start managing your tenancy.
          </p>
        </div>

        <TenantVerification
          onComplete={handleVerificationComplete}
          onBack={() => navigate('/tenant-dashboard')}
        />
      </div>
    </div>
  );
};

export default TenantDashboard;