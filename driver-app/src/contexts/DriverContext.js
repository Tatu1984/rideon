import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import { driverAPI, tripAPI } from '../services/api.service';
import socketService from '../services/socket.service';
import {
  startLocationTracking,
  stopLocationTracking,
  getCurrentLocation,
  getLastStoredLocation,
  requestLocationPermissions,
} from '../services/gps.service';

const DriverContext = createContext({});

export const DriverProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(false);
  const [activeTrip, setActiveTrip] = useState(null);
  const [tripRequest, setTripRequest] = useState(null);
  const [earnings, setEarnings] = useState({ today: 0, week: 0, month: 0 });
  const [driverLocation, setDriverLocation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);

  const appState = useRef(AppState.currentState);
  const locationUpdateInterval = useRef(null);

  useEffect(() => {
    setupSocketListeners();
    loadActiveTrip();
    fetchEarnings();
    initializeLocationPermissions();

    // Handle app state changes for background/foreground transitions
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      cleanupSocketListeners();
      socketService.disconnect();
      stopBackgroundLocation();
      subscription.remove();
      if (locationUpdateInterval.current) {
        clearInterval(locationUpdateInterval.current);
      }
    };
  }, []);

  // Start/stop location tracking based on online status
  useEffect(() => {
    if (isOnline && locationPermissionGranted) {
      startBackgroundLocation();
    } else if (!isOnline) {
      stopBackgroundLocation();
    }
  }, [isOnline, locationPermissionGranted]);

  const handleAppStateChange = async (nextAppState) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App has come to the foreground
      console.log('App came to foreground');

      // Restore last location if we were tracking
      if (isOnline) {
        const lastLocation = await getLastStoredLocation();
        if (lastLocation) {
          setDriverLocation(lastLocation);
          socketService.updateLocation(lastLocation, activeTrip?.id);
        }
      }
    }
    appState.current = nextAppState;
  };

  const initializeLocationPermissions = async () => {
    const result = await requestLocationPermissions();
    setLocationPermissionGranted(result.granted);
    if (!result.granted) {
      console.warn('Location permissions not granted:', result.error);
    }
  };

  const startBackgroundLocation = async () => {
    const result = await startLocationTracking(
      (location) => {
        setDriverLocation(location);
        // Send location to server via socket
        socketService.updateLocation(location, activeTrip?.id);
      },
      {
        timeInterval: activeTrip ? 3000 : 10000, // More frequent updates during active trip
        distanceInterval: activeTrip ? 5 : 20,
        notificationBody: activeTrip
          ? 'Navigating to destination...'
          : 'Looking for nearby ride requests',
      }
    );

    if (!result.success) {
      console.error('Failed to start location tracking:', result.error);
    }
  };

  const stopBackgroundLocation = async () => {
    await stopLocationTracking();
  };

  // Re-setup socket listeners when activeTrip changes
  useEffect(() => {
    if (activeTrip?.id) {
      socketService.joinTrip(activeTrip.id);
    }
  }, [activeTrip?.id]);

  const cleanupSocketListeners = () => {
    socketService.off('trip:request');
    socketService.off('trip:cancelled');
    socketService.off('trip:status-updated');
    socketService.off('trip:message-received');
    socketService.off('trip:emergency-alert');
  };

  const setupSocketListeners = async () => {
    await socketService.connect();
    setSocketConnected(socketService.isConnected());

    // New trip request
    socketService.on('trip:request', (trip) => {
      console.log('📍 New trip request:', trip);
      setTripRequest(trip);
    });

    // Trip cancelled by rider
    socketService.on('trip:cancelled', (data) => {
      console.log('❌ Trip cancelled:', data);
      setTripRequest(null);
      if (activeTrip?.id === data?.tripId) {
        setActiveTrip(null);
      }
    });

    // Trip status updated (from rider or backend)
    socketService.on('trip:status-updated', (data) => {
      console.log('🔄 Trip status updated:', data);
      if (activeTrip?.id === data.tripId) {
        setActiveTrip(prev => ({ ...prev, status: data.status }));
      }
    });

    // Chat messages
    socketService.on('trip:message-received', (data) => {
      console.log('💬 Message received:', data);
      if (data.senderRole !== 'driver') {
        setMessages(prev => [...prev, {
          id: Date.now(),
          message: data.message,
          sender: data.senderRole,
          timestamp: data.timestamp,
        }]);
      }
    });

    // Emergency alert
    socketService.on('trip:emergency-alert', (data) => {
      console.log('🚨 Emergency alert:', data);
      // Handle emergency - could trigger UI alert
    });
  };

  const loadActiveTrip = async () => {
    try {
      const response = await driverAPI.getActiveTrip();
      const trip = response.data?.data || response.data;
      if (trip && trip.id) {
        setActiveTrip(trip);
        socketService.joinTrip(trip.id);
      }
    } catch (error) {
      // No active trip is okay
      console.log('No active trip');
    }
  };

  const goOnline = async () => {
    try {
      await driverAPI.updateStatus('online');
      socketService.updateStatus('online');
      setIsOnline(true);
      return { success: true };
    } catch (error) {
      console.error('Failed to go online:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to go online' };
    }
  };

  const goOffline = async () => {
    try {
      await driverAPI.updateStatus('offline');
      socketService.updateStatus('offline');
      setIsOnline(false);
      return { success: true };
    } catch (error) {
      console.error('Failed to go offline:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to go offline' };
    }
  };

  const acceptTrip = async (tripId) => {
    try {
      const response = await tripAPI.acceptTrip(tripId);
      const trip = response.data?.data || response.data;
      setActiveTrip(trip);
      setTripRequest(null);

      // Notify via socket and join trip room
      socketService.acceptTrip(tripId);
      socketService.joinTrip(tripId);

      return { success: true, data: trip };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to accept trip' };
    }
  };

  const rejectTrip = async (tripId) => {
    try {
      await tripAPI.rejectTrip(tripId);
      setTripRequest(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to reject trip' };
    }
  };

  const startTrip = async (tripId) => {
    try {
      const response = await tripAPI.startTrip(tripId);
      const trip = response.data?.data || response.data;
      setActiveTrip(trip);

      // Update via socket
      socketService.updateTripStatus(tripId, 'in_progress');

      return { success: true, data: trip };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to start trip' };
    }
  };

  const completeTrip = async (tripId) => {
    try {
      const response = await tripAPI.completeTrip(tripId);

      // Update via socket before clearing state
      socketService.updateTripStatus(tripId, 'completed');
      socketService.leaveTrip(tripId);

      setActiveTrip(null);
      setMessages([]);
      fetchEarnings();

      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to complete trip' };
    }
  };

  const updateTripStatus = async (tripId, status) => {
    try {
      const response = await tripAPI.updateTripStatus(tripId, status);
      const data = response.data?.data || response.data;

      if (data?.trip) {
        setActiveTrip(data.trip);
      }

      // Broadcast status change via socket
      socketService.updateTripStatus(tripId, status);

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update status' };
    }
  };

  const updateLocation = useCallback((location) => {
    setDriverLocation(location);
    socketService.updateLocation(location, activeTrip?.id);
  }, [activeTrip?.id]);

  const sendMessage = useCallback((message) => {
    if (activeTrip?.id) {
      socketService.sendMessage(activeTrip.id, message);
      setMessages(prev => [...prev, {
        id: Date.now(),
        message,
        sender: 'driver',
        timestamp: new Date().toISOString(),
      }]);
    }
  }, [activeTrip?.id]);

  const triggerEmergency = useCallback((location) => {
    if (activeTrip?.id) {
      socketService.triggerEmergency(activeTrip.id, location, 'Driver emergency');
    }
  }, [activeTrip?.id]);

  const fetchEarnings = async () => {
    try {
      const response = await driverAPI.getEarnings('all');
      const data = response.data?.data || response.data;
      setEarnings(data);
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
    }
  };

  return (
    <DriverContext.Provider value={{
      isOnline,
      activeTrip,
      tripRequest,
      earnings,
      driverLocation,
      messages,
      socketConnected,
      locationPermissionGranted,
      goOnline,
      goOffline,
      acceptTrip,
      rejectTrip,
      startTrip,
      completeTrip,
      updateTripStatus,
      updateLocation,
      sendMessage,
      triggerEmergency,
      fetchEarnings,
      loadActiveTrip,
      requestLocationPermissions: initializeLocationPermissions,
    }}>
      {children}
    </DriverContext.Provider>
  );
};

export const useDriver = () => useContext(DriverContext);
