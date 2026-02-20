// src/components/BuyerDashboard/BuyerOverview.tsx
import { useState, useEffect } from 'react';
import { Heart, Calendar, Eye, MessageSquare, Home, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { buyerApi, BuyerDashboardStats } from '@/services/buyerApi';

export const BuyerOverview = ({ user }: { user: any }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<BuyerDashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setStatsLoading(true);
        const response = await buyerApi.getDashboardStats();
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
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
          <button onClick={() => navigate('/buyer-dashboard?activeTab=calendar')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
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
          <button onClick={() => navigate('/buyer-dashboard?activeTab=history')} className="text-xs text-purple-600 dark:text-purple-400 hover:underline">
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