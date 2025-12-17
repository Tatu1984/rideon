/**
 * RideMap Component
 * A comprehensive map component for displaying rides with:
 * - Pickup and dropoff markers
 * - Route polyline between points
 * - Driver location tracking
 * - ETA display
 */

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../config/constants';

// Default region (San Francisco)
const DEFAULT_REGION = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Map style for a cleaner look
const mapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#f5f5f5' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#e0e0e0' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#c9e4f5' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#d4edda' }],
  },
];

export default function RideMap({
  pickup,
  dropoff,
  driverLocation,
  routeCoordinates,
  onRegionChange,
  showUserLocation = true,
  style,
  children,
}) {
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get initial location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission denied');
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLocation(location.coords);
      } catch (err) {
        console.error('Error getting location:', err);
        setError('Could not get location');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Fit map to show all markers when pickup/dropoff change
  useEffect(() => {
    if (mapRef.current && pickup && dropoff) {
      const coordinates = [
        { latitude: pickup.latitude, longitude: pickup.longitude },
        { latitude: dropoff.latitude, longitude: dropoff.longitude },
      ];

      if (driverLocation) {
        coordinates.push({
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
        });
      }

      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
        animated: true,
      });
    }
  }, [pickup, dropoff, driverLocation]);

  // Calculate initial region based on available data
  const initialRegion = useMemo(() => {
    if (pickup) {
      return {
        ...pickup,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
    }
    if (userLocation) {
      return {
        ...userLocation,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
    }
    return DEFAULT_REGION;
  }, [pickup, userLocation]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  if (error && !userLocation) {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <Ionicons name="location-outline" size={48} color={COLORS.gray} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={true}
        showsCompass={true}
        customMapStyle={mapStyle}
        onRegionChangeComplete={onRegionChange}
      >
        {/* Pickup Marker */}
        {pickup && (
          <Marker
            coordinate={pickup}
            title="Pickup"
            description={pickup.address}
            anchor={{ x: 0.5, y: 1 }}
          >
            <View style={styles.pickupMarker}>
              <Ionicons name="location" size={32} color={COLORS.success} />
            </View>
          </Marker>
        )}

        {/* Dropoff Marker */}
        {dropoff && (
          <Marker
            coordinate={dropoff}
            title="Dropoff"
            description={dropoff.address}
            anchor={{ x: 0.5, y: 1 }}
          >
            <View style={styles.dropoffMarker}>
              <Ionicons name="location" size={32} color={COLORS.danger} />
            </View>
          </Marker>
        )}

        {/* Driver Marker */}
        {driverLocation && (
          <Marker
            coordinate={driverLocation}
            title="Driver"
            anchor={{ x: 0.5, y: 0.5 }}
            rotation={driverLocation.heading || 0}
          >
            <View style={styles.driverMarker}>
              <Ionicons name="car" size={28} color={COLORS.white} />
            </View>
          </Marker>
        )}

        {/* Route Polyline */}
        {routeCoordinates && routeCoordinates.length > 1 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={COLORS.primary}
            strokeWidth={4}
            lineDashPattern={[1]}
          />
        )}

        {/* Render any additional children (custom markers, etc.) */}
        {children}
      </MapView>
    </View>
  );
}

// Custom hook for decoding polyline from Google Directions API
export function useDecodePolyline(encodedPolyline) {
  return useMemo(() => {
    if (!encodedPolyline) return [];

    const points = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encodedPolyline.length) {
      let shift = 0;
      let result = 0;
      let byte;

      do {
        byte = encodedPolyline.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;

      do {
        byte = encodedPolyline.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }

    return points;
  }, [encodedPolyline]);
}

// Helper component for ETA display
export function ETADisplay({ minutes, distance }) {
  return (
    <View style={styles.etaContainer}>
      <View style={styles.etaItem}>
        <Ionicons name="time-outline" size={20} color={COLORS.primary} />
        <Text style={styles.etaValue}>{minutes || '--'} min</Text>
      </View>
      <View style={styles.etaDivider} />
      <View style={styles.etaItem}>
        <Ionicons name="navigate-outline" size={20} color={COLORS.primary} />
        <Text style={styles.etaValue}>{distance || '--'} km</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  pickupMarker: {
    alignItems: 'center',
  },
  dropoffMarker: {
    alignItems: 'center',
  },
  driverMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  etaContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  etaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  etaDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  etaValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
  },
});
