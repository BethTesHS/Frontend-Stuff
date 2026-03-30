import { Badge } from '@/components/ui/badge';
import { AlertTriangle, MessageSquare, UserCheck, Users, Home, HeadphonesIcon } from 'lucide-react';

interface AdminOverviewProps {
  stats: any;
  statsLoading: boolean;
}

export const AdminOverview = ({ stats, statsLoading }: AdminOverviewProps) => {
  const statCards = [
    {
      label: 'Pending Verifications',
      value: statsLoading ? '...' : stats?.pending_verifications?.toString() ?? '0',
      icon: UserCheck,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Unread Support Messages',
      value: statsLoading ? '...' : stats?.unread_messages?.toString() ?? '0',
      icon: MessageSquare,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-100 dark:bg-orange-900/30',
    },
    {
      label: 'Total Users',
      value: statsLoading ? '...' : stats?.total_users?.toString() ?? '0',
      icon: Users,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      label: 'Active Properties',
      value: statsLoading ? '...' : stats?.active_properties?.toString() ?? '0',
      icon: Home,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
    },
  ];

  const pendingVerifications = stats?.pending_verifications ?? 0;
  const unreadMessages = stats?.unread_messages ?? 0;
  const openSupportConvs = stats?.open_support_conversations ?? 0;

  const alerts: { title: string; detail: string; level: 'high' | 'medium' | 'low' }[] = [];
  if (unreadMessages > 0) {
    alerts.push({
      title: 'Unread support messages',
      detail: `${unreadMessages} message${unreadMessages !== 1 ? 's' : ''} waiting for a reply`,
      level: unreadMessages > 5 ? 'high' : 'medium',
    });
  }
  if (pendingVerifications > 0) {
    alerts.push({
      title: 'Verification backlog',
      detail: `${pendingVerifications} pending verification${pendingVerifications !== 1 ? 's' : ''}`,
      level: pendingVerifications > 10 ? 'high' : 'medium',
    });
  }
  if (openSupportConvs > 0) {
    alerts.push({
      title: 'Open support conversations',
      detail: `${openSupportConvs} conversation${openSupportConvs !== 1 ? 's' : ''} still open`,
      level: 'low',
    });
  }

  const levelVariant = (level: 'high' | 'medium' | 'low') =>
    level === 'high' ? 'destructive' : level === 'medium' ? 'secondary' : 'outline';

  const levelLabel = (level: 'high' | 'medium' | 'low') =>
    level === 'high' ? 'High' : level === 'medium' ? 'Medium' : 'Info';

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts and Support stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="flex items-center text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
            <AlertTriangle className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
            Active Alerts
          </h3>
          {statsLoading ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>
          ) : alerts.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No active alerts. Everything looks good.</p>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{alert.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{alert.detail}</p>
                  </div>
                  <Badge variant={levelVariant(alert.level)}>{levelLabel(alert.level)}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Support summary */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="flex items-center text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
            <HeadphonesIcon className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
            Support Overview
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Open Conversations</span>
              <span className="font-medium text-gray-800 dark:text-gray-100">
                {statsLoading ? '…' : openSupportConvs}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Unread Messages</span>
              <span className="font-medium text-gray-800 dark:text-gray-100">
                {statsLoading ? '…' : unreadMessages}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Active Admin Sessions</span>
              <span className="font-medium text-gray-800 dark:text-gray-100">
                {statsLoading ? '…' : stats?.active_sessions ?? 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Total Admins</span>
              <span className="font-medium text-gray-800 dark:text-gray-100">
                {statsLoading ? '…' : stats?.total_admins ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
