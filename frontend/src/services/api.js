import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  addFamilyMember: (data) => api.post('/auth/family-members', data),
  removeFamilyMember: (id) => api.delete(`/auth/family-members/${id}`),
};

// Service Requests
export const serviceAPI = {
  create: (data) => api.post('/service-requests', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMyRequests: (params) => api.get('/service-requests/my', { params }),
  getAll: (params) => api.get('/service-requests', { params }),
  getById: (id) => api.get(`/service-requests/${id}`),
  updateStatus: (id, data) => api.put(`/service-requests/${id}/status`, data),
  confirmService: (id, data) => api.put(`/service-requests/${id}/confirm`, data),
  submitFeedback: (id, data) => api.post(`/service-requests/${id}/feedback`, data),
  emergencySOS: (data) => api.post('/service-requests/emergency/sos', data),
};

// Admin
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getResidents: (params) => api.get('/admin/residents', { params }),
  getPersonnel: (params) => api.get('/admin/personnel', { params }),
  addPersonnel: (data) => api.post('/admin/personnel', data),
  updatePersonnel: (id, data) => api.put(`/admin/personnel/${id}`, data),
  assignPersonnel: (data) => api.post('/admin/assign', data),
  createAnnouncement: (data) => api.post('/admin/announcements', data),
  getAnnouncements: () => api.get('/admin/announcements'),
  setMaintenanceFee: (data) => api.post('/admin/maintenance-fees', data),
  getMaintenanceFees: () => api.get('/admin/maintenance-fees'),
};

// Staff
export const staffAPI = {
  getMyTasks: (params) => api.get('/staff/tasks', { params }),
  updateTaskStatus: (id, data) => api.put(`/staff/tasks/${id}/status`, data),
  uploadProof: (id, data) => api.post(`/staff/tasks/${id}/proof`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// Payments
export const paymentAPI = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verifyPayment: (data) => api.post('/payments/verify', data),
  getMyPayments: (params) => api.get('/payments/my', { params }),
  getAllPayments: (params) => api.get('/payments', { params }),
  recordOffline: (data) => api.post('/payments/offline', data),
};

// Visitors
export const visitorAPI = {
  register: (data) => api.post('/visitors', data),
  getMyVisitors: () => api.get('/visitors/my'),
  getAll: (params) => api.get('/visitors', { params }),
  checkIn: (id) => api.put(`/visitors/${id}/check-in`),
  checkOut: (id) => api.put(`/visitors/${id}/check-out`),
};

// Notifications
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

// Chatbot
export const chatbotAPI = {
  chat: (message) => api.post('/chatbot', { message }),
};

export default api;
