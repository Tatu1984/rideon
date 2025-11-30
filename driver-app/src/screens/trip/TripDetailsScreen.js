import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Linking } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useDriver } from '../../contexts/DriverContext';

export default function TripDetailsScreen({ route, navigation }) {
  const { activeTrip, startTrip, completeTrip } = useDriver();
  const [trip, setTrip] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    if (activeTrip) {
      setTrip(activeTrip);
    } else if (route?.params?.trip) {
      setTrip(route.params.trip);
    }
  }, [activeTrip, route]);

  const handleStartTrip = async () => {
    if (!trip) return;

    Alert.alert(
      'Start Trip',
      'Have you picked up the passenger?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Trip',
          onPress: async () => {
            setIsStarting(true);
            const result = await startTrip(trip.id);
            setIsStarting(false);

            if (result.success) {
              Alert.alert('Success', 'Trip started successfully');
            } else {
              Alert.alert('Error', result.error || 'Failed to start trip');
            }
          },
        },
      ]
    );
  };

  const handleCompleteTrip = async () => {
    if (!trip) return;

    Alert.alert(
      'Complete Trip',
      'Have you reached the destination?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            setIsCompleting(true);
            const result = await completeTrip(trip.id);
            setIsCompleting(false);

            if (result.success) {
              Alert.alert('Success', 'Trip completed successfully', [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } else {
              Alert.alert('Error', result.error || 'Failed to complete trip');
            }
          },
        },
      ]
    );
  };

  const handleCallPassenger = () => {
    if (trip?.passenger?.phone) {
      Linking.openURL(`tel:${trip.passenger.phone}`);
    } else {
      Alert.alert('Error', 'Passenger phone number not available');
    }
  };

  const handleNavigate = () => {
    const destination = trip?.status === 'accepted'
      ? trip?.pickupLocation
      : trip?.dropoffLocation;

    if (destination) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}`;
      Linking.openURL(url);
    }
  };

  if (!trip) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No trip details available</Text>
      </View>
    );
  }

  const initialRegion = {
    latitude: trip.pickupLocation?.latitude || 0,
    longitude: trip.pickupLocation?.longitude || 0,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const getTripStatus = () => {
    switch (trip.status) {
      case 'accepted':
        return { text: 'Going to pickup', color: '#F59E0B' };
      case 'in_progress':
        return { text: 'Trip in progress', color: '#7C3AED' };
      case 'completed':
        return { text: 'Completed', color: '#10B981' };
      default:
        return { text: trip.status, color: '#6B7280' };
    }
  };

  const status = getTripStatus();

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
      >
        {trip.pickupLocation && (
          <Marker
            coordinate={{
              latitude: trip.pickupLocation.latitude,
              longitude: trip.pickupLocation.longitude,
            }}
            title="Pickup Location"
            pinColor="#7C3AED"
          />
        )}
        {trip.dropoffLocation && (
          <Marker
            coordinate={{
              latitude: trip.dropoffLocation.latitude,
              longitude: trip.dropoffLocation.longitude,
            }}
            title="Dropoff Location"
            pinColor="#EF4444"
          />
        )}
        {trip.pickupLocation && trip.dropoffLocation && (
          <Polyline
            coordinates={[
              {
                latitude: trip.pickupLocation.latitude,
                longitude: trip.pickupLocation.longitude,
              },
              {
                latitude: trip.dropoffLocation.latitude,
                longitude: trip.dropoffLocation.longitude,
              },
            ]}
            strokeColor="#7C3AED"
            strokeWidth={3}
          />
        )}
      </MapView>

      <ScrollView style={styles.detailsContainer}>
        <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
          <Text style={styles.statusText}>{status.text}</Text>
        </View>

        <View style={styles.passengerSection}>
          <View style={styles.passengerInfo}>
            <View style={styles.passengerAvatar}>
              <Text style={styles.passengerAvatarText}>
                {trip.passenger?.name?.charAt(0)?.toUpperCase() || 'P'}
              </Text>
            </View>
            <View style={styles.passengerDetails}>
              <Text style={styles.passengerName}>{trip.passenger?.name || 'Passenger'}</Text>
              <View style={styles.passengerRating}>
                <Text style={styles.ratingIcon}>⭐</Text>
                <Text style={styles.ratingText}>{trip.passenger?.rating?.toFixed(1) || '5.0'}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.callButton} onPress={handleCallPassenger}>
            <Text style={styles.callButtonText}>📞</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.routeSection}>
          <View style={styles.routeItem}>
            <View style={styles.routeIconContainer}>
              <View style={styles.pickupDot} />
            </View>
            <View style={styles.routeInfo}>
              <Text style={styles.routeLabel}>Pickup</Text>
              <Text style={styles.routeAddress}>{trip.pickupAddress || 'Pickup location'}</Text>
            </View>
          </View>

          <View style={styles.routeLine} />

          <View style={styles.routeItem}>
            <View style={styles.routeIconContainer}>
              <View style={styles.dropoffDot} />
            </View>
            <View style={styles.routeInfo}>
              <Text style={styles.routeLabel}>Dropoff</Text>
              <Text style={styles.routeAddress}>{trip.dropoffAddress || 'Dropoff location'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.tripInfoSection}>
          <View style={styles.tripInfoItem}>
            <Text style={styles.tripInfoLabel}>Distance</Text>
            <Text style={styles.tripInfoValue}>
              {trip.distance ? `${trip.distance.toFixed(1)} km` : 'Calculating...'}
            </Text>
          </View>
          <View style={styles.tripInfoItem}>
            <Text style={styles.tripInfoLabel}>Estimated Time</Text>
            <Text style={styles.tripInfoValue}>
              {trip.estimatedTime ? `${Math.round(trip.estimatedTime)} min` : 'Calculating...'}
            </Text>
          </View>
          <View style={styles.tripInfoItem}>
            <Text style={styles.tripInfoLabel}>Fare</Text>
            <Text style={styles.tripInfoValue}>${trip.fare?.toFixed(2) || '0.00'}</Text>
          </View>
        </View>

        {trip.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Passenger Notes</Text>
            <Text style={styles.notesText}>{trip.notes}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.navigateButton} onPress={handleNavigate}>
          <Text style={styles.navigateButtonText}>
            Navigate to {trip.status === 'accepted' ? 'Pickup' : 'Dropoff'}
          </Text>
        </TouchableOpacity>

        {trip.status === 'accepted' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.startButton]}
            onPress={handleStartTrip}
            disabled={isStarting}
          >
            <Text style={styles.actionButtonText}>
              {isStarting ? 'Starting...' : 'Start Trip'}
            </Text>
          </TouchableOpacity>
        )}

        {trip.status === 'in_progress' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={handleCompleteTrip}
            disabled={isCompleting}
          >
            <Text style={styles.actionButtonText}>
              {isCompleting ? 'Completing...' : 'Complete Trip'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  map: {
    height: 300,
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  statusBadge: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  passengerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  passengerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  passengerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  passengerAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  passengerDetails: {
    flex: 1,
  },
  passengerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  passengerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  callButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButtonText: {
    fontSize: 24,
  },
  routeSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  routeItem: {
    flexDirection: 'row',
  },
  routeIconContainer: {
    width: 24,
    alignItems: 'center',
  },
  pickupDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#7C3AED',
  },
  routeLine: {
    width: 2,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginLeft: 11,
    marginVertical: 4,
  },
  dropoffDot: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: '#EF4444',
  },
  routeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  routeLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  routeAddress: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  tripInfoSection: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tripInfoItem: {
    flex: 1,
    alignItems: 'center',
  },
  tripInfoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  tripInfoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  notesSection: {
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#78350F',
  },
  navigateButton: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  navigateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  startButton: {
    backgroundColor: '#7C3AED',
  },
  completeButton: {
    backgroundColor: '#10B981',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 40,
  },
});
