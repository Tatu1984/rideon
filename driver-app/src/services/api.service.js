import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from "expo-constants";

const inProduction = process.env.NODE_ENV === "production";
const inExpo = Constants.expoConfig && Constants.expoConfig.hostUri;
const inBrowser = typeof document !== "undefined";
const apiDomain = inProduction
  ? "rideon.example.com"
  : inExpo
  ? `${Constants.expoConfig.hostUri.split(`:`).shift()}:3001/api`
  : inBrowser
  ? `${document.location.hostname}:3001/api`
  : "localhost:3001/api";

const protocol = inProduction ? "https" : "http";

const apiUrl = `${protocol}://${apiDomain}`;

const api = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
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
};

export const tripAPI = {
  acceptTrip: (tripId) => api.post(`/trips/${tripId}/accept`),
  rejectTrip: (tripId) => api.post(`/trips/${tripId}/reject`),
  startTrip: (tripId) => api.post(`/trips/${tripId}/start`),
  completeTrip: (tripId) => api.post(`/trips/${tripId}/complete`),
  getActiveTrip: () => api.get('/driver/active-trip'),
};

export default api;
