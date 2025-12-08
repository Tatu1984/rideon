import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FavoriteDriversScreen({ navigation }) {
  const [drivers, setDrivers] = useState([
    {
      id: '1',
      name: 'John Smith',
      photo: 'https://i.pravatar.cc/150?img=12',
      rating: 4.9,
      totalTrips: 850,
      completedWithYou: 12,
      vehicle: 'Toyota Camry',
      plate: 'ABC 1234',
      yearsActive: 5,
      badges: ['Top Rated', 'Clean Car'],
    },
    {
      id: '2',
      name: 'Emily Johnson',
      photo: 'https://i.pravatar.cc/150?img=45',
      rating: 4.8,
      totalTrips: 650,
      completedWithYou: 8,
      vehicle: 'Honda Accord',
      plate: 'XYZ 5678',
      yearsActive: 3,
      badges: ['Friendly', 'Punctual'],
    },
    {
      id: '3',
      name: 'Michael Brown',
      photo: 'https://i.pravatar.cc/150?img=33',
      rating: 5.0,
      totalTrips: 1200,
      completedWithYou: 15,
      vehicle: 'Tesla Model 3',
      plate: 'TES 9999',
      yearsActive: 7,
      badges: ['Top Rated', 'Eco-Friendly', 'Great Conversation'],
    },
  ]);

  const handleRemoveFavorite = (driverId, driverName) => {
    alert(`Remove ${driverName} from favorites?`);
  };

  const handleRequestDriver = (driver) => {
    alert(`Request a ride with ${driver.name}?\nThis feature gives priority to matching with this driver.`);
  };

  const handleViewProfile = (driver) => {
    alert(`View ${driver.name}'s full profile`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorite Drivers</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="star" size={24} color="#F59E0B" />
          <Text style={styles.infoText}>
            Request rides from your favorite drivers and enjoy personalized service!
          </Text>
        </View>

        {/* Drivers List */}
        {drivers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color="#E5E7EB" />
            <Text style={styles.emptyStateTitle}>No Favorite Drivers Yet</Text>
            <Text style={styles.emptyStateText}>
              After completing trips, you can add drivers to your favorites for quicker bookings.
            </Text>
          </View>
        ) : (
          drivers.map((driver) => (
            <View key={driver.id} style={styles.driverCard}>
              <View style={styles.driverHeader}>
                <View style={styles.driverHeaderLeft}>
                  <Image source={{ uri: driver.photo }} style={styles.driverPhoto} />
                  <View style={styles.driverBasicInfo}>
                    <View style={styles.driverNameRow}>
                      <Text style={styles.driverName}>{driver.name}</Text>
                      <TouchableOpacity onPress={() => handleRemoveFavorite(driver.id, driver.name)}>
                        <Ionicons name="heart" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.driverRating}>
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Text style={styles.driverRatingText}>{driver.rating}</Text>
                      <Text style={styles.driverTripsText}>• {driver.totalTrips} trips</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Badges */}
              <View style={styles.badgesContainer}>
                {driver.badges.map((badge, index) => (
                  <View key={index} style={styles.badge}>
                    <Text style={styles.badgeText}>{badge}</Text>
                  </View>
                ))}
              </View>

              {/* Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.stat}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#10B981" />
                  <Text style={styles.statLabel}>Trips with you</Text>
                  <Text style={styles.statValue}>{driver.completedWithYou}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Ionicons name="time-outline" size={18} color="#7C3AED" />
                  <Text style={styles.statLabel}>Years active</Text>
                  <Text style={styles.statValue}>{driver.yearsActive}</Text>
                </View>
              </View>

              {/* Vehicle Info */}
              <View style={styles.vehicleInfo}>
                <Ionicons name="car-sport" size={18} color="#6B7280" />
                <Text style={styles.vehicleText}>
                  {driver.vehicle} • {driver.plate}
                </Text>
              </View>

              {/* Actions */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => handleRequestDriver(driver)}
                >
                  <Ionicons name="car" size={18} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Request Ride</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => handleViewProfile(driver)}
                >
                  <Ionicons name="person-outline" size={18} color="#7C3AED" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* How It Works */}
        <View style={styles.howItWorksCard}>
          <Text style={styles.howItWorksTitle}>How Favorite Drivers Work</Text>

          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>
              Complete a trip and rate your driver 5 stars
            </Text>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>
              Add them to favorites from trip history
            </Text>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>
              Request rides and we'll try to match you with them
            </Text>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <Text style={styles.stepText}>
              Enjoy personalized service from drivers you trust
            </Text>
          </View>
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
  content: {
    flex: 1,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 48,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  driverCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
  },
  driverHeader: {
    marginBottom: 12,
  },
  driverHeaderLeft: {
    flexDirection: 'row',
    gap: 12,
  },
  driverPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  driverBasicInfo: {
    flex: 1,
  },
  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  driverRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  driverRatingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  driverTripsText: {
    fontSize: 13,
    color: '#6B7280',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7C3AED',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  vehicleText: {
    fontSize: 13,
    color: '#6B7280',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  howItWorksCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  howItWorksTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
