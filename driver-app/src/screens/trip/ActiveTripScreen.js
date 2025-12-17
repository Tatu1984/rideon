import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useDriver } from '../../contexts/DriverContext';

export default function ActiveTripScreen({ navigation, route }) {
  const { trip } = route.params || {};
  const { updateTripStatus } = useDriver();
  const [tripStatus, setTripStatus] = useState(trip?.status || 'accepted');
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleArrivedAtPickup = async () => {
    setTripStatus('driver_arrived');
    await updateTripStatus(trip.id, 'driver_arrived');
    Alert.alert('Success', 'Marked as arrived at pickup location');
  };

  const handleStartTrip = async () => {
    setTripStatus('in_progress');
    await updateTripStatus(trip.id, 'in_progress');
    Alert.alert('Success', 'Trip started!');
  };

  const handleCompleteTrip = async () => {
    Alert.alert(
      'Complete Trip',
      'Are you sure you want to complete this trip?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            await updateTripStatus(trip.id, 'completed');
            navigation.navigate('MainTabs');
            Alert.alert('Success', 'Trip completed! Payment received.');
          },
        },
      ]
    );
  };

  const handleCall = () => {
    const phoneNumber = trip?.passenger?.phone || '';
    const url = Platform.OS === 'ios' ? `telprompt:${phoneNumber}` : `tel:${phoneNumber}`;
    Linking.openURL(url);
  };

  const handleNavigate = () => {
    const destination = tripStatus === 'accepted' || tripStatus === 'driver_arrived'
      ? trip?.pickup
      : trip?.dropoff;

    const url = Platform.select({
      ios: `maps://app?daddr=${destination?.latitude},${destination?.longitude}`,
      android: `google.navigation:q=${destination?.latitude},${destination?.longitude}`,
    });

    Linking.openURL(url);
  };

  const handleSOS = () => {
    Alert.alert(
      'Emergency SOS',
      'This will alert the operations team and emergency services. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Emergency',
          style: 'destructive',
          onPress: () => {
            // In real app, this would trigger emergency protocol
            Linking.openURL('tel:911');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: trip?.pickup?.latitude || 37.78825,
          longitude: trip?.pickup?.longitude || -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation
      >
        {trip?.pickup && (
          <Marker
            coordinate={{
              latitude: trip.pickup.latitude,
              longitude: trip.pickup.longitude,
            }}
            pinColor="#10B981"
            title="Pickup"
          />
        )}
        {trip?.dropoff && (
          <Marker
            coordinate={{
              latitude: trip.dropoff.latitude,
              longitude: trip.dropoff.longitude,
            }}
            pinColor="#EF4444"
            title="Dropoff"
          />
        )}
      </MapView>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.statusBadge}>
            {tripStatus === 'accepted' && 'Heading to Pickup'}
            {tripStatus === 'driver_arrived' && 'Arrived at Pickup'}
            {tripStatus === 'in_progress' && 'In Progress'}
          </Text>
          <Text style={styles.timerText}>{formatTime(timer)}</Text>
        </View>
        <TouchableOpacity onPress={handleSOS} style={styles.sosButton}>
          <Ionicons name="alert-circle" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Bottom Panel */}
      <View style={styles.bottomPanel}>
        <View style={styles.passengerInfo}>
          <View style={styles.passengerAvatar}>
            <Ionicons name="person" size={32} color="#7C3AED" />
          </View>
          <View style={styles.passengerDetails}>
            <Text style={styles.passengerName}>{trip?.passenger?.name || 'Passenger'}</Text>
            <Text style={styles.passengerRating}>⭐ {trip?.passenger?.rating || '5.0'}</Text>
          </View>
          <TouchableOpacity onPress={handleCall} style={styles.callButton}>
            <Ionicons name="call" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.tripDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="location" size={20} color="#10B981" />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Pickup</Text>
              <Text style={styles.detailValue}>{trip?.pickup?.address}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="location" size={20} color="#EF4444" />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Dropoff</Text>
              <Text style={styles.detailValue}>{trip?.dropoff?.address}</Text>
            </View>
          </View>

          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Estimated Fare</Text>
            <Text style={styles.fareValue}>${trip?.fare || '0.00'}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={handleNavigate} style={styles.navigateButton}>
            <Ionicons name="navigate" size={20} color="#7C3AED" />
            <Text style={styles.navigateButtonText}>Navigate</Text>
          </TouchableOpacity>

          {tripStatus === 'accepted' && (
            <TouchableOpacity onPress={handleArrivedAtPickup} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Arrived at Pickup</Text>
            </TouchableOpacity>
          )}

          {tripStatus === 'driver_arrived' && (
            <TouchableOpacity onPress={handleStartTrip} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Start Trip</Text>
            </TouchableOpacity>
          )}

          {tripStatus === 'in_progress' && (
            <TouchableOpacity onPress={handleCompleteTrip} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Complete Trip</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  statusBadge: {
    backgroundColor: '#7C3AED',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: '600',
  },
  timerText: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sosButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomPanel: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  passengerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  passengerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  passengerDetails: {
    flex: 1,
    marginLeft: 12,
  },
  passengerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  passengerRating: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  callButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tripDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailText: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  fareLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  fareValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  actions: {
    gap: 12,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  navigateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
  },
  primaryButton: {
    backgroundColor: '#7C3AED',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
