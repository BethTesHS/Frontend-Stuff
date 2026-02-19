import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Bot, UserCheck, MessageSquare, Users, Home } from 'lucide-react';

interface AdminOverviewProps {
  stats: any;
  statsLoading: boolean;
}

export const AdminOverview = ({ stats, statsLoading }: AdminOverviewProps) => {
  const mockStats = [
    {
      label: 'Pending Verifications',
      value: statsLoading ? '...' : stats?.pending_verifications?.toString() || '0',
      icon: UserCheck,
      color: 'text-gray-600'
    },
    {
      label: 'Unread Messages',
      value: statsLoading ? '...' : stats?.unread_messages?.toString() || '0',
      icon: MessageSquare,
      color: 'text-gray-600'
    },
    {
      label: 'Total Users',
      value: statsLoading ? '...' : stats?.total_users?.toString() || '0',
      icon: Users,
      color: 'text-gray-600'
    },
    {
      label: 'Active Properties',
      value: statsLoading ? '...' : stats?.active_properties?.toString() || '0',
      icon: Home,
      color: 'text-gray-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockStats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <stat.icon className={`w-6 h-6 ${stat.color} dark:text-gray-400`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts and Bot Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="flex items-center text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
            <AlertTriangle className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
            Recent Alerts
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">High complaint volume</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">3 complaints received today</p>
              </div>
              <Badge variant="destructive">High</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">Verification backlog</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">12 pending verifications</p>
              </div>
              <Badge variant="secondary">Medium</Badge>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="flex items-center text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
            <Bot className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
            Support Bot Activity
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Conversations Today</span>
              <span className="font-medium text-gray-800 dark:text-gray-100">47</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Resolved Automatically</span>
              <span className="font-medium text-gray-800 dark:text-gray-100">31</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Escalated to Admin</span>
              <span className="font-medium text-gray-800 dark:text-gray-100">8</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};