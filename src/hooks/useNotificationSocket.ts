import { useEffect, useRef } from "react";
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { getAuthToken } from '@/utils/tokenStorage';
import { playNotificationSound } from '@/hooks/useNotificationSound';

// Backend API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://api.homeduk.property';
// Extract base URL without /api suffix for Socket.IO connection
const SOCKET_URL = API_BASE_URL.replace('/api', '');

export const useNotificationSocket = (onNewNotification?: (notification: any) => void) => {
  const { user } = useAuth();
  const callbackRef = useRef(onNewNotification);

  useEffect(() => {
    callbackRef.current = onNewNotification;
  }, [onNewNotification]);

  useEffect(() => {
    // Skip socket connection if user is not available
    if (!user?.id) return;

    const token = getAuthToken();
    if (!token) return;

    // Connect to Socket.IO server
    const socket: Socket = io(SOCKET_URL, {
      auth: {
        token: token
      },
      reconnection: true,
      reconnectionDelay: 5000,
      reconnectionAttempts: 3
    });

    // Join user's room for targeted notifications
    socket.on('connect', () => {
      console.log('Socket connected successfully');
      socket.emit('join_room', `user_${user.id}`);
    });

    // Listen for new notifications
    socket.on('new_notification', (notification) => {
      console.log('New notification received:', notification);

      playNotificationSound();

      toast.success(notification.title, {
        description: notification.message,
        duration: 5000,
      });

      callbackRef.current?.(notification);
    });

    // Listen for notification updates
    socket.on('notification_read', (data) => {
      console.log('Notification marked as read:', data);
    });

    socket.on('all_notifications_read', (data) => {
      console.log('All notifications marked as read:', data);
    });

    // Handle connection errors
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      // Don't spam the console with errors - just log once
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id]);
};