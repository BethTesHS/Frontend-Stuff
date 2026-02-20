// constants/apiEndpoints.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://homedapp1.azurewebsites.net';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },

  // Property endpoints
  PROPERTIES: {
    BASE: '/properties',
    CREATE: '/properties/create',
    CREATE_WITH_FILES: '/properties/create-with-files',
    MY_PROPERTIES: '/properties/my-properties',
    FEATURED: '/properties/featured',
    SEARCH: '/properties/search',
    UPDATE: (id: number) => `/properties/${id}/update`,
    UPLOAD_IMAGES: (id: number) => `/properties/${id}/upload-images`,
    SET_PRIMARY_IMAGE: (id: number, imageId: number) => `/properties/${id}/set-primary-image/${imageId}`,
    IMAGES: (id: number) => `/properties/${id}/images`,
    STATUS: (id: string) => `/properties/${id}/status`,
    AGENT_STATS: '/agent/stats',
    OWNER_STATS: '/my-properties/stats',
    OWNER_ACTIVITIES: '/owner/activities',
    TENANT_DASHBOARD: '/api/tenant/dashboard',
    AGENT_ACTIVITIES: '/api/agent/recent-activities',
  },

  // Profile endpoints
  PROFILES: {
    BASE: '/profiles',
    ME: '/profiles/me',
    SETUP: '/profiles/setup',
    SELECT_ROLE: '/profiles/select-role',
    CURRENT_ROLE: '/profiles/current-role',
    UPDATE: '/profiles/update',
    CHECK_COMPLETION: '/profiles/check-completion',
  },

  // Agent endpoints
  AGENTS: {
    BASE: '/api/agents',
    FEATURED: '/api/agents/featured',
    DETAILS: (id: number) => `/api/agents/${id}`,
    REVIEWS: (id: number) => `/api/agents/${id}/reviews`,
    INQUIRIES: (id: number) => `/api/agents/${id}/inquiries`,
    CONTACT: '/api/contact',
    HEALTH: '/api/health',
  },

  // Notification endpoints
  NOTIFICATIONS: {
    BASE: '/api/notifications',
    UNREAD_COUNT: '/api/notifications/unread-count',
    MARK_ALL_READ: '/api/notifications/mark-all-read',
    MARK_READ: (id: string) => `/api/notifications/${id}/read`,
    DELETE: (id: string) => `/api/notifications/${id}`,
    PREFERENCES: '/api/notification-preferences',
    TEST: '/notifications/test',
  },

  // External Tenant endpoints
  EXTERNAL_TENANT: {
    BASE: '/api/external-tenant',
    SETUP: '/api/external-tenant/setup',
    PROFILE: '/api/external-tenant/profile',
    UPDATE: '/api/external-tenant/update',
    CHECK_PROFILE: '/api/external-tenant/check-profile',
    DASHBOARD: '/api/external-tenant/dashboard',
    DASHBOARD_SUMMARY: '/api/external-tenant/dashboard/summary',
    RESEND_WELCOME: '/api/external-tenant/resend-welcome',
  },

  // Owner Dashboard endpoints
  OWNER: {
    REVENUE_STATS: '/api/properties/owner/revenue-stats',
    VIEWINGS: '/api/bookings/owner/viewings',
    VIEWING_DETAILS: (id: number) => `/api/bookings/owner/viewings/${id}`,
    CALENDAR_EVENTS: '/api/calendar/owner/events',
    CALENDAR_EVENT_DETAILS: (id: number) => `/api/calendar/owner/events/${id}`,
  },

  // Admin endpoints
  ADMIN: {
    LOGIN: '/admin/login',
    PROFILE: '/admin/profile',
    STATS: '/admin/dashboard/stats',
    LOGOUT: '/admin/logout',
    SESSIONS: '/admin/sessions',
    REVOKE_SESSION: (sessionId: string) => `/admin/sessions/${sessionId}`,
    DASHBOARD_MESSAGES: '/admin/dashboard/messages',
    DASHBOARD_CONVERSATIONS: '/admin/dashboard/conversations',
    DASHBOARD_SUMMARY: '/admin/dashboard/summary',
    CONVERSATION_MESSAGES: (conversationId: number) => `/admin/conversations/${conversationId}/messages`,
    SEND_MESSAGE: '/admin/messages',
    UPDATE_CONVERSATION_STATUS: (conversationId: number) => `/admin/conversations/${conversationId}/status`,
    UPLOAD_FILE: '/admin/upload-file',
    DOWNLOAD_FILE: (filename: string) => `/api/files/${filename}`,
    MESSAGING_STATS: '/admin/dashboard/stats',
    EXTERNAL_TENANT_PROFILE: (userId: string) => `/admin/external-tenants/${userId}`,
    // User management endpoints
    USERS: '/admin/users',
    SUSPEND_USER: (userId: string) => `/admin/users/${userId}/suspend`,
    UNSUSPEND_USER: (userId: string) => `/admin/users/${userId}/unsuspend`,
    
    TASKS: "/admin/tasks",
    TASK_ACTION: (taskId: string) => `/admin/tasks/${taskId}/action`,
  },

  BUYER: {
    DASHBOARD_STATS: '/api/buyer/dashboard/stats',
    VIEWINGS: '/api/buyer/viewings',
    VIEWING_DETAILS: (id: number) => `/api/buyer/viewings/${id}`,
    SAVED_PROPERTIES: '/api/buyer/saved-properties',
    SAVE_PROPERTY: '/api/buyer/saved-properties',
    UNSAVE_PROPERTY: (propertyId: number) => `/api/buyer/saved-properties/${propertyId}`,
    VIEWING_HISTORY: '/api/buyer/viewing-history',
    VIEWING_FEEDBACK: (viewingId: number) => `/api/buyer/viewing-history/${viewingId}/feedback`,
    CALENDAR_EVENTS: '/api/buyer/calendar/events',
    CALENDAR_EVENT_DETAILS: (id: number) => `/api/buyer/calendar/events/${id}`,
    MESSAGES: '/api/buyer/messages',
    CONVERSATION_MESSAGES: (conversationId: number) => `/api/buyer/messages/${conversationId}`,
    SEND_MESSAGE: (conversationId: number) => `/api/buyer/messages/${conversationId}`,
    START_CONVERSATION: '/api/buyer/messages/start',
    MARK_AS_READ: (conversationId: number) => `/api/buyer/messages/${conversationId}/mark-read`,
    CHAT: '/api/buyer/chat',
    NOTIFICATIONS: '/api/buyer/notifications',
    NOTIFICATIONS_UNREAD_COUNT: '/api/buyer/notifications/unread-count',
    NOTIFICATION_MARK_READ: (id: number) => `/api/buyer/notifications/${id}/mark-read`,
    NOTIFICATIONS_MARK_ALL_READ: '/api/buyer/notifications/mark-all-read',
    NOTIFICATION_DELETE: (id: number) => `/api/buyer/notifications/${id}`,
    PROFILE: '/api/buyer/profile',
    INQUIRIES: '/api/buyer/inquiries',
    RECOMMENDATIONS: '/api/buyer/recommendations',
    SPARE_ROOM_VIEWINGS: '/api/buyer/spare-room-viewings',
    SPARE_ROOM_VIEWING_DETAILS: (id: number) => `/api/buyer/spare-room-viewings/${id}`,
    INQUIRIES_UNIFIED: '/api/buyer/inquiries/unified',
    INQUIRY_UNIFIED_DETAILS: (id: number) => `/api/buyer/inquiries/unified/${id}`,
  },

  // Universal chat endpoint (for all user types)
  CHAT: '/api/buyer/chat',
} as const;

export { API_BASE_URL };