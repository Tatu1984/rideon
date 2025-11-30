import React, { createContext, useState, useContext, useEffect } from 'react';
import { startLocationTracking, stopLocationTracking, getCurrentLocation } from '../services/gps.service';
import { driverAPI } from '../services/api.service';
import socketService from '../services/socket.service';
import { useDriver } from './DriverContext';

const LocationContext = createContext({});

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [tracking, setTracking] = useState(false);
  const { isOnline } = useDriver();

  useEffect(() => {
    initLocation();
  }, []);

  useEffect(() => {
    if (isOnline && !tracking) {
      startTracking();
    } else if (!isOnline && tracking) {
      stopTracking();
    }
  }, [isOnline]);

  const initLocation = async () => {
    const coords = await getCurrentLocation();
    if (coords) {
      setLocation(coords);
    }
  };

  const startTracking = async () => {
    const success = await startLocationTracking((coords) => {
      setLocation(coords);
      updateLocationToServer(coords);
    });
    setTracking(success);
  };

  const stopTracking = async () => {
    await stopLocationTracking();
    setTracking(false);
  };

  const updateLocationToServer = async (coords) => {
    try {
      await driverAPI.updateLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
        heading: coords.heading,
        speed: coords.speed,
      });
      
      socketService.updateLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  };

  return (
    <LocationContext.Provider value={{ location, tracking }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
