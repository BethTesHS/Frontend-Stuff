import { useState } from 'react';
import { 
  Search, Calendar, User, MessageSquare, AlertTriangle, 
  FileText, UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export const ExternalTenantOverview = ({ user, setActiveTab, navigate, dashboardData, dashboardLoading }: any) => {
  const [currentPage, setCurrentPage] = useState(1);
  const activitiesPerPage = 3;

  const allActivities = [
    { id: 1, icon: Search, title: "Searched for properties in London", time: "2 hours ago" },
    { id: 2, icon: Calendar, title: "Scheduled property viewing", time: "1 day ago" },
    { id: 3, icon: User, title: "Updated profile information", time: "3 days ago" },
    { id: 4, icon: MessageSquare, title: "Sent message to agent", time: "5 days ago" },
    { id: 5, icon: AlertTriangle, title: "Submitted maintenance request", time: "1 week ago" },
    { id: 6, icon: FileText, title: "Viewed lease agreement", time: "2 weeks ago" }
  ];

  const calculateRentCountdown = () => {
    const moveInDate = dashboardData?.tenancy?.start_date
      ? new Date(dashboardData.tenancy.start_date)
      : new Date();
    const today = new Date();
    const daysSinceMoveIn = Math.floor((today.getTime() - moveInDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysUntilRent = 31 - (daysSinceMoveIn % 31);
    return { daysUntilRent, daysPassed: daysSinceMoveIn % 31 };
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
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="size-2 rounded-full bg-emerald-500"></div>
          <p className="text-muted-foreground text-sm font-medium">External Tenant</p>
        </div>
      </div>

      <h2 className="text-foreground text-xl font-bold leading-tight tracking-[-0.015em] mb-4">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 cursor-pointer group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all" onClick={() => setActiveTab("maintenance")}>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-lg text-gray-800 dark:text-gray-100 font-semibold">Maintenance</h3>
          </div>
          <Button variant="outline" className="w-full">Request Maintenance</Button>
        </div>
        
        <div className="glass-card p-6 cursor-pointer group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all" onClick={() => setActiveTab("complaints")}>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg text-gray-800 dark:text-gray-100 font-semibold">Complaints</h3>
          </div>
          <Button variant="outline" className="w-full">File Complaint</Button>
        </div>

        <div className="glass-card p-6 cursor-pointer group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all" onClick={() => navigate('/properties')}>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-lg text-gray-800 dark:text-gray-100 font-semibold">Browse</h3>
          </div>
          <Button variant="outline" className="w-full">Find Properties</Button>
        </div>
      </div>
    </div>
  );
};