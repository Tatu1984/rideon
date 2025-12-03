import React, { createContext, useState, useContext, useEffect } from 'react';
import { tripAPI } from '../services/api.service';
import socketService from '../services/socket.service';

const TripContext = createContext({});

export const TripProvider = ({ children }) => {
  const [activeTrip, setActiveTrip] = useState(null);
  const [tripHistory, setTripHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeSocket();
    loadActiveTrip();
    loadTripHistory();

    return () => {
      socketService.off('trip:updated');
      socketService.off('driver:location');
      socketService.off('driver:arrived');
      socketService.off('trip:started');
      socketService.off('trip:completed');
    };
  }, []);

  const initializeSocket = async () => {
    await socketService.connect();

    socketService.on('trip:updated', (trip) => {
      console.log('Trip updated:', trip);
      setActiveTrip(trip);
    });

    socketService.on('driver:location', (location) => {
      if (activeTrip) {
        setActiveTrip((prev) => ({
          ...prev,
          driverLocation: location,
        }));
      }
    });

    socketService.on('driver:arrived', () => {
      if (activeTrip) {
        setActiveTrip((prev) => ({
          ...prev,
          status: 'arrived',
        }));
      }
    });

    socketService.on('trip:started', () => {
      if (activeTrip) {
        setActiveTrip((prev) => ({
          ...prev,
          status: 'started',
        }));
      }
    });

    socketService.on('trip:completed', (trip) => {
      setActiveTrip(null);
      loadTripHistory();
    });
  };

  const loadActiveTrip = async () => {
    try {
      const response = await tripAPI.getActiveTrip();
      const trip = response.data.data || response.data;
      setActiveTrip(trip);
    } catch (error) {
      console.error('Error loading active trip:', error);
    }
  };

  const loadTripHistory = async () => {
    try {
      const response = await tripAPI.getTripHistory();
      const trips = response.data.data || response.data;
      setTripHistory(trips);
    } catch (error) {
      console.error('Error loading trip history:', error);
    }
  };

  const requestTrip = async (tripData) => {
    try {
      setLoading(true);
      const response = await tripAPI.createTrip(tripData);
      const trip = response.data.data || response.data;
      setActiveTrip(trip);
      socketService.requestTrip(trip);
      return { success: true, trip };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to request trip',
      };
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
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get estimate',
      };
    }
  };

  return (
    <TripContext.Provider
      value={{
        activeTrip,
        tripHistory,
        loading,
        requestTrip,
        cancelTrip,
        rateTrip,
        getEstimate,
        loadTripHistory,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => useContext(TripContext);
