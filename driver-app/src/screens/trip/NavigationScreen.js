import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Alert, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const NAVIGATION_STEPS = [
  { icon: 'arrow-up', instruction: 'Head north', distance: '0.2 mi' },
  { icon: 'arrow-forward', instruction: 'Turn right onto Main St', distance: '0.5 mi' },
  { icon: 'arrow-back', instruction: 'Turn left onto Oak Ave', distance: '0.3 mi' },
  { icon: 'arrow-forward', instruction: 'Turn right onto Pine Rd', distance: '0.4 mi' },
  { icon: 'flag', instruction: 'Destination on right', distance: '' },
];

export default function NavigationScreen({ route, navigation }) {
  const { trip, destination } = route?.params || {};
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [eta, setEta] = useState('--');
  const [distance, setDistance] = useState('--');
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    initializeNavigation();
    return () => {};
  }, []);

  const initializeNavigation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is needed for navigation');
        navigation.goBack();
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coords = { latitude: location.coords.latitude, longitude: location.coords.longitude };
      setCurrentLocation(coords);

      const dest = destination || trip?.dropoffLocation || { latitude: coords.latitude + 0.01, longitude: coords.longitude + 0.01 };

      // Generate mock route coordinates
      const routePoints = generateRouteCoordinates(coords, dest);
      setRouteCoordinates(routePoints);

      // Calculate mock ETA and distance
      const distanceKm = calculateDistance(coords.latitude, coords.longitude, dest.latitude, dest.longitude);
      setDistance(distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} mi`);
      setEta(`${Math.round(distanceKm * 3)} min`);

      setLoading(false);
      setIsNavigating(true);

      // Start location tracking
      Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 10, timeInterval: 5000 },
        (newLocation) => {
          setCurrentLocation({ latitude: newLocation.coords.latitude, longitude: newLocation.coords.longitude });
          updateNavigation(newLocation.coords);
        }
      );
    } catch (error) {
      console.error('Navigation init error:', error);
      Alert.alert('Error', 'Failed to initialize navigation');
      setLoading(false);
    }
  };

  const generateRouteCoordinates = (start, end) => {
    const points = [];
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const lat = start.latitude + (end.latitude - start.latitude) * (i / steps);
      const lng = start.longitude + (end.longitude - start.longitude) * (i / steps);
      const jitter = (Math.random() - 0.5) * 0.001;
      points.push({ latitude: lat + jitter, longitude: lng + jitter });
    }
    return points;
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const updateNavigation = (coords) => {
    // Update step based on progress (mock)
    if (routeCoordinates.length > 0 && currentStepIndex < NAVIGATION_STEPS.length - 1) {
      const progress = Math.random();
      if (progress > 0.8) setCurrentStepIndex(prev => Math.min(prev + 1, NAVIGATION_STEPS.length - 1));
    }
  };

  const handleOpenExternalNav = (app) => {
    const dest = destination || trip?.dropoffLocation;
    if (!dest) { Alert.alert('Error', 'No destination set'); return; }

    const { latitude, longitude } = dest;
    let url = '';

    if (app === 'google') {
      url = Platform.OS === 'ios'
        ? `comgooglemaps://?daddr=${latitude},${longitude}&directionsmode=driving`
        : `google.navigation:q=${latitude},${longitude}`;
    } else if (app === 'apple') {
      url = `maps://app?daddr=${latitude},${longitude}`;
    } else if (app === 'waze') {
      url = `waze://?ll=${latitude},${longitude}&navigate=yes`;
    }

    Linking.canOpenURL(url).then(supported => {
      if (supported) Linking.openURL(url);
      else Alert.alert('Error', `${app} Maps is not installed`);
    });
  };

  const handleEndNavigation = () => {
    Alert.alert('End Navigation', 'Are you sure you want to stop navigation?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'End', style: 'destructive', onPress: () => navigation.goBack() }
    ]);
  };

  const handleRecenter = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...currentLocation,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }, 500);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Calculating route...</Text>
      </View>
    );
  }

  const currentStep = NAVIGATION_STEPS[currentStepIndex];
  const dest = destination || trip?.dropoffLocation || (currentLocation && { latitude: currentLocation.latitude + 0.01, longitude: currentLocation.longitude + 0.01 });

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={currentLocation && { ...currentLocation, latitudeDelta: LATITUDE_DELTA, longitudeDelta: LONGITUDE_DELTA }}
        showsUserLocation
        showsMyLocationButton={false}
        followsUserLocation={isNavigating}
      >
        {routeCoordinates.length > 0 && (
          <Polyline coordinates={routeCoordinates} strokeColor="#7C3AED" strokeWidth={5} lineDashPattern={[0]} />
        )}
        {dest && (
          <Marker coordinate={dest}>
            <View style={styles.destinationMarker}>
              <Ionicons name="flag" size={20} color="#fff" />
            </View>
          </Marker>
        )}
      </MapView>

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.etaContainer}>
          <Text style={styles.etaTime}>{eta}</Text>
          <Text style={styles.etaDistance}>{distance}</Text>
        </View>
        <TouchableOpacity style={styles.moreButton} onPress={() => {}}>
          <Ionicons name="ellipsis-vertical" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <View style={styles.navigationCard}>
        <View style={styles.currentStep}>
          <View style={styles.stepIconContainer}>
            <Ionicons name={currentStep.icon} size={32} color="#fff" />
          </View>
          <View style={styles.stepInfo}>
            <Text style={styles.stepInstruction}>{currentStep.instruction}</Text>
            {currentStep.distance && <Text style={styles.stepDistance}>in {currentStep.distance}</Text>}
          </View>
        </View>

        {currentStepIndex < NAVIGATION_STEPS.length - 1 && (
          <View style={styles.nextStep}>
            <Text style={styles.nextStepLabel}>Then</Text>
            <Ionicons name={NAVIGATION_STEPS[currentStepIndex + 1].icon} size={16} color="#6B7280" />
            <Text style={styles.nextStepText}>{NAVIGATION_STEPS[currentStepIndex + 1].instruction}</Text>
          </View>
        )}
      </View>

      <View style={styles.bottomControls}>
        <TouchableOpacity style={styles.controlButton} onPress={handleRecenter}>
          <Ionicons name="locate" size={24} color="#7C3AED" />
        </TouchableOpacity>

        <View style={styles.externalApps}>
          <Text style={styles.externalAppsLabel}>Open in:</Text>
          <View style={styles.appButtons}>
            <TouchableOpacity style={styles.appButton} onPress={() => handleOpenExternalNav('google')}>
              <Text style={styles.appButtonText}>Google</Text>
            </TouchableOpacity>
            {Platform.OS === 'ios' && (
              <TouchableOpacity style={styles.appButton} onPress={() => handleOpenExternalNav('apple')}>
                <Text style={styles.appButtonText}>Apple</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.appButton} onPress={() => handleOpenExternalNav('waze')}>
              <Text style={styles.appButtonText}>Waze</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.endButton} onPress={handleEndNavigation}>
          <Ionicons name="close" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.tripInfo}>
        <View style={styles.tripInfoRow}>
          <Ionicons name="location" size={18} color="#7C3AED" />
          <Text style={styles.tripInfoText} numberOfLines={1}>
            {trip?.dropoffAddress || destination?.address || 'Destination'}
          </Text>
        </View>
        {trip?.rider && (
          <View style={styles.tripInfoRow}>
            <Ionicons name="person" size={18} color="#6B7280" />
            <Text style={styles.tripInfoText}>{trip.rider.firstName} {trip.rider.lastName}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { fontSize: 16, color: '#6B7280', marginTop: 16 },
  map: { ...StyleSheet.absoluteFillObject },
  topBar: { position: 'absolute', top: 50, left: 16, right: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 4 },
  etaContainer: { backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 4 },
  etaTime: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  etaDistance: { fontSize: 14, color: '#6B7280' },
  moreButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 4 },
  navigationCard: { position: 'absolute', top: 110, left: 16, right: 16, backgroundColor: '#7C3AED', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8 },
  currentStep: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  stepIconContainer: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  stepInfo: { flex: 1, marginLeft: 16 },
  stepInstruction: { fontSize: 20, fontWeight: '600', color: '#fff' },
  stepDistance: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  nextStep: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.1)', paddingVertical: 10, paddingHorizontal: 16, gap: 8 },
  nextStepLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  nextStepText: { fontSize: 13, color: 'rgba(255,255,255,0.9)', flex: 1 },
  bottomControls: { position: 'absolute', bottom: 140, left: 16, right: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  controlButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 4 },
  externalApps: { flex: 1, marginHorizontal: 12 },
  externalAppsLabel: { fontSize: 11, color: '#6B7280', textAlign: 'center', marginBottom: 4 },
  appButtons: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  appButton: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  appButtonText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  endButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 4 },
  tripInfo: { position: 'absolute', bottom: 32, left: 16, right: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 8 },
  tripInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  tripInfoText: { fontSize: 14, color: '#374151', flex: 1 },
  destinationMarker: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#7C3AED', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff' },
});
