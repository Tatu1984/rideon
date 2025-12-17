import axios from 'axios';
import Constants from "expo-constants";
import SecureStorageService from './secureStorage.service';

// Production API URL - update this with your actual Vercel backend URL after deployment
const PRODUCTION_API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://rideon-api.vercel.app';

const inProduction = process.env.NODE_ENV === "production";
const inExpo = Constants.expoConfig && Constants.expoConfig.hostUri;
const inBrowser = typeof document !== "undefined";

// Get API URL based on environment
const getApiUrl = () => {
  // Use environment variable if set
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Production mode
  if (inProduction) {
    return PRODUCTION_API_URL;
  }

  // Development mode - connect to local backend
  if (inExpo && Constants.expoConfig?.hostUri) {
    const localIp = Constants.expoConfig.hostUri.split(':')[0];
    return `http://${localIp}:3001/api`;
  }

  if (inBrowser) {
    return `http://${document.location.hostname}:3001/api`;
  }

  return 'http://localhost:3001/api';
};

const apiUrl = getApiUrl();

const api = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests from secure storage
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStorageService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear tokens on unauthorized response
      await SecureStorageService.clearTokens();
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/driver/login', { email, password }),
  register: (data) => api.post('/auth/driver/register', data),
  getProfile: () => api.get('/driver/profile'),
};

export const driverAPI = {
  updateLocation: (location) => api.post('/driver/location', location),
  updateStatus: (status) => api.patch('/driver/status', { status }),
  updateProfile: (data) => api.patch('/driver/profile', data),
  getEarnings: (period) => api.get(`/driver/earnings?period=${period}`),
  getTripHistory: () => api.get('/driver/trips'),
  // Documents
  getDocuments: () => api.get('/driver/documents'),
  uploadDocument: (formData) => api.post('/driver/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteDocument: (type) => api.delete(`/driver/documents/${type}`),
  // Vehicle
  getVehicle: () => api.get('/driver/vehicle'),
  updateVehicle: (formData) => api.post('/driver/vehicle', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  // Bank Details
  getBankDetails: () => api.get('/driver/bank-details'),
  updateBankDetails: (data) => api.post('/driver/bank-details', data),
  deleteBankDetails: () => api.delete('/driver/bank-details'),
  // Support
  getSupportTickets: () => api.get('/driver/support/tickets'),
  createSupportTicket: (data) => api.post('/driver/support/tickets', data),
  getSupportTicket: (id) => api.get(`/driver/support/tickets/${id}`),
  addTicketMessage: (id, message) => api.post(`/driver/support/tickets/${id}/messages`, { message }),
  // Referrals
  getReferralInfo: () => api.get('/driver/referrals'),
  getReferralHistory: () => api.get('/driver/referrals/history'),
  sendReferralInvite: (data) => api.post('/driver/referrals/invite', data),
};

export const tripAPI = {
  acceptTrip: (tripId) => api.post(`/trips/${tripId}/accept`),
  rejectTrip: (tripId) => api.post(`/trips/${tripId}/reject`),
  startTrip: (tripId) => api.post(`/trips/${tripId}/start`),
  completeTrip: (tripId) => api.post(`/trips/${tripId}/complete`),
  updateTripStatus: (tripId, status) => api.put(`/trips/${tripId}/status`, { status }),
  getActiveTrip: () => api.get('/driver/active-trip'),
};

export default api;
