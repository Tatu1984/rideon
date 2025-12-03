import React, { createContext, useState, useContext, useEffect } from 'react';
import * as Location from 'expo-location';
import socketService from '../services/socket.service';

const LocationContext = createContext({});

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setPermissionGranted(true);
        getCurrentLocation();
        startLocationUpdates();
      }
    } catch (error) {
      console.error('Permission error:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setLocation(coords);
      getAddressFromCoords(coords);
      socketService.updateLocation(coords);

      return coords;
    } catch (error) {
      console.error('Location error:', error);
      return null;
    }
  };

  const startLocationUpdates = async () => {
    try {
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 50,
        },
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(coords);
          socketService.updateLocation(coords);
        }
      );
    } catch (error) {
      console.error('Location watch error:', error);
    }
  };

  const getAddressFromCoords = async (coords) => {
    try {
      const results = await Location.reverseGeocodeAsync(coords);
      if (results[0]) {
        const addr = `${results[0].street || ''}, ${results[0].city || ''}, ${results[0].region || ''}`;
        setAddress(addr);
        return addr;
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    return '';
  };

  const getCoordsFromAddress = async (addressString) => {
    try {
      const results = await Location.geocodeAsync(addressString);
      if (results[0]) {
        return {
          latitude: results[0].latitude,
          longitude: results[0].longitude,
        };
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    return null;
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        address,
        permissionGranted,
        getCurrentLocation,
        getAddressFromCoords,
        getCoordsFromAddress,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
