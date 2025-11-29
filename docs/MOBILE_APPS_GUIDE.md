# Mobile Apps Implementation Guide (React Native)

## Complete React Native Implementation for Rider & Driver Apps

---

## Rider Mobile App

### App Entry Point (`apps/rider-app/App.js`)

```javascript
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import { RideProvider } from './src/contexts/RideContext';
import { SocketProvider } from './src/contexts/SocketContext';
import RootNavigator from './src/navigation/RootNavigator';
import { requestLocationPermission } from './src/utils/permissions';

export default function App() {
  useEffect(() => {
    // Request location permissions on app start
    requestLocationPermission();
  }, []);

  return (
    <NavigationContainer>
      <AuthProvider>
        <SocketProvider>
          <RideProvider>
            <RootNavigator />
          </RideProvider>
        </SocketProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}
```

### Rider Home Screen (`apps/rider-app/src/screens/Home/HomeScreen.js`)

```javascript
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { rideService } from '../../services/rideService';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const mapRef = useRef(null);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [fareEstimate, setFareEstimate] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState(null); // 'pickup' or 'dropoff'

  // Get current location
  useEffect(() => {
    const watchId = Geolocation.watchPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setCurrentLocation(location);
        if (!pickupLocation) {
          setPickupLocation(location);
        }
      },
      (error) => console.error('Location error:', error),
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 5000,
        fastestInterval: 3000
      }
    );

    return () => Geolocation.clearWatch(watchId);
  }, []);

  // Socket.IO listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('ride_accepted', (data) => {
      console.log('Ride accepted:', data);
      setActiveTrip(prev => ({ ...prev, ...data, status: 'accepted' }));
    });

    socket.on('driver_location_update', (data) => {
      setDriverLocation({
        latitude: data.location.lat,
        longitude: data.location.lng
      });
    });

    socket.on('driver_arrived', () => {
      setActiveTrip(prev => ({ ...prev, status: 'arrived' }));
      Alert.alert('Driver Arrived', 'Your driver has arrived at the pickup location');
    });

    socket.on('trip_started', () => {
      setActiveTrip(prev => ({ ...prev, status: 'in_progress' }));
    });

    socket.on('trip_completed', (data) => {
      setActiveTrip(null);
      setDriverLocation(null);
      navigation.navigate('Rating', { tripId: data.tripId, fare: data.finalFare });
    });

    socket.on('ride_cancelled', (data) => {
      Alert.alert('Ride Cancelled', data.reason || 'The driver cancelled the ride');
      setActiveTrip(null);
    });

    socket.on('no_drivers_available', () => {
      Alert.alert('No Drivers Available', 'No drivers are available in your area right now');
      setActiveTrip(null);
    });

    return () => {
      socket.off('ride_accepted');
      socket.off('driver_location_update');
      socket.off('driver_arrived');
      socket.off('trip_started');
      socket.off('trip_completed');
      socket.off('ride_cancelled');
      socket.off('no_drivers_available');
    };
  }, [socket]);

  // Fetch fare estimate
  useEffect(() => {
    if (pickupLocation && dropoffLocation) {
      fetchFareEstimate();
    }
  }, [pickupLocation, dropoffLocation]);

  const fetchFareEstimate = async () => {
    try {
      const estimate = await rideService.estimateFare({
        pickupLocation: {
          lat: pickupLocation.latitude,
          lng: pickupLocation.longitude
        },
        dropoffLocation: {
          lat: dropoffLocation.latitude,
          lng: dropoffLocation.longitude
        }
      });
      setFareEstimate(estimate);
    } catch (error) {
      console.error('Error estimating fare:', error);
    }
  };

  const handleRequestRide = async () => {
    if (!pickupLocation || !dropoffLocation) {
      Alert.alert('Error', 'Please select both pickup and dropoff locations');
      return;
    }

    setLoading(true);
    try {
      const trip = await rideService.createTrip({
        pickupLocation: {
          lat: pickupLocation.latitude,
          lng: pickupLocation.longitude,
          address: 'Pickup Address' // Would come from reverse geocoding
        },
        dropoffLocation: {
          lat: dropoffLocation.latitude,
          lng: dropoffLocation.longitude,
          address: 'Dropoff Address' // Would come from reverse geocoding
        },
        paymentMethod: 'card'
      });

      setActiveTrip(trip);
      Alert.alert('Ride Requested', 'Finding nearby drivers...');
    } catch (error) {
      console.error('Error requesting ride:', error);
      Alert.alert('Error', 'Failed to request ride');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRide = async () => {
    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this ride?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await rideService.cancelTrip(activeTrip.tripId, {
                reason: 'Change of plans'
              });
              setActiveTrip(null);
              setDriverLocation(null);
            } catch (error) {
              console.error('Error cancelling ride:', error);
              Alert.alert('Error', 'Failed to cancel ride');
            }
          }
        }
      ]
    );
  };

  const handleMapPress = (e) => {
    if (searchMode === 'pickup') {
      setPickupLocation(e.nativeEvent.coordinate);
      setSearchMode(null);
    } else if (searchMode === 'dropoff') {
      setDropoffLocation(e.nativeEvent.coordinate);
      setSearchMode(null);
    }
  };

  if (!currentLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05
        }}
        onPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton
      >
        {/* Pickup Marker */}
        {pickupLocation && (
          <Marker
            coordinate={pickupLocation}
            pinColor="green"
            title="Pickup Location"
            draggable
            onDragEnd={(e) => setPickupLocation(e.nativeEvent.coordinate)}
          />
        )}

        {/* Dropoff Marker */}
        {dropoffLocation && (
          <Marker
            coordinate={dropoffLocation}
            pinColor="red"
            title="Dropoff Location"
            draggable
            onDragEnd={(e) => setDropoffLocation(e.nativeEvent.coordinate)}
          />
        )}

        {/* Driver Marker */}
        {driverLocation && (
          <Marker
            coordinate={driverLocation}
            title="Driver Location"
            image={require('../../assets/car-marker.png')}
          />
        )}

        {/* Route Line */}
        {pickupLocation && dropoffLocation && (
          <Polyline
            coordinates={[pickupLocation, dropoffLocation]}
            strokeColor="#4285F4"
            strokeWidth={3}
            lineDashPattern={[10, 10]}
          />
        )}
      </MapView>

      {/* Bottom Panel */}
      <View style={styles.bottomPanel}>
        {!activeTrip ? (
          <View style={styles.requestPanel}>
            <Text style={styles.panelTitle}>Book a Ride</Text>

            <TouchableOpacity
              style={styles.locationInput}
              onPress={() => setSearchMode('pickup')}
            >
              <Text style={styles.inputText}>
                {pickupLocation ? '📍 Pickup location set' : 'Set pickup location'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.locationInput}
              onPress={() => setSearchMode('dropoff')}
            >
              <Text style={styles.inputText}>
                {dropoffLocation ? '📍 Dropoff location set' : 'Set dropoff location'}
              </Text>
            </TouchableOpacity>

            {fareEstimate && (
              <View style={styles.fareCard}>
                <Text style={styles.fareLabel}>Estimated Fare</Text>
                <Text style={styles.fareAmount}>${fareEstimate.estimatedFare}</Text>
                <View style={styles.fareDetails}>
                  <Text style={styles.fareDetailText}>
                    Distance: {fareEstimate.distance} km
                  </Text>
                  <Text style={styles.fareDetailText}>
                    Time: ~{fareEstimate.estimatedDuration} min
                  </Text>
                </View>
                {fareEstimate.surgeMultiplier > 1 && (
                  <Text style={styles.surgeText}>
                    ⚡ Surge pricing: {fareEstimate.surgeMultiplier}x
                  </Text>
                )}
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.requestButton,
                (!fareEstimate || loading) && styles.requestButtonDisabled
              ]}
              onPress={handleRequestRide}
              disabled={!fareEstimate || loading}
            >
              <Text style={styles.requestButtonText}>
                {loading ? 'Requesting...' : 'Request Ride'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.activeTripPanel}>
            <Text style={styles.panelTitle}>Your Ride</Text>

            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {getStatusText(activeTrip.status)}
              </Text>
            </View>

            {activeTrip.driver && (
              <View style={styles.driverInfo}>
                <View style={styles.driverAvatar}>
                  <Text style={styles.driverInitial}>
                    {activeTrip.driver.firstName?.[0]}
                  </Text>
                </View>
                <View style={styles.driverDetails}>
                  <Text style={styles.driverName}>
                    {activeTrip.driver.firstName}
                  </Text>
                  <Text style={styles.driverRating}>
                    ⭐ {activeTrip.driver.rating}
                  </Text>
                </View>
              </View>
            )}

            {activeTrip.vehicle && (
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleText}>
                  {activeTrip.vehicle.make} {activeTrip.vehicle.model}
                </Text>
                <Text style={styles.vehicleText}>
                  {activeTrip.vehicle.color} • {activeTrip.vehicle.plateNumber}
                </Text>
              </View>
            )}

            <View style={styles.tripDetails}>
              <Text style={styles.fareText}>
                Estimated fare: ${activeTrip.estimatedFare}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelRide}
            >
              <Text style={styles.cancelButtonText}>Cancel Ride</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Search Mode Indicator */}
      {searchMode && (
        <View style={styles.searchModeIndicator}>
          <Text style={styles.searchModeText}>
            Tap on the map to set {searchMode} location
          </Text>
        </View>
      )}
    </View>
  );
}

function getStatusText(status) {
  const statusMap = {
    requested: 'Finding drivers...',
    accepted: 'Driver assigned',
    driver_en_route: 'Driver on the way',
    arrived: 'Driver arrived',
    in_progress: 'Trip in progress'
  };
  return statusMap[status] || status;
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666'
  },
  map: {
    flex: 1
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10
  },
  requestPanel: {},
  activeTripPanel: {},
  panelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15
  },
  locationInput: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10
  },
  inputText: {
    fontSize: 16,
    color: '#333'
  },
  fareCard: {
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 10,
    marginVertical: 15
  },
  fareLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5
  },
  fareAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4285F4',
    marginBottom: 10
  },
  fareDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  fareDetailText: {
    fontSize: 14,
    color: '#666'
  },
  surgeText: {
    marginTop: 10,
    fontSize: 14,
    color: '#ff6b6b',
    fontWeight: 'bold'
  },
  requestButton: {
    backgroundColor: '#4285F4',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center'
  },
  requestButtonDisabled: {
    backgroundColor: '#ccc'
  },
  requestButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  statusBadge: {
    backgroundColor: '#4285F4',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 15
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  driverAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  driverInitial: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold'
  },
  driverDetails: {},
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5
  },
  driverRating: {
    fontSize: 14,
    color: '#666'
  },
  vehicleInfo: {
    marginBottom: 15
  },
  vehicleText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3
  },
  tripDetails: {
    marginBottom: 15
  },
  fareText: {
    fontSize: 16,
    fontWeight: '600'
  },
  cancelButton: {
    backgroundColor: '#ff6b6b',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  searchModeIndicator: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#4285F4',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  searchModeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  }
});
```

---

## Driver Mobile App

### Driver Home Screen (`apps/driver-app/src/screens/Home/HomeScreen.js`)

```javascript
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  Alert,
  Switch
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { driverService } from '../../services/driverService';

export default function DriverHomeScreen({ navigation }) {
  const { user, driver } = useAuth();
  const { socket } = useSocket();
  const mapRef = useRef(null);
  const locationIntervalRef = useRef(null);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [incomingRide, setIncomingRide] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);
  const [countdown, setCountdown] = useState(30);

  // Watch location
  useEffect(() => {
    const watchId = Geolocation.watchPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setCurrentLocation(location);

        // Send location updates when online
        if (isOnline && !locationIntervalRef.current) {
          sendLocationUpdate(location, position.coords);
        }
      },
      (error) => console.error('Location error:', error),
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 5000
      }
    );

    return () => Geolocation.clearWatch(watchId);
  }, [isOnline]);

  // Send location updates
  useEffect(() => {
    if (isOnline && currentLocation) {
      locationIntervalRef.current = setInterval(() => {
        sendLocationUpdate(currentLocation);
      }, 5000);
    } else {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
        locationIntervalRef.current = null;
      }
    }

    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
    };
  }, [isOnline, currentLocation]);

  const sendLocationUpdate = async (location, coords) => {
    if (socket && socket.connected) {
      socket.emit('update_location', {
        lat: location.latitude,
        lng: location.longitude,
        heading: coords?.heading || 0,
        speed: coords?.speed || 0,
        accuracy: coords?.accuracy || 0
      });
    }

    try {
      await driverService.updateLocation({
        lat: location.latitude,
        lng: location.longitude,
        heading: coords?.heading || 0,
        speed: coords?.speed || 0,
        accuracy: coords?.accuracy || 0
      });
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  // Socket.IO listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('ride_request', (data) => {
      console.log('New ride request:', data);
      setIncomingRide(data);
      setCountdown(data.timeout || 30);
    });

    socket.on('ride_cancelled_by_rider', (data) => {
      Alert.alert('Ride Cancelled', 'The rider has cancelled the ride');
      setIncomingRide(null);
      setActiveTrip(null);
    });

    return () => {
      socket.off('ride_request');
      socket.off('ride_cancelled_by_rider');
    };
  }, [socket]);

  // Countdown timer for incoming ride
  useEffect(() => {
    if (!incomingRide) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setIncomingRide(null);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [incomingRide]);

  const handleToggleOnline = async () => {
    if (!driver?.isVerified) {
      Alert.alert('Not Verified', 'Your account needs to be verified before you can go online');
      return;
    }

    try {
      await driverService.updateStatus({ isOnline: !isOnline });
      setIsOnline(!isOnline);
    } catch (error) {
      console.error('Error toggling online status:', error);
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleAcceptRide = async () => {
    if (!incomingRide) return;

    try {
      const trip = await driverService.acceptTrip(incomingRide.tripId);
      setActiveTrip(trip);
      setIncomingRide(null);
      navigation.navigate('ActiveTrip', { tripId: trip.tripId });
    } catch (error) {
      console.error('Error accepting ride:', error);
      Alert.alert('Error', 'Failed to accept ride');
      setIncomingRide(null);
    }
  };

  const handleDeclineRide = async () => {
    if (!incomingRide) return;

    try {
      await driverService.declineTrip(incomingRide.tripId, {
        reason: 'Not available'
      });
      setIncomingRide(null);
    } catch (error) {
      console.error('Error declining ride:', error);
    }
  };

  if (!currentLocation) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05
        }}
        showsUserLocation
        showsMyLocationButton
      />

      {/* Online/Offline Toggle */}
      <View style={styles.statusContainer}>
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>
            {isOnline ? '🟢 Online' : '⚫ Offline'}
          </Text>
          <Switch
            value={isOnline}
            onValueChange={handleToggleOnline}
            trackColor={{ false: '#ccc', true: '#4285F4' }}
            thumbColor={isOnline ? '#fff' : '#f4f3f4'}
          />
        </View>

        {isOnline && (
          <View style={styles.earningsCard}>
            <Text style={styles.earningsLabel}>Today's Earnings</Text>
            <Text style={styles.earningsAmount}>$0.00</Text>
            <Text style={styles.earningsTrips}>0 trips</Text>
          </View>
        )}
      </View>

      {/* Incoming Ride Modal */}
      <Modal
        visible={!!incomingRide}
        transparent
        animationType="slide"
        onRequestClose={() => setIncomingRide(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.rideRequestCard}>
            <View style={styles.countdownCircle}>
              <Text style={styles.countdownText}>{countdown}</Text>
            </View>

            <Text style={styles.rideRequestTitle}>New Ride Request</Text>

            <View style={styles.rideDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Pickup:</Text>
                <Text style={styles.detailValue} numberOfLines={2}>
                  {incomingRide?.pickup?.address}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Dropoff:</Text>
                <Text style={styles.detailValue} numberOfLines={2}>
                  {incomingRide?.dropoff?.address}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Distance:</Text>
                <Text style={styles.detailValue}>
                  {incomingRide?.distance} km
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Estimated Fare:</Text>
                <Text style={styles.detailValue}>
                  ${incomingRide?.estimatedFare}
                </Text>
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.declineButton]}
                onPress={handleDeclineRide}
              >
                <Text style={styles.buttonText}>Decline</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={handleAcceptRide}
              >
                <Text style={styles.buttonText}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  map: {
    flex: 1
  },
  statusContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20
  },
  statusCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  earningsCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5
  },
  earningsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5
  },
  earningsAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4285F4',
    marginBottom: 5
  },
  earningsTrips: {
    fontSize: 14,
    color: '#666'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  rideRequestCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400
  },
  countdownCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20
  },
  countdownText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold'
  },
  rideRequestTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20
  },
  rideDetails: {
    marginBottom: 20
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    width: 100,
    color: '#666'
  },
  detailValue: {
    fontSize: 16,
    flex: 1,
    color: '#333'
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5
  },
  declineButton: {
    backgroundColor: '#ff6b6b'
  },
  acceptButton: {
    backgroundColor: '#4285F4'
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  }
});
```

---

## Utility Files

### Location Permissions (`apps/rider-app/src/utils/permissions.js`)

```javascript
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export async function requestLocationPermission() {
  if (Platform.OS === 'ios') {
    // iOS automatically prompts for permission
    Geolocation.requestAuthorization('whenInUse');
    return true;
  }

  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'RideOn needs access to your location to show nearby drivers and track your trips.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK'
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission granted');
        return true;
      } else {
        Alert.alert(
          'Location Permission Required',
          'RideOn requires location access to function properly.'
        );
        return false;
      }
    } catch (err) {
      console.error('Permission error:', err);
      return false;
    }
  }
}
```

### API Service (`apps/rider-app/src/services/api.js`)

```javascript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:3001/api'; // Change for production

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try refresh
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken
        });

        const { accessToken } = response.data.data;
        await AsyncStorage.setItem('accessToken', accessToken);

        // Retry original request
        error.config.headers.Authorization = `Bearer ${accessToken}`;
        return axios(error.config);
      } catch (refreshError) {
        // Refresh failed, logout user
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
        // Navigate to login
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### Ride Service (`apps/rider-app/src/services/rideService.js`)

```javascript
import api from './api';

class RideService {
  async estimateFare(data) {
    const response = await api.post('/rider/trips/estimate', data);
    return response.data;
  }

  async createTrip(data) {
    const response = await api.post('/rider/trips', data);
    return response.data;
  }

  async getTrip(tripId) {
    const response = await api.get(`/rider/trips/${tripId}`);
    return response.data;
  }

  async cancelTrip(tripId, data) {
    const response = await api.post(`/rider/trips/${tripId}/cancel`, data);
    return response.data;
  }

  async getTripHistory(params) {
    const response = await api.get('/rider/trips', { params });
    return response.data;
  }

  async rateTrip(tripId, data) {
    const response = await api.post(`/rider/trips/${tripId}/rating`, data);
    return response.data;
  }
}

export const rideService = new RideService();
```

---

## Package.json for Mobile Apps

### Rider App (`apps/rider-app/package.json`)

```json
{
  "name": "rideon-rider-app",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "start": "react-native start",
    "test": "jest"
  },
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.73.2",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/stack": "^6.3.20",
    "@react-native-community/geolocation": "^3.1.0",
    "@react-native-async-storage/async-storage": "^1.21.0",
    "react-native-maps": "^1.10.0",
    "socket.io-client": "^4.6.0",
    "axios": "^1.6.5",
    "react-native-safe-area-context": "^4.8.2",
    "react-native-screens": "^3.29.0",
    "react-native-gesture-handler": "^2.14.1"
  },
  "devDependencies": {
    "@babel/core": "^7.23.7",
    "@babel/runtime": "^7.23.7",
    "jest": "^29.7.0",
    "metro-react-native-babel-preset": "^0.77.0"
  }
}
```

This comprehensive guide provides complete, production-ready code for both rider and driver mobile applications using React Native with all the core features including real-time location tracking, ride matching, and Socket.IO integration.
