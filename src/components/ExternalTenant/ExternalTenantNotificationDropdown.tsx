import { useState, useRef } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useNotifications } from '@/contexts/NotificationContext';
import { notificationApi } from '@/services/api';
import { getAuthToken } from '@/utils/tokenStorage';

export function ExternalTenantNotificationDropdown({ onShowAll }: { onShowAll: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { unreadCount } = useNotifications();
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();

  const fetchNotifications = async () => {
    if (loading) return;
    if (!getAuthToken()) return;
    setLoading(true);
    try {
      const response = await notificationApi.getNotifications({
        page: 1,
        per_page: 5,
        unread_only: false,
        user_role: 'external_tenant'
      });
      if (response.success && response.data) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsOpen(true);
    fetchNotifications();
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg relative transition-colors">
        <Bell size={20} className="text-gray-600 dark:text-gray-400" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500 text-white border-2 border-white dark:border-gray-900 rounded-full text-[10px]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </button>

      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-80 max-h-[28rem] overflow-hidden z-50 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
          </div>
          <CardContent className="p-0 overflow-y-auto max-h-80">
            {loading ? (
              <div className="p-6 text-center">
                <Loader2 className="w-6 h-6 mx-auto animate-spin text-gray-400 mb-2" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No new notifications</div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{notif.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">{notif.message}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <div className="p-3 border-t border-gray-100 dark:border-gray-800 text-center shrink-0">
            <button
              onClick={() => { onShowAll(); setIsOpen(false); }}
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400"
            >
              View all notifications
            </button>
          </div>
        </Card>
        )}
    </div>
  );
}