export const getAdminToken = (): string | null => {
  return localStorage.getItem('admin_token');
};

export const getAdminProfile = () => {
  const adminData = localStorage.getItem('admin_profile');
  return adminData ? JSON.parse(adminData) : null;
};

export const isAdminAuthenticated = (): boolean => {
  return !!getAdminToken() && !!getAdminProfile();
};

export const clearAdminAuth = () => {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_profile');
};
