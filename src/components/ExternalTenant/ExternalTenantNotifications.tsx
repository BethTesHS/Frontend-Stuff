import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Calendar, AlertTriangle, CheckCircle, MessageSquare, User, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { notificationApi } from '@/services/api';
import { useNotifications } from '@/contexts/NotificationContext';
import { getAuthToken } from '@/utils/tokenStorage';
import { toast } from 'sonner';

export default function ExternalTenantNotifications() {
  const { unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!getAuthToken()) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await notificationApi.getNotifications({
        page: 1,
        per_page: 20,
        unread_only: false,
        user_role: 'external_tenant'
      });

      if (response.success && response.data) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markNotificationAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {
      toast.error('Failed to mark notification as read');
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconClass = "w-6 h-6 text-emerald-600 dark:text-emerald-400";
    switch (type) {
      case 'complaint': return <AlertTriangle className={iconClass} />;
      case 'message': return <MessageSquare className={iconClass} />;
      default: return <Bell className={iconClass} />;
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <Bell className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Notifications</h1>
            <p className="text-sm text-gray-500">Manage your alerts and messages</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={() => markAllAsRead()}>
            Mark all as read
          </Button>
        )}
      </div>

      <Card className="border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden bg-white dark:bg-gray-900">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">You're all caught up!</h3>
              <p className="text-gray-500 max-w-sm">
                When you receive updates about your property or messages, they will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-6 flex gap-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer ${!notification.read ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''}`}
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  <div className="shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                      <p className={`font-medium ${!notification.read ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>
                        {notification.title}
                      </p>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {notification.message}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="shrink-0 flex items-center">
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}