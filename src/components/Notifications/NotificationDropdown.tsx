import { useState, useRef, useEffect } from 'react';
import { Bell, Eye, MessageSquare, Calendar, AlertTriangle, CheckCircle, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { notificationApi, type Notification } from '@/services/api';
import { toast } from 'sonner';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingReadIds, setMarkingReadIds] = useState<Set<string>>(new Set());
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { unreadCount, markAsRead } = useNotifications();

  // Fetch notifications when dropdown opens
  const fetchNotifications = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await notificationApi.getNotifications({
        page: 1,
        per_page: 10, // Show only recent notifications in dropdown
        unread_only: false,
        user_role: user?.role || 'external_tenant' // External tenants have no role
      });

      if (response.success && response.data) {
        setNotifications(response.data.notifications);
      } else {
        throw new Error(response.error || 'Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Don't show toast error for dropdown as it might be annoying
    } finally {
      setLoading(false);
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle dropdown toggle
  const handleToggle = () => {
    if (!isOpen) {
      setIsOpen(true);
      fetchNotifications();
    } else {
      setIsOpen(false);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'booking':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'complaint':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-purple-600" />;
      case 'viewing':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'inquiry':
        return <MessageSquare className="w-5 h-5 text-purple-600" />;
      case 'contact':
        return <MessageSquare className="w-5 h-5 text-purple-600" />;
      case 'review':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'approval':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <User className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRoleBasedStyles = () => {
    switch (user?.role) {
      case 'owner':
        return {
          cardClass: 'bg-white/20 backdrop-blur-lg border border-white/30 shadow-2xl',
          headerClass: 'bg-gradient-to-r from-blue-400/20 to-purple-400/20 border-b border-white/20',
          titleClass: 'bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent font-bold',
          badgeClass: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white',
          unreadClass: 'bg-gradient-to-r from-blue-100 to-purple-100 border-l-blue-500',
          buttonClass: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
        };
      case 'agent':
        return {
          cardClass: 'bg-white shadow-lg border border-gray-200',
          headerClass: 'bg-emerald-50 border-b border-emerald-100',
          titleClass: 'text-emerald-600 font-bold',
          badgeClass: 'bg-emerald-500 text-white',
          unreadClass: 'bg-emerald-50 border-l-emerald-500',
          buttonClass: 'bg-emerald-500 hover:bg-emerald-600 text-white'
        };
      case 'tenant':
        return {
          cardClass: 'bg-white shadow-lg border border-gray-200',
          headerClass: 'bg-blue-50 border-b border-blue-100',
          titleClass: 'text-blue-600 font-bold',
          badgeClass: 'bg-blue-500 text-white',
          unreadClass: 'bg-blue-50 border-l-blue-500',
          buttonClass: 'bg-blue-500 hover:bg-blue-600 text-white'
        };
      default:
        return {
          cardClass: 'bg-white shadow-lg border border-gray-200',
          headerClass: 'bg-gray-50 border-b border-gray-100',
          titleClass: 'text-gray-900 font-bold',
          badgeClass: 'bg-gray-500 text-white',
          unreadClass: 'bg-gray-50 border-l-gray-500',
          buttonClass: 'bg-gray-500 hover:bg-gray-600 text-white'
        };
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-gray-300 bg-gray-50';
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      setMarkingReadIds(prev => new Set([...prev, notification.id]));
      
      try {
        await markAsRead(notification.id);
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
        toast.error('Failed to mark notification as read');
      } finally {
        setMarkingReadIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(notification.id);
          return newSet;
        });
      }
    }

    // Navigate based on notification type or action URL
    if (notification.action_url) {
      navigate(notification.action_url);
    } else {
      // Default navigation based on type
      switch (notification.type) {
        case 'complaint':
          navigate('/agent-complaints');
          break;
        case 'booking':
        case 'viewing':
          navigate('/agent-valuation');
          break;
        case 'inquiry':
        case 'contact':
          navigate('/inquiries');
          break;
        default:
          navigate('/notifications');
          break;
      }
    }
    
    setIsOpen(false);
  };

  const styles = getRoleBasedStyles();

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2"
        onClick={handleToggle}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge className={`absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 ${styles.badgeClass}`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className={`absolute right-0 top-full mt-2 w-96 max-h-96 overflow-y-auto z-50 rounded-2xl ${styles.cardClass}`}>
          <div className={`p-4 ${styles.headerClass}`}>
            <div className="flex items-center justify-between">
              <h3 className={`font-semibold ${styles.titleClass}`}>Notifications</h3>
              <Badge className={styles.badgeClass}>
                {unreadCount} new
              </Badge>
            </div>
          </div>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 text-center">
                <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-gray-400" />
                <p className="text-sm text-gray-500">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 cursor-pointer hover:bg-white/10 transition-colors border-l-4 ${
                      getPriorityColor(notification.priority)
                    } ${!notification.read ? styles.unreadClass : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notification.read ? 'font-semibold' : 'text-gray-900'}`}>
                          {notification.title}
                        </p>
                        <p className={`text-sm mt-1 ${!notification.read ? 'font-medium' : 'text-gray-600'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {notification.time}
                        </p>
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-center space-y-1">
                        {!notification.read && (
                          <div className={`w-2 h-2 rounded-full ${
                            user?.role === 'owner' ? 'bg-gradient-to-r from-blue-500 to-purple-600' :
                            user?.role === 'agent' ? 'bg-emerald-500' : 'bg-blue-500'
                          }`}></div>
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
            <div className={`p-4 border-t ${styles.headerClass}`}>
              <Button 
                className={`w-full ${styles.buttonClass} shadow-lg hover:shadow-xl transition-all duration-300`}
                onClick={() => {
                  // Navigate to appropriate dashboard notifications section based on user role
                  const dashboardPath = user?.role === 'agent' ? '/agent-dashboard' : 
                                      user?.role === 'owner' || user?.role === 'manager' ? '/owner-dashboard' : 
                                      user?.role === 'tenant' ? '/tenant-dashboard' : 
                                      '/external-tenant-dashboard';
                  
                  // Use window.location to trigger the tab change via hash or state
                  window.location.href = `${dashboardPath}#notifications`;
                  setIsOpen(false);
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                View All Notifications
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationDropdown;