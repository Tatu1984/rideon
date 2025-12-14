import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from "expo-constants";

const inProduction = process.env.NODE_ENV === "production";
const inExpo = Constants.expoConfig && Constants.expoConfig.hostUri;
const inBrowser = typeof document !== "undefined";
const apiDomain = inProduction
  ? "rideon.example.com"
  : inExpo
  ? `${Constants.expoConfig.hostUri.split(`:`).shift()}:3001`
  : inBrowser
  ? `${document.location.hostname}:3001`
  : "localhost:3001";

const protocol = inProduction ? "https" : "http";

const SOCKET_URL = `${protocol}://${apiDomain}`;

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  async connect() {
    if (this.socket && this.connected) {
      return this.socket;
    }

    const token = await AsyncStorage.getItem('token');

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      this.connected = false;
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
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

  // Event listeners
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  emit(event, data) {
    if (this.socket && this.connected) {
      this.socket.emit(event, data);
    }
  }

  // Rider-specific events
  requestTrip(tripData) {
    this.emit('rider:request-trip', tripData);
  }

  cancelTrip(tripId) {
    this.emit('rider:cancel-trip', { tripId });
  }

  updateLocation(location) {
    this.emit('rider:location', location);
  }

  sendMessage(tripId, message) {
    this.emit('rider:message', { tripId, message });
  }

  callDriver(tripId) {
    this.emit('rider:call-driver', { tripId });
  }

  triggerSOS(tripId, location) {
    this.emit('rider:sos', { tripId, location });
  }
}

export default new SocketService();
