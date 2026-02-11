import { useState, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useIsMobile } from "@/hooks/use-mobile";
import { propertyApi, profileApi } from "@/services/api";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useForm } from 'react-hook-form';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
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
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  AlertTriangle,
  MessageSquare,
  User,
  Building,
  Calendar,
  Menu,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  UserCheck,
  TrendingUp,
  Users,
  Plus,
  Clock,
  CheckCircle,
  BarChart3,
  MapPin,
  Bed,
  Bath,
  DollarSign,
  Eye,
  KeyRound,
  Settings,
  Edit,
  Upload,
  Phone,
  Mail,
  Briefcase,
  Award,
  FileText,
  Bell,
  LogOut,
  Moon,
  Sun,
  ChevronDown
} from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import NotificationDropdown from "@/components/Notifications/NotificationDropdown";
import AgentMessages from "@/components/AgentDashboard/AgentMessages";
import NotificationsComponent from "@/components/TenantDashboard/NotificationsComponent";
import TenantApprovalRequests from '@/components/TenantApproval/TenantApprovalRequests';
import ScheduledViewingsList from '@/components/Schedule/ScheduledViewingsList';
import AgentRequestsView from '@/components/AgentRequests/AgentRequestsView';
import AgentRequestsList from '@/components/AgentRequests/AgentRequestsList';
import { InquiriesView } from '@/components/Agent/InquiriesView';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { spareRoomApi } from '@/services/spareRoomApi';
import { SpareRoomListings } from '@/components/SpareRoom/SpareRoomListings';
import { AgentSidebar } from '@/components/AgentDashboard/AgentSidebar';
import { Search } from 'lucide-react';
import { PropertyToggle } from '@/components/Properties/PropertyToggle';

const AgentDashboard = () => {
  const { loading, hasAccess, user } = useAuthGuard(['agent'], false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Close sidebar on mobile, keep open on desktop
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Handle special tab navigation cases
  const handleTabChange = (tab: string) => {
    if (tab === 'post-spare-room') {
      navigate('/post-spare-room');
      return;
    }
    if (tab === 'add-property') {
      navigate('/list-property');
      return;
    }

    // Use flushSync to force immediate synchronous state update
    // This ensures the UI updates instantly when clicking tabs
    flushSync(() => {
      setActiveTab(tab);
    });
  };
  const [agentStats, setAgentStats] = useState([
    { label: 'Active Listings', value: '0', icon: Building, color: 'text-blue-600', bgColor: 'bg-blue-50', gradient: 'from-blue-500 to-blue-600' },
    { label: 'Total Clients', value: '0', icon: Users, color: 'text-green-600', bgColor: 'bg-green-50', gradient: 'from-green-500 to-green-600' },
    { label: 'This Month Sales', value: '0', icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-50', gradient: 'from-purple-500 to-purple-600' },
    { label: 'Scheduled Viewings', value: '0', icon: Calendar, color: 'text-orange-600', bgColor: 'bg-orange-50', gradient: 'from-orange-500 to-orange-600' },
  ]);
  const [agentActivity, setAgentActivity] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [activityPage, setActivityPage] = useState(1);
  const activitiesPerPage = 5;
  const { toast } = useToast();

  // Handle success message from property listing
  useEffect(() => {
    const state = location.state as any;
    if (state?.message) {
      toast({
        title: "Success",
        description: state.message,
      });
      // Clear the state to prevent showing the message again
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname, toast]);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setStatsLoading(true);
        
        // Fetch properties to get real statistics
        const propertiesResponse = await propertyApi.getMyProperties({
          page: 1,
          per_page: 1000 // Get all properties for accurate stats
        });
        
        if (propertiesResponse.success && propertiesResponse.data) {
          const allProperties = propertiesResponse.data.properties;
          const activeListings = allProperties.filter(p => p.status === 'active').length;
          const totalProperties = allProperties.length;
          
          setAgentStats([
            { label: 'Active Listings', value: activeListings.toString(), icon: Building, color: 'text-blue-600', bgColor: 'bg-blue-50', gradient: 'from-blue-500 to-blue-600' },
            { label: 'Total Properties', value: totalProperties.toString(), icon: Home, color: 'text-green-600', bgColor: 'bg-green-50', gradient: 'from-green-500 to-green-600' },
            { label: 'This Month Sales', value: '0', icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-50', gradient: 'from-purple-500 to-purple-600' },
            { label: 'Scheduled Viewings', value: '0', icon: Calendar, color: 'text-orange-600', bgColor: 'bg-orange-50', gradient: 'from-orange-500 to-orange-600' },
          ]);
        } else {
          // Set default values if API fails
          setAgentStats([
            { label: 'Active Listings', value: '0', icon: Building, color: 'text-blue-600', bgColor: 'bg-blue-50', gradient: 'from-blue-500 to-blue-600' },
            { label: 'Total Properties', value: '0', icon: Home, color: 'text-green-600', bgColor: 'bg-green-50', gradient: 'from-green-500 to-green-600' },
            { label: 'This Month Sales', value: '0', icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-50', gradient: 'from-purple-500 to-purple-600' },
            { label: 'Scheduled Viewings', value: '0', icon: Calendar, color: 'text-orange-600', bgColor: 'bg-orange-50', gradient: 'from-orange-500 to-orange-600' },
          ]);
        }

        // Fetch agent activities (keep this separate)
        try {
          const activitiesResponse = await propertyApi.getAgentActivities();
          if (activitiesResponse.success && activitiesResponse.data) {
            setAgentActivity(activitiesResponse.data.activities);
          }
        } catch (activityError) {
          console.error('Error fetching activities:', activityError);
          // Keep default empty activities if this fails
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set default values if API fails
        setAgentStats([
          { label: 'Active Listings', value: '0', icon: Building, color: 'text-blue-600', bgColor: 'bg-blue-50', gradient: 'from-blue-500 to-blue-600' },
          { label: 'Total Properties', value: '0', icon: Home, color: 'text-green-600', bgColor: 'bg-green-50', gradient: 'from-green-500 to-green-600' },
          { label: 'This Month Sales', value: '0', icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-50', gradient: 'from-purple-500 to-purple-600' },
          { label: 'Scheduled Viewings', value: '0', icon: Calendar, color: 'text-orange-600', bgColor: 'bg-orange-50', gradient: 'from-orange-500 to-orange-600' },
        ]);
      } finally {
        setStatsLoading(false);
      }
    };

    if (user && hasAccess) {
      fetchDashboardData();
    }
  }, [user, hasAccess, location.state?.refresh]);

  // Fetch properties when properties tab is activated
  useEffect(() => {
    const fetchProperties = async () => {
      if (activeTab !== 'properties' || !user || !hasAccess) return;
      
      try {
        setPropertiesLoading(true);
        const response = await propertyApi.getMyProperties({
          page: 1,
          per_page: 10
        });
        console.log('Properties API response:', response);
        
        if (response.success && response.data) {
          setProperties(response.data.properties);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        // If token expired, redirect to login
        if (error.message?.includes('Token has expired')) {
          toast({
            title: "Session Expired",
            description: "Please login again.",
            variant: "destructive"
          });
          navigate('/login');
        } else {
          toast({
            title: "Error",
            description: "Failed to load properties",
            variant: "destructive"
          });
        }
      } finally {
        setPropertiesLoading(false);
      }
    };

    fetchProperties();
  }, [activeTab, user, hasAccess]);

  const handleNavigation = (path: string, actionName: string) => {
    console.log(`Attempting to navigate to ${path} for action: ${actionName}`);
    navigate(path);
  };

  const handleTenantApproval = (requestId: number) => {
    console.log(`Tenant request ${requestId} approved`);
    // Add any additional logic for approval
  };

  const handleTenantRejection = (requestId: number) => {
    console.log(`Tenant request ${requestId} rejected`);
    // Add any additional logic for rejection
  };

  const handleViewingStatusUpdate = (viewingId: number, status: string) => {
    console.log(`Viewing ${viewingId} status updated to ${status}`);
    // Add any additional logic for viewing status updates
  };

  const handleAgentRequestAccept = (requestId: number, agentDetails: { name: string; email: string; phone: string; message?: string }) => {
    console.log(`Agent request ${requestId} accepted with details:`, agentDetails);
    // Add any additional logic for request acceptance
  };

  const handleAgentRequestReject = (requestId: number) => {
    console.log(`Agent request ${requestId} rejected`);
    // Add any additional logic for request rejection
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading Agent Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    console.log('AgentDashboard - Access denied, redirecting...');
    return null;
  }

  console.log('AgentDashboard rendering:', { user, activeTab, sidebarOpen });

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContent user={user} navigate={navigate} agentStats={agentStats} agentActivity={agentActivity} statsLoading={statsLoading} activityPage={activityPage} setActivityPage={setActivityPage} activitiesPerPage={activitiesPerPage} />;
      case "properties":
        return <PropertiesContent user={user} navigate={navigate} properties={properties} propertiesLoading={propertiesLoading} />;
      case "messages":
        return <AgentMessages />;
      case "requests":
        return <AgentRequestsView />;
      case "approvals":
        return <ApprovalsContent handleTenantApproval={handleTenantApproval} handleTenantRejection={handleTenantRejection} />;
      case "viewings":
        return <ViewingsContent handleViewingStatusUpdate={handleViewingStatusUpdate} navigate={navigate} />;
      case "inquiries":
        return <InquiriesContent />;
      case "complaints":
        return <ComplaintsContent navigate={navigate} />;
      case "spare-rooms":
        return <SpareRoomListings userRole="agent" />;
      case "notifications":
        return <NotificationsComponent user={user} />;
      case "profile":
        return <ProfileContent user={user} />;
      default:
        return <DashboardContent user={user} navigate={navigate} agentStats={agentStats} agentActivity={agentActivity} statsLoading={statsLoading} activityPage={activityPage} setActivityPage={setActivityPage} activitiesPerPage={activitiesPerPage} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <AgentSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left: Menu Button, Collapse Toggle and Search */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  <Menu className="text-xl" />
                </button>

                {/* Sidebar Collapse Toggle (Desktop only) */}
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden lg:block text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>

                {/* Search Bar */}
                <div className="relative hidden md:block">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-gray-400 dark:text-gray-500" size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search properties, clients, or tasks..."
                    className="pl-10 pr-4 py-2 w-64 lg:w-80 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Right: Notifications and User */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Add New Button */}
                <button
                  onClick={() => navigate('/list-property')}
                  className="hidden md:flex items-center space-x-2 bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus size={18} />
                  <span>Add New</span>
                </button>

                {/* User Menu Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                      <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-600 dark:from-gray-600 dark:to-gray-800 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {user?.firstName?.[0] || 'B'}{user?.lastName?.[0] || 'J'}
                        </span>
                      </div>
                      <div className="hidden md:block text-left">
                        <p className="font-medium text-gray-800 dark:text-gray-200">{user?.firstName || ''} {user?.lastName || ''}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Agent</p>
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

        {/* Main Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950">
          {renderContent()}
        </main>
      </div>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Settings</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Customize your dashboard preferences
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Theme Toggle */}
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

// Dashboard Content Component for Agent
const DashboardContent = ({ user, navigate, agentStats = [], agentActivity = [], statsLoading, activityPage, setActivityPage, activitiesPerPage }: any) => {
  const safeAgentStats = Array.isArray(agentStats) ? agentStats : [];
  const safeAgentActivity = Array.isArray(agentActivity) ? agentActivity : [];

  console.log('DashboardContent rendering:', {
    user,
    statsCount: safeAgentStats.length,
    activityCount: safeAgentActivity.length,
    statsLoading
  });

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Welcome Back, {user?.firstName || ''} {user?.lastName || ''}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Here's what's happening with your business today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Listings */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Active Listings</h3>
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <Home className="text-gray-600 dark:text-gray-400" size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            {statsLoading ? '...' : safeAgentStats.find((s: any) => s.label === 'Active Listings')?.value || '0'}
          </p>
          <div className="flex items-center text-xs text-green-600 dark:text-green-400">
            <TrendingUp size={14} className="mr-1" />
            <span>2 new this week</span>
          </div>
        </div>

        {/* Total Properties */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Total Properties</h3>
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <Building className="text-gray-600 dark:text-gray-400" size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            {statsLoading ? '...' : safeAgentStats.find((s: any) => s.label === 'Total Properties')?.value || '0'}
          </p>
          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
            <CheckCircle size={14} className="mr-1" />
            <span>All managed</span>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Monthly Revenue</h3>
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <DollarSign className="text-gray-600 dark:text-gray-400" size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">£12,450</p>
          <div className="flex items-center text-xs text-green-600 dark:text-green-400">
            <TrendingUp size={14} className="mr-1" />
            <span>15% from last month</span>
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Success Rate</h3>
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <BarChart3 className="text-gray-600 dark:text-gray-400" size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">94%</p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-green-500 dark:bg-green-600 h-2 rounded-full" style={{ width: '94%' }}></div>
          </div>
        </div>
      </div>

      {/* Recent Activity and Properties Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Recent Activity</h2>
          </div>
          <div className="p-6 space-y-6">
            {statsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="animate-pulse flex items-start space-x-4">
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : safeAgentActivity.length > 0 ? (
              safeAgentActivity.slice(0, 4).map((activity: any, index) => {
                const colors = ['bg-gray-600', 'bg-green-600', 'bg-gray-500', 'bg-gray-700'];
                return (
                  <div key={activity.id || index} className="relative pl-6">
                    <div className={`absolute left-0 top-2 w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-gray-100">{activity.title}</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{activity.description}</p>
                      </div>
                      <span className="text-gray-500 text-sm whitespace-nowrap ml-4">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <>
                <div className="relative pl-6">
                  <div className="absolute left-0 top-2 w-3 h-3 rounded-full bg-gray-600 dark:bg-gray-500"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-100">New Spare Room Assigned to You</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">A new spare room "test 2" has been assigned to you</p>
                    </div>
                    <span className="text-gray-500 dark:text-gray-500 text-sm">21/1/2025</span>
                  </div>
                </div>
                <div className="relative pl-6">
                  <div className="absolute left-0 top-2 w-3 h-3 rounded-full bg-green-600 dark:bg-green-500"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-100">Listed spare room: test 2</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">789 Maple Road, Birmingham</p>
                    </div>
                    <span className="text-gray-500 dark:text-gray-500 text-sm">21/1/2025</span>
                  </div>
                </div>
                <div className="relative pl-6">
                  <div className="absolute left-0 top-2 w-3 h-3 rounded-full bg-gray-500 dark:bg-gray-600"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-100">New Message from Tenant</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">John Smith inquired about availability</p>
                    </div>
                    <span className="text-gray-500 dark:text-gray-500 text-sm">20/1/2025</span>
                  </div>
                </div>
                <div className="relative pl-6">
                  <div className="absolute left-0 top-2 w-3 h-3 rounded-full bg-gray-700 dark:bg-gray-400"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-100">Viewing Scheduled</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Property viewing at 3:00 PM tomorrow</p>
                    </div>
                    <span className="text-gray-500 dark:text-gray-500 text-sm">19/1/2025</span>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="p-6 border-t border-gray-100 dark:border-gray-800">
            <button className="w-full text-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium">
              View All Activity <ChevronRight className="inline ml-2" size={16} />
            </button>
          </div>
        </div>

        {/* Properties Overview (Recent Listings) */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Properties Overview</h2>
          </div>
          <div className="p-6">
            {/* Property Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Listings</p>
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">
                  {safeAgentStats.find((s: any) => s.label === 'Active Listings')?.value || '0'}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Under Contract</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">2</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">1</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Recently Sold</p>
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">3</p>
              </div>
            </div>

            {/* Property List */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-100">789 Maple Road</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Birmingham • 3 Bed • 2 Bath</p>
                  </div>
                  <Badge className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium px-3 py-1 rounded-full border-0">
                    Active
                  </Badge>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-800 dark:text-gray-200">£1,250/month</span>
                  <button className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium">
                    View Details <ChevronRight className="inline ml-1" size={14} />
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-100">123 Oak Avenue</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">London • 2 Bed • 1 Bath</p>
                  </div>
                  <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-medium px-3 py-1 rounded-full border-0">
                    Sold
                  </Badge>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-800 dark:text-gray-200">£950/month</span>
                  <button className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium">
                    View Details <ChevronRight className="inline ml-1" size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/list-property')}
            className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Plus className="text-gray-600 dark:text-gray-400 mb-2" size={28} />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Add Property</span>
          </button>

          <button
            onClick={() => navigate('/schedule-viewing')}
            className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Calendar className="text-gray-600 dark:text-gray-400 mb-2" size={28} />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Schedule Viewing</span>
          </button>

          <button
            onClick={() => {
              toast.info("Report generation feature is coming soon!");
            }}
            className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <FileText className="text-gray-600 dark:text-gray-400 mb-2" size={28} />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Generate Report</span>
          </button>

          <button
            onClick={() => {
              toast.info("Analytics dashboard is coming soon!");
            }}
            className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <BarChart3 className="text-gray-600 dark:text-gray-400 mb-2" size={28} />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">View Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Property Pie Chart Component
const PropertyPieChart = ({ agentStats, statsLoading }: any) => {
  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeListings = parseInt(agentStats.find((s: any) => s.label === 'Active Listings')?.value || '0');
  const totalProperties = parseInt(agentStats.find((s: any) => s.label === 'Total Properties')?.value || '0');
  const inactiveProperties = Math.max(0, totalProperties - activeListings);
  const totalTenants = parseInt(agentStats.find((s: any) => s.label === 'Total Clients')?.value || '0');

  const data = [
    { name: 'Active Listings', value: activeListings, color: '#FF6B35' }, 
    { name: 'Inactive Properties', value: inactiveProperties, color: '#9D4EDD' }, 
    { name: 'Total Tenants', value: totalTenants, color: '#06FFA5' },
  ].filter(item => item.value > 0); 

  
  const hasData = data.length > 0 && data.some(item => item.value > 0);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <BarChart3 className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No data available yet</p>
        <p className="text-sm text-muted-foreground mt-2">Start by adding properties to see statistics</p>
      </div>
    );
  }

  const renderCustomLabel = (entry: any) => {
    const percent = entry.percent || 0;
    return `${(percent * 100).toFixed(0)}%`;
  };

  return (
    <div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={70}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => [value, '']}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Data Summary */}
      <div className="mt-4 space-y-2 border-t border-border pt-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-muted-foreground">{item.name}</span>
            </div>
            <span className="font-semibold text-foreground">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Tenant Claims Line Chart Component
const TenantClaimsLineChart = ({ statsLoading }: { statsLoading: boolean }) => {
  const [tenantClaimsData, setTenantClaimsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenantClaimsData = async () => {
      try {
        setLoading(true);

        // Fetch properties to get tenant claim data
        const propertiesResponse = await propertyApi.getMyProperties({
          page: 1,
          per_page: 1000
        });

        if (propertiesResponse.success && propertiesResponse.data) {
          const properties = propertiesResponse.data.properties;

          const mockTenantClaims = generateMockTenantClaimsData(properties);
          setTenantClaimsData(mockTenantClaims);
        }
      } catch (error) {
        console.error('Error fetching tenant claims data:', error);
        setTenantClaimsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantClaimsData();
  }, []);

  const generateMockTenantClaimsData = (properties: any[]) => {
    if (!properties || properties.length === 0) {
      return [];
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const data = months.map((month, index) => {
      const dataPoint: any = { month };

      // For each property, generate random tenant claim counts
      properties.slice(0, 5).forEach((property, propIndex) => {
        // Generate realistic claim counts (0-3 tenants per month)
        const claims = Math.floor(Math.random() * 4);
        dataPoint[property.title?.substring(0, 20) || `Property ${propIndex + 1}`] = claims;
      });

      return dataPoint;
    });

    return data;
  };

  if (statsLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!tenantClaimsData || tenantClaimsData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Users className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No tenant claim data available yet</p>
        <p className="text-sm text-muted-foreground mt-2">Tenant claims will appear here as they are made</p>
      </div>
    );
  }

 
  const propertyNames = Object.keys(tenantClaimsData[0] || {}).filter(key => key !== 'month');
  const lineColors = ['#FF6B35', '#9D4EDD', '#06FFA5', '#FFB800', '#00D4FF'];
  const totalTenants = tenantClaimsData.reduce((sum, dataPoint) => {
    return sum + propertyNames.reduce((propSum, propName) => {
      return propSum + (dataPoint[propName] || 0);
    }, 0);
  }, 0);

  return (
    <div>
      {/* Summary Stats */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="bg-muted/30 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Total Tenants</p>
          <p className="text-lg font-bold text-foreground">{totalTenants}</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Properties</p>
          <p className="text-lg font-bold text-foreground">{propertyNames.length}</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Avg/Month</p>
          <p className="text-lg font-bold text-foreground">
            {tenantClaimsData.length > 0 ? (totalTenants / tenantClaimsData.length).toFixed(1) : 0}
          </p>
        </div>
      </div>

      {/* Line Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={tenantClaimsData}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="month"
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '10px' }}
              tick={{ fontSize: 10 }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '10px' }}
              tick={{ fontSize: 10 }}
              width={30}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '11px'
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend
              wrapperStyle={{ fontSize: '10px' }}
              iconType="line"
              iconSize={8}
            />
            {propertyNames.map((propName, index) => (
              <Line
                key={propName}
                type="monotone"
                dataKey={propName}
                stroke={lineColors[index % lineColors.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Property Legend with Details */}
      <div className="mt-4 space-y-1.5 border-t border-border pt-3">
        <p className="text-xs font-semibold text-foreground mb-2">Properties:</p>
        {propertyNames.map((propName, index) => {
          const totalForProperty = tenantClaimsData.reduce((sum, dataPoint) => sum + (dataPoint[propName] || 0), 0);
          return (
            <div key={index} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: lineColors[index % lineColors.length] }}></div>
                <span className="text-muted-foreground truncate max-w-[150px]" title={propName}>
                  {propName}
                </span>
              </div>
              <span className="font-semibold text-foreground">{totalForProperty}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Properties Content Component
const PropertiesContent = ({ user, navigate, properties, propertiesLoading }: any) => {
  const [localProperties, setLocalProperties] = useState(properties);

  useEffect(() => {
    setLocalProperties(properties);
  }, [properties]);

  const handleStatusChange = (propertyId: string, newStatus: string) => {
    setLocalProperties((prev: any[]) =>
      prev.map(p => p.id === propertyId ? { ...p, status: newStatus } : p)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">My Properties</h2>
          <p className="text-sm text-muted-foreground">Manage your property listings</p>
        </div>
        <Button onClick={() => navigate('/list-property')} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Property
        </Button>
      </div>

      {propertiesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="animate-pulse">
                <div className="h-48 bg-muted"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : localProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localProperties.map((property: any) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 cursor-pointer" onClick={() => navigate(`/property/${property.id}`)}>
                {property.images && property.images.length > 0 ? (
                  <img
                    src={typeof property.images[0] === 'string' ? property.images[0] : property.images[0]?.image_url || property.primary_image_url || '/placeholder.svg'}
                    alt={property.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                ) : property.primary_image_url ? (
                  <img
                    src={property.primary_image_url}
                    alt={property.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Building className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
                  {property.listing_type}
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-2 truncate cursor-pointer" onClick={() => navigate(`/property/${property.id}`)}>{property.title}</h3>
                <p className="text-sm text-muted-foreground mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {property.location}
                </p>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <span className="flex items-center">
                    <Bed className="w-4 h-4 mr-1" />
                    {property.bedrooms} beds
                  </span>
                  <span className="flex items-center">
                    <Bath className="w-4 h-4 mr-1" />
                    {property.bathrooms} baths
                  </span>
                </div>
                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary flex items-center">
                      <DollarSign className="w-4 h-4" />
                      {property.price ? property.price.toLocaleString() : 'N/A'}
                    </span>
                    <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
                      {property.status}
                    </Badge>
                  </div>
                  <PropertyToggle
                    propertyId={property.id}
                    currentStatus={property.status}
                    onStatusChange={(newStatus) => handleStatusChange(property.id, newStatus)}
                  />
                </div>
                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-800">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/edit-property/${property.id}`);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Are you sure you want to delete "${property.title}"?`)) {
                        console.log('Delete property:', property.id);
                        toast.success(`${property.title} has been deleted successfully.`);
                      }
                    }}
                  >
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Properties Listed</h3>
          <p className="text-muted-foreground mb-4">Start by adding your first property listing</p>
          <Button onClick={() => navigate('/list-property')} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </Card>
      )}
    </div>
  );
};

// Requests Content Component
const RequestsContent = ({ handleAgentRequestAccept, handleAgentRequestReject }: any) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-2">Agent Requests</h2>
        <p className="text-sm text-muted-foreground">Manage incoming agent collaboration requests</p>
      </div>
      <AgentRequestsList 
        onAcceptRequest={handleAgentRequestAccept}
        onRejectRequest={handleAgentRequestReject}
      />
    </div>
  );
};

// Approvals Content Component
const ApprovalsContent = ({ handleTenantApproval, handleTenantRejection }: any) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-2">Tenant Approval Requests</h2>
        <p className="text-sm text-muted-foreground">Review and approve tenant applications</p>
      </div>
      <TenantApprovalRequests 
        onApprove={handleTenantApproval}
        onReject={handleTenantRejection}
      />
    </div>
  );
};

// Viewings Content Component
const ViewingsContent = ({ handleViewingStatusUpdate, navigate }: any) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground mb-2">Property Viewings</h2>
          <p className="text-sm text-muted-foreground">Manage scheduled property viewings</p>
        </div>
        <Button onClick={() => navigate('/properties')} className="bg-primary hover:bg-primary/90">
          <Calendar className="w-4 h-4 mr-2" />
          Schedule Viewing
        </Button>
      </div>

      <ScheduledViewingsList />
    </div>
  );
};

// Inquiries Content Component
const InquiriesContent = () => {
  return (
    <div className="h-full">
      <InquiriesView />
    </div>
  );
};

// Complaints Content Component
const ComplaintsContent = ({ navigate }: any) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground mb-2">Property Complaints</h2>
          <p className="text-sm text-muted-foreground">Manage tenant complaints and issues</p>
        </div>
        <Button onClick={() => navigate('/agent-complaints')} className="bg-primary hover:bg-primary/90">
          <Eye className="w-4 h-4 mr-2" />
          View All Complaints
        </Button>
      </div>

      <Card className="p-8 text-center">
        <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Complaints Management</h3>
        <p className="text-muted-foreground mb-4">Use the dedicated complaints page for full complaint management features</p>
        <Button onClick={() => navigate('/agent-complaints')} variant="outline">
          Go to Complaints Page
        </Button>
      </Card>
    </div>
  );
};

// Profile Content Component
const ProfileContent = ({ user }: any) => {
  const [submitting, setSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  interface AgentProfileData {
    name: string;
    company: string;
    location: string;
    description: string;
    phone: string;
    email: string;
    specialization: string;
    experience: string;
    officeAddress: string;
    serviceAreas: string;
  }

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AgentProfileData>({
    defaultValues: {
      name: user ? `${user.firstName} ${user.lastName}` : '',
      email: user?.email || '',
    }
  });

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        const response = await profileApi.getProfile();

        if (response.success && response.data) {
          const { profile, user: userData } = response.data;
          setProfileData(profile);

          // Set image preview if profile has an image
          if (profile?.profile_picture_url) {
            setImagePreview(profile.profile_picture_url);
          }

          // Reset form with fetched data
          reset({
            name: profile?.name || `${userData?.first_name || ''} ${userData?.last_name || ''}`.trim(),
            email: userData?.email || '',
            company: profile?.company || '',
            location: profile?.location || '',
            description: profile?.description || '',
            phone: profile?.phone || userData?.phone || '',
            specialization: profile?.specialization || '',
            experience: profile?.experience || '',
            officeAddress: profile?.office_address || '',
            serviceAreas: profile?.service_areas || '',
          });

          // Set edit mode to false if profile exists
          setIsEditMode(!profile || Object.keys(profile).length === 0);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        });
        setIsEditMode(true); // Enable edit mode if fetch fails
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [reset, toast]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Error",
          description: "Image size should be less than 5MB",
          variant: "destructive"
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select a valid image file",
          variant: "destructive"
        });
        return;
      }

      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = async (data: AgentProfileData) => {
    setSubmitting(true);
    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('company', data.company);
      formData.append('location', data.location);
      formData.append('description', data.description);
      formData.append('phone', data.phone);
      formData.append('specialization', data.specialization);
      formData.append('experience', data.experience);
      formData.append('office_address', data.officeAddress);
      formData.append('service_areas', data.serviceAreas);

      // Add profile image if it exists
      if (profileImage) {
        formData.append('profile_picture', profileImage);
      }



      // Call API based on whether we're creating or updating
      let response;
      if (profileData && Object.keys(profileData).length > 0) {
        // Update existing profile - convert FormData to JSON for update
        const updateData = {
          name: data.name,
          company: data.company,
          location: data.location,
          description: data.description,
          phone: data.phone,
          specialization: data.specialization,
          experience: data.experience,
          office_address: data.officeAddress,
          service_areas: data.serviceAreas,
        };
        response = await profileApi.updateProfile(updateData);
      } else {
        // Setup new profile
        response = await profileApi.setupProfileWithImage(formData);
      }

      if (response.success) {
        toast({
          title: "Success",
          description: "Profile updated successfully!"
        });
        setIsEditMode(false);
        // Refresh profile data
        const updatedProfile = await profileApi.getProfile();
        if (updatedProfile.success && updatedProfile.data) {
          setProfileData(updatedProfile.data.profile);
        }
      } else {
        toast({
          title: "Error",
          description: response.message || 'Failed to update profile',
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to update profile. Please try again.',
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground mb-2">
            Agent Profile
          </h2>
          <p className="text-sm text-muted-foreground">
            {isEditMode
              ? 'Update your professional profile information'
              : 'View your professional profile information'
            }
          </p>
        </div>
        {profileData && Object.keys(profileData).length > 0 && (
          <Button
            variant={isEditMode ? "outline" : "default"}
            onClick={() => setIsEditMode(!isEditMode)}
            className="flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            {isEditMode ? 'Cancel Edit' : 'Edit Profile'}
          </Button>
        )}
      </div>

      <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

            {/* Profile Picture Section */}
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center justify-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Profile Picture
              </h3>
              <div className="flex flex-col items-center space-y-4">
                <div
                  onClick={isEditMode ? triggerFileInput : undefined}
                  className={`relative w-32 h-32 rounded-full border-4 border-dashed border-primary/30 transition-colors duration-200 bg-muted/20 flex items-center justify-center group overflow-hidden ${
                    isEditMode ? 'hover:border-primary/60 hover:bg-muted/40 cursor-pointer' : 'cursor-default'
                  }`}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
                      <p className="text-xs text-muted-foreground">Upload Photo</p>
                    </div>
                  )}
                  {isEditMode && (
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {isEditMode && (
                  <p className="text-sm text-muted-foreground">
                    Click to upload your professional photo (Max 5MB)
                  </p>
                )}
              </div>
            </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-card/80 border-primary/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Basic Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-foreground font-medium">Full Name *</Label>
                    <Input
                      id="name"
                      {...register('name', { required: 'Name is required' })}
                      placeholder="e.g., Sarah Johnson"
                      className="mt-2"
                      readOnly={!isEditMode}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-foreground font-medium">Email *</Label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        placeholder="sarah@premierproperties.com"
                        className="pl-10"
                        readOnly={!isEditMode}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-foreground font-medium">Phone Number *</Label>
                    <div className="relative mt-2">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        {...register('phone', { required: 'Phone number is required' })}
                        placeholder="e.g., +44 20 1234 5678"
                        className="pl-10"
                        readOnly={!isEditMode}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="location" className="text-foreground font-medium">Primary Location *</Label>
                    <div className="relative mt-2">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="location"
                        {...register('location', { required: 'Location is required' })}
                        placeholder="e.g., Central London"
                        className="pl-10"
                        readOnly={!isEditMode}
                      />
                    </div>
                    {errors.location && (
                      <p className="text-sm text-destructive mt-1">{errors.location.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card className="bg-card/80 border-primary/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Professional Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="company" className="text-foreground font-medium">Company *</Label>
                    <div className="relative mt-2">
                      <Building className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="company"
                        {...register('company', { required: 'Company is required' })}
                        placeholder="e.g., Premier Properties Ltd"
                        className="pl-10"
                        readOnly={!isEditMode}
                      />
                    </div>
                    {errors.company && (
                      <p className="text-sm text-destructive mt-1">{errors.company.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="specialization" className="text-foreground font-medium">Specialization *</Label>
                    <Input
                      id="specialization"
                      {...register('specialization', { required: 'Specialization is required' })}
                      placeholder="e.g., Residential Sales & New Homes"
                      className="mt-2"
                      readOnly={!isEditMode}
                    />
                    {errors.specialization && (
                      <p className="text-sm text-destructive mt-1">{errors.specialization.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="experience" className="text-foreground font-medium">Years of Experience *</Label>
                    <div className="relative mt-2">
                      <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="experience"
                        {...register('experience', { required: 'Experience is required' })}
                        placeholder="e.g., 8+ years"
                        className="pl-10"
                        readOnly={!isEditMode}
                      />
                    </div>
                    {errors.experience && (
                      <p className="text-sm text-destructive mt-1">{errors.experience.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-card/80 border-primary/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Additional Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="serviceAreas" className="text-foreground font-medium">Service Areas *</Label>
                    <Input
                      id="serviceAreas"
                      {...register('serviceAreas', { required: 'Service areas are required' })}
                      placeholder="e.g., Mayfair, Marylebone, Fitzrovia"
                      className="mt-2"
                      readOnly={!isEditMode}
                    />
                    {errors.serviceAreas && (
                      <p className="text-sm text-destructive mt-1">{errors.serviceAreas.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="officeAddress" className="text-foreground font-medium">Office Address *</Label>
                    <div className="relative mt-2">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="officeAddress"
                        {...register('officeAddress', { required: 'Office address is required' })}
                        placeholder="e.g., 123 Oxford Street, London W1D 2HX"
                        className="pl-10"
                        readOnly={!isEditMode}
                      />
                    </div>
                    {errors.officeAddress && (
                      <p className="text-sm text-destructive mt-1">{errors.officeAddress.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description Section */}
            <Card className="bg-card/80 border-primary/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Professional Summary
                </h3>
                <div>
                  <Label htmlFor="description" className="text-foreground font-medium">Professional Summary *</Label>
                  <Textarea
                    id="description"
                    {...register('description', { required: 'Description is required' })}
                    placeholder="Describe your experience, expertise, and professional background..."
                    rows={6}
                    className="mt-2 resize-none"
                    readOnly={!isEditMode}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submit Button */}
          {isEditMode && (
            <div className="pt-6">
              <Button
                type="submit"
                className="w-full h-14 text-lg font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={submitting}
              >
                {submitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Updating Profile...</span>
                  </div>
                ) : (
                  profileData && Object.keys(profileData).length > 0 ? 'Update Profile' : 'Complete Profile Setup'
                )}
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-3">
                * All fields marked with asterisk are required
              </p>
            </div>
          )}
        </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentDashboard;
