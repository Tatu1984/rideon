import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../config/constants';

export default function VehicleSelectionScreen({ navigation, route }) {
  const { pickup, dropoff, payment, promoCode } = route.params || {};
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const vehicles = [
    {
      id: 'economy',
      name: 'Economy',
      description: 'Affordable rides',
      capacity: '4',
      icon: '🚗',
      baseFare: 5.00,
      perKm: 0.80,
      perMin: 0.20,
      estimatedFare: 15.50,
      estimatedTime: '5 min',
      surge: false,
    },
    {
      id: 'sedan',
      name: 'Sedan',
      description: 'Comfortable sedans',
      capacity: '4',
      icon: '🚙',
      baseFare: 8.00,
      perKm: 1.20,
      perMin: 0.30,
      estimatedFare: 22.00,
      estimatedTime: '5 min',
      surge: false,
    },
    {
      id: 'suv',
      name: 'SUV',
      description: 'Spacious SUVs',
      capacity: '6',
      icon: '🚐',
      baseFare: 12.00,
      perKm: 1.80,
      perMin: 0.40,
      estimatedFare: 32.50,
      estimatedTime: '7 min',
      surge: false,
    },
    {
      id: 'pool',
      name: 'Pool',
      description: 'Share & save',
      capacity: '2',
      icon: '🚕',
      baseFare: 3.00,
      perKm: 0.60,
      perMin: 0.15,
      estimatedFare: 9.80,
      estimatedTime: '8 min',
      surge: false,
      discount: '30% OFF',
    },
    {
      id: 'xl',
      name: 'XL',
      description: 'Extra large vehicles',
      capacity: '8',
      icon: '🚎',
      baseFare: 15.00,
      perKm: 2.00,
      perMin: 0.50,
      estimatedFare: 40.00,
      estimatedTime: '10 min',
      surge: true,
      surgeMultiplier: 1.5,
    },
  ];

  const handleBookRide = () => {
    if (!selectedVehicle) {
      alert('Please select a vehicle');
      return;
    }
    navigation.navigate('FareBreakdown', {
      pickup,
      dropoff,
      payment,
      promoCode,
      vehicle: vehicles.find(v => v.id === selectedVehicle),
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Select Vehicle</Text>
          <Text style={styles.headerSubtitle}>Choose your ride</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Route Info */}
      <View style={styles.routeInfo}>
        <View style={styles.routeRow}>
          <Ionicons name="location" size={16} color="#10B981" />
          <Text style={styles.routeText} numberOfLines={1}>{pickup || 'Pickup location'}</Text>
        </View>
        <View style={styles.routeRow}>
          <Ionicons name="flag" size={16} color="#EF4444" />
          <Text style={styles.routeText} numberOfLines={1}>{dropoff || 'Dropoff location'}</Text>
        </View>
      </View>

      {/* Vehicle List */}
      <ScrollView style={styles.vehicleList}>
        {vehicles.map((vehicle) => (
          <TouchableOpacity
            key={vehicle.id}
            style={[
              styles.vehicleCard,
              selectedVehicle === vehicle.id && styles.vehicleCardSelected,
            ]}
            onPress={() => setSelectedVehicle(vehicle.id)}
          >
            <View style={styles.vehicleLeft}>
              <Text style={styles.vehicleIcon}>{vehicle.icon}</Text>
              <View style={styles.vehicleInfo}>
                <View style={styles.vehicleNameRow}>
                  <Text style={styles.vehicleName}>{vehicle.name}</Text>
                  {vehicle.surge && (
                    <View style={styles.surgeBadge}>
                      <Ionicons name="flash" size={12} color="#EF4444" />
                      <Text style={styles.surgeText}>{vehicle.surgeMultiplier}x</Text>
                    </View>
                  )}
                  {vehicle.discount && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{vehicle.discount}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.vehicleDescription}>{vehicle.description}</Text>
                <View style={styles.vehicleDetails}>
                  <View style={styles.vehicleDetail}>
                    <Ionicons name="people-outline" size={14} color="#9CA3AF" />
                    <Text style={styles.vehicleDetailText}>{vehicle.capacity}</Text>
                  </View>
                  <View style={styles.vehicleDetail}>
                    <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                    <Text style={styles.vehicleDetailText}>{vehicle.estimatedTime}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.vehicleRight}>
              <Text style={styles.vehicleFare}>${vehicle.estimatedFare.toFixed(2)}</Text>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  // Show fare breakdown
                  alert(`Base: $${vehicle.baseFare}\nPer km: $${vehicle.perKm}\nPer min: $${vehicle.perMin}`);
                }}
              >
                <Ionicons name="information-circle-outline" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {promoCode && (
          <View style={styles.promoApplied}>
            <Ionicons name="pricetag" size={16} color="#10B981" />
            <Text style={styles.promoAppliedText}>{promoCode} applied</Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.bookButton, !selectedVehicle && styles.bookButtonDisabled]}
          onPress={handleBookRide}
          disabled={!selectedVehicle}
        >
          <Text style={styles.bookButtonText}>
            {selectedVehicle
              ? `Book ${vehicles.find(v => v.id === selectedVehicle)?.name}`
              : 'Select a vehicle'}
          </Text>
          {selectedVehicle && <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />}
        </TouchableOpacity>
      </View>
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
  headerInfo: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  routeInfo: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  routeText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
  },
  vehicleList: {
    flex: 1,
    padding: 16,
  },
  vehicleCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  vehicleCardSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#F9FAFB',
  },
  vehicleLeft: {
    flex: 1,
    flexDirection: 'row',
  },
  vehicleIcon: {
    fontSize: 48,
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  surgeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  surgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  discountBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#10B981',
  },
  vehicleDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  vehicleDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  vehicleDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vehicleDetailText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  vehicleRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  vehicleFare: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  promoApplied: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  promoAppliedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    padding: 18,
    borderRadius: 12,
    gap: 8,
  },
  bookButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
