import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { tripAPI } from '../services/api.service';
import socketService from '../services/socket.service';
import ErrorModal from '../components/ErrorModal';


const TripContext = createContext({});

export const TripProvider = ({ children }) => {
  const [activeTrip, setActiveTrip] = useState(null);
  const [tripHistory, setTripHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    initializeSocket();
    loadActiveTrip();
    loadTripHistory();

    return () => {
      cleanupSocketListeners();
    };
  }, []);

  // Re-join trip room when activeTrip changes
  useEffect(() => {
    if (activeTrip?.id) {
      socketService.joinTrip(activeTrip.id);
    }
  }, [activeTrip?.id]);

  const cleanupSocketListeners = () => {
    socketService.off('trip:updated');
    socketService.off('trip:driver-location');
    socketService.off('trip:accepted');
    socketService.off('trip:status-updated');
    socketService.off('trip:message-received');
    socketService.off('trip:emergency-alert');
    socketService.off('trip:cancelled');
  };

  const handleError = (error) => {
    const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';
    setError(errorMessage);
    return { success: false, error: errorMessage };
  };

  const initializeSocket = async () => {
    await socketService.connect();
    setSocketConnected(socketService.isConnected());

    // General trip update
    socketService.on('trip:updated', (trip) => {
      console.log('📍 Trip updated:', trip);
      setActiveTrip(trip);
    });

    // Driver location updates
    socketService.on('trip:driver-location', (location) => {
      console.log('🚗 Driver location:', location);
      setDriverLocation(location);
      setActiveTrip((prev) => prev ? ({
        ...prev,
        driverLocation: location,
      }) : prev);
    });

    // Trip accepted by driver
    socketService.on('trip:accepted', (data) => {
      console.log('✅ Trip accepted:', data);
      setActiveTrip((prev) => prev ? ({
        ...prev,
        status: 'accepted',
        driverId: data.driverId,
      }) : prev);
    });

    // Status updates (arrived, in_progress, completed)
    socketService.on('trip:status-updated', (data) => {
      console.log('🔄 Trip status updated:', data);
      if (data.status === 'completed') {
        setActiveTrip(null);
        setDriverLocation(null);
        setMessages([]);
        loadTripHistory();
      } else {
        setActiveTrip((prev) => prev ? ({
          ...prev,
          status: data.status,
        }) : prev);
      }
    });

    // Chat messages from driver
    socketService.on('trip:message-received', (data) => {
      console.log('💬 Message received:', data);
      if (data.senderRole !== 'rider') {
        setMessages((prev) => [...prev, {
          id: Date.now(),
          message: data.message,
          sender: data.senderRole,
          timestamp: data.timestamp,
        }]);
      }
    });

    // Emergency alerts
    socketService.on('trip:emergency-alert', (data) => {
      console.log('🚨 Emergency alert:', data);
    });

    // Trip cancelled by driver
    socketService.on('trip:cancelled', (data) => {
      console.log('❌ Trip cancelled:', data);
      setActiveTrip(null);
      setDriverLocation(null);
      setMessages([]);
    });
  };

  const loadActiveTrip = async () => {
    try {
      const response = await tripAPI.getActiveTrip();
      const trip = response.data.data || response.data;
      setActiveTrip(trip);
    } catch (error) {
      handleError(error);
      // console.error('Error loading active trip:', error);
    }
  };

  const loadTripHistory = async () => {
    try {
      const response = await tripAPI.getTripHistory();
      const trips = response.data.data || response.data;
      setTripHistory(trips);
    } catch (error) {
      handleError(error);
      //console.error('Error loading trip history:', error);
    }
  };

  const requestTrip = async (tripData) => {
    setLoading(true);
    try {
      const response = await tripAPI.createTrip(tripData);
      const trip = response.data.data || response.data;
      setActiveTrip(trip);
      socketService.requestTrip(trip);
      return { success: true, trip };
    } catch (error) {
      return handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const cancelTrip = async (tripId, reason) => {
    try {
      await tripAPI.cancelTrip(tripId, reason);
      socketService.cancelTrip(tripId);
      setActiveTrip(null);
      return { success: true };
    } catch (error) {
      handleError(error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to cancel trip',
      };
    }
  };

  const rateTrip = async (tripId, rating, review, tip = 0) => {
    try {
      await tripAPI.rateTrip(tripId, rating, review, tip);
      await loadTripHistory();
      return { success: true };
    } catch (error) {
      handleError(error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to rate trip',
      };
    }
  };

  const getEstimate = async (pickupLocation, dropoffLocation, vehicleType) => {
    try {
      const response = await tripAPI.estimate(pickupLocation, dropoffLocation, vehicleType);
      return {
        success: true,
        estimate: response.data.data || response.data,
      };
    } catch (error) {
      handleError(error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get estimate',
      };
    }
  };

  const sendMessage = useCallback((message) => {
    if (activeTrip?.id) {
      socketService.sendMessage(activeTrip.id, message);
      setMessages((prev) => [...prev, {
        id: Date.now(),
        message,
        sender: 'rider',
        timestamp: new Date().toISOString(),
      }]);
    }
  }, [activeTrip?.id]);

  const triggerSOS = useCallback((location) => {
    if (activeTrip?.id) {
      socketService.triggerSOS(activeTrip.id, location);
    }
  }, [activeTrip?.id]);

  return (
    <TripContext.Provider
      value={{
        activeTrip,
        tripHistory,
        loading,
        driverLocation,
        messages,
        socketConnected,
        requestTrip,
        cancelTrip,
        rateTrip,
        getEstimate,
        loadTripHistory,
        sendMessage,
        triggerSOS,
        error,
        clearError: () => setError(null),
      }}
    >
      {children}
      {error && <ErrorModal visible={!!error} message={error} onClose={() => setError(null)} />}
    </TripContext.Provider>
  );
};

export const useTrip = () => useContext(TripContext);
