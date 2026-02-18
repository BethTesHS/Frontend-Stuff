const SENSITIVE_KEYS = [
  'auth_token',
  'refresh_token',
  'homedUser',
  'admin_token',
  'admin_profile',
  'agencyToken',
  'agencyData',
  'user',
] as const;

type SensitiveKey = typeof SENSITIVE_KEYS[number];

export const tokenStorage = {
  getItem(key: SensitiveKey): string | null {
    return sessionStorage.getItem(key);
  },
  setItem(key: SensitiveKey, value: string): void {
    sessionStorage.setItem(key, value);
  },
  removeItem(key: SensitiveKey): void {
    sessionStorage.removeItem(key);
  },
  clearAllAuth(): void {
    SENSITIVE_KEYS.forEach(key => sessionStorage.removeItem(key));
  },
};

// Main auth helpers
export const getAuthToken = () => tokenStorage.getItem('auth_token');
export const setAuthToken = (token: string) => tokenStorage.setItem('auth_token', token);
export const getRefreshToken = () => tokenStorage.getItem('refresh_token');
export const setRefreshToken = (token: string) => tokenStorage.setItem('refresh_token', token);

export const getHomedUser = (): any | null => {
  const raw = tokenStorage.getItem('homedUser');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};
export const setHomedUser = (user: any) =>
  tokenStorage.setItem('homedUser', JSON.stringify(user));

// Admin auth helpers
export const getAdminToken = () => tokenStorage.getItem('admin_token');
export const setAdminToken = (token: string) => tokenStorage.setItem('admin_token', token);

export const getAdminProfile = (): any | null => {
  const raw = tokenStorage.getItem('admin_profile');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};
export const setAdminProfile = (profile: any) =>
  tokenStorage.setItem('admin_profile', JSON.stringify(profile));

// Agency auth helpers
export const getAgencyToken = () => tokenStorage.getItem('agencyToken');
export const setAgencyToken = (token: string) => tokenStorage.setItem('agencyToken', token);

export const getAgencyData = (): any | null => {
  const raw = tokenStorage.getItem('agencyData');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};
export const setAgencyData = (data: any) =>
  tokenStorage.setItem('agencyData', JSON.stringify(data));

export const getAgencyUser = (): any | null => {
  const raw = tokenStorage.getItem('user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};
export const setAgencyUser = (user: any) =>
  tokenStorage.setItem('user', JSON.stringify(user));

/**
 * One-time migration: move existing tokens from localStorage to sessionStorage.
 * Called at app startup to prevent forcing existing users to re-login after this update.
 */
export const migrateFromLocalStorage = (): void => {
  SENSITIVE_KEYS.forEach(key => {
    const value = localStorage.getItem(key);
    if (value && !sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, value);
      localStorage.removeItem(key);
    }
  });
};
