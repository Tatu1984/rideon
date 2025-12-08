import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Modal, Alert, Linking } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE, Heatmap } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useDriver } from '../../contexts/DriverContext';
import { useLocation } from '../../contexts/LocationContext';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { isOnline, goOnline, goOffline, tripRequest, acceptTrip, rejectTrip, earnings } = useDriver();
  const { location } = useLocation();
  const [countdown, setCountdown] = useState(30);
  const [showHeatMap, setShowHeatMap] = useState(true);

  useEffect(() => {
    if (tripRequest) {
      setCountdown(30);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleReject();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [tripRequest]);

  const handleToggleOnline = async () => {
    if (isOnline) {
      await goOffline();
    } else {
      await goOnline();
    }
  };

  const handleAccept = async () => {
    const result = await acceptTrip(tripRequest.id);
    if (!result.success) {
      Alert.alert('Error', result.error);
    } else {
      // Navigate to active trip screen
      navigation.navigate('ActiveTrip', { trip: { ...tripRequest, status: 'accepted' } });
    }
  };

  const handleReject = async () => {
    await rejectTrip(tripRequest.id);
  };

  const handleCall = () => {
    if (tripRequest?.passenger?.phone) {
      Linking.openURL(`tel:${tripRequest.passenger.phone}`);
    }
  };

  const handleNavigate = () => {
    if (tripRequest?.pickup) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${tripRequest.pickup.latitude},${tripRequest.pickup.longitude}`;
      Linking.openURL(url);
    }
  };

  // Mock heat map data - high demand areas
  const heatMapPoints = [
    { latitude: location?.latitude || 37.78825, longitude: location?.longitude || -122.4324, weight: 50 },
    { latitude: (location?.latitude || 37.78825) + 0.01, longitude: (location?.longitude || -122.4324) + 0.01, weight: 30 },
    { latitude: (location?.latitude || 37.78825) - 0.01, longitude: (location?.longitude || -122.4324) - 0.01, weight: 40 },
  ];

  const initialRegion = location ? {
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  } : {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="You"
            description="Your current location"
          />
        )}
        
        {/* Service area geofence example */}
        {location && (
          <Circle
            center={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            radius={5000}
            strokeColor="rgba(124, 58, 237, 0.5)"
            fillColor="rgba(124, 58, 237, 0.1)"
          />
        )}
      </MapView>

      <View style={styles.overlay}>
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View>
              <Text style={styles.statusLabel}>Status</Text>
              <Text style={[styles.statusText, { color: isOnline ? '#10B981' : '#EF4444' }]}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
            <Switch
              value={isOnline}
              onValueChange={handleToggleOnline}
              trackColor={{ false: '#D1D5DB', true: '#A78BFA' }}
              thumbColor={isOnline ? '#7C3AED' : '#F3F4F6'}
            />
          </View>
        </View>

        <View style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>Today's Earnings</Text>
          <Text style={styles.earningsAmount}>${earnings.today || 0}</Text>
        </View>
      </View>

      {/* Trip Request Modal */}
      <Modal
        visible={!!tripRequest}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.countdownContainer}>
              <Text style={styles.countdownText}>{countdown}s</Text>
            </View>

            <Text style={styles.modalTitle}>New Trip Request</Text>

            {/* Quick Stats */}
            <View style={styles.quickStats}>
              <View style={styles.quickStat}>
                <Ionicons name="location" size={20} color="#7C3AED" />
                <Text style={styles.quickStatValue}>{tripRequest?.distanceToRider || '2.3'} km</Text>
                <Text style={styles.quickStatLabel}>To Pickup</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStat}>
                <Ionicons name="time" size={20} color="#7C3AED" />
                <Text style={styles.quickStatValue}>{tripRequest?.estimatedDuration || '12'} min</Text>
                <Text style={styles.quickStatLabel}>Trip Time</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStat}>
                <Ionicons name="cash" size={20} color="#10B981" />
                <Text style={styles.quickStatValue}>${tripRequest?.fare || '15.50'}</Text>
                <Text style={styles.quickStatLabel}>Fare</Text>
              </View>
            </View>

            <View style={styles.tripInfo}>
              <View style={styles.tripRow}>
                <View style={styles.tripIconContainer}>
                  <Ionicons name="person-circle" size={24} color="#7C3AED" />
                </View>
                <View style={styles.tripRowContent}>
                  <Text style={styles.tripLabel}>Passenger</Text>
                  <Text style={styles.tripValue}>{tripRequest?.passenger?.name || 'John Doe'}</Text>
                  <Text style={styles.tripRating}>⭐ {tripRequest?.passenger?.rating || '4.8'}</Text>
                </View>
              </View>

              <View style={styles.tripRow}>
                <View style={styles.tripIconContainer}>
                  <Ionicons name="location" size={24} color="#10B981" />
                </View>
                <View style={styles.tripRowContent}>
                  <Text style={styles.tripLabel}>Pickup Location</Text>
                  <Text style={styles.tripValue}>{tripRequest?.pickup?.address || '123 Main St'}</Text>
                </View>
              </View>

              <View style={styles.tripRow}>
                <View style={styles.tripIconContainer}>
                  <Ionicons name="flag" size={24} color="#EF4444" />
                </View>
                <View style={styles.tripRowContent}>
                  <Text style={styles.tripLabel}>Dropoff Location</Text>
                  <Text style={styles.tripValue}>{tripRequest?.dropoff?.address || '456 Oak Ave'}</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
                <Ionicons name="call" size={20} color="#7C3AED" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleNavigate}>
                <Ionicons name="navigate" size={20} color="#7C3AED" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.rejectButton]}
                onPress={handleReject}
              >
                <Text style={styles.rejectButtonText}>Reject</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.acceptButton]}
                onPress={handleAccept}
              >
                <Text style={styles.acceptButtonText}>Accept</Text>
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
    flex: 1,
  },
  map: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  earningsCard: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    padding: 16,
  },
  earningsLabel: {
    fontSize: 14,
    color: '#E9D5FF',
    marginBottom: 4,
  },
  earningsAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  countdownContainer: {
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  countdownText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    justifyContent: 'space-around',
  },
  quickStat: {
    alignItems: 'center',
    flex: 1,
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginVertical: 4,
  },
  quickStatLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  tripInfo: {
    marginBottom: 16,
  },
  tripRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tripIconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  tripRowContent: {
    flex: 1,
  },
  tripLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  tripValue: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
    marginBottom: 2,
  },
  tripRating: {
    fontSize: 13,
    color: '#F59E0B',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#FEE2E2',
  },
  rejectButtonText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
  },
  acceptButton: {
    backgroundColor: '#7C3AED',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
