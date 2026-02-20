import { useState, useEffect,useMemo } from "react";
import { flushSync } from "react-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useIsMobile } from "@/hooks/use-mobile";
import { buyerApi, BuyerDashboardStats } from "@/services/buyerApi";
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
  Menu,
  ChevronLeft,
  ChevronRight,
  Bell,
  LogOut,
  Moon,
  Sun,
  ChevronDown,
  User,
  Settings,
  Home,
  Calendar,
  MessageSquare,
  Eye,
  Heart,
  Plus,
  Users,
  TrendingUp
} from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday 
} from 'date-fns';
import { BuyerSidebar } from "@/components/BuyerDashboard/BuyerSidebar";
import { Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AgentMessages from "@/components/AgentDashboard/AgentMessages";
import NotificationsComponent from "@/components/TenantDashboard/NotificationsComponent";
import { DAYS_FULL } from '../constants/calendar';
import { detectConflicts, transformViewingsToEvents } from '../utils/calendarUtils';
import { FilterToggle } from "@/components/Calendar/FilterToggle";
import { EventGrid } from "@/components/Calendar/EventGrid";
import { UpcomingEventCard } from "@/components/Calendar/UpcomingEventCard";
import { MiniCalendar } from "@/components/Calendar/MiniCalendar";
import ScheduleViewingDialog from "@/components/Schedule/ScheduleViewingDialog";

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
  const [viewings, setViewings] = useState<any[]>([]);
  const [viewingsLoading, setViewingsLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<BuyerDashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [savedProperties, setSavedProperties] = useState<any[]>([]);
  const [savedPropertiesLoading, setSavedPropertiesLoading] = useState(false);

  // Handle URL parameters for tab and message context
  useEffect(() => {
    const tab = searchParams.get('activeTab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Close sidebar on mobile, keep open on desktop
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Handle tab changes
  const handleTabChange = (tab: string) => {
    flushSync(() => {
      setActiveTab(tab);
    });
  };

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (activeTab === 'dashboard' && user && hasAccess) {
        try {
          setStatsLoading(true);
          const response = await buyerApi.getDashboardStats();
          if (response.success && response.data) {
            setDashboardStats(response.data);
          }
        } catch (error) {
          console.error('Error fetching dashboard stats:', error);
        } finally {
          setStatsLoading(false);
        }
      }
    };

    fetchDashboardStats();
  }, [activeTab, user, hasAccess]);

  useEffect(() => {
    const fetchViewings = async () => {
      if ((activeTab === 'calendar' || activeTab === 'history') && user && hasAccess) {
        try {
          setViewingsLoading(true);
          const response = activeTab === 'calendar'
            ? await buyerApi.getViewings({ page: 1, per_page: 100, status: 'confirmed' })
            : await buyerApi.getViewings({ page: 1, per_page: 100 });

          if (response.success && response.data) {
            setViewings(response.data.viewings || []);
          }
        } catch (error) {
          console.error('Error fetching viewings:', error);
        } finally {
          setViewingsLoading(false);
        }
      }
    };

    fetchViewings();
  }, [activeTab, user, hasAccess]);

  useEffect(() => {
    const fetchSavedProperties = async () => {
      if (activeTab === 'saved' && user && hasAccess) {
        try {
          setSavedPropertiesLoading(true);
          const response = await buyerApi.getSavedProperties({ page: 1, per_page: 100 });
          if (response.success && response.data) {
            setSavedProperties(response.data.properties || []);
          }
        } catch (error) {
          console.error('Error fetching saved properties:', error);
        } finally {
          setSavedPropertiesLoading(false);
        }
      }
    };

    fetchSavedProperties();
  }, [activeTab, user, hasAccess]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
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
        return <DashboardContent user={user} navigate={navigate} stats={dashboardStats} statsLoading={statsLoading} />;
      case "saved":
        return <SavedPropertiesContent savedProperties={savedProperties} loading={savedPropertiesLoading} navigate={navigate} />;
      case "messages":
        // Extract context from URL params
        const propertyId = searchParams.get('propertyId');
        const propertyTitle = searchParams.get('propertyTitle');
        const agentId = searchParams.get('agentId');
        const agentName = searchParams.get('agentName');
        const roomId = searchParams.get('roomId');
        const roomTitle = searchParams.get('roomTitle');
        const landlordId = searchParams.get('landlordId');
        const landlordName = searchParams.get('landlordName');

        return <AgentMessages
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
        return <CalendarContent viewings={viewings} viewingsLoading={viewingsLoading} />;
      case "notifications":
        return <NotificationsComponent user={user} />;
      case "history":
        return <HistoryContent viewings={viewings} viewingsLoading={viewingsLoading} navigate={navigate} />;
      case "profile":
        return <ProfileContent user={user} />;
      default:
        return <DashboardContent user={user} navigate={navigate} stats={dashboardStats} statsLoading={statsLoading} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <BuyerSidebar
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
                    placeholder="Search properties..."
                    className="pl-10 pr-4 py-2 w-64 lg:w-80 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent"
                    onClick={() => navigate('/properties')}
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

                {/* User Menu Dropdown */}
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

const DashboardContent = ({ user, navigate, stats, statsLoading }: any) => {
  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Welcome Back, {user?.firstName || ''} {user?.lastName || ''}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Find your perfect property today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Saved Properties</h3>
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-800 rounded-lg flex items-center justify-center">
              <Heart className="text-emerald-600 dark:text-emerald-400" size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">{stats?.saved_properties ?? 0}</p>
          <button onClick={() => navigate('/saved')} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
            View saved properties
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Scheduled Viewings</h3>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
              <Calendar className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">{stats?.scheduled_viewings ?? 0}</p>
          <button onClick={() => navigate('/buyer-dashboard')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
            View calendar
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Properties Viewed</h3>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center">
              <Eye className="text-purple-600 dark:text-purple-400" size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">{stats?.properties_viewed ?? 0}</p>
          <button onClick={() => navigate('/buyer-dashboard')} className="text-xs text-purple-600 dark:text-purple-400 hover:underline">
            View history
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">New Messages</h3>
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-800 rounded-lg flex items-center justify-center">
              <MessageSquare className="text-orange-600 dark:text-orange-400" size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">{stats?.new_messages ?? 0}</p>
          <button onClick={() => navigate('/messages')} className="text-xs text-orange-600 dark:text-orange-400 hover:underline">
            View messages
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/properties')}
            className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
          >
            <Home className="text-emerald-600 dark:text-emerald-400 mb-2" size={28} />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Browse Properties</span>
          </button>

          <button
            onClick={() => navigate('/saved')}
            className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
          >
            <Heart className="text-emerald-600 dark:text-emerald-400 mb-2" size={28} />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Saved Properties</span>
          </button>

          <button
            onClick={() => navigate('/find-agent')}
            className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
          >
            <User className="text-emerald-600 dark:text-emerald-400 mb-2" size={28} />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Find an Agent</span>
          </button>

          <button
            onClick={() => navigate('/messages')}
            className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
          >
            <MessageSquare className="text-emerald-600 dark:text-emerald-400 mb-2" size={28} />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Messages</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const CalendarContent = ({ viewings, viewingsLoading }: any) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('Month');
  const [activeFilters, setActiveFilters] = useState({
  confirmed: true,
  pending: true
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart); 
  const endDate = endOfWeek(monthEnd);

  const calendarDays = useMemo(() => {
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [startDate, endDate]);
  
  const events = useMemo(() => {
  const transformed = transformViewingsToEvents(viewings || []);
  const filtered = transformed.filter(event => {
    if (event.status === 'confirmed' && !activeFilters.confirmed) return false;
    if (event.status === 'pending' && !activeFilters.pending) return false;
    return true;
  });
  const sorted = [...filtered].sort((a, b) => {
    const dateTimeA = new Date(`${a.date} ${a.startTime}`).getTime();
    const dateTimeB = new Date(`${b.date} ${b.startTime}`).getTime();
    return dateTimeA - dateTimeB;
  });

  return detectConflicts(sorted);
}, [viewings, activeFilters]);

  const toggleFilter = (type: 'confirmed' | 'pending') => {
  setActiveFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleDateSelect = (date: Date) => {
  setCurrentDate(date);
  };

  // Handlers for Navigation
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  return (
    <div className="flex flex-1 min-h-[600px] bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <aside className="hidden xl:flex w-72 flex-col border-r border-slate-100 dark:border-slate-800 p-6 bg-white dark:bg-slate-900">
        <ScheduleViewingDialog propertyId={viewings?.[0]?.property_id || 0} 
          onSuccess={() => {
              
              console.log("Viewing requested, refreshing data...");
            }}
          >
            <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 mb-8">
              <Plus size={18} strokeWidth={3} /> <span>Request Viewing</span>
            </button>
        </ScheduleViewingDialog>
        
        <div className="space-y-8">
          <div>
            <h3 className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-4">Quick Filters</h3>
            <div className="space-y-4">
             <FilterToggle 
                label="Confirmed" 
                color="bg-blue-500" 
                icon={Home} 
                active={activeFilters.confirmed}
                onToggle={() => toggleFilter('confirmed')}
              />
              <FilterToggle 
                label="Pending" 
                color="bg-orange-500" 
                icon={Users} 
                active={activeFilters.pending}
                onToggle={() => toggleFilter('pending')}
              />
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
             <MiniCalendar currentDate={currentDate} onDateClick={handleDateSelect}
              onMonthChange={setCurrentDate} />
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
        <div className="p-5 border-b border-slate-50 dark:border-slate-900 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 mr-4">
              <button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <ChevronLeft size={18} />
              </button>
              <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700">
              {['Day', 'Week', 'Month'].map(m => (
                <button 
                  key={m} 
                  onClick={() => setViewMode(m)} 
                  className={`px-5 py-1.5 text-[10px] font-bold rounded-lg transition-all ${viewMode === m ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-7 border-t border-l border-slate-100 dark:border-slate-800 rounded-tl-xl overflow-hidden">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 text-center border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 uppercase tracking-wider">
                {day}
              </div>
            ))}
            
            {calendarDays.map((day, i) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayEvents = events.filter(e => e.date === dateKey);
              const isCurrentMonth = isSameDay(startOfMonth(day), monthStart);
              const isSelected = isSameDay(day, currentDate);
              const isActualToday = isToday(day); 

              return (
                <div 
                  key={dateKey} 
                  onClick={() => setCurrentDate(day)}
                  className={`min-h-[120px] border-r border-b border-slate-100 dark:border-slate-800 p-2 transition-all cursor-pointer
                    ${!isCurrentMonth ? 'bg-slate-50/30 dark:bg-slate-950/20' : 'bg-white dark:bg-slate-900'}
                    ${isSelected ? 'ring-2 ring-inset ring-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20' : ''} 
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[11px] font-black w-7 h-7 flex items-center justify-center rounded-full 
                      ${isActualToday 
                        ? ' text-white shadow-md'
                        : isSelected 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500 dark:text-white'
                          : isCurrentMonth 
                            ? 'text-slate-700 dark:text-slate-300' 
                            : 'text-slate-300 dark:text-slate-700'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>   
                  </div>
                  
                  <div className="space-y-1">
                    {dayEvents.map(event => (
                      <EventGrid key={event.id} event={event} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <aside className="hidden lg:block w-80 border-l border-slate-100 dark:border-slate-800 p-6 bg-white dark:bg-slate-900 overflow-y-auto">
        <h3 className="text-xs font-bold dark:text-white text-black uppercase tracking-widest mb-8">Upcoming Viewings</h3>
        {events.length > 0 ? (
          events.map(event => <UpcomingEventCard key={event.id} event={event} />)
        ) : (
          <div className="text-center py-20">
             <Calendar className="text-slate-300 dark:text-slate-700 mx-auto mb-3" size={24} />
             <p className="text-slate-500 dark:text-slate-600 text-xs">No scheduled viewings</p>
          </div>
        )}
      </aside>

    </div>
  );
};

const HistoryContent = ({ viewings, viewingsLoading, navigate }: any) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-2">Viewing History</h2>
        <p className="text-sm text-muted-foreground">All properties you've viewed</p>
      </div>

      {viewingsLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : viewings.length > 0 ? (
        <div className="space-y-4">
          {viewings.map((viewing: any) => (
            <Card key={viewing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{viewing.property?.title || 'Property Viewing'}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{viewing.property?.address || 'Location TBD'}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span><span className="font-medium">Date:</span> {new Date(viewing.viewing_date).toLocaleDateString()}</span>
                      <span><span className="font-medium">Time:</span> {viewing.viewing_time}</span>
                      <span><span className="font-medium">Status:</span> {viewing.status}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/property/${viewing.property_id}`)}
                  >
                    View Property
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Eye className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Viewing History</h3>
          <p className="text-muted-foreground mb-4">You haven't viewed any properties yet</p>
          <Button onClick={() => navigate('/properties')}>
            Browse Properties
          </Button>
        </Card>
      )}
    </div>
  );
};

const ProfileContent = ({ user }: any) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-2">Profile</h2>
        <p className="text-sm text-muted-foreground">Manage your account information</p>
      </div>

      <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-3xl">
                {user?.firstName?.[0] || 'B'}{user?.lastName?.[0] || 'Y'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-foreground">{user?.firstName} {user?.lastName}</h3>
            <p className="text-muted-foreground">Buyer</p>
          </div>

          <div className="space-y-4">
            <div className="border-b border-border pb-4">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium text-foreground">{user?.email}</p>
            </div>
            <div className="border-b border-border pb-4">
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium text-foreground">{user?.phone || 'Not provided'}</p>
            </div>
            <div className="border-b border-border pb-4">
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="font-medium text-foreground">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>

          <div className="mt-8">
            <Button className="w-full">Edit Profile</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const SavedPropertiesContent = ({ savedProperties, loading, navigate }: any) => {
  const handleUnsave = async (propertyId: number) => {
    try {
      await buyerApi.unsaveProperty(propertyId);
      window.location.reload();
    } catch (error) {
      console.error('Error unsaving property:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-2">Saved Properties</h2>
        <p className="text-sm text-muted-foreground">Properties you've saved for later</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : savedProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedProperties.map((saved: any) => (
            <Card key={saved.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {saved.property?.primary_image_url && (
                <img
                  src={saved.property.primary_image_url}
                  alt={saved.property.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{saved.property?.title || 'Property'}</h3>
                  <button
                    onClick={() => handleUnsave(saved.property_id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Heart className="fill-current" size={20} />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{saved.property?.address}</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mb-3">
                  £{saved.property?.price?.toLocaleString() || 'N/A'}
                </p>
                <div className="flex gap-3 text-sm text-muted-foreground mb-3">
                  <span>{saved.property?.bedrooms} beds</span>
                  <span>{saved.property?.bathrooms} baths</span>
                  <span>{saved.property?.property_type}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(`/property/${saved.property_id}`)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Saved Properties</h3>
          <p className="text-muted-foreground mb-4">You haven't saved any properties yet</p>
          <Button onClick={() => navigate('/properties')}>
            Browse Properties
          </Button>
        </Card>
      )}
    </div>
  );
};

export default BuyerDashboard;
