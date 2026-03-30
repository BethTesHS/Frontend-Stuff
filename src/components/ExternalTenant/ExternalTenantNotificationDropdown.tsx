import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, AlertTriangle, MessageSquare, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useNotifications } from '@/contexts/NotificationContext';
import { notificationApi } from '@/services/api';
import { getAuthToken } from '@/utils/tokenStorage';

export function ExternalTenantNotificationDropdown({ onShowAll }: { onShowAll: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const { unreadCount, markAllAsRead } = useNotifications();
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();

  const fetchNotifications = async () => {
    if (!getAuthToken()) return;
    setLoading(true);
    try {
      const response = await notificationApi.getNotifications({
        page: 1,
        limit: 5,
        unread_only: false,
        user_role: 'external_tenant',
      });
      if (response.success && response.data) {
        setNotifications(Array.isArray(response.data) ? response.data : (response.data?.notifications ?? []));
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Re-fetch whenever the unread count changes (new notification arrived)
  useEffect(() => {
    if (unreadCount > 0) fetchNotifications();
  }, [unreadCount]);

  const handleClearAll = async () => {
    setClearing(true);
    try {
      await markAllAsRead();
      // Mark all local items as read visually
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error clearing notifications:', error);
    } finally {
      setClearing(false);
    }
  };

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsOpen(true);
    fetchNotifications();
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => setIsOpen(false), 300);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'complaint': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'message':   return <MessageSquare className="w-4 h-4 text-blue-500" />;
      default:          return <Bell className="w-4 h-4 text-emerald-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diff < 60)    return 'Just now';
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Bell button */}
      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg relative transition-colors">
        <Bell
          size={20}
          className={unreadCount > 0 ? 'text-orange-500' : 'text-gray-600 dark:text-gray-400'}
        />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-orange-500 text-white border-2 border-white dark:border-gray-900 rounded-full text-[10px]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-80 max-h-[28rem] overflow-hidden z-50 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Notifications</h3>
              {unreadCount > 0 && (
                <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-[10px] px-1.5 py-0 border-0">
                  {unreadCount} new
                </Badge>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleClearAll}
                disabled={clearing}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors disabled:opacity-50"
                title="Mark all as read"
              >
                {clearing
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <CheckCheck className="w-3.5 h-3.5" />
                }
                <span>Clear all</span>
              </button>
            )}
          </div>

          {/* List */}
          <CardContent className="p-0 overflow-y-auto max-h-72">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : (notifications ?? []).length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-700" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {(notifications ?? []).map((notif) => (
                  <div
                    key={notif.id}
                    className={`px-4 py-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                      !notif.read ? 'bg-orange-50/40 dark:bg-orange-900/10' : ''
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">{getIcon(notif.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${!notif.read ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                      {notif.created_at && (
                        <p className="text-[10px] text-gray-400 mt-1">{formatTime(notif.created_at)}</p>
                      )}
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 shrink-0">
            <button
              onClick={() => { onShowAll(); setIsOpen(false); }}
              className="w-full text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400 py-1 transition-colors"
            >
              View all notifications
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
