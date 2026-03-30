import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Bell, Search, Calendar, AlertTriangle, CheckCircle,
  MessageSquare, User, Filter, Loader2,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { notificationApi, type Notification } from '@/services/api';
import { useNotifications } from '@/contexts/NotificationContext';
import { getAuthToken } from '@/utils/tokenStorage';
import { toast } from 'sonner';

const PER_PAGE = 20;

interface PaginationState {
  current_page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

const defaultPagination: PaginationState = {
  current_page: 1,
  total: 0,
  pages: 0,
  has_next: false,
  has_prev: false,
};

const NotificationsComponent = ({ user }: { user?: any }) => {
  const { unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [pagination, setPagination] = useState<PaginationState>(defaultPagination);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [markingReadIds, setMarkingReadIds] = useState<Set<string>>(new Set());

  // Debounce ref so filter/search changes don't fire immediately
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchNotifications = async (page = 1, append = false) => {
    if (!getAuthToken()) {
      setLoading(false);
      return;
    }
    try {
      if (!append) setLoading(true);

      const response = await notificationApi.getNotifications({
        page,
        per_page: PER_PAGE,
        type: filterType === 'all' ? undefined : filterType,
        search: searchTerm.trim() || undefined,
        unread_only: false,
        user_role: user?.role ?? 'external_tenant',
      });

      if (response?.success && response.data) {
        const data = response.data as any;
        // Handle different possible response shapes safely
        const fetched: Notification[] = Array.isArray(data.notifications)
          ? data.notifications
          : Array.isArray(data.data)
          ? data.data
          : [];

        setNotifications((prev) => (append ? [...prev, ...fetched] : fetched));

        setPagination({
          current_page: data.current_page ?? page,
          total: data.total ?? fetched.length,
          pages: data.pages ?? 1,
          has_next: data.has_next ?? false,
          has_prev: data.has_prev ?? false,
        });
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      // Don't toast on every poll failure — only on first load
      if (!append && notifications.length === 0) {
        toast.error('Could not load notifications');
      }
    } finally {
      setLoading(false);
    }
  };

  // Debounced refetch on filter/search change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchNotifications(1, false);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterType]);

  const markNotificationAsRead = async (id: string) => {
    if (markingReadIds.has(id)) return;
    setMarkingReadIds((prev) => new Set([...prev, id]));
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      toast.error('Failed to mark as read');
    } finally {
      setMarkingReadIds((prev) => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (isMarkingAllRead || unreadCount === 0) return;
    setIsMarkingAllRead(true);
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      toast.error('Failed to mark all as read');
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    const cls = 'w-4 h-4';
    switch (type) {
      case 'booking':
      case 'viewing':
        return <Calendar className={cls} />;
      case 'complaint':
        return <AlertTriangle className={cls} />;
      case 'resolved':
      case 'approval':
      case 'review':
        return <CheckCircle className={cls} />;
      case 'message':
      case 'inquiry':
      case 'contact':
        return <MessageSquare className={cls} />;
      default:
        return <User className={cls} />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
      return new Date(dateString).toLocaleDateString();
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
          >
            <option value="all">All types</option>
            <option value="booking">Bookings</option>
            <option value="complaint">Complaints</option>
            <option value="resolved">Resolved</option>
            <option value="viewing">Viewings</option>
            <option value="inquiry">Inquiries</option>
            <option value="general">General</option>
          </select>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllNotificationsAsRead}
              disabled={isMarkingAllRead}
              className="whitespace-nowrap text-xs"
            >
              {isMarkingAllRead
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : `Mark all read (${unreadCount})`
              }
            </Button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
        {loading && notifications.length === 0 ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
              No notifications
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || filterType !== 'all'
                ? 'Try adjusting the search or filter.'
                : "You're all caught up!"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                  !n.read ? 'bg-gray-50/70 dark:bg-gray-800/30' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 size-8 rounded-lg flex items-center justify-center mt-0.5 ${
                      !n.read
                        ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {getNotificationIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <p
                        className={`text-sm font-semibold ${
                          !n.read
                            ? 'text-gray-900 dark:text-gray-100'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {n.title}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-400">
                          {formatTimeAgo(n.created_at)}
                        </span>
                        {!n.read && (
                          <span className="size-2 rounded-full bg-blue-500 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                    <p
                      className={`text-xs mt-0.5 ${
                        !n.read
                          ? 'text-gray-700 dark:text-gray-300'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {n.message}
                    </p>
                    {!n.read && (
                      <button
                        onClick={() => markNotificationAsRead(n.id)}
                        disabled={markingReadIds.has(n.id)}
                        className="mt-1.5 text-xs text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
                      >
                        {markingReadIds.has(n.id) ? 'Marking…' : 'Mark as read'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {pagination.has_next && (
              <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 text-center">
                <button
                  onClick={() =>
                    fetchNotifications(pagination.current_page + 1, true)
                  }
                  disabled={loading}
                  className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Load more'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsComponent;
