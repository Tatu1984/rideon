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
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
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
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.socket.on('connect', () => {
      console.log('✅ Rider socket connected:', this.socket.id);
      this.connected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Rider socket disconnected:', reason);
      this.connected = false;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Rider socket reconnected after', attemptNumber, 'attempts');
      this.connected = true;
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Rider socket reconnecting... attempt:', attemptNumber);
      this.reconnectAttempts = attemptNumber;
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Rider socket reconnection failed');
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

  // Event listeners
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

  // Trip room management
  joinTrip(tripId) {
    this.emit('trip:join', { tripId });
  }

  leaveTrip(tripId) {
    this.emit('trip:leave', { tripId });
  }

  // Rider-specific events
  requestTrip(tripData) {
    this.emit('rider:request-trip', tripData);
    // Also join the trip room
    if (tripData?.id) {
      this.joinTrip(tripData.id);
    }
  }

  cancelTrip(tripId) {
    this.emit('rider:cancel-trip', { tripId });
    this.leaveTrip(tripId);
  }

  updateLocation(location) {
    this.emit('rider:location', location);
  }

  sendMessage(tripId, message) {
    this.emit('trip:message', {
      tripId,
      message,
      senderRole: 'rider',
    });
  }

  callDriver(tripId) {
    this.emit('rider:call-driver', { tripId });
  }

  triggerSOS(tripId, location, message = '') {
    this.emit('trip:emergency', {
      tripId,
      location,
      message: message || 'Rider emergency',
    });
  }
}

export default new SocketService();
