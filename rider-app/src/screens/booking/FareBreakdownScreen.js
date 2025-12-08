import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FareBreakdownScreen({ navigation, route }) {
  const { vehicle, pickup, dropoff, promoCode } = route.params || {};

  const fareDetails = {
    baseFare: vehicle?.baseFare || 5.00,
    distanceFare: 8.50,
    timeFare: 2.00,
    surge: vehicle?.surge ? 5.25 : 0,
    tax: 2.10,
    serviceFee: 1.50,
    discount: promoCode ? -3.00 : 0,
  };

  const total = Object.values(fareDetails).reduce((sum, val) => sum + val, 0);

  const handleConfirmBooking = () => {
    // Navigate to trip tracking or confirmation
    alert('Ride booked successfully!');
    navigation.navigate('MainTabs');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fare Breakdown</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Vehicle Info */}
        <View style={styles.vehicleCard}>
          <Text style={styles.vehicleIcon}>{vehicle?.icon || '🚗'}</Text>
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleName}>{vehicle?.name || 'Economy'}</Text>
            <Text style={styles.vehicleDescription}>{vehicle?.description}</Text>
          </View>
        </View>

        {/* Route Info */}
        <View style={styles.routeCard}>
          <View style={styles.routeRow}>
            <Ionicons name="location" size={20} color="#10B981" />
            <Text style={styles.routeText} numberOfLines={2}>{pickup || 'Pickup location'}</Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routeRow}>
            <Ionicons name="flag" size={20} color="#EF4444" />
            <Text style={styles.routeText} numberOfLines={2}>{dropoff || 'Dropoff location'}</Text>
          </View>
        </View>

        {/* Fare Breakdown */}
        <View style={styles.fareCard}>
          <Text style={styles.fareTitle}>Fare Details</Text>

          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Base Fare</Text>
            <Text style={styles.fareValue}>${fareDetails.baseFare.toFixed(2)}</Text>
          </View>

          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Distance Fare</Text>
            <Text style={styles.fareValue}>${fareDetails.distanceFare.toFixed(2)}</Text>
          </View>

          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Time Fare</Text>
            <Text style={styles.fareValue}>${fareDetails.timeFare.toFixed(2)}</Text>
          </View>

          {fareDetails.surge > 0 && (
            <View style={styles.fareRow}>
              <View style={styles.fareRowLeft}>
                <Text style={styles.fareLabel}>Surge Pricing</Text>
                <View style={styles.surgeBadge}>
                  <Ionicons name="flash" size={10} color="#EF4444" />
                  <Text style={styles.surgeText}>{vehicle?.surgeMultiplier}x</Text>
                </View>
              </View>
              <Text style={styles.fareValue}>${fareDetails.surge.toFixed(2)}</Text>
            </View>
          )}

          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Tax</Text>
            <Text style={styles.fareValue}>${fareDetails.tax.toFixed(2)}</Text>
          </View>

          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Service Fee</Text>
            <Text style={styles.fareValue}>${fareDetails.serviceFee.toFixed(2)}</Text>
          </View>

          {fareDetails.discount < 0 && (
            <View style={styles.fareRow}>
              <View style={styles.fareRowLeft}>
                <Text style={[styles.fareLabel, { color: '#10B981' }]}>Promo Discount</Text>
                <View style={styles.promoBadge}>
                  <Text style={styles.promoText}>{promoCode}</Text>
                </View>
              </View>
              <Text style={[styles.fareValue, { color: '#10B981' }]}>
                ${fareDetails.discount.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Fare</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.paymentCard}>
          <Text style={styles.paymentTitle}>Payment Method</Text>
          <View style={styles.paymentMethod}>
            <Ionicons name="wallet" size={24} color="#7C3AED" />
            <Text style={styles.paymentText}>Wallet</Text>
            <TouchableOpacity>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.termsCard}>
          <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
          <Text style={styles.termsText}>
            By confirming, you agree to our terms and conditions. Cancellation charges may apply.
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerLabel}>Total Amount</Text>
          <Text style={styles.footerAmount}>${total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmBooking}>
          <Text style={styles.confirmButtonText}>Confirm Booking</Text>
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
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 16,
  },
  vehicleIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  vehicleDescription: {
    fontSize: 14,
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
  routeText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginLeft: 9,
    marginVertical: 8,
  },
  fareCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  },
  fareTitle: {
    fontSize: 18,
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
  fareRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fareLabel: {
    fontSize: 15,
    color: '#6B7280',
  },
  fareValue: {
    fontSize: 15,
    fontWeight: '600',
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
    fontSize: 10,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  promoBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  promoText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#10B981',
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
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  paymentText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
  },
  termsCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  footerLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  footerAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  confirmButton: {
    backgroundColor: '#7C3AED',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
