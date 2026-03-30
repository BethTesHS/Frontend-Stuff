import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationApi, type Notification } from '@/services/api';
import { useAuth } from './AuthContext';
import { useNotificationSocket } from '@/hooks/useNotificationSocket';
import { getAdminToken } from '@/utils/tokenStorage';

interface NotificationContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [backendAvailable, setBackendAvailable] = useState(true);
  
  // Safe auth hook usage with fallback
  let user = null;
  try {
    const authContext = useAuth();
    user = authContext?.user || null;
  } catch (error) {
    console.warn('Auth context not available in NotificationProvider:', error);
  }

  // Refresh unread count
  const refreshUnreadCount = useCallback(async () => {
    // Skip if backend is known to be unavailable
    if (!backendAvailable) {
      return;
    }

    try {
      const response = await notificationApi.getUnreadCount();
      if (response.success && response.data) {
        setUnreadCount(response.data.unread_count);
        setBackendAvailable(true); // Reset on success
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
      // Mark backend as unavailable to prevent repeated requests
      // setBackendAvailable(false);
      // setUnreadCount(0); // Reset count when backend is unavailable
    }
  }, [backendAvailable]);
  // Mark notification as read
  const markAsRead = async (notificationId: string | number) => {
    try {
      const idStr = notificationId.toString();
      const response = await notificationApi.markAsRead(idStr);
      if (response.success) {
        if (response.data && typeof response.data.unread_count === "number") {
          setUnreadCount(response.data.unread_count);
        } else {
          // Fallback: decrement locally if backend doesn't return count
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await notificationApi.markAllAsRead();
      if (response.success) {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  };

  // Handle real-time notifications - memoized to prevent socket reconnection loop
  const handleNewNotification = useCallback((notification: Notification) => {
    setUnreadCount(prev => prev + 1);
  }, []);

  useNotificationSocket(handleNewNotification);

  // Initial unread count fetch - for regular users OR admin sessions
  useEffect(() => {
    if (user?.id || getAdminToken()) {
      refreshUnreadCount();
    } else {
      setUnreadCount(0);
    }
  }, [user?.id, refreshUnreadCount]);

  return (
    <NotificationContext.Provider value={{
      unreadCount,
      refreshUnreadCount,
      markAsRead,
      markAllAsRead,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};