import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../config/constants';

export default function BookingScreen({ navigation, route }) {
  const [pickup, setPickup] = useState(route.params?.pickup || '');
  const [dropoff, setDropoff] = useState(route.params?.dropoff || '');
  const [selectedPayment, setSelectedPayment] = useState('wallet');
  const [promoCode, setPromoCode] = useState('');

  const savedLocations = [
    { id: 1, name: 'Home', address: '123 Main St, San Francisco', icon: 'home' },
    { id: 2, name: 'Work', address: '456 Market St, San Francisco', icon: 'briefcase' },
    { id: 3, name: 'Gym', address: '789 Mission St, San Francisco', icon: 'fitness' },
  ];

  const handleContinue = () => {
    if (!pickup || !dropoff) {
      alert('Please enter both pickup and dropoff locations');
      return;
    }
    navigation.navigate('VehicleSelection', {
      pickup,
      dropoff,
      payment: selectedPayment,
      promoCode,
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book a Ride</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Location Inputs */}
        <View style={styles.locationCard}>
          <View style={styles.locationInputs}>
            <View style={styles.locationDots}>
              <View style={styles.pickupDot} />
              <View style={styles.locationLine} />
              <View style={styles.dropoffDot} />
            </View>

            <View style={styles.inputs}>
              <TextInput
                style={styles.input}
                placeholder="Pickup location"
                value={pickup}
                onChangeText={setPickup}
              />
              <View style={styles.inputDivider} />
              <TextInput
                style={styles.input}
                placeholder="Where to?"
                value={dropoff}
                onChangeText={setDropoff}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.currentLocationButton}>
            <Ionicons name="locate" size={20} color="#7C3AED" />
            <Text style={styles.currentLocationText}>Use current location</Text>
          </TouchableOpacity>
        </View>

        {/* Saved Locations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Locations</Text>
          {savedLocations.map((location) => (
            <TouchableOpacity
              key={location.id}
              style={styles.savedLocation}
              onPress={() => setDropoff(location.address)}
            >
              <View style={styles.savedLocationIcon}>
                <Ionicons name={location.icon} size={20} color="#7C3AED" />
              </View>
              <View style={styles.savedLocationInfo}>
                <Text style={styles.savedLocationName}>{location.name}</Text>
                <Text style={styles.savedLocationAddress}>{location.address}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Special Pickups */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Pickups</Text>
          <View style={styles.specialPickups}>
            <TouchableOpacity style={styles.specialPickup}>
              <Ionicons name="airplane" size={24} color="#7C3AED" />
              <Text style={styles.specialPickupText}>Airport</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.specialPickup}>
              <Ionicons name="train" size={24} color="#7C3AED" />
              <Text style={styles.specialPickupText}>Station</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.specialPickup}>
              <Ionicons name="location" size={24} color="#7C3AED" />
              <Text style={styles.specialPickupText}>Landmark</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethods}>
            <TouchableOpacity
              style={[styles.paymentMethod, selectedPayment === 'wallet' && styles.paymentMethodActive]}
              onPress={() => setSelectedPayment('wallet')}
            >
              <Ionicons name="wallet" size={20} color={selectedPayment === 'wallet' ? '#7C3AED' : '#9CA3AF'} />
              <Text style={[styles.paymentMethodText, selectedPayment === 'wallet' && styles.paymentMethodTextActive]}>
                Wallet
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.paymentMethod, selectedPayment === 'card' && styles.paymentMethodActive]}
              onPress={() => setSelectedPayment('card')}
            >
              <Ionicons name="card" size={20} color={selectedPayment === 'card' ? '#7C3AED' : '#9CA3AF'} />
              <Text style={[styles.paymentMethodText, selectedPayment === 'card' && styles.paymentMethodTextActive]}>
                Card
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.paymentMethod, selectedPayment === 'cash' && styles.paymentMethodActive]}
              onPress={() => setSelectedPayment('cash')}
            >
              <Ionicons name="cash" size={20} color={selectedPayment === 'cash' ? '#7C3AED' : '#9CA3AF'} />
              <Text style={[styles.paymentMethodText, selectedPayment === 'cash' && styles.paymentMethodTextActive]}>
                Cash
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Promo Code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Promo Code</Text>
          <View style={styles.promoCodeInput}>
            <TextInput
              style={styles.promoInput}
              placeholder="Enter promo code"
              value={promoCode}
              onChangeText={setPromoCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.promoButton}>
              <Text style={styles.promoButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Schedule for Later */}
        <TouchableOpacity
          style={styles.scheduleButton}
          onPress={() => navigation.navigate('ScheduleRide', { pickup, dropoff })}
        >
          <Ionicons name="calendar-outline" size={20} color="#7C3AED" />
          <Text style={styles.scheduleButtonText}>Schedule for later</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  locationCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationInputs: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  locationDots: {
    alignItems: 'center',
    marginRight: 12,
    paddingTop: 16,
  },
  pickupDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
  },
  locationLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  dropoffDot: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: '#EF4444',
  },
  inputs: {
    flex: 1,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1F2937',
  },
  inputDivider: {
    height: 12,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  currentLocationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  savedLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  savedLocationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  savedLocationInfo: {
    flex: 1,
  },
  savedLocationName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  savedLocationAddress: {
    fontSize: 13,
    color: '#6B7280',
  },
  specialPickups: {
    flexDirection: 'row',
    gap: 12,
  },
  specialPickup: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  specialPickupText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentMethod: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  paymentMethodActive: {
    borderColor: '#7C3AED',
    backgroundColor: '#F3F4F6',
  },
  paymentMethodText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  paymentMethodTextActive: {
    color: '#7C3AED',
  },
  promoCodeInput: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    gap: 8,
  },
  promoInput: {
    flex: 1,
    padding: 12,
    fontSize: 15,
  },
  promoButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
  },
  promoButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  scheduleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7C3AED',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    padding: 18,
    borderRadius: 12,
    gap: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
