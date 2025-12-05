import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
// Temporarily using placeholder for Expo Go compatibility
import MapView, { Marker, PROVIDER_GOOGLE } from '../../components/MapViewPlaceholder';
import { useTrip } from '../../contexts/TripContext';
import { COLORS, TRIP_STATUS } from '../../config/constants';

export default function TripTrackingScreen({ navigation }) {
  const { activeTrip, cancelTrip } = useTrip();
  const [showCancel, setShowCancel] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (!activeTrip) {
      navigation.navigate('Home');
    } else if (activeTrip.status === TRIP_STATUS.COMPLETED) {
      setShowRating(true);
    }
  }, [activeTrip]);

  const handleCancelTrip = async () => {
    const result = await cancelTrip(activeTrip.id, 'User cancelled');
    if (result.success) {
      setShowCancel(false);
      navigation.navigate('Home');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const getStatusMessage = () => {
    if (!activeTrip) return 'Finding driver...';
    switch (activeTrip.status) {
      case TRIP_STATUS.REQUESTED:
        return 'Finding a driver...';
      case TRIP_STATUS.ACCEPTED:
        return 'Driver is on the way';
      case TRIP_STATUS.ARRIVED:
        return 'Driver has arrived';
      case TRIP_STATUS.STARTED:
        return 'Trip in progress';
      case TRIP_STATUS.COMPLETED:
        return 'Trip completed';
      default:
        return 'Processing...';
    }
  };

  const getStatusColor = () => {
    if (!activeTrip) return COLORS.gray;
    switch (activeTrip.status) {
      case TRIP_STATUS.REQUESTED:
        return COLORS.warning;
      case TRIP_STATUS.ACCEPTED:
      case TRIP_STATUS.ARRIVED:
        return COLORS.primary;
      case TRIP_STATUS.STARTED:
        return COLORS.success;
      case TRIP_STATUS.COMPLETED:
        return COLORS.success;
      default:
        return COLORS.gray;
    }
  };

  if (!activeTrip) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading trip...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: activeTrip.pickupLocation.latitude,
          longitude: activeTrip.pickupLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
      >
        <Marker
          coordinate={activeTrip.pickupLocation}
          title="Pickup"
          pinColor={COLORS.primary}
        />
        <Marker
          coordinate={activeTrip.dropoffLocation}
          title="Drop-off"
          pinColor={COLORS.success}
        />
        {activeTrip.driverLocation && (
          <Marker
            coordinate={activeTrip.driverLocation}
            title="Driver"
          >
            <Text style={styles.driverMarker}>🚗</Text>
          </Marker>
        )}
      </MapView>

      <View style={styles.infoContainer}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusMessage()}</Text>
        </View>

        {activeTrip.driver && (
          <View style={styles.driverCard}>
            <View style={styles.driverAvatar}>
              <Text style={styles.avatarText}>
                {activeTrip.driver.firstName?.[0]}{activeTrip.driver.lastName?.[0]}
              </Text>
            </View>
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>
                {activeTrip.driver.firstName} {activeTrip.driver.lastName}
              </Text>
              <Text style={styles.driverRating}>⭐ {activeTrip.driver.rating || '4.8'}</Text>
              <Text style={styles.vehicleInfo}>
                {activeTrip.driver.vehicleType} • {activeTrip.driver.vehicleNumber}
              </Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionIcon}>📞</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionIcon}>💬</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.tripDetails}>
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>{activeTrip.pickupAddress}</Text>
          </View>
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>🎯</Text>
            <Text style={styles.locationText}>{activeTrip.dropoffAddress}</Text>
          </View>
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Fare</Text>
            <Text style={styles.fareAmount}>${activeTrip.fareEstimate?.toFixed(2) || '0.00'}</Text>
          </View>
        </View>

        {activeTrip.status !== TRIP_STATUS.COMPLETED && activeTrip.status !== TRIP_STATUS.STARTED && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowCancel(true)}
          >
            <Text style={styles.cancelButtonText}>Cancel Trip</Text>
          </TouchableOpacity>
        )}

        {activeTrip.status === TRIP_STATUS.STARTED && (
          <View style={styles.sosContainer}>
            <TouchableOpacity style={styles.sosButton}>
              <Text style={styles.sosText}>🆘 SOS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <Text style={styles.shareText}>📤 Share Trip</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal visible={showCancel} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cancel Trip?</Text>
            <Text style={styles.modalMessage}>Are you sure you want to cancel this trip?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonOutline]}
                onPress={() => setShowCancel(false)}
              >
                <Text style={styles.modalButtonTextOutline}>No, Keep Trip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDanger]}
                onPress={handleCancelTrip}
              >
                <Text style={styles.modalButtonText}>Yes, Cancel</Text>
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
  loadingText: {
    fontSize: 18,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 100,
  },
  driverMarker: {
    fontSize: 32,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statusBadge: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 16,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  driverAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  driverRating: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 2,
  },
  vehicleInfo: {
    fontSize: 14,
    color: COLORS.gray,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 20,
  },
  tripDetails: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.dark,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  fareLabel: {
    fontSize: 16,
    color: COLORS.gray,
  },
  fareAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  cancelButton: {
    backgroundColor: COLORS.danger,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  sosContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  sosButton: {
    flex: 1,
    backgroundColor: COLORS.danger,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  sosText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  shareText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonOutline: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  modalButtonDanger: {
    backgroundColor: COLORS.danger,
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextOutline: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
