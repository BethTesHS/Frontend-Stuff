import { useState } from 'react';
import { 
  Search, Calendar, User, MessageSquare, AlertTriangle, 
  FileText, CalendarDays, Building, PoundSterling, 
  ChevronLeft, ChevronRight, UserCheck, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export const TenantOverview = ({ user, setActiveTab, navigate, dashboardData, dashboardLoading }: any) => {
  const [currentPage, setCurrentPage] = useState(1);
  const activitiesPerPage = 3;
  const isVerified = user?.tenantVerified || false;

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

  const totalPages = Math.ceil(allActivities.length / activitiesPerPage);
  const indexOfLastActivity = currentPage * activitiesPerPage;
  const indexOfFirstActivity = indexOfLastActivity - activitiesPerPage;
  const currentActivities = allActivities.slice(indexOfFirstActivity, indexOfLastActivity);

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

  const pieData = [
    { name: 'Days Passed', value: rentInfo.daysPassed, color: '#6B7280' },
    { name: 'Days Remaining', value: rentInfo.daysUntilRent, color: '#9CA3AF' },
  ];

  if (dashboardLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
        <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

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

      {dashboardData?.status === 'active' && dashboardData?.property && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                      {/* <MapPin className="h-3 w-3" /> */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    className={`flex items-center justify-between py-2 ${!isLast ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}
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

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-foreground/70">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="h-8 text-xs bg-gray-50 dark:bg-gray-800"
                  >
                    <ChevronLeft className="h-3 w-3" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 text-xs bg-gray-50 dark:bg-gray-800"
                  >
                    Next
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

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
                if (!isVerified) setActiveTab('verification');
                else navigate('/submit-complaint');
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