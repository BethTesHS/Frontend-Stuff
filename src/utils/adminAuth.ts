import { getAdminToken as _getAdminToken, getAdminProfile as _getAdminProfile, tokenStorage } from './tokenStorage';

export const getAdminToken = (): string | null => {
  return _getAdminToken();
};

export const getAdminProfile = () => {
  return _getAdminProfile();
};

export const isAdminAuthenticated = (): boolean => {
  return !!getAdminToken() && !!getAdminProfile();
};

export const clearAdminAuth = () => {
  tokenStorage.removeItem('admin_token');
  tokenStorage.removeItem('admin_profile');
};
