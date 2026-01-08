import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from "expo-constants";
import SecureStorageService from './secureStorage.service';

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
    return `http://${localIp}:3001`;
  }

  if (inBrowser) {
    return `http://${document.location.hostname}:3001`;
  }

  return 'http://localhost:3001';
};

const SOCKET_URL = getApiUrl();

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
  }

  async connect() {
    if (this.socket && this.connected) {
      return this.socket;
    }

    const token = await SecureStorageService.getAccessToken();
    console.log('🔌 Socket token:', token ? 'exists' : 'missing');
    console.log('🔌 Socket URL:', SOCKET_URL);
    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.socket.on('connect', () => {
      console.log('✅ Driver socket connected:', this.socket.id);
      this.connected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Driver socket disconnected:', reason);
      this.connected = false;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Driver socket reconnected after', attemptNumber, 'attempts');
      this.connected = true;
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Driver socket reconnecting... attempt:', attemptNumber);
      this.reconnectAttempts = attemptNumber;
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Driver socket reconnection failed');
      this.connected = false;
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  isConnected() {
    return this.connected && this.socket?.connected;
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  emit(event, data) {
    if (this.socket && this.connected) {
      this.socket.emit(event, data);
      return true;
    }
    console.warn('Socket not connected, cannot emit:', event);
    return false;
  }

  // Driver-specific events
  updateLocation(location, tripId = null) {
    this.emit('driver:location-update', {
      latitude: location.latitude,
      longitude: location.longitude,
      heading: location.heading,
      speed: location.speed,
      tripId,
    });
  }

  updateStatus(status) {
    this.emit('driver:status-change', { status });
  }

  // Trip-related events
  joinTrip(tripId) {
    this.emit('trip:join', { tripId });
  }

  leaveTrip(tripId) {
    this.emit('trip:leave', { tripId });
  }

  acceptTrip(tripId) {
    this.emit('trip:accept', { tripId });
  }

  updateTripStatus(tripId, status) {
    this.emit('trip:status-update', { tripId, status });
  }

  sendMessage(tripId, message) {
    this.emit('trip:message', {
      tripId,
      message,
      senderRole: 'driver',
    });
  }

  triggerEmergency(tripId, location, message = '') {
    this.emit('trip:emergency', {
      tripId,
      location,
      message,
    });
  }
}

export default new SocketService();
