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
    console.log('Token:', token);
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
  login: (email, password) => api.post('/v1/auth/login', { email, password }),
  register: (data) => api.post('/v1/auth/register', data),
  getProfile: () => api.get('/v1/auth/profile'),
};

export const driverAPI = {
  updateLocation: (location) => api.post('/v1/driver/location', location),
  updateStatus: (status) => api.put('/v1/driver/status', { status }),
  updateProfile: (data) => api.patch('/v1/driver/profile', data),
  getEarnings: (period) => api.get(`/v1/driver/earnings?period=${period}`),
  getTripHistory: () => api.get('/v1/driver/trips'),
  // Documents
  getDocuments: () => api.get('/v1/driver/documents'),
  uploadDocument: (formData) => api.post('/v1/driver/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteDocument: (type) => api.delete(`/v1/driver/documents/${type}`),
  // Vehicle
  getVehicle: () => api.get('/v1/driver/vehicles'),
  updateVehicle: (formData) => {
  console.log('Sending FormData:', formData);
  return api.post('/v1/driver/vehicles', formData, { 
    headers: { 
      'Content-Type': 'multipart/form-data' 
    } 
  });
  },
  // Bank Details
  getBankDetails: () => api.get('/v1/driver/bank-details'),
  updateBankDetails: (data) => api.put('/v1/driver/bank-details', data),
  deleteBankDetails: () => api.delete('/v1/driver/bank-details'),
  // Support
  getSupportTickets: () => api.get('/v1/driver/support/tickets'),
  createSupportTicket: (data) => api.post('/v1/driver/support/tickets', data),
  getSupportTicket: (id) => api.get(`/v1/driver/support/tickets/${id}`),
  addTicketMessage: (id, message) => api.post(`/v1/driver/support/tickets/${id}/messages`, { message }),
  // Referrals
  getReferralInfo: () => api.get('/v1/driver/referrals'),
  getReferralHistory: () => api.get('/v1/driver/referrals/history'),
  sendReferralInvite: (data) => api.post('/v1/driver/referrals/invite', data),
};

export const tripAPI = {
  acceptTrip: (tripId) => api.post(`/v1/trips/${tripId}/accept`),
  rejectTrip: (tripId) => api.post(`/v1/trips/${tripId}/reject`),
  startTrip: (tripId) => api.post(`/v1/trips/${tripId}/start`),
  completeTrip: (tripId) => api.post(`/v1/trips/${tripId}/complete`),
  updateTripStatus: (tripId, status) => api.put(`/v1/trips/${tripId}/status`, { status }),
  getActiveTrip: () => api.get('/v1/driver/active-trip'),
};

export default api;
