import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { authApi } from '@/services/api';
import { toast } from 'sonner';
import { tokenStorage, getAuthToken, setAuthToken, getRefreshToken, setRefreshToken, setHomedUser } from '@/utils/tokenStorage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://api.homeduk.property';

// Helper function to decode JWT and get expiration time
const getTokenExpirationTime = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null; // Convert to milliseconds
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role?: 'owner' | 'agent' | 'tenant' | 'manager' | 'buyer' | 'agency_admin';
  avatar?: string;
  phone?: string;
  profileComplete?: boolean;
  tenantVerified?: boolean;
  isActive?: boolean;
  isVerified?: boolean;
  manualVerificationStatus?: 'not_started' | 'pending' | 'verified';
  isPlatformTenant?: boolean;
  buyerIntent?: 'buy' | 'rent' | 'find_roommate';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithSSO: (ssoData: any) => Promise<void>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
  loading: boolean;
}

type TenantInfo = {
  isPlatformTenant: boolean;
  tenantVerified: boolean;
  manualVerificationStatus: 'not_started' | 'pending' | 'verified';
  redirectPath: string;
};

/**
 * Determines whether a tenant is an external or platform tenant and returns
 * the appropriate user fields + redirect path.  Called after login, SSO login,
 * and on session restore so the logic lives in exactly one place.
 */
const resolveTenantInfo = async (token: string, role: string | undefined): Promise<TenantInfo> => {
  const platformDefault: TenantInfo = {
    isPlatformTenant: true,
    tenantVerified: false,
    manualVerificationStatus: 'not_started',
    redirectPath: '/tenant-dashboard',
  };

  // 1. Check external tenant profile
  try {
    const externalRes = await fetch(`${API_BASE_URL}/external-tenant/check-profile`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });

    if (externalRes.ok) {
      const externalData = await externalRes.json();
      if (externalData.success) {
        const { has_external_profile, profile_complete } = externalData.data;

        if (has_external_profile && profile_complete) {
          return {
            isPlatformTenant: false,
            tenantVerified: true,
            manualVerificationStatus: 'verified',
            redirectPath: '/external-tenant-dashboard',
          };
        }

        if (has_external_profile) {
          // Profile exists but incomplete — send back to setup
          return {
            isPlatformTenant: false,
            tenantVerified: false,
            manualVerificationStatus: "pending",
            redirectPath: "/external-tenant-dashboard",
          };
        }
      }
    }
  } catch {
    // Network error on external check — fall through to platform check
  }

  // 2. Not an external tenant — only check platform status when role is already 'tenant'
  if (role !== 'tenant') return platformDefault;

  try {
    const dashRes = await fetch(`${API_BASE_URL}/tenant/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });

    if (dashRes.ok) {
      const dashData = await dashRes.json();
      const isActive = dashData.success && dashData.data?.status === 'active';
      return {
        isPlatformTenant: true,
        tenantVerified: isActive,
        manualVerificationStatus: isActive ? 'verified' : 'not_started',
        redirectPath: '/tenant-dashboard',
      };
    }
  } catch {
    // Fall through to default
  }

  return platformDefault;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Function to schedule token refresh
  const scheduleTokenRefresh = (token: string) => {
    // Clear existing timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    const expirationTime = getTokenExpirationTime(token);
    if (!expirationTime) {
      console.warn('Could not determine token expiration time');
      return;
    }

    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;

    // Refresh token 5 minutes before expiration (or halfway through if token expires in less than 10 minutes)
    const refreshBuffer = Math.min(5 * 60 * 1000, timeUntilExpiration / 2);
    const refreshTime = timeUntilExpiration - refreshBuffer;

    if (refreshTime > 0) {
      console.log(`Token refresh scheduled in ${Math.round(refreshTime / 1000 / 60)} minutes`);

      refreshTimerRef.current = setTimeout(async () => {
        try {
          console.log('Attempting automatic token refresh...');
          const response = await authApi.refreshToken();

          if (response.success && response.data) {
            const { access_token, refresh_token } = response.data;
            setAuthToken(access_token);
            if (refresh_token) {
              setRefreshToken(refresh_token);
            }

            // Schedule next refresh
            scheduleTokenRefresh(access_token);
            console.log('Token refreshed successfully');
          }
        } catch (error) {
          console.error('Failed to refresh token:', error);
          // Don't log out automatically - let the user continue until token actually expires
        }
      }, refreshTime);
    } else {
      console.warn('Token already expired or about to expire');
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  // Handle page visibility changes to refresh token when user returns
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && user) {
        const token = getAuthToken();
        if (token) {
          const expirationTime = getTokenExpirationTime(token);
          if (expirationTime) {
            const timeUntilExpiration = expirationTime - Date.now();

            // If token expires in less than 10 minutes, refresh it immediately
            if (timeUntilExpiration < 10 * 60 * 1000 && timeUntilExpiration > 0) {
              try {
                console.log('Refreshing token due to page visibility change...');
                const response = await authApi.refreshToken();

                if (response.success && response.data) {
                  const { access_token, refresh_token } = response.data;
                  setAuthToken(access_token);
                  if (refresh_token) {
                    setRefreshToken(refresh_token);
                  }

                  scheduleTokenRefresh(access_token);
                  console.log('Token refreshed successfully on page visibility change');
                }
              } catch (error) {
                console.error('Failed to refresh token on visibility change:', error);
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
  }, [user]);

  // Periodic check every 5 minutes to ensure token is still valid
  useEffect(() => {
    if (!user) return;

    const checkInterval = setInterval(async () => {
      const token = getAuthToken();
      if (token) {
        const expirationTime = getTokenExpirationTime(token);
        if (expirationTime) {
          const timeUntilExpiration = expirationTime - Date.now();

          // If token is expired or will expire in the next minute, try to refresh
          if (timeUntilExpiration < 60 * 1000) {
            try {
              console.log('Token expiring soon, attempting refresh...');
              const response = await authApi.refreshToken();

              if (response.success && response.data) {
                const { access_token, refresh_token } = response.data;
                setAuthToken(access_token);
                if (refresh_token) {
                  setRefreshToken(refresh_token);
                }

                scheduleTokenRefresh(access_token);
                console.log('Token refreshed successfully via periodic check');
              }
            } catch (error) {
              console.error('Failed to refresh token during periodic check:', error);
            }
          }
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => {
      clearInterval(checkInterval);
    };
  }, [user]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = getAuthToken();
        const storedUser = tokenStorage.getItem('homedUser');

        let initialUser: User | null = null;
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            initialUser = parsedUser;
            setUser(parsedUser);
          } catch (e) {
            tokenStorage.removeItem('homedUser');
          }
        }

        if (token) {
          // Check if token is expired before making the request
          const expirationTime = getTokenExpirationTime(token);
          if (expirationTime && expirationTime < Date.now()) {
            console.log('Token expired during initialization, clearing auth data');
            tokenStorage.removeItem('auth_token');
            tokenStorage.removeItem('refresh_token');
            tokenStorage.removeItem('homedUser');
            setUser(null);
            setLoading(false);
            return;
          }

          try {
            const response = await authApi.getCurrentUser();

            if (response.success && response.data) {
              const responseData = response.data as any;

              let userData: any;
              let profileData: any;

              if (responseData.data && responseData.data.user) {
                userData = responseData.data.user;
                profileData = responseData.data.profile;
              } else if (responseData.user) {
                userData = responseData.user;
                profileData = responseData.profile;
              } else {
                userData = responseData;
                profileData = null;
              }

              const user: User = {
                id: userData.id?.toString() || '',
                email: userData.email || '',
                firstName: userData.first_name || '',
                lastName: userData.last_name || '',
                name: userData.full_name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
                phone: userData.phone || '',
                isActive: userData.is_active,
                isVerified: userData.is_verified,
                role: (profileData?.role || userData.role || initialUser?.role) as 'owner' | 'agent' | 'tenant' | 'manager' | 'buyer' | 'agency_admin' | undefined,
                profileComplete: profileData?.is_profile_complete ?? initialUser?.profileComplete,
                tenantVerified: initialUser?.tenantVerified,
              };

              // Check tenant dashboard status if user is a tenant (or has no role yet — may be an external tenant)
              if (user.role === 'tenant' || !user.role) {
                const { redirectPath, ...tenantFields } = await resolveTenantInfo(token, user.role);
                // If we found an external profile during initialization, update the role to tenant
                if (redirectPath === "/external-tenant-dashboard") {
                  Object.assign(user, {
                    role: "tenant" as const,
                    ...tenantFields,
                  });
                } else if (user.role === "tenant") {
                  Object.assign(user, { ...tenantFields });
                }
              }

              setUser(user);
              setHomedUser(user);

              // Schedule automatic token refresh
              scheduleTokenRefresh(token);
            } else if (initialUser) {
              // If API response is not successful but we have stored user, keep using it
              console.warn('Could not refresh user data, using cached user data');
              setUser(initialUser);

              // Still schedule token refresh even with cached data
              scheduleTokenRefresh(token);
            } else {
              throw new Error('Invalid token response');
            }
          } catch (error: any) {
            console.error('Error fetching current user:', error);
            // Only clear auth if we don't have a stored user to fall back on
            if (initialUser) {
              console.warn('Using cached user data due to API error');
              setUser(initialUser);

              // Schedule token refresh even if there was an error
              scheduleTokenRefresh(token);
            } else {
              tokenStorage.removeItem('auth_token');
              tokenStorage.removeItem('refresh_token');
              tokenStorage.removeItem('homedUser');
              setUser(null);
            }
          }
        }
      } catch (error) {
        tokenStorage.removeItem('auth_token');
        tokenStorage.removeItem('refresh_token');
        tokenStorage.removeItem('homedUser');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);

      if (response.success && response.data) {
        const { user: userData, profile: profileData, access_token, refresh_token } = response.data;

        setAuthToken(access_token);
        if (refresh_token) {
          setRefreshToken(refresh_token);
        }

        const user: User = {
          id: userData.id?.toString() || userData.sub || '',
          email: userData.email || '',
          firstName: userData.first_name || '',
          lastName: userData.last_name || '',
          name: userData.full_name || '',
          phone: userData.phone || '',
          isActive: userData.is_active,
          isVerified: userData.is_verified,
          role: (userData.role || profileData?.role) as 'owner' | 'agent' | 'tenant' | 'manager' | 'buyer' | 'agency_admin' | undefined,
          profileComplete: profileData?.is_profile_complete,
        };

        setUser(user);
        setHomedUser(user);

        // Schedule automatic token refresh after login
        scheduleTokenRefresh(access_token);

        let shouldRedirectTo = '/select-role';

        if (user.role === 'tenant' || !user.role) {
          const { redirectPath, ...tenantFields } = await resolveTenantInfo(access_token, user.role);
          if (redirectPath === '/external-tenant-dashboard') {
            shouldRedirectTo = redirectPath;
            const updatedUser = { ...user, role: 'tenant' as const, ...tenantFields };
            setUser(updatedUser);
            setHomedUser(updatedUser);
          } else if (user.role === 'tenant') {
            shouldRedirectTo = redirectPath;
            const updatedUser = { ...user, ...tenantFields };
            setUser(updatedUser);
            setHomedUser(updatedUser);
          }
        } else if (user.role === 'agent') {
          shouldRedirectTo = user.profileComplete ? '/agent-dashboard' : '/profile-setup';
        } else if (user.role === 'owner' || user.role === 'manager') {
          shouldRedirectTo = user.profileComplete ? '/owner-dashboard' : '/profile-setup';
        } else if (user.role) {
          shouldRedirectTo = '/dashboard';
        }

        localStorage.setItem('login_redirect_path', shouldRedirectTo);

        toast.success('Login successful!');
      } else {
        throw new Error(response.error || response.message || 'Login failed');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed. Please try again.';

      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const loginWithSSO = async (ssoData: any) => {
    try {
      const { user: userData, profile: profileData, access_token, refresh_token } = ssoData;

      // Store tokens with correct keys
      setAuthToken(access_token);
      if (refresh_token) {
        setRefreshToken(refresh_token);
      }

      const user: User = {
        id: userData.id?.toString() || '',
        email: userData.email || '',
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        name: userData.full_name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
        phone: userData.phone || '',
        isActive: userData.is_active,
        isVerified: userData.is_verified,
        role: (userData.role || profileData?.role) as 'owner' | 'agent' | 'tenant' | 'manager' | 'buyer' | 'agency_admin' | undefined,
        profileComplete: profileData?.is_profile_complete,
      };

      // Update context state
      setUser(user);
      setHomedUser(user);

      // Schedule automatic token refresh
      scheduleTokenRefresh(access_token);

      // Handle tenant verification checks if needed
      let shouldRedirectTo = '/select-role';

      if (user.role === 'tenant' || !user.role) {
          const { redirectPath, ...tenantFields } = await resolveTenantInfo(access_token, user.role);
          if (redirectPath === '/external-tenant-dashboard') {
            shouldRedirectTo = redirectPath;
            const updatedUser = { ...user, role: 'tenant' as const, ...tenantFields };
            setUser(updatedUser);
            setHomedUser(updatedUser);
          } else if (user.role === 'tenant') {
            shouldRedirectTo = redirectPath;
            const updatedUser = { ...user, ...tenantFields };
            setUser(updatedUser);
            setHomedUser(updatedUser);
          }
        } else if (user.role === 'agent') {
        shouldRedirectTo = user.profileComplete ? '/agent-dashboard' : '/profile-setup';
      } else if (user.role === 'owner' || user.role === 'manager') {
        shouldRedirectTo = user.profileComplete ? '/owner-dashboard' : '/profile-setup';
      } else if (user.role) {
        shouldRedirectTo = '/dashboard';
      }

      localStorage.setItem('login_redirect_path', shouldRedirectTo);
    } catch (error: any) {
      const errorMessage = error.message || 'SSO login failed. Please try again.';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Proceed with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      // Clear token refresh timer
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }

      // Clear sensitive auth data from sessionStorage
      tokenStorage.removeItem('auth_token');
      tokenStorage.removeItem('refresh_token');
      tokenStorage.removeItem('homedUser');

      // Clear profile drafts from localStorage (non-sensitive, stays in localStorage)
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('profileDraft_')) {
          localStorage.removeItem(key);
        }
      });

      // Update state immediately - this triggers re-renders across all components
      setUser(null);

      // Show success message
      toast.success('Logged out successfully');

      // Force a hard redirect to home page to ensure clean state
      // Using setTimeout to allow toast to display
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await authApi.register({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
      });

      if (response.success) {
        // Success - the calling component will handle showing success message and redirect
        return;
      } else {
        throw new Error(response.error || response.message || 'Registration failed');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed. Please try again.';
      throw new Error(errorMessage);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (!user) return;

    const cleanedUserData: any = {};
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== "" && value !== undefined && value !== null) {
        if (typeof value === 'string' && value.trim() === '') {
          return;
        }
        cleanedUserData[key] = value;
      }
    });

    const updatedUser = { ...user, ...cleanedUserData };
    setUser(updatedUser);
    setHomedUser(updatedUser);
  };

  const isAuthenticated = !!user && !!getAuthToken();


  const value = {
    user,
    login,
    loginWithSSO,
    logout,
    register,
    updateUser,
    isAuthenticated,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
