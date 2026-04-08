


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://api.homeduk.property';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    FORGOT_PASSWORD: '/auth/password/forget',
    RESET_PASSWORD: '/auth/password/reset',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },

  // Property endpoints
  PROPERTIES: {
    BASE: '/property',
    LIST: '/property/list',
    DETAIL: '/property',
    CREATE: '/property',
    MY_PROPERTIES: '/property/my',
    FEATURED: '/property/featured',
    SEARCH: '/property/search',
    DRAFT: '/property/draft',
    MARKET_COMPARISON: (id: string) => `/property/${id}/market-comparison`,
    ANALYSIS: (id: string) => `/property/${id}/analysis`,
    BOOST: (id: string) => `/property/${id}/boost`,
    UPDATE: '/property',
    STATUS: (id: string) => `/property/${id}/status`,
    AGENT_STATS: '/agent/stats',
    OWNER_STATS: '/my-properties/stats',
    OWNER_ACTIVITIES: '/owner/activities',
    TENANT_DASHBOARD: '/api/tenant/dashboard',
    AGENT_ACTIVITIES: '/api/agent/recent-activities',
  },

  // Property image endpoints
  PROPERTY_IMAGE: {
    LIST: '/property_image/list',             // GET    — paginated list; optional ?is_primary= filter
    DETAIL: '/property_image',                // GET    — single record by ?property_image_id=
    UPLOAD_URL: '/property_image/upload_url', // GET    — pre-signed S3 URL (?property_id=&filename=)
    CREATE: '/property_image',                // POST   — save metadata only (no file upload)
    UPLOAD: '/property_image/upload',         // POST   — multipart: property_id, image_id, file, is_primary, alt_text
    UPDATE: '/property_image',                // PUT    — update record (image_id, alt_text, is_primary, …)
    DELETE: '/property_image',                // DELETE — remove record by image_id
  },

  // Profile endpoints
  PROFILES: {
    BASE: '/profiles',
    ME: '/profiles/me',
    SETUP: '/user_profile',
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
    BASE: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_ALL_READ: '/notifications/mark-all-read',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    DELETE: (id: string) => `/notifications/${id}`,
    PREFERENCES: '/notification-preferences',
    TEST: '/notifications/test',
  },

  // External Tenant endpoints
  EXTERNAL_TENANT: {
    BASE: '/external_tenant', 
    SETUP: '/external_tenant/setup',
    PROFILE: '/external_tenant/profile',
    UPDATE: '/external_tenant/profile',
    CHECK_PROFILE: '/external-tenant/check-profile',
    DASHBOARD: '/external_tenant/dashboard',
    DASHBOARD_SUMMARY: '/api/external-tenant/dashboard/summary',
    RESEND_WELCOME: '/api/external-tenant/resend-welcome',
    // Complaints / maintenance
    COMPLAINTS: '/ext-complaints',
    COMPLAINT_DETAIL: (id: number) => `/ext-complaints/${id}`,
    // Calendar
    CALENDAR_EVENTS: '/ext-calendar/events',
    CALENDAR_EVENT: (id: number) => `/ext-calendar/events/${id}`,
    // Documents
    DOCUMENTS: '/ext-documents',
    DOCUMENT: (id: number) => `/ext-documents/${id}`,
    // History
    HISTORY: '/ext-history',
  },

  // Admin Messaging (support chat)
  ADMIN_MESSAGING: {
    CONVERSATIONS: '/admin-messaging/conversations',
    MESSAGES: (id: number) => `/admin-messaging/conversations/${id}/messages`,
    CLOSE: (id: number) => `/admin-messaging/conversations/${id}/close`,
    REOPEN: (id: number) => `/admin-messaging/conversations/${id}/reopen`,
    UNREAD_COUNT: '/admin-messaging/unread-count',
  },

  // Messaging Endpoints
  MESSAGING: {
    CONVERSATIONS: '/messaging/conversations',
    MESSAGES: (conversationId: number) => `/messaging/conversations/${conversationId}/messages`,
    SEND: '/messaging/send',
    REPLY: (conversationId: number) => `/messaging/conversations/${conversationId}/messages`, 
    CLOSE: (conversationId: number) => `/messaging/conversations/${conversationId}/close`,
    REOPEN: (conversationId: number) => `/messaging/conversations/${conversationId}/reopen`,
    UNREAD_COUNT: '/messaging/unread-count',
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
    LOGIN: '/auth/login',
    PROFILE: '/admin/me',
    STATS: '/admin/stats',
    CALENDAR_EVENTS: '/calendar_event/list',
    LOGOUT: '/admin_session/logout',
    SESSIONS: '/admin_session/list',
    REVOKE_SESSION: (sessionId: string) => `/admin_session?admin_session_id=${sessionId}`,
    SETTINGS_LIST: '/admin-settings/list',
    SETTINGS_BASE: '/admin-settings',
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
    USERS: '/auth/admin/users',
    SUSPEND_USER: (userId: string) => `/admin/users/${userId}/suspend`,
    UNSUSPEND_USER: (userId: string) => `/admin/users/${userId}/unsuspend`,
    
    TASKS: '/celery_tasks/list',
    TASKS_BASE: '/celery_tasks',
    TASK_TRIGGER: '/celery_tasks/trigger',
    TASK_REGISTERED: '/celery_tasks/registered',
    TASK_STATUS: (taskId: string) => `/celery_tasks/status/${taskId}`,

    ADMIN_BASE: '/admin/notifications',

    TENANT_VERIFICATION: {
      LIST: '/tenant_verification_request/list',
      GET_ITEM: (id: number) => `/tenant_verification_request/${id}`,
      UPDATE: '/tenant_verification_request',
      DELETE: '/tenant_verification_request',
    },

    HEALTH_CHECK: '/health-checker',
  },
  
  TENANT_VERIFICATION: {
    VALIDATE_PIN: '/tenant_verification/validate-pin',
    SUBMIT_REQUEST: '/tenant_verification/submit-request',
    MY_REQUESTS: '/tenant_verification/requests',
    APPROVE: (id: number) => `/tenant_verification/approve/${id}`,
    REJECT: (id: number) => `/tenant_verification/reject/${id}`,
    CREATE_PIN: '/tenant_verification/pins/create',
    GET_PINS: '/tenant_verification/pins',

    // New endpoints for the new tenant verification functional requirements by Ravi
    UPLOAD_DOCUMENT: '/tenant_verification/upload-document',
    CHECK_STATUS: '/tenant_verification/status',
    DELETE_DOCUMENT: (documentId: string) => `/tenant_verification/document/${documentId}`,
    HISTORY: '/tenant_verification/history',
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

  // Property Impression endpoints
  IMPRESSIONS: {
    RECORD: '/property/impression',
    PERFORMANCE: '/property/impressions/performance',
  },

  // Postcode endpoints
  POSTCODE: {
    LOOKUP: '/postcode',
    AUTOCOMPLETE: '/postcode/autocomplete',
    VALIDATE: '/postcode/validate',
    SEARCH_PLACES: '/postcode/search-places',
    LOCATIONS_AUTOCOMPLETE: '/postcode/locations/autocomplete',
  },
} as const;

export { API_BASE_URL };