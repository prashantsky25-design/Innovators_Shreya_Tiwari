const API_BASE = '/api';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('eventsphere_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('eventsphere_token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('eventsphere_token');
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
};

// Typed Service Helpers
export const api = {
  // Auth
  register: (body: any) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => apiFetch('/auth/me'),
  updateProfile: (body: any) => apiFetch('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),

  // Events
  getEvents: (params?: Record<string, any>) => {
    const query = new URLSearchParams(params || {}).toString();
    return apiFetch(`/events${query ? `?${query}` : ''}`);
  },
  getEvent: (identifier: string) => apiFetch(`/events/${identifier}`),
  createEvent: (body: any) => apiFetch('/events', { method: 'POST', body: JSON.stringify(body) }),
  updateEvent: (id: string, body: any) => apiFetch(`/events/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  getOrganizerEvents: () => apiFetch('/events/organizer/my-events'),
  getDomains: () => apiFetch('/events/domains'),

  // Registrations & Tickets
  registerForEvent: (body: { eventId: string; customAnswers?: any }) =>
    apiFetch('/registrations', { method: 'POST', body: JSON.stringify(body) }),
  getMyRegistrations: () => apiFetch('/registrations/my-registrations'),
  getEventRegistrations: (eventId: string) => apiFetch(`/registrations/event/${eventId}`),

  // Attendance & Check-in
  scanTicket: (body: { tokenOrCode: string; eventId?: string }) =>
    apiFetch('/attendance/scan', { method: 'POST', body: JSON.stringify(body) }),
  getAttendanceHistory: () => apiFetch('/attendance/my-history'),
  getLiveAttendance: (eventId: string) => apiFetch(`/attendance/event/${eventId}/live`),

  // Certificates
  getMyCertificates: () => apiFetch('/certificates/my-certificates'),
  verifyCertificate: (certificateId: string) => apiFetch(`/certificates/verify/${certificateId}`),
  saveCertificateTemplate: (body: any) => apiFetch('/certificates/templates', { method: 'POST', body: JSON.stringify(body) }),
  getTemplates: () => apiFetch('/certificates/templates'),

  // Galleries
  getGallery: (eventId: string) => apiFetch(`/gallery/event/${eventId}`),
  uploadGalleryPhoto: (eventId: string, formData: FormData) =>
    apiFetch(`/gallery/event/${eventId}/photos`, { method: 'POST', body: formData }),
  publishGallery: (eventId: string) => apiFetch(`/gallery/event/${eventId}/publish`, { method: 'POST' }),
  publishAlbum: (eventId: string) => apiFetch(`/gallery/event/${eventId}/publish`, { method: 'POST' }),

  // Rewards & Gamification
  getRewardsDashboard: () => apiFetch('/rewards/dashboard'),
  getLeaderboard: () => apiFetch('/rewards/leaderboard'),

  // Notifications
  getNotifications: () => apiFetch('/notifications'),
  markNotificationRead: (id: string) => apiFetch(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => apiFetch('/notifications/read-all', { method: 'PUT' }),

  // Admin
  getAdminMetrics: () => apiFetch('/admin/metrics'),
  getAdminUsers: () => apiFetch('/admin/users'),
  updateUserRole: (id: string, role: string) => apiFetch(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  moderateEvent: (id: string, body: any) => apiFetch(`/admin/events/${id}/moderate`, { method: 'PUT', body: JSON.stringify(body) }),
  createDomain: (body: any) => apiFetch('/admin/domains', { method: 'POST', body: JSON.stringify(body) }),
  getAuditLogs: () => apiFetch('/admin/audit-logs'),
  getEmailLogs: () => apiFetch('/admin/email-logs'),
};
