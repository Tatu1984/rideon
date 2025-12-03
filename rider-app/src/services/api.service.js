import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/constants';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
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
      await AsyncStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (email, password) => api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/rider/profile'),
  updateProfile: (data) => api.patch('/rider/profile', data),
};

// Trip APIs
export const tripAPI = {
  estimate: (pickupLocation, dropoffLocation, vehicleType) =>
    api.post('/rider/trips/estimate', { pickupLocation, dropoffLocation, vehicleType }),
  createTrip: (tripData) => api.post('/rider/trips', tripData),
  getActiveTrip: () => api.get('/rider/active-trip'),
  getTripHistory: () => api.get('/rider/trips'),
  getTripDetails: (tripId) => api.get(`/rider/trips/${tripId}`),
  cancelTrip: (tripId, reason) => api.post(`/rider/trips/${tripId}/cancel`, { reason }),
  rateTrip: (tripId, rating, review, tip) =>
    api.post(`/rider/trips/${tripId}/rate`, { rating, review, tip }),
};

// Wallet APIs
export const walletAPI = {
  getBalance: () => api.get('/rider/wallet'),
  addMoney: (amount, paymentMethod) => api.post('/rider/wallet/add', { amount, paymentMethod }),
  getTransactions: () => api.get('/rider/wallet/transactions'),
};

// Coupon APIs
export const couponAPI = {
  apply: (code) => api.post('/rider/coupons/apply', { code }),
  getAvailable: () => api.get('/rider/coupons'),
};

// Support APIs
export const supportAPI = {
  createTicket: (subject, message, tripId) =>
    api.post('/rider/support', { subject, message, tripId }),
  getTickets: () => api.get('/rider/support'),
  reportLostItem: (tripId, description) =>
    api.post('/rider/lost-items', { tripId, description }),
};

// Emergency/SOS APIs
export const emergencyAPI = {
  triggerSOS: (tripId, location) => api.post('/rider/sos', { tripId, location }),
  shareTrip: (tripId, contacts) => api.post('/rider/share-trip', { tripId, contacts }),
};

export default api;
