import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bell, Search, Calendar, AlertTriangle, CheckCircle, MessageSquare, User, Filter, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { notificationApi, type Notification } from '@/services/api';
import { useNotifications } from '@/contexts/NotificationContext';
import { getAuthToken } from '@/utils/tokenStorage';
import { toast } from 'sonner';

export const AdminNotifications = () => {
  const { unreadCount, markAsRead, markAllAsRead } = useNotifications();
  
  // State management
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 20,
    total: 0,
    pages: 0,
    has_next: false,
    has_prev: false
  });
  
  // Loading states
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [markingReadIds, setMarkingReadIds] = useState<Set<string>>(new Set());

  // Fetch notifications with useCallback to prevent infinite re-renders
  const fetchNotifications = useCallback(async (page: number = 1, append: boolean = false) => {
    if (!getAuthToken()) {
      setLoading(false);
      return;
    }
    try {
      if (!append) setLoading(true);

      const response = await notificationApi.getNotifications({
        page,
        per_page: pagination.per_page,
        type: filterType,
        search: searchTerm || undefined,
        unread_only: false,
        user_role: 'admin' // Force admin role
      });

      if (response.success && response.data) {
        const { notifications: newNotifications, ...paginationData } = response.data;
        
        if (append) {
          setNotifications(prev => [...prev, ...newNotifications]);
        } else {
          setNotifications(newNotifications);
        }
        
        setPagination(paginationData);
      } else {
        throw new Error(response.error || 'Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [pagination.per_page, filterType, searchTerm]);

  // Handle initial load and filter/search changes with debouncing to prevent duplicate requests
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchNotifications(1);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterType, fetchNotifications]);

  // Mark single notification as read
  const markNotificationAsRead = async (id: string) => {
    if (markingReadIds.has(id)) return;

    setMarkingReadIds(prev => new Set([...prev, id]));

    try {
      await markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    } finally {
      setMarkingReadIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    if (isMarkingAllRead || unreadCount === 0) return;

    setIsMarkingAllRead(true);

    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  // Load more notifications
  const loadMore = () => {
    if (pagination.has_next && !loading) {
      fetchNotifications(pagination.current_page + 1, true);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    const iconClass = "w-6 h-6 text-gray-600 dark:text-gray-400";
    switch (type) {
      case 'booking':
        return <Calendar className={iconClass} />;
      case 'complaint':
        return <AlertTriangle className={iconClass} />;
      case 'resolved':
        return <CheckCircle className={iconClass} />;
      case 'message':
        return <MessageSquare className={iconClass} />;
      case 'viewing':
        return <Calendar className={iconClass} />;
      case 'inquiry':
        return <MessageSquare className={iconClass} />;
      case 'contact':
        return <MessageSquare className={iconClass} />;
      case 'review':
        return <CheckCircle className={iconClass} />;
      case 'approval':
        return <CheckCircle className={iconClass} />;
      default:
        return <User className={iconClass} />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with integrated search and actions */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg p-6">
          {/* Title Section equivalent space */}
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllNotificationsAsRead}
                disabled={isMarkingAllRead}
                className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {isMarkingAllRead && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Mark all read ({unreadCount})
              </Button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 rounded-md text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
              >
                <option value="all">All Types</option>
                <option value="booking">Bookings</option>
                <option value="complaint">Complaints</option>
                <option value="resolved">Resolved</option>
                <option value="viewing">Viewings</option>
                <option value="inquiry">Inquiries</option>
                <option value="message">Messages</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800">
            <CardTitle className="text-lg text-foreground">
              All Notifications {pagination.total > 0 && `(${pagination.total})`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-muted-foreground" />
                  <p className="text-muted-foreground">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No notifications found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || filterType !== 'all'
                      ? 'Try adjusting your search or filter criteria'
                      : 'You\'re all caught up! New notifications will appear here.'
                    }
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-6 transition-all hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 ${
                        !notification.read
                          ? 'bg-gray-50 dark:bg-gray-800/50 border-l-gray-500 dark:border-l-gray-600'
                          : 'border-l-gray-200 dark:border-l-gray-700'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className={`text-lg font-semibold ${
                              !notification.read ? 'font-bold text-foreground' : 'text-foreground'
                            }`}>
                              {notification.title}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant="secondary"
                                className="capitalize bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                              >
                                {notification.priority}
                              </Badge>
                              {!notification.read && (
                                <div className="w-2 h-2 rounded-full bg-gray-600 dark:bg-gray-500"></div>
                              )}
                            </div>
                          </div>
                          <p className={`mb-3 ${
                            !notification.read ? 'font-medium text-foreground' : 'text-muted-foreground'
                          }`}>
                            {notification.message}
                          </p>
                          {notification.description && (
                            <p className={`text-sm mb-4 ${
                              !notification.read ? 'font-medium text-foreground' : 'text-muted-foreground'
                            }`}>
                              {notification.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(notification.created_at)}
                            </span>
                            {!notification.read && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markNotificationAsRead(notification.id)}
                                disabled={markingReadIds.has(notification.id)}
                                className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                              >
                                {markingReadIds.has(notification.id) && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                                Mark as read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {pagination.has_next && (
                    <div className="p-4 text-center border-t border-gray-200 dark:border-gray-800">
                      <Button
                        variant="outline"
                        onClick={loadMore}
                        disabled={loading}
                        className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Load More
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};