import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline } from 'react-native-maps';

export default function TripDetailsScreen({ navigation, route }) {
  const { tripId } = route.params || {};

  // Mock trip data
  const trip = {
    id: tripId || 'TRIP123456',
    date: '2025-12-05',
    time: '10:30 AM',
    status: 'completed',
    pickup: '123 Main St, San Francisco',
    dropoff: '456 Market St, San Francisco',
    pickupCoords: { latitude: 37.7749, longitude: -122.4194 },
    dropoffCoords: { latitude: 37.7849, longitude: -122.4094 },
    distance: '8.5 km',
    duration: '25 min',
    vehicle: {
      name: 'Sedan',
      icon: '🚙',
      plate: 'ABC 1234',
    },
    driver: {
      name: 'John Smith',
      photo: 'https://i.pravatar.cc/150?img=12',
      rating: 4.8,
    },
    fare: {
      baseFare: 8.00,
      distanceFare: 8.50,
      timeFare: 2.00,
      tax: 2.10,
      serviceFee: 1.50,
      discount: -3.00,
      total: 19.10,
    },
    payment: 'Wallet',
    rating: 5,
  };

  const routeCoordinates = [
    trip.pickupCoords,
    { latitude: 37.7799, longitude: -122.4144 },
    trip.dropoffCoords,
  ];

  const handleDownloadInvoice = () => {
    alert('Invoice downloaded to your device');
  };

  const handleEmailReceipt = () => {
    alert('Receipt sent to your email');
  };

  const handleReportIssue = () => {
    navigation.navigate('SupportScreen', { tripId: trip.id });
  };

  const handleReportLostItem = () => {
    navigation.navigate('LostItem', { tripId: trip.id });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip Details</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-social" size={24} color="#7C3AED" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Map Preview */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 37.7799,
              longitude: -122.4144,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <Marker coordinate={trip.pickupCoords}>
              <View style={styles.pickupMarker}>
                <Ionicons name="location" size={20} color="#10B981" />
              </View>
            </Marker>
            <Marker coordinate={trip.dropoffCoords}>
              <View style={styles.dropoffMarker}>
                <Ionicons name="flag" size={20} color="#EF4444" />
              </View>
            </Marker>
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#7C3AED"
              strokeWidth={3}
            />
          </MapView>
          <TouchableOpacity style={styles.replayButton}>
            <Ionicons name="play-circle" size={20} color="#7C3AED" />
            <Text style={styles.replayText}>Replay Route</Text>
          </TouchableOpacity>
        </View>

        {/* Trip Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.statusText}>Completed</Text>
          </View>
          <Text style={styles.tripId}>Trip ID: {trip.id}</Text>
          <Text style={styles.tripDateTime}>{trip.date} • {trip.time}</Text>
        </View>

        {/* Route Info */}
        <View style={styles.routeCard}>
          <View style={styles.routeRow}>
            <Ionicons name="location" size={20} color="#10B981" />
            <View style={styles.routeInfo}>
              <Text style={styles.routeLabel}>Pickup</Text>
              <Text style={styles.routeAddress}>{trip.pickup}</Text>
            </View>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routeRow}>
            <Ionicons name="flag" size={20} color="#EF4444" />
            <View style={styles.routeInfo}>
              <Text style={styles.routeLabel}>Dropoff</Text>
              <Text style={styles.routeAddress}>{trip.dropoff}</Text>
            </View>
          </View>
          <View style={styles.tripStats}>
            <View style={styles.tripStat}>
              <Ionicons name="speedometer-outline" size={16} color="#6B7280" />
              <Text style={styles.tripStatText}>{trip.distance}</Text>
            </View>
            <View style={styles.tripStat}>
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text style={styles.tripStatText}>{trip.duration}</Text>
            </View>
          </View>
        </View>

        {/* Driver Info */}
        <View style={styles.driverCard}>
          <Image source={{ uri: trip.driver.photo }} style={styles.driverPhoto} />
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>{trip.driver.name}</Text>
            <View style={styles.driverRating}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.driverRatingText}>{trip.driver.rating}</Text>
            </View>
            <Text style={styles.vehicleInfo}>{trip.vehicle.name} • {trip.vehicle.plate}</Text>
          </View>
          <View style={styles.driverActions}>
            <Text style={styles.yourRatingLabel}>Your Rating</Text>
            <View style={styles.yourRating}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name="star"
                  size={16}
                  color={star <= trip.rating ? '#F59E0B' : '#E5E7EB'}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Fare Breakdown */}
        <View style={styles.fareCard}>
          <Text style={styles.fareTitle}>Fare Breakdown</Text>

          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Base Fare</Text>
            <Text style={styles.fareValue}>${trip.fare.baseFare.toFixed(2)}</Text>
          </View>

          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Distance Fare</Text>
            <Text style={styles.fareValue}>${trip.fare.distanceFare.toFixed(2)}</Text>
          </View>

          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Time Fare</Text>
            <Text style={styles.fareValue}>${trip.fare.timeFare.toFixed(2)}</Text>
          </View>

          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Tax</Text>
            <Text style={styles.fareValue}>${trip.fare.tax.toFixed(2)}</Text>
          </View>

          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Service Fee</Text>
            <Text style={styles.fareValue}>${trip.fare.serviceFee.toFixed(2)}</Text>
          </View>

          {trip.fare.discount < 0 && (
            <View style={styles.fareRow}>
              <Text style={[styles.fareLabel, { color: '#10B981' }]}>Discount</Text>
              <Text style={[styles.fareValue, { color: '#10B981' }]}>
                ${trip.fare.discount.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>${trip.fare.total.toFixed(2)}</Text>
          </View>

          <View style={styles.paymentMethod}>
            <Ionicons name="wallet" size={16} color="#6B7280" />
            <Text style={styles.paymentMethodText}>Paid via {trip.payment}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsCard}>
          <TouchableOpacity style={styles.actionButton} onPress={handleDownloadInvoice}>
            <Ionicons name="download-outline" size={20} color="#7C3AED" />
            <Text style={styles.actionButtonText}>Download Invoice</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleEmailReceipt}>
            <Ionicons name="mail-outline" size={20} color="#7C3AED" />
            <Text style={styles.actionButtonText}>Email Receipt</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleReportLostItem}>
            <Ionicons name="help-circle-outline" size={20} color="#7C3AED" />
            <Text style={styles.actionButtonText}>Lost Item</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleReportIssue}>
            <Ionicons name="warning-outline" size={20} color="#EF4444" />
            <Text style={styles.actionButtonText}>Report Issue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    height: 200,
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  pickupMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  dropoffMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  replayButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  replayText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7C3AED',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  tripId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  tripDateTime: {
    fontSize: 13,
    color: '#6B7280',
  },
  routeCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  routeInfo: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  routeAddress: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginLeft: 9,
    marginVertical: 8,
  },
  tripStats: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 24,
  },
  tripStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tripStatText: {
    fontSize: 14,
    color: '#6B7280',
  },
  driverCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
  },
  driverPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  driverRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  driverRatingText: {
    fontSize: 13,
    color: '#6B7280',
  },
  vehicleInfo: {
    fontSize: 13,
    color: '#6B7280',
  },
  driverActions: {
    alignItems: 'flex-end',
  },
  yourRatingLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  yourRating: {
    flexDirection: 'row',
    gap: 2,
  },
  fareCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  },
  fareTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fareLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  fareValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paymentMethodText: {
    fontSize: 13,
    color: '#6B7280',
  },
  actionsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 8,
    borderRadius: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
  },
});
