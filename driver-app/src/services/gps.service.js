import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCATION_TASK_NAME = 'background-location-task';
const LOCATION_STORAGE_KEY = 'driver_last_location';

let locationCallback = null;
let isTracking = false;

// Define the background task - this runs even when the app is in the background
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background location error:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    if (locations && locations.length > 0) {
      const location = locations[0];
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        heading: location.coords.heading,
        speed: location.coords.speed,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
      };

      console.log('Background location update:', coords.latitude, coords.longitude);

      // Store latest location for retrieval when app comes back to foreground
      try {
        await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(coords));
      } catch (e) {
        console.error('Error storing location:', e);
      }

      // Call the callback if set (for foreground updates)
      if (locationCallback) {
        locationCallback(coords);
      }
    }
  }
});

/**
 * Request location permissions
 */
export const requestLocationPermissions = async () => {
  try {
    // Request foreground permission
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      return { granted: false, error: 'Foreground location permission denied' };
    }

    // Request background permission
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      return { granted: true, background: false, error: 'Background location permission denied' };
    }

    return { granted: true, background: true };
  } catch (error) {
    console.error('Error requesting location permissions:', error);
    return { granted: false, error: error.message };
  }
};

/**
 * Check if location permissions are granted
 */
export const checkLocationPermissions = async () => {
  try {
    const foreground = await Location.getForegroundPermissionsAsync();
    const background = await Location.getBackgroundPermissionsAsync();

    return {
      foreground: foreground.status === 'granted',
      background: background.status === 'granted',
    };
  } catch (error) {
    console.error('Error checking permissions:', error);
    return { foreground: false, background: false };
  }
};

/**
 * Start background location tracking
 * @param {Function} callback - Called with location updates
 * @param {Object} options - Configuration options
 */
export const startLocationTracking = async (callback, options = {}) => {
  try {
    // Check permissions first
    const permissions = await checkLocationPermissions();
    if (!permissions.foreground) {
      const requested = await requestLocationPermissions();
      if (!requested.granted) {
        return { success: false, error: 'Location permissions not granted' };
      }
    }

    locationCallback = callback;

    // Check if task is already registered and stop it
    const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
    if (isRegistered) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }

    // Configuration for location updates
    const config = {
      accuracy: options.accuracy || Location.Accuracy.High,
      timeInterval: options.timeInterval || 5000, // Update every 5 seconds
      distanceInterval: options.distanceInterval || 10, // Or when moved 10 meters
      deferredUpdatesInterval: options.deferredUpdatesInterval || 5000,
      deferredUpdatesDistance: options.deferredUpdatesDistance || 0,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: options.notificationTitle || 'RideOn Driver',
        notificationBody: options.notificationBody || 'Tracking your location for nearby ride requests',
        notificationColor: '#160832',
      },
      pausesUpdatesAutomatically: false,
      activityType: Location.ActivityType.AutomotiveNavigation,
    };

    // Start location updates
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, config);

    isTracking = true;
    console.log('Background location tracking started');

    return { success: true };
  } catch (error) {
    console.error('Error starting location tracking:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Stop background location tracking
 */
export const stopLocationTracking = async () => {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
    if (isRegistered) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }
    locationCallback = null;
    isTracking = false;
    console.log('Background location tracking stopped');
    return { success: true };
  } catch (error) {
    console.error('Error stopping location tracking:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if location tracking is active
 */
export const isLocationTrackingActive = async () => {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
    return isRegistered && isTracking;
  } catch (error) {
    return false;
  }
};

/**
 * Get current location (one-time)
 */
export const getCurrentLocation = async (options = {}) => {
  try {
    // Check permissions
    const permissions = await checkLocationPermissions();
    if (!permissions.foreground) {
      const requested = await requestLocationPermissions();
      if (!requested.granted) {
        return null;
      }
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: options.accuracy || Location.Accuracy.High,
      maximumAge: options.maximumAge || 10000, // Accept cached location up to 10 seconds old
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      heading: location.coords.heading,
      speed: location.coords.speed,
      accuracy: location.coords.accuracy,
      timestamp: location.timestamp,
    };
  } catch (error) {
    console.error('Error getting current location:', error);

    // Try to get last stored location as fallback
    try {
      const stored = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error getting stored location:', e);
    }

    return null;
  }
};

/**
 * Get the last stored location (useful when app wakes from background)
 */
export const getLastStoredLocation = async () => {
  try {
    const stored = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  } catch (error) {
    console.error('Error getting stored location:', error);
    return null;
  }
};

/**
 * Watch location changes (foreground only, higher frequency)
 */
export const watchLocation = async (callback, options = {}) => {
  try {
    const permissions = await checkLocationPermissions();
    if (!permissions.foreground) {
      const requested = await requestLocationPermissions();
      if (!requested.granted) {
        return null;
      }
    }

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: options.accuracy || Location.Accuracy.BestForNavigation,
        timeInterval: options.timeInterval || 2000,
        distanceInterval: options.distanceInterval || 5,
      },
      (location) => {
        callback({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          heading: location.coords.heading,
          speed: location.coords.speed,
          accuracy: location.coords.accuracy,
          timestamp: location.timestamp,
        });
      }
    );

    return subscription;
  } catch (error) {
    console.error('Error watching location:', error);
    return null;
  }
};

/**
 * Calculate distance between two coordinates in meters
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Calculate bearing between two coordinates
 */
export const calculateBearing = (lat1, lon1, lat2, lon2) => {
  const rad = Math.PI / 180;
  const dLon = (lon2 - lon1) * rad;
  const y = Math.sin(dLon) * Math.cos(lat2 * rad);
  const x =
    Math.cos(lat1 * rad) * Math.sin(lat2 * rad) -
    Math.sin(lat1 * rad) * Math.cos(lat2 * rad) * Math.cos(dLon);
  const bearing = Math.atan2(y, x) * (180 / Math.PI);
  return (bearing + 360) % 360;
};

export default {
  requestLocationPermissions,
  checkLocationPermissions,
  startLocationTracking,
  stopLocationTracking,
  isLocationTrackingActive,
  getCurrentLocation,
  getLastStoredLocation,
  watchLocation,
  calculateDistance,
  calculateBearing,
};
