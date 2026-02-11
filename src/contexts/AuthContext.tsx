import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { authApi } from '@/services/api';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://homedapp1.azurewebsites.net/api';

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
            localStorage.setItem('auth_token', access_token);
            if (refresh_token) {
              localStorage.setItem('refresh_token', refresh_token);
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
        const token = localStorage.getItem('auth_token');
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
                  localStorage.setItem('auth_token', access_token);
                  if (refresh_token) {
                    localStorage.setItem('refresh_token', refresh_token);
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
      const token = localStorage.getItem('auth_token');
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
                localStorage.setItem('auth_token', access_token);
                if (refresh_token) {
                  localStorage.setItem('refresh_token', refresh_token);
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
        const token = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('homedUser');

        let initialUser: User | null = null;
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            initialUser = parsedUser;
            setUser(parsedUser);
          } catch (e) {
            localStorage.removeItem('homedUser');
          }
        }

        if (token) {
          // Check if token is expired before making the request
          const expirationTime = getTokenExpirationTime(token);
          if (expirationTime && expirationTime < Date.now()) {
            console.log('Token expired during initialization, clearing auth data');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('homedUser');
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

              // Check tenant dashboard status if user is a tenant
              if (user.role === 'tenant') {
                try {
                  // First check external tenant
                  const externalCheckResponse = await fetch(`${API_BASE_URL}/external-tenant/check-profile`, {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  });

                  if (externalCheckResponse.ok) {
                    const externalCheckData = await externalCheckResponse.json();
                    if (externalCheckData.success) {
                      const { has_external_profile, profile_complete } = externalCheckData.data;

                      if (has_external_profile && profile_complete) {
                        // External tenant with complete profile - mark as verified
                        user.tenantVerified = true;
                        user.isPlatformTenant = false;
                        user.manualVerificationStatus = 'verified';
                      }
                    }
                  }

                  // If not external tenant, check internal tenant dashboard (platform tenant)
                  if (!user.tenantVerified) {
                    user.isPlatformTenant = true;

                    const dashboardResponse = await fetch(`${API_BASE_URL}/tenant/dashboard`, {
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      }
                    });

                    if (dashboardResponse.ok) {
                      const dashboardData = await dashboardResponse.json();
                      if (dashboardData.success && dashboardData.data?.status === 'active') {
                        // Platform tenant with active property - verified
                        user.tenantVerified = true;
                        user.manualVerificationStatus = 'verified';
                      } else {
                        // Platform tenant but no active property yet
                        user.tenantVerified = false;
                        user.manualVerificationStatus = 'not_started';
                      }
                    } else if (dashboardResponse.status === 401 || dashboardResponse.status === 403) {
                      // Platform tenant hasn't completed verification yet - allow dashboard access
                      console.log('Platform tenant not verified yet - allowing dashboard access');
                      user.tenantVerified = false;
                      user.manualVerificationStatus = 'not_started';
                    }
                  }
                } catch (error) {
                  // If checks fail, default to unverified platform tenant
                  if (user.isPlatformTenant === undefined) {
                    user.isPlatformTenant = true;
                    user.tenantVerified = false;
                    user.manualVerificationStatus = 'not_started';
                  }
                }
              }

              setUser(user);
              localStorage.setItem('homedUser', JSON.stringify(user));

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
              localStorage.removeItem('auth_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('homedUser');
              setUser(null);
            }
          }
        }
      } catch (error) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('homedUser');
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

        localStorage.setItem('auth_token', access_token);
        if (refresh_token) {
          localStorage.setItem('refresh_token', refresh_token);
        }

        const user: User = {
          id: userData.id?.toString() || '',
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
        localStorage.setItem('homedUser', JSON.stringify(user));

        // Schedule automatic token refresh after login
        scheduleTokenRefresh(access_token);

        let shouldRedirectTo = '/select-role';

        try {
          if (user.role === 'tenant') {
            try {
              const externalCheckResponse = await fetch(`${API_BASE_URL}/external-tenant/check-profile`, {
                headers: {
                  'Authorization': `Bearer ${access_token}`,
                  'Content-Type': 'application/json'
                }
              });

              if (externalCheckResponse.ok) {
                const externalCheckData = await externalCheckResponse.json();

                if (externalCheckData.success) {
                  const { has_external_profile, profile_complete } = externalCheckData.data;

                  if (has_external_profile && profile_complete) {
                    shouldRedirectTo = '/external-tenant-dashboard';
                    const updatedUser = {
                      ...user,
                      tenantVerified: true,
                      isPlatformTenant: false,
                      manualVerificationStatus: 'verified' as const
                    };
                    setUser(updatedUser);
                    localStorage.setItem('homedUser', JSON.stringify(updatedUser));
                  } else if (has_external_profile) {
                    shouldRedirectTo = '/select-role';
                  } else {
                    // Platform tenant - check if they have active property
                    try {
                      const dashboardResponse = await fetch(`${API_BASE_URL}/tenant/dashboard`, {
                        headers: {
                          'Authorization': `Bearer ${access_token}`,
                          'Content-Type': 'application/json'
                        }
                      });

                      if (dashboardResponse.ok) {
                        const dashboardData = await dashboardResponse.json();

                        if (dashboardData.success && dashboardData.data?.status === 'active') {
                          // Verified platform tenant with active property
                          shouldRedirectTo = '/tenant-dashboard';
                          const updatedUser = {
                            ...user,
                            tenantVerified: true,
                            isPlatformTenant: true,
                            manualVerificationStatus: 'verified' as const
                          };
                          setUser(updatedUser);
                          localStorage.setItem('homedUser', JSON.stringify(updatedUser));
                        } else {
                          // Platform tenant without verification - still allow dashboard access
                          shouldRedirectTo = '/tenant-dashboard';
                          const updatedUser = {
                            ...user,
                            tenantVerified: false,
                            isPlatformTenant: true,
                            manualVerificationStatus: 'not_started' as const
                          };
                          setUser(updatedUser);
                          localStorage.setItem('homedUser', JSON.stringify(updatedUser));
                        }
                      } else if (dashboardResponse.status === 401 || dashboardResponse.status === 403) {
                        // Platform tenant not verified yet - allow dashboard access
                        console.log('Platform tenant not verified yet - allowing dashboard access');
                        shouldRedirectTo = '/tenant-dashboard';
                        const updatedUser = {
                          ...user,
                          tenantVerified: false,
                          isPlatformTenant: true,
                          manualVerificationStatus: 'not_started' as const
                        };
                        setUser(updatedUser);
                        localStorage.setItem('homedUser', JSON.stringify(updatedUser));
                      }
                    } catch (internalError) {
                      // Error checking platform tenant - default to allowing dashboard access
                      console.log('Platform tenant check error - allowing dashboard access');
                      shouldRedirectTo = '/tenant-dashboard';
                      const updatedUser = {
                        ...user,
                        tenantVerified: false,
                        isPlatformTenant: true,
                        manualVerificationStatus: 'not_started' as const
                      };
                      setUser(updatedUser);
                      localStorage.setItem('homedUser', JSON.stringify(updatedUser));
                    }
                  }
                }
              } else {
                // External check failed - assume platform tenant
                try {
                  const dashboardResponse = await fetch(`${API_BASE_URL}/tenant/dashboard`, {
                    headers: {
                      'Authorization': `Bearer ${access_token}`,
                      'Content-Type': 'application/json'
                    }
                  });

                  if (dashboardResponse.ok) {
                    const dashboardData = await dashboardResponse.json();

                    if (dashboardData.success && dashboardData.data?.status === 'active') {
                      shouldRedirectTo = '/tenant-dashboard';
                      const updatedUser = {
                        ...user,
                        tenantVerified: true,
                        isPlatformTenant: true,
                        manualVerificationStatus: 'verified' as const
                      };
                      setUser(updatedUser);
                      localStorage.setItem('homedUser', JSON.stringify(updatedUser));
                    } else {
                      // Platform tenant without verification - allow dashboard access
                      shouldRedirectTo = '/tenant-dashboard';
                      const updatedUser = {
                        ...user,
                        tenantVerified: false,
                        isPlatformTenant: true,
                        manualVerificationStatus: 'not_started' as const
                      };
                      setUser(updatedUser);
                      localStorage.setItem('homedUser', JSON.stringify(updatedUser));
                    }
                  } else if (dashboardResponse.status === 401 || dashboardResponse.status === 403) {
                    // Platform tenant not verified - allow dashboard access
                    console.log('Platform tenant not verified, allowing dashboard access');
                    shouldRedirectTo = '/tenant-dashboard';
                    const updatedUser = {
                      ...user,
                      tenantVerified: false,
                      isPlatformTenant: true,
                      manualVerificationStatus: 'not_started' as const
                    };
                    setUser(updatedUser);
                    localStorage.setItem('homedUser', JSON.stringify(updatedUser));
                  }
                } catch (internalError) {
                  console.log('Internal tenant check error during login:', internalError);
                  // Default to allowing dashboard access
                  shouldRedirectTo = '/tenant-dashboard';
                  const updatedUser = {
                    ...user,
                    tenantVerified: false,
                    isPlatformTenant: true,
                    manualVerificationStatus: 'not_started' as const
                  };
                  setUser(updatedUser);
                  localStorage.setItem('homedUser', JSON.stringify(updatedUser));
                }
              }
            } catch (externalError) {
              console.log('External tenant check error during login:', externalError);
              // Default to allowing dashboard access
              shouldRedirectTo = '/tenant-dashboard';
              const updatedUser = {
                ...user,
                tenantVerified: false,
                isPlatformTenant: true,
                manualVerificationStatus: 'not_started' as const
              };
              setUser(updatedUser);
              localStorage.setItem('homedUser', JSON.stringify(updatedUser));
            }

          } else if (user.role === 'agent') {
            shouldRedirectTo = user.profileComplete ? '/agent-dashboard' : '/profile-setup';
          } else if (user.role === 'owner' || user.role === 'manager') {
            shouldRedirectTo = user.profileComplete ? '/owner-dashboard' : '/profile-setup';
          } else if (user.role) {
            shouldRedirectTo = '/dashboard';
          }
        } catch (error) {
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
      localStorage.setItem('auth_token', access_token);
      if (refresh_token) {
        localStorage.setItem('refresh_token', refresh_token);
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
      localStorage.setItem('homedUser', JSON.stringify(user));

      // Schedule automatic token refresh
      scheduleTokenRefresh(access_token);

      // Handle tenant verification checks if needed
      let shouldRedirectTo = '/select-role';

      try {
        if (user.role === 'tenant') {
          try {
            const externalCheckResponse = await fetch(`${API_BASE_URL}/external-tenant/check-profile`, {
              headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
              }
            });

            if (externalCheckResponse.ok) {
              const externalCheckData = await externalCheckResponse.json();

              if (externalCheckData.success) {
                const { has_external_profile, profile_complete } = externalCheckData.data;

                if (has_external_profile && profile_complete) {
                  shouldRedirectTo = '/external-tenant-dashboard';
                  const updatedUser = {
                    ...user,
                    tenantVerified: true,
                    isPlatformTenant: false,
                    manualVerificationStatus: 'verified' as const
                  };
                  setUser(updatedUser);
                  localStorage.setItem('homedUser', JSON.stringify(updatedUser));
                } else if (has_external_profile) {
                  shouldRedirectTo = '/select-role';
                } else {
                  // Platform tenant - check if they have active property
                  try {
                    const dashboardResponse = await fetch(`${API_BASE_URL}/tenant/dashboard`, {
                      headers: {
                        'Authorization': `Bearer ${access_token}`,
                        'Content-Type': 'application/json'
                      }
                    });

                    if (dashboardResponse.ok) {
                      const dashboardData = await dashboardResponse.json();

                      if (dashboardData.success && dashboardData.data?.status === 'active') {
                        shouldRedirectTo = '/tenant-dashboard';
                        const updatedUser = {
                          ...user,
                          tenantVerified: true,
                          isPlatformTenant: true,
                          manualVerificationStatus: 'verified' as const
                        };
                        setUser(updatedUser);
                        localStorage.setItem('homedUser', JSON.stringify(updatedUser));
                      } else {
                        shouldRedirectTo = '/tenant-dashboard';
                        const updatedUser = {
                          ...user,
                          tenantVerified: false,
                          isPlatformTenant: true,
                          manualVerificationStatus: 'not_started' as const
                        };
                        setUser(updatedUser);
                        localStorage.setItem('homedUser', JSON.stringify(updatedUser));
                      }
                    } else if (dashboardResponse.status === 401 || dashboardResponse.status === 403) {
                      shouldRedirectTo = '/tenant-dashboard';
                      const updatedUser = {
                        ...user,
                        tenantVerified: false,
                        isPlatformTenant: true,
                        manualVerificationStatus: 'not_started' as const
                      };
                      setUser(updatedUser);
                      localStorage.setItem('homedUser', JSON.stringify(updatedUser));
                    }
                  } catch (internalError) {
                    shouldRedirectTo = '/tenant-dashboard';
                    const updatedUser = {
                      ...user,
                      tenantVerified: false,
                      isPlatformTenant: true,
                      manualVerificationStatus: 'not_started' as const
                    };
                    setUser(updatedUser);
                    localStorage.setItem('homedUser', JSON.stringify(updatedUser));
                  }
                }
              }
            } else {
              // External check failed - assume platform tenant
              try {
                const dashboardResponse = await fetch(`${API_BASE_URL}/tenant/dashboard`, {
                  headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'Content-Type': 'application/json'
                  }
                });

                if (dashboardResponse.ok) {
                  const dashboardData = await dashboardResponse.json();

                  if (dashboardData.success && dashboardData.data?.status === 'active') {
                    shouldRedirectTo = '/tenant-dashboard';
                    const updatedUser = {
                      ...user,
                      tenantVerified: true,
                      isPlatformTenant: true,
                      manualVerificationStatus: 'verified' as const
                    };
                    setUser(updatedUser);
                    localStorage.setItem('homedUser', JSON.stringify(updatedUser));
                  } else {
                    shouldRedirectTo = '/tenant-dashboard';
                    const updatedUser = {
                      ...user,
                      tenantVerified: false,
                      isPlatformTenant: true,
                      manualVerificationStatus: 'not_started' as const
                    };
                    setUser(updatedUser);
                    localStorage.setItem('homedUser', JSON.stringify(updatedUser));
                  }
                } else if (dashboardResponse.status === 401 || dashboardResponse.status === 403) {
                  shouldRedirectTo = '/tenant-dashboard';
                  const updatedUser = {
                    ...user,
                    tenantVerified: false,
                    isPlatformTenant: true,
                    manualVerificationStatus: 'not_started' as const
                  };
                  setUser(updatedUser);
                  localStorage.setItem('homedUser', JSON.stringify(updatedUser));
                }
              } catch (internalError) {
                shouldRedirectTo = '/tenant-dashboard';
                const updatedUser = {
                  ...user,
                  tenantVerified: false,
                  isPlatformTenant: true,
                  manualVerificationStatus: 'not_started' as const
                };
                setUser(updatedUser);
                localStorage.setItem('homedUser', JSON.stringify(updatedUser));
              }
            }
          } catch (externalError) {
            shouldRedirectTo = '/tenant-dashboard';
            const updatedUser = {
              ...user,
              tenantVerified: false,
              isPlatformTenant: true,
              manualVerificationStatus: 'not_started' as const
            };
            setUser(updatedUser);
            localStorage.setItem('homedUser', JSON.stringify(updatedUser));
          }

        } else if (user.role === 'agent') {
          shouldRedirectTo = user.profileComplete ? '/agent-dashboard' : '/profile-setup';
        } else if (user.role === 'owner' || user.role === 'manager') {
          shouldRedirectTo = user.profileComplete ? '/owner-dashboard' : '/profile-setup';
        } else if (user.role) {
          shouldRedirectTo = '/dashboard';
        }
      } catch (error) {
        console.error('Error during SSO login redirect logic:', error);
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

      // Immediately clear all auth state
      const keysToRemove = ['auth_token', 'refresh_token', 'homedUser'];

      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('profileDraft_')) {
          keysToRemove.push(key);
        }
      });

      keysToRemove.forEach(key => localStorage.removeItem(key));

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
      if (value !== "" && value !== undefined && value !== null && value !== false) {
        if (typeof value === 'string' && value.trim() === '') {
          return;
        }
        cleanedUserData[key] = value;
      }
    });

    const updatedUser = { ...user, ...cleanedUserData };
    setUser(updatedUser);
    localStorage.setItem('homedUser', JSON.stringify(updatedUser));
  };

  const isAuthenticated = !!user && !!localStorage.getItem('auth_token');

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

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
