// src/components/OwnerDashboard/OwnerNotificationDropdown.tsx
import { useState, useRef } from 'react';
import { Bell, Eye, MessageSquare, Calendar, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/contexts/NotificationContext';
import { notificationApi, type Notification } from '@/services/api';
import { toast } from 'sonner';

interface OwnerNotificationDropdownProps {
  onShowAll: () => void;
}

export const OwnerNotificationDropdown = ({ onShowAll }: OwnerNotificationDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingReadIds, setMarkingReadIds] = useState<Set<string>>(new Set());
  
  const { unreadCount, markAsRead } = useNotifications();
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();

  const fetchNotifications = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await notificationApi.getNotifications({
        page: 1,
        per_page: 5,
        unread_only: false,
        user_role: 'owner' // Specific to the Owner Role
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

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'booking': return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'complaint': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'resolved': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'message': return <MessageSquare className="w-5 h-5 text-purple-600" />;
      case 'viewing': return <Calendar className="w-5 h-5 text-blue-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      setMarkingReadIds(prev => new Set([...prev, notification.id]));
      try {
        await markAsRead(notification.id);
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
      } catch (error) {
        toast.error('Failed to mark notification as read');
      } finally {
        setMarkingReadIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(notification.id);
          return newSet;
        });
      }
    }
    
    onShowAll();
    setIsOpen(false);
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
            {unreadCount > 0 && (
              <Badge variant="destructive" className="bg-red-500 text-white font-medium">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <CardContent className="p-0 overflow-y-auto max-h-80">
            {loading ? (
              <div className="p-6 text-center">
                <Loader2 className="w-6 h-6 mx-auto animate-spin text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-700" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                          {notification.message}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1.5">
                          {notification.time}
                        </p>
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-center space-y-1 mt-1">
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                        )}
                        {markingReadIds.has(notification.id) && (
                          <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 shrink-0">
            <Button 
              variant="default" 
              className="w-full shadow-sm"
              onClick={() => {
                onShowAll();
                setIsOpen(false);
              }}
            >
              <Eye className="w-4 h-4 mr-2" />
              Show all notifications
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};