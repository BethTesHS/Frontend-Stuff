import Layout from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bell, Search, Calendar, AlertTriangle, CheckCircle, MessageSquare, User, Filter, Loader2, RefreshCw } from 'lucide-react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useState, useEffect } from 'react';
import { notificationApi, type Notification, type NotificationListResponse } from '@/services/api';
import { useNotifications } from '@/contexts/NotificationContext';
import { toast } from 'sonner';

const Notifications = () => {
  const { loading: authLoading, hasAccess, user } = useAuthGuard(['agent', 'owner', 'manager', 'tenant']);
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

  // Fetch notifications
  const fetchNotifications = async (page: number = 1, append: boolean = false) => {
    try {
      if (!append) setLoading(true);

      const response = await notificationApi.getNotifications({
        page,
        per_page: pagination.per_page,
        type: filterType,
        search: searchTerm || undefined,
        unread_only: false,
        user_role: user?.role || 'external_tenant' // External tenants have no role
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
  };

  // Initial load
  useEffect(() => {
    if (hasAccess && !authLoading) {
      fetchNotifications();
    }
  }, [hasAccess, authLoading]);

  // Handle search and filter changes
  useEffect(() => {
    if (hasAccess && !authLoading) {
      const timeoutId = setTimeout(() => {
        fetchNotifications(1);
      }, 300); // Debounce search

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, filterType]);

  // Mark single notification as read (using context)
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

  // Mark all notifications as read (using context)
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

  // Load more notifications (pagination)
  const loadMore = () => {
    if (pagination.has_next && !loading) {
      fetchNotifications(pagination.current_page + 1, true);
    }
  };

  // Refresh notifications
  const refreshNotifications = () => {
    setSearchTerm('');
    setFilterType('all');
    fetchNotifications(1);
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
        </div>
      </Layout>
    );
  }

  if (!hasAccess) {
    return null;
  }

  const getRoleBasedStyles = () => {
    switch (user?.role) {
      case 'owner':
        return {
          backgroundClass: 'bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100',
          headerCardClass: 'bg-white/20 backdrop-blur-lg border border-white/30 shadow-2xl rounded-2xl',
          cardClass: 'bg-white/20 backdrop-blur-lg border border-white/30 shadow-2xl rounded-2xl',
          titleClass: 'bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent',
          iconClass: 'text-blue-600',
          badgeClass: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white',
          buttonClass: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white',
          unreadClass: 'bg-gradient-to-r from-blue-100 to-purple-100 border-l-blue-500',
          inputClass: 'bg-white/10 backdrop-blur-sm border border-white/20 focus:border-blue-400',
          selectClass: 'bg-white/10 backdrop-blur-sm border border-white/20 focus:ring-blue-500',
          floatingElements: (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute top-40 right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
              <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>
          )
        };
      case 'agent':
        return {
          backgroundClass: 'bg-gradient-to-br from-gray-50 to-gray-100',
          headerCardClass: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-xl rounded-xl border-0',
          cardClass: 'bg-white shadow-md rounded-xl border-0',
          titleClass: 'text-white font-bold',
          iconClass: 'text-emerald-600',
          badgeClass: 'bg-emerald-500 text-white',
          buttonClass: 'bg-emerald-500 hover:bg-emerald-600 text-white',
          unreadClass: 'bg-emerald-50 border-l-emerald-500',
          inputClass: 'border-gray-300 focus:ring-emerald-500 focus:border-transparent',
          selectClass: 'border-gray-300 focus:ring-emerald-500 focus:border-transparent',
          floatingElements: null
        };
      case 'tenant':
        return {
          backgroundClass: 'bg-gradient-to-br from-gray-50 to-blue-50',
          headerCardClass: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl rounded-xl border-0',
          cardClass: 'bg-white shadow-md rounded-xl border-0',
          titleClass: 'text-white font-bold',
          iconClass: 'text-blue-600',
          badgeClass: 'bg-blue-500 text-white',
          buttonClass: 'bg-blue-500 hover:bg-blue-600 text-white',
          unreadClass: 'bg-blue-50 border-l-blue-500',
          inputClass: 'border-gray-300 focus:ring-blue-500 focus:border-transparent',
          selectClass: 'border-gray-300 focus:ring-blue-500 focus:border-transparent',
          floatingElements: null
        };
      default:
        return {
          backgroundClass: 'bg-gray-50',
          headerCardClass: 'bg-white shadow-xl rounded-xl border-0',
          cardClass: 'bg-white shadow-md rounded-xl border-0',
          titleClass: 'text-gray-900 font-bold',
          iconClass: 'text-gray-600',
          badgeClass: 'bg-gray-500 text-white',
          buttonClass: 'bg-gray-500 hover:bg-gray-600 text-white',
          unreadClass: 'bg-gray-50 border-l-gray-500',
          inputClass: 'border-gray-300 focus:ring-gray-500 focus:border-transparent',
          selectClass: 'border-gray-300 focus:ring-gray-500 focus:border-transparent',
          floatingElements: null
        };
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'booking':
        return <Calendar className="w-6 h-6 text-blue-600" />;
      case 'complaint':
        return <AlertTriangle className="w-6 h-6 text-red-600" />;
      case 'resolved':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'message':
        return <MessageSquare className="w-6 h-6 text-purple-600" />;
      case 'viewing':
        return <Calendar className="w-6 h-6 text-blue-600" />;
      case 'inquiry':
        return <MessageSquare className="w-6 h-6 text-purple-600" />;
      case 'contact':
        return <MessageSquare className="w-6 h-6 text-purple-600" />;
      case 'review':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'approval':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      default:
        return <User className="w-6 h-6 text-gray-600" />;
    }
  };

  const styles = getRoleBasedStyles();

  return (
    <Layout showFooter={false}>
      <div className={`h-screen flex flex-col ${styles.backgroundClass} relative`}>
        {styles.floatingElements}
        
        <div className="flex-shrink-0 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="mb-8">
            <Card className={styles.headerCardClass}>
              <CardContent className="p-8">
                <h1 className={`text-3xl font-bold mb-4 flex items-center ${styles.titleClass}`}>
                  <Bell className={`w-8 h-8 mr-3 ${user?.role === 'owner' ? 'text-blue-600' : 'text-white'}`} />
                  Notifications
                </h1>
                <div className="flex items-center justify-between">
                  <p className={user?.role === 'owner' ? 'text-gray-600' : 'text-white/90'}>
                    Stay updated with all your property activities and communications
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={refreshNotifications}
                      disabled={loading}
                      className={user?.role === 'owner' ? 'bg-white/20 border-white/20 text-gray-700 hover:bg-white/30' : 'bg-white/20 border-white/20 text-white hover:bg-white/30'}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    {unreadCount > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={markAllNotificationsAsRead}
                        disabled={isMarkingAllRead}
                        className={user?.role === 'owner' ? 'bg-white/20 border-white/20 text-gray-700 hover:bg-white/30' : 'bg-white/20 border-white/20 text-white hover:bg-white/30'}
                      >
                        {isMarkingAllRead && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Mark all as read ({unreadCount})
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className={`mb-6 ${styles.cardClass}`}>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 ${styles.inputClass}`}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className={`px-3 py-2 rounded-md text-sm ${styles.selectClass}`}
                  >
                    <option value="all">All Types</option>
                    <option value="booking">Bookings</option>
                    <option value="complaint">Complaints</option>
                    <option value="resolved">Resolved</option>
                    <option value="viewing">Viewings</option>
                    <option value="inquiry">Inquiries</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-8 relative z-10">
          <Card className={`h-full flex flex-col ${styles.cardClass}`}>
            <CardHeader className="flex-shrink-0">
              <CardTitle className={`text-lg ${user?.role === 'owner' ? styles.titleClass : 'text-gray-900'}`}>
                All Notifications {pagination.total > 0 && `(${pagination.total})`}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-gray-400" />
                  <p className="text-gray-500">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                  <p className="text-gray-500">
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
                      className={`p-6 transition-all hover:bg-gray-50 border-l-4 ${
                        !notification.read 
                          ? styles.unreadClass
                          : 'border-l-gray-300'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className={`text-lg font-semibold ${
                              !notification.read ? 'font-bold' : 'text-gray-900'
                            } ${user?.role === 'owner' && !notification.read ? styles.titleClass : ''}`}>
                              {notification.title}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant={notification.priority === 'high' ? 'destructive' : 
                                       notification.priority === 'medium' ? 'default' : 'secondary'}
                                className="capitalize"
                              >
                                {notification.priority}
                              </Badge>
                              {!notification.read && (
                                <div className={`w-2 h-2 rounded-full ${
                                  user?.role === 'owner' ? 'bg-gradient-to-r from-blue-500 to-purple-600' :
                                  user?.role === 'agent' ? 'bg-emerald-500' : 'bg-blue-500'
                                }`}></div>
                              )}
                            </div>
                          </div>
                          <p className={`mb-3 ${
                            !notification.read ? 'font-medium' : 'text-gray-700'
                          }`}>
                            {notification.message}
                          </p>
                          {notification.description && (
                            <p className={`text-sm mb-4 ${
                              !notification.read ? 'font-medium' : 'text-gray-600'
                            }`}>
                              {notification.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">{notification.time}</span>
                            {!notification.read && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => markNotificationAsRead(notification.id)}
                                disabled={markingReadIds.has(notification.id)}
                                className={`${styles.buttonClass} text-sm`}
                              >
                                {markingReadIds.has(notification.id) && (
                                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                )}
                                Mark as read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Load More Button */}
                  {pagination.has_next && (
                    <div className="p-6 text-center border-t">
                      <Button 
                        variant="outline" 
                        onClick={loadMore}
                        disabled={loading}
                        className={styles.buttonClass}
                      >
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Load More Notifications
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;