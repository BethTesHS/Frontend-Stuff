// src/components/AgentDashboard/AgentOverview.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Building, TrendingUp, Calendar, CheckCircle, DollarSign, BarChart3, Plus, FileText, ChevronRight, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { propertyApi } from '@/services/api';
import { toast } from 'sonner';

export const AgentOverview = ({ user }: { user: any }) => {
  const navigate = useNavigate();
  const [statsLoading, setStatsLoading] = useState(true);
  const [agentActivity, setAgentActivity] = useState<any[]>([]);
  const [agentStats, setAgentStats] = useState([
    { label: 'Active Listings', value: '0', icon: Building, color: 'text-blue-600', bgColor: 'bg-blue-50', gradient: 'from-blue-500 to-blue-600' },
    { label: 'Total Properties', value: '0', icon: Home, color: 'text-green-600', bgColor: 'bg-green-50', gradient: 'from-green-500 to-green-600' },
    { label: 'This Month Sales', value: '0', icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-50', gradient: 'from-purple-500 to-purple-600' },
    { label: 'Scheduled Viewings', value: '0', icon: Calendar, color: 'text-orange-600', bgColor: 'bg-orange-50', gradient: 'from-orange-500 to-orange-600' },
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setStatsLoading(true);
        const propertiesResponse = await propertyApi.getMyProperties({ page: 1, per_page: 1000 });
        
        if (propertiesResponse.success && propertiesResponse.data) {
          const allProperties = propertiesResponse.data.properties;
          const activeListings = allProperties.filter((p: any) => p.status === 'active').length;
          const totalProperties = allProperties.length;
          
          setAgentStats([
            { label: 'Active Listings', value: activeListings.toString(), icon: Building, color: 'text-blue-600', bgColor: 'bg-blue-50', gradient: 'from-blue-500 to-blue-600' },
            { label: 'Total Properties', value: totalProperties.toString(), icon: Home, color: 'text-green-600', bgColor: 'bg-green-50', gradient: 'from-green-500 to-green-600' },
            { label: 'This Month Sales', value: '0', icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-50', gradient: 'from-purple-500 to-purple-600' },
            { label: 'Scheduled Viewings', value: '0', icon: Calendar, color: 'text-orange-600', bgColor: 'bg-orange-50', gradient: 'from-orange-500 to-orange-600' },
          ]);
        }

        try {
          const activitiesResponse = await propertyApi.getAgentActivities();
          if (activitiesResponse.success && activitiesResponse.data) {
            setAgentActivity(activitiesResponse.data.activities);
          }
        } catch (activityError) {
          console.error('Error fetching activities:', activityError);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Welcome Back, {user?.firstName || ''} {user?.lastName || ''}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Here's what's happening with your business today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {agentStats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{stat.label}</h3>
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <stat.icon className="text-gray-600 dark:text-gray-400" size={20} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              {statsLoading ? '...' : stat.value}
            </p>
          </div>
        ))}
      </div>

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
            ) : agentActivity.length > 0 ? (
              agentActivity.slice(0, 4).map((activity: any, index) => {
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
              <p className="text-gray-500 dark:text-gray-400 text-center">No recent activity found.</p>
            )}
          </div>
        </div>

        {/* Properties Overview */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Properties Overview</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Listings</p>
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">
                  {agentStats.find(s => s.label === 'Active Listings')?.value || '0'}
                </p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Under Contract</p>
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">2</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button onClick={() => navigate('/list-property')} className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Plus className="text-gray-600 dark:text-gray-400 mb-2" size={28} />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Add Property</span>
          </button>
          <button onClick={() => navigate('/schedule-viewing')} className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Calendar className="text-gray-600 dark:text-gray-400 mb-2" size={28} />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Schedule Viewing</span>
          </button>
          <button onClick={() => toast.info("Report generation feature is coming soon!")} className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <FileText className="text-gray-600 dark:text-gray-400 mb-2" size={28} />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Generate Report</span>
          </button>
          <button onClick={() => toast.info("Analytics dashboard is coming soon!")} className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <BarChart3 className="text-gray-600 dark:text-gray-400 mb-2" size={28} />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">View Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
};