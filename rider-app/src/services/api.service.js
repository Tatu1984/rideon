import axios from 'axios';
import Constants from "expo-constants";
import SecureStorageService from './secureStorage.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Production API URL - your Vercel backend
const PRODUCTION_API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://rideon-backend.vercel.app/api';

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
  baseURL: `https://rideon-backend-green.vercel.app/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token from secure storage
api.interceptors.request.use(async (config) => {
  const isAuthRoute =
    config.url?.includes('/auth/login') ||
    config.url?.includes('/auth/register');

  if (!isAuthRoute) {
    const token = await SecureStorageService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});
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

// Payment APIs
export const paymentAPI = {
  // Payment intent for Stripe
  createPaymentIntent: (tripId, amount, paymentMethod) =>
    api.post('/payments/intent', { tripId, amount, paymentMethod }),
  confirmPayment: (tripId, paymentIntentId, paymentMethod) =>
    api.post('/payments/confirm', { tripId, paymentIntentId, paymentMethod }),
  getPaymentHistory: (page = 1, limit = 20) =>
    api.get(`/payments/history?page=${page}&limit=${limit}`),
  requestRefund: (paymentId, reason) =>
    api.post('/payments/refund', { paymentId, reason }),
  // Payment methods (cards)
  getSavedCards: () => api.get('/rider/payment-methods'),
  addCard: (cardToken) => api.post('/rider/payment-methods', { cardToken }),
  deleteCard: (cardId) => api.delete(`/rider/payment-methods/${cardId}`),
  setDefaultCard: (cardId) => api.patch(`/rider/payment-methods/${cardId}/default`),
  // Stripe setup for adding new cards
  getSetupIntent: () => api.post('/rider/payment-methods/setup-intent'),
};

export default api;
