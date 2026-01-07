// API Configuration
export const API_URL = 'http://192.168.31.167:3001/api';
export const SOCKET_URL = 'http://192.168.31.167:3001';

// Stripe Configuration
// NOTE: Replace with your actual Stripe publishable key in production
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_your_stripe_publishable_key';

// Map Configuration
export const INITIAL_REGION = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Vehicle Types
export const VEHICLE_TYPES = [
  { id: 1, name: 'Economy', icon: '🚗', basePrice: 2.50 },
  { id: 2, name: 'Premium', icon: '🚙', basePrice: 3.50 },
  { id: 3, name: 'SUV', icon: '🚐', basePrice: 4.50 },
  { id: 4, name: 'Luxury', icon: '✨', basePrice: 6.00 },
];

// Trip Status
export const TRIP_STATUS = {
  REQUESTED: 'requested',
  ACCEPTED: 'accepted',
  ARRIVED: 'arrived',
  STARTED: 'started',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Theme Colors
export const COLORS = {
  primary: '#160832', //'#7C3AED',
  secondary: '#EC4899',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  dark: '#1F2937',
  light: '#F3F4F6',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#6B7280',
};
