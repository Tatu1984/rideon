import React, { createContext, useState, useContext, useEffect } from 'react';
import { driverAPI, tripAPI } from '../services/api.service';
import socketService from '../services/socket.service';

const DriverContext = createContext({});

export const DriverProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(false);
  const [activeTrip, setActiveTrip] = useState(null);
  const [tripRequest, setTripRequest] = useState(null);
  const [earnings, setEarnings] = useState({ today: 0, week: 0, month: 0 });

  useEffect(() => {
    setupSocketListeners();
    return () => {
      socketService.disconnect();
    };
  }, []);

  const setupSocketListeners = () => {
    socketService.connect();
    
    socketService.on('trip:request', (trip) => {
      console.log('New trip request:', trip);
      setTripRequest(trip);
    });

    socketService.on('trip:cancelled', () => {
      setTripRequest(null);
      setActiveTrip(null);
    });
  };

  const goOnline = async () => {
    try {
      await driverAPI.updateStatus('online');
      socketService.updateStatus('online');
      setIsOnline(true);
    } catch (error) {
      console.error('Failed to go online:', error);
    }
  };

  const goOffline = async () => {
    try {
      await driverAPI.updateStatus('offline');
      socketService.updateStatus('offline');
      setIsOnline(false);
    } catch (error) {
      console.error('Failed to go offline:', error);
    }
  };

  const acceptTrip = async (tripId) => {
    try {
      const response = await tripAPI.acceptTrip(tripId);
      setActiveTrip(response.data);
      setTripRequest(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  };

  const rejectTrip = async (tripId) => {
    try {
      await tripAPI.rejectTrip(tripId);
      setTripRequest(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  };

  const startTrip = async (tripId) => {
    try {
      const response = await tripAPI.startTrip(tripId);
      setActiveTrip(response.data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  };

  const completeTrip = async (tripId) => {
    try {
      const response = await tripAPI.completeTrip(tripId);
      setActiveTrip(null);
      fetchEarnings();
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  };

  const fetchEarnings = async () => {
    try {
      const response = await driverAPI.getEarnings('all');
      setEarnings(response.data);
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
      goOnline,
      goOffline,
      acceptTrip,
      rejectTrip,
      startTrip,
      completeTrip,
      fetchEarnings,
    }}>
      {children}
    </DriverContext.Provider>
  );
};

export const useDriver = () => useContext(DriverContext);
