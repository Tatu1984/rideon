/**
 * Socket.io Service for Web App
 * Handles real-time communication with the backend
 */

import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * Initialize socket connection
   */
  connect(token) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return this.socket;
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.setupBaseListeners();

    return this.socket;
  }

  /**
   * Setup base event listeners
   */
  setupBaseListeners() {
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.connected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      this.reconnectAttempts++;
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.listeners.clear();
    }
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.socket?.connected || false;
  }

  /**
   * Subscribe to an event
   */
  on(event, callback) {
    if (!this.socket) {
      console.warn('Socket not initialized. Call connect() first.');
      return;
    }

    this.socket.on(event, callback);

    // Track listeners for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Unsubscribe from an event
   */
  off(event, callback) {
    if (!this.socket) return;

    if (callback) {
      this.socket.off(event, callback);
      const callbacks = this.listeners.get(event) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    } else {
      this.socket.off(event);
      this.listeners.delete(event);
    }
  }

  /**
   * Emit an event
   */
  emit(event, data) {
    if (!this.socket) {
      console.warn('Socket not initialized. Call connect() first.');
      return;
    }

    this.socket.emit(event, data);
  }

  // ==================== Trip Events ====================

  /**
   * Join a trip room for real-time updates
   */
  joinTrip(tripId) {
    this.emit('trip:join', { tripId });
  }

  /**
   * Leave a trip room
   */
  leaveTrip(tripId) {
    this.emit('trip:leave', { tripId });
  }

  /**
   * Subscribe to trip status updates
   */
  onTripStatusUpdate(callback) {
    this.on('trip:status-updated', callback);
  }

  /**
   * Subscribe to driver location updates
   */
  onDriverLocationUpdate(callback) {
    this.on('trip:driver-location', callback);
  }

  /**
   * Subscribe to trip accepted event
   */
  onTripAccepted(callback) {
    this.on('trip:accepted', callback);
  }

  /**
   * Subscribe to new messages
   */
  onTripMessage(callback) {
    this.on('trip:message-received', callback);
  }

  /**
   * Send a message to the driver/rider
   */
  sendTripMessage(tripId, message, senderRole) {
    this.emit('trip:message', { tripId, message, senderRole });
  }

  /**
   * Trigger emergency alert
   */
  triggerEmergency(tripId, location, message) {
    this.emit('trip:emergency', { tripId, location, message });
  }

  // ==================== Driver Events ====================

  /**
   * Subscribe to nearby driver locations
   */
  onDriversNearby(callback) {
    this.on('driver:location-updated', callback);
  }

  /**
   * Subscribe to driver online/offline events
   */
  onDriverOnline(callback) {
    this.on('driver:online', callback);
  }

  onDriverOffline(callback) {
    this.on('driver:offline', callback);
  }

  // ==================== Split Fare Events ====================

  /**
   * Subscribe to split fare invitation
   */
  onSplitFareInvitation(callback) {
    this.on('split-fare:invitation', callback);
  }

  /**
   * Subscribe to split fare acceptance
   */
  onSplitFareAccepted(callback) {
    this.on('split-fare:accepted', callback);
  }

  /**
   * Subscribe to split fare declined
   */
  onSplitFareDeclined(callback) {
    this.on('split-fare:declined', callback);
  }

  /**
   * Subscribe to split fare payment
   */
  onSplitFarePayment(callback) {
    this.on('split-fare:payment', callback);
  }

  /**
   * Subscribe to split fare cancellation
   */
  onSplitFareCancelled(callback) {
    this.on('split-fare:cancelled', callback);
  }

  // ==================== Notification Events ====================

  /**
   * Subscribe to push notifications
   */
  onNotification(callback) {
    this.on('notification', callback);
  }

  // ==================== Admin Events ====================

  /**
   * Join admin room (for admin dashboard)
   */
  joinAdminRoom() {
    this.emit('admin:join', {});
  }

  /**
   * Subscribe to emergency alerts (admin)
   */
  onEmergencyAlert(callback) {
    this.on('trip:emergency-alert', callback);
  }

  /**
   * Subscribe to new trip requests (for live dashboard)
   */
  onNewTripRequest(callback) {
    this.on('trip:new-request', callback);
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
