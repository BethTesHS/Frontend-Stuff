import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import SupportBot from '@/components/Support/SupportBot';
import { ProfileUpdateDialog } from '@/components/Owner/ProfileUpdateDialog';
import { OwnerSidebar } from '@/components/OwnerDashboard/OwnerSidebar';
import { OwnerMessages } from '@/components/OwnerDashboard/OwnerMessages';
import { OwnerBookings } from '@/components/OwnerDashboard/OwnerBookings';
import { OwnerCalendar } from '@/components/OwnerDashboard/OwnerCalendar';
import NotificationsComponent from '@/components/TenantDashboard/NotificationsComponent';
import {
  Home,
  DollarSign,
  Bed,
  TrendingUp,
  User,
  CheckCircle,
  Building,
  Clock,
  Wrench,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  BarChart3,
  Building2,
  MessageCircle,
  Calendar,
  Eye,
  Bell,
  Menu,
  Search,
  Settings,
  LogOut,
  Moon,
  Sun,
  UserCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { propertyApi, ownerDashboardApi } from '@/services/api';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { spareRoomApi } from '@/services/spareRoomApi';
import { SpareRoomListings } from '@/components/SpareRoom/SpareRoomListings';
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Initial owner stats structure with loading placeholders
const initialOwnerStats = [
  {
    label: 'Total Properties',
    value: '0',
    icon: Home,
    trend: 'Loading...',
  },
  {
    label: 'Monthly Revenue',
    value: '£0',
    icon: DollarSign,
    trend: 'Loading...',
  },
  {
    label: 'Active Listings',
    value: '0',
    icon: Building,
    trend: 'Loading...',
  },
  {
    label: 'Total Tenants',
    value: '0',
    icon: User,
    trend: 'Loading...',
  },
];

// Empty initial activity - will be populated by API
const recentActivity = [];

// Navigation items for header titles
const navigationItems = [
  { title: "Overview", value: "overview", icon: BarChart3 },
  { title: "Properties", value: "properties", icon: Building2 },
  { title: "Rooms", value: "spare-rooms", icon: Eye },
  { title: "Messages", value: "messages", icon: MessageCircle },
  { title: "Bookings", value: "bookings", icon: Calendar },
  { title: "Calendar", value: "calendar", icon: Calendar },
  { title: "Notifications", value: "notifications", icon: Bell },
  { title: "Profile", value: "profile", icon: User },
];

const OwnerDashboard = () => {
  const { loading, hasAccess, user } = useAuthGuard(['owner'], false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [agentResponse, setAgentResponse] = useState<any>(null);
  const [showMessage, setShowMessage] = useState(false);
  const [ownerStats, setOwnerStats] = useState(initialOwnerStats);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ownerActivity, setOwnerActivity] = useState(recentActivity);
  const [statsLoading, setStatsLoading] = useState(true);

  // Check for agent response from navigation state
  useEffect(() => {
    if (location.state?.agentRequest) {
      setAgentResponse(location.state.agentRequest);
    }
  }, [location.state]);

  // Handle success message from property listing
  useEffect(() => {
    const state = location.state as any;
    if (state?.message) {
      toast.success(state.message);
      // Clear the state to prevent showing the message again
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setStatsLoading(true);
        
        // Fetch properties directly to get accurate counts
        const propertiesResponse = await propertyApi.getMyProperties();
        let totalProperties = 0;
        let activeProperties = 0;
        
        if (propertiesResponse.success && propertiesResponse.data) {
          const properties = propertiesResponse.data.properties || propertiesResponse.data;
          totalProperties = Array.isArray(properties) ? properties.length : 0;
          activeProperties = Array.isArray(properties) ? properties.filter((property: any) => property.status === 'active').length : 0;
        }
        
        // Also try to fetch owner statistics for other data if available
        try {
          const statsResponse = await propertyApi.getOwnerStats();
          if (statsResponse.success && statsResponse.data) {
            const stats = statsResponse.data;
            // Use API stats if available, otherwise use calculated values
            totalProperties = stats.total_properties || totalProperties;
            activeProperties = stats.active_properties || activeProperties;
          }
        } catch (error) {
          console.log('Owner stats API not available, using calculated values');
        }

        // Fetch spare room statistics
        let spareRoomsCount = 0;
        try {
          const spareRoomsResponse = await spareRoomApi.getMySpareRoomsStats();
          spareRoomsCount = spareRoomsResponse?.total || 0;
        } catch (error) {
          console.log('Spare rooms stats not available');
          // Try getting spare rooms directly
          try {
            const spareRooms = await spareRoomApi.getSpareRooms(user?.id);
            spareRoomsCount = spareRooms?.length || 0;
          } catch (err) {
            console.log('Could not fetch spare rooms');
          }
        }

        // Fetch revenue statistics
        let monthlyRevenue = 0;
        let revenueTrend = 'No data available';
        let revenueTrendColor = 'text-gray-500';
        try {
          const revenueResponse = await ownerDashboardApi.getRevenueStats();
          if (revenueResponse.success && revenueResponse.data) {
            monthlyRevenue = revenueResponse.data.average_monthly_revenue || 0;

            // Calculate trend from monthly trends if available
            if (revenueResponse.data.monthly_trends && revenueResponse.data.monthly_trends.length >= 2) {
              const trends = revenueResponse.data.monthly_trends;
              const currentMonth = trends[trends.length - 1].revenue;
              const previousMonth = trends[trends.length - 2].revenue;

              if (previousMonth > 0) {
                const percentChange = ((currentMonth - previousMonth) / previousMonth) * 100;
                const sign = percentChange >= 0 ? '+' : '';
                revenueTrend = `${sign}${percentChange.toFixed(1)}% from last month`;
                revenueTrendColor = 'text-gray-600 dark:text-gray-400';
              } else {
                revenueTrend = 'First month data';
                revenueTrendColor = 'text-gray-600 dark:text-gray-400';
              }
            }
          }
        } catch (error) {
          console.log('Revenue stats not available:', error);
        }

        setOwnerStats([
          {
            label: 'Total Properties',
            value: totalProperties.toString(),
            icon: Home,
            trend: 'Properties listed',
          },
          {
            label: 'Monthly Revenue',
            value: `£${monthlyRevenue.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
            icon: DollarSign,
            trend: revenueTrend,
          },
          {
            label: 'Active Listings',
            value: activeProperties.toString(),
            icon: Building,
            trend: 'Currently active',
          },
          {
            label: 'Spare Rooms',
            value: spareRoomsCount.toString(),
            icon: Bed,
            trend: 'Room listings',
          },
        ]);

        // Fetch owner activities
        const activitiesResponse = await propertyApi.getOwnerActivities();
        if (activitiesResponse.success && activitiesResponse.data) {
          const apiActivities = activitiesResponse.data.activities.map((activity: any) => ({
            title: activity.action,
            detail: activity.property,
            time: activity.time,
            icon: activity.type === 'rental' ? DollarSign :
                  activity.type === 'listing' ? Building :
                  activity.type === 'maintenance' ? Wrench :
                  activity.type === 'inquiry' ? User :
                  CheckCircle,
            dotColor: 'bg-gray-400 dark:bg-gray-600',
            iconColor: 'text-gray-600 dark:text-gray-400'
          }));
          setOwnerActivity(apiActivities);
        }
      } catch (error) {
        console.error('Error fetching owner dashboard data:', error);
        toast.error('Failed to load dashboard data');
        // Keep default values if API fails
      } finally {
        setStatsLoading(false);
      }
    };

    if (user && hasAccess) {
      fetchDashboardData();
    }
  }, [user, hasAccess, location.state?.refresh]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  const handleTabChange = (tab: string) => {
    if (tab === 'add-property') {
      navigate('/list-property');
      return;
    }
    if (tab === 'post-spare-room') {
      navigate('/post-spare-room');
      return;
    }
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'properties':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">My Properties</h2>
              <Link to="/my-properties">
                <Button className="bg-primary hover:bg-primary/90">
                  View All Properties
                </Button>
              </Link>
            </div>
            <div className="text-center py-8">
              <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Property management content will be displayed here</p>
            </div>
          </div>
        );
      case 'messages':
        return <OwnerMessages />;
      case 'bookings':
        return <OwnerBookings />;
      case 'calendar':
        return <OwnerCalendar />;
      case 'notifications':
        return <NotificationsComponent user={user} />;
      case 'spare-rooms':
        return (
          <div className="space-y-6">
            <SpareRoomListings userRole="owner" />
          </div>
        );
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Profile Settings</h2>
              <ProfileUpdateDialog>
                <Button className="bg-primary hover:bg-primary/90">
                  Update Profile
                </Button>
              </ProfileUpdateDialog>
            </div>
            <div className="text-center py-8">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Profile management content will be displayed here</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
            <div className="relative z-10 px-4 py-6 space-y-8">
              {/* Stats Cards Grid - 30% height */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {ownerStats.map((stat, index) => (
                  <div
                    key={stat.label}
                    className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{stat.label}</h3>
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <stat.icon className="text-gray-600 dark:text-gray-400" size={20} />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                      {statsLoading ? '...' : stat.value}
                    </p>
                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                      <TrendingUp size={14} className="mr-1" />
                      <span>{stat.trend}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Property Overview Summary */}
              <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Your Property Network</h3>
                  <Building className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Properties</p>
                    <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">
                      {ownerStats.find((s: any) => s.label === 'Active Listings')?.value || '0'}
                    </p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">
                      {ownerStats.find((s: any) => s.label === 'Monthly Revenue')?.value || '£0'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Section - Updated */}
              <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
                {/* Recent Activity Feed - 70% width */}
                <div className="lg:col-span-7">
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Recent Activity</h3>
                        <Button variant="ghost" className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                          View All
                        </Button>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-800">
                      {statsLoading ? (
                        // Loading skeleton
                        Array.from({ length: 3 }).map((_, index) => (
                          <div key={index} className="p-6 animate-pulse">
                            <div className="flex items-start space-x-4">
                              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : ownerActivity.length > 0 ? (
                        ownerActivity.map((activity, index) => (
                        <div key={index} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 group cursor-pointer">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <div className={`w-3 h-3 ${activity.dotColor} rounded-full`}></div>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <activity.icon className={`w-6 h-6 ${activity.iconColor}`} />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-gray-900 dark:group-hover:text-gray-50 transition-colors">
                                {activity.title}
                              </p>
                              <p className="text-gray-600 dark:text-gray-400">{activity.detail}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full inline-block mt-1">
                                {activity.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Clock className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 font-medium">No recent activity</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Activities will appear here as they happen</p>
                      </div>
                    )}
                    </div>
                  </div>
                </div>

                {/* Agent Response / Quick Add Property - 30% width */}
                <div className="lg:col-span-3">
                  {agentResponse ? (
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-6">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                        <CheckCircle className="w-6 h-6 mr-3 text-gray-600 dark:text-gray-400" />
                        Agent Response
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 bg-gray-600 dark:bg-gray-700 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 dark:text-gray-100">{agentResponse.agentName}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Property Agent</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                            Great news! Your agent request has been accepted.
                          </p>
                          <Button
                            size="sm"
                            className="w-full bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white"
                            onClick={() => setShowMessage(!showMessage)}
                          >
                            {showMessage ? (
                              <>
                                <ChevronUp className="w-4 h-4 mr-2" />
                                Hide Message
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4 mr-2" />
                                View Message
                              </>
                            )}
                          </Button>
                        </div>
                        
                        {/* Expandable Message Section */}
                        {showMessage && (
                          <div className="bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-4 animate-fade-in">
                            <div className="space-y-4">
                              {/* Agent Contact Info */}
                              <div className="bg-gray-100 dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                                <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 text-sm">Contact Information</h4>
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <Phone className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                                    <span className="text-xs text-gray-700 dark:text-gray-300">+44 7700 900123</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Mail className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                                    <span className="text-xs text-gray-700 dark:text-gray-300">{agentResponse.agentName?.toLowerCase().replace(' ', '.')}@properties.co.uk</span>
                                  </div>
                                </div>
                              </div>

                              {/* Message Content */}
                              <div className="bg-gray-100 dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                                <div className="flex items-start space-x-2">
                                  <div className="w-8 h-8 bg-gray-600 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                                    <User className="w-4 h-4 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-gray-100 mb-1 text-sm">{agentResponse.agentName}</p>
                                    <div className="text-xs text-gray-700 dark:text-gray-300 space-y-2">
                                      <p>
                                        Thank you for choosing me as your property agent. I'm excited to help you with your property needs and will ensure a smooth and professional experience.
                                      </p>
                                      <p>
                                        I'll be in touch shortly to discuss your property requirements and next steps. Feel free to reach out if you have any immediate questions.
                                      </p>
                                      <p className="font-medium text-gray-800 dark:text-gray-200">
                                        Best regards,<br />
                                        {agentResponse.agentName}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => setAgentResponse(null)}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-6">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Quick Add Property</h3>
                      <div className="space-y-4">
                        <Input placeholder="Property Name" className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700" />
                        <Select>
                          <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                            <SelectValue placeholder="Property Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="apartment">Apartment</SelectItem>
                            <SelectItem value="house">House</SelectItem>
                            <SelectItem value="villa">Villa</SelectItem>
                            <SelectItem value="studio">Studio</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input placeholder="Address" className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700" />
                        <div className="grid grid-cols-2 gap-2">
                          <Input placeholder="Beds" type="number" className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700" />
                          <Input placeholder="Baths" type="number" className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700" />
                        </div>
                        <Input placeholder="Monthly Rent ($)" type="number" className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700" />
                        <Button className="w-full bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 mt-6">
                          <Building className="w-4 h-4 mr-2" />
                          List Property
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <SupportBot />
            </div>
          </div>
        );
    }
  };

  const getUserInitials = () => {
    if (!user?.name) return "OW"
    const names = user.name.split(' ')
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
    }
    return user.name.substring(0, 2).toUpperCase()
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Logged out successfully")
      navigate('/')
    } catch (error) {
      toast.error("Failed to logout")
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1">
        {/* Sidebar */}
        <OwnerSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onCollapseChange={setIsSidebarCollapsed}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
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
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="hidden lg:block text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                  >
                    {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                  </button>

                  {/* Search Bar */}
                  <div className="relative hidden md:block">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="text-gray-400 dark:text-gray-500" size={18} />
                    </div>
                    <input
                      type="text"
                      placeholder="Search properties..."
                      className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 w-64"
                    />
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center space-x-3">
                  {/* Theme Toggle */}
                  <button
                    onClick={toggleTheme}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    title="Toggle theme"
                  >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                  </button>

                  {/* Notifications */}
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg relative"
                    title="Notifications"
                  >
                    <Bell size={20} />
                  </button>

                  {/* Profile Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                        <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-600 dark:from-gray-600 dark:to-gray-800 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">{getUserInitials()}</span>
                        </div>
                        <ChevronDown size={16} className="text-gray-600 dark:text-gray-400" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="font-semibold text-gray-800 dark:text-gray-100">{user?.name || "Owner"}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                      </div>
                      <DropdownMenuItem onClick={() => setActiveTab('profile')}>
                        <UserCircle className="mr-2" size={16} />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActiveTab('notifications')}>
                        <Bell className="mr-2" size={16} />
                        Notifications
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2" size={16} />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className={`flex-1 overflow-auto bg-gray-50 dark:bg-gray-950 w-full ${activeTab === 'overview' ? 'p-0' : 'p-6'}`}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
