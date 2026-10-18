import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Attach JWT token from localStorage to every outgoing request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const login = (credentials) => API.post('/auth/login', credentials);
export const register = (userData) => API.post('/auth/register', userData);
export const getMe = () => API.get('/auth/me');

// Resource API
export const getResources = (params) => API.get('/resources', { params });
export const getResourceById = (id) => API.get(`/resources/${id}`);
export const createResource = (data) => API.post('/resources', data);
export const updateResource = (id, data) => API.patch(`/resources/${id}`, data);
export const checkAvailability = (id, params) => API.get(`/resources/${id}/availability`, { params });
export const getRecommendations = (params) => API.get('/resources/recommendations', { params });

// Booking API
export const getBookings = (params) => API.get('/bookings', { params });
export const createBooking = (data) => API.post('/bookings', data);
export const cancelBooking = (id) => API.patch(`/bookings/${id}/cancel`);
export const decideBooking = (id, data) => API.patch(`/bookings/${id}/decision`, data);

// Maintenance API
export const getTickets = (params) => API.get('/maintenance', { params });
export const createTicket = (data) => API.post('/maintenance', data);
export const updateTicket = (id, data) => API.patch(`/maintenance/${id}`, data);

// Analytics API
export const getAnalyticsOverview = () => API.get('/analytics/overview');

// Notifications API
export const getNotifications = () => API.get('/notifications');
export const markNotificationRead = (id) => API.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => API.patch('/notifications/read-all');

// User Management & Audit Logs (Admin)
export const getAllUsers = () => API.get('/users');
export const updateUserRole = (id, data) => API.patch(`/users/${id}/role`, data);
export const getAuditLogs = (params) => API.get('/audit-logs', { params });

export default API;
