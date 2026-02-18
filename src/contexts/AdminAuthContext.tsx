import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { adminApi, type AdminProfile } from '@/services/adminApi';
import { toast } from 'sonner';
import { tokenStorage, getAdminToken, setAdminToken, setAdminProfile } from '@/utils/tokenStorage';

// Helper function to decode JWT and get expiration time
const getTokenExpirationTime = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null; // Convert to milliseconds
  } catch (error) {
    console.error('Failed to decode admin token:', error);
    return null;
  }
};

interface AdminAuthContextType {
  admin: AdminProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, profile: AdminProfile, sessionId: string) => void;
  logout: () => Promise<void>;
  refreshAdmin: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider = ({ children }: AdminAuthProviderProps) => {
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to schedule token refresh
  const scheduleTokenRefresh = (token: string) => {
    // Clear existing timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    const expirationTime = getTokenExpirationTime(token);
    if (!expirationTime) {
      console.warn('Could not determine admin token expiration time');
      // Start keep-alive polling as fallback
      startKeepAlive();
      return;
    }

    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;

    // Refresh token 5 minutes before expiration (or halfway through if token expires in less than 10 minutes)
    const refreshBuffer = Math.min(5 * 60 * 1000, timeUntilExpiration / 2);
    const refreshTime = timeUntilExpiration - refreshBuffer;

    if (refreshTime > 0) {
      console.log(`[AdminAuth] Token refresh scheduled in ${Math.round(refreshTime / 1000 / 60)} minutes`);

      refreshTimerRef.current = setTimeout(async () => {
        try {
          console.log('[AdminAuth] Attempting automatic token refresh...');
          await refreshAdminSession();
        } catch (error) {
          console.error('[AdminAuth] Failed to refresh token:', error);
          // Start keep-alive as fallback
          startKeepAlive();
        }
      }, refreshTime);
    } else {
      console.warn('[AdminAuth] Token already expired or about to expire');
      // Try immediate refresh
      refreshAdminSession().catch(() => {
        console.error('[AdminAuth] Immediate refresh failed');
      });
    }
  };

  // Keep-alive mechanism: periodically verify session
  const startKeepAlive = () => {
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current);
    }

    // Check session every 5 minutes
    keepAliveIntervalRef.current = setInterval(async () => {
      try {
        console.log('[AdminAuth] Keep-alive check...');
        await adminApi.getProfile();
        console.log('[AdminAuth] Keep-alive successful');
      } catch (error) {
        console.error('[AdminAuth] Keep-alive failed:', error);
        // Don't log out automatically - let the user continue until they take an action
      }
    }, 5 * 60 * 1000);
  };

  // Refresh admin session
  const refreshAdminSession = async () => {
    try {
      const response = await adminApi.getProfile();
      if (response.admin) {
        setAdmin(response.admin);
        setAdminProfile(response.admin);
        console.log('[AdminAuth] Admin session refreshed successfully');

        // Check if we got a new token in the response
        const token = getAdminToken();
        if (token) {
          scheduleTokenRefresh(token);
        } else {
          startKeepAlive();
        }
      }
    } catch (error) {
      console.error('[AdminAuth] Failed to refresh admin session:', error);
      throw error;
    }
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      if (keepAliveIntervalRef.current) {
        clearInterval(keepAliveIntervalRef.current);
      }
    };
  }, []);

  // Handle page visibility changes to refresh session when user returns
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && admin) {
        const token = getAdminToken();
        if (token) {
          const expirationTime = getTokenExpirationTime(token);
          if (expirationTime) {
            const timeUntilExpiration = expirationTime - Date.now();

            // If token expires in less than 10 minutes, refresh it immediately
            if (timeUntilExpiration < 10 * 60 * 1000 && timeUntilExpiration > 0) {
              try {
                console.log('[AdminAuth] Refreshing session due to page visibility change...');
                await refreshAdminSession();
              } catch (error) {
                console.error('[AdminAuth] Failed to refresh on visibility change:', error);
              }
            }
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [admin]);

  // Initialize admin authentication
  useEffect(() => {
    const initializeAdminAuth = async () => {
      try {
        const token = getAdminToken();
        const storedAdmin = tokenStorage.getItem('admin_profile');

        if (token && storedAdmin) {
          try {
            const parsedAdmin = JSON.parse(storedAdmin);
            setAdmin(parsedAdmin);

            // Verify token is still valid
            try {
              const response = await adminApi.getProfile();
              if (response.admin) {
                setAdmin(response.admin);
                setAdminProfile(response.admin);
              }

              // Schedule automatic refresh
              scheduleTokenRefresh(token);
            } catch (error) {
              console.error('[AdminAuth] Token validation failed:', error);
              // Clear invalid auth data
              tokenStorage.removeItem('admin_token');
              tokenStorage.removeItem('admin_profile');
              setAdmin(null);
            }
          } catch (e) {
            console.error('[AdminAuth] Failed to parse stored admin:', e);
            tokenStorage.removeItem('admin_profile');
            tokenStorage.removeItem('admin_token');
            setAdmin(null);
          }
        }
      } catch (error) {
        console.error('[AdminAuth] Initialization error:', error);
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAdminAuth();
  }, []);

  const login = (token: string, profile: AdminProfile, sessionId: string) => {
    setAdminToken(token);
    setAdminProfile(profile);
    setAdmin(profile);

    // Schedule automatic token refresh
    scheduleTokenRefresh(token);

    console.log('[AdminAuth] Admin logged in successfully');
  };

  const logout = async () => {
    try {
      await adminApi.logout();
    } catch (error) {
      console.error('[AdminAuth] Logout API call failed:', error);
    } finally {
      // Clear timers
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      if (keepAliveIntervalRef.current) {
        clearInterval(keepAliveIntervalRef.current);
        keepAliveIntervalRef.current = null;
      }

      // Clear auth data
      tokenStorage.removeItem('admin_token');
      tokenStorage.removeItem('admin_profile');
      setAdmin(null);

      toast.success('Logged out successfully');

      // Navigation will be handled by useAdminGuard hook which detects !isAuthenticated
    }
  };

  const refreshAdmin = async () => {
    await refreshAdminSession();
  };

  const value = {
    admin,
    isAuthenticated: !!admin && !!getAdminToken(),
    loading,
    login,
    logout,
    refreshAdmin,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};
