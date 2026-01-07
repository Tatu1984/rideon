import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { driverAPI, tripAPI } from '../../services/api.service';

export default function TripsScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await driverAPI.getTripHistory();
      setTrips(response.data || []);
    } catch (error) {
      console.error('Failed to fetch trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTrips();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'cancelled':
        return '#EF4444';
      case 'in_progress':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'in_progress':
        return 'In Progress';
      default:
        return status;
    }
  };

  const renderTripItem = ({ item }) => (
    <TouchableOpacity
      style={styles.tripCard}
      onPress={() => navigation?.navigate('TripDetails', { tripId: item.id })}
    >
      <View style={styles.tripHeader}>
        <View>
          <Text style={styles.tripDate}>{formatDate(item.createdAt)}</Text>
          <Text style={styles.tripTime}>{formatTime(item.createdAt)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.tripRoute}>
        <View style={styles.routePoint}>
          <View style={styles.pickupDot} />
          <View style={styles.routeLine} />
          <View style={styles.dropoffDot} />
        </View>
        <View style={styles.routeDetails}>
          <Text style={styles.routeLabel}>Pickup</Text>
          <Text style={styles.routeAddress} numberOfLines={1}>
            {item.pickupAddress || 'Pickup location'}
          </Text>
          <Text style={styles.routeLabel}>Dropoff</Text>
          <Text style={styles.routeAddress} numberOfLines={1}>
            {item.dropoffAddress || 'Dropoff location'}
          </Text>
        </View>
      </View>

      <View style={styles.tripFooter}>
        <View style={styles.tripInfo}>
          <Text style={styles.tripInfoLabel}>Distance</Text>
          <Text style={styles.tripInfoValue}>
            {item.distance ? `${item.distance.toFixed(1)} km` : 'N/A'}
          </Text>
        </View>
        <View style={styles.tripInfo}>
          <Text style={styles.tripInfoLabel}>Duration</Text>
          <Text style={styles.tripInfoValue}>
            {item.duration ? `${Math.round(item.duration)} min` : 'N/A'}
          </Text>
        </View>
        <View style={styles.tripEarnings}>
          <Text style={styles.earningsAmount}>${item.fare?.toFixed(2) || '0.00'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
     {/* <Text style={styles.emptyStateIcon}>🚗</Text>*/}
     <Image source={require('../../../assets/cab.png')} style={{width:"100%",height:300,  objectFit:"contain"}}/>
      <Text style={styles.emptyStateTitle}>No trips yet</Text>
      <Text style={styles.emptyStateText}>Your completed trips will appear here</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#160832" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trip History</Text>
        <Text style={styles.headerSubtitle}>{trips.length} trips</Text>
      </View>

      <FlatList
        data={trips}
        renderItem={renderTripItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#160832',
    padding: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E9D5FF',
  },
  listContent: {
    padding: 16,
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tripDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  tripTime: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tripRoute: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  routePoint: {
    alignItems: 'center',
    marginRight: 12,
  },
  pickupDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#160832',
  },
  routeLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  dropoffDot: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: '#160832',
  },
  routeDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  routeLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  routeAddress: {
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 8,
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  tripInfo: {
    flex: 1,
  },
  tripInfoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  tripInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  tripEarnings: {
    alignItems: 'flex-end',
  },
  earningsAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#160832',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 0,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 0,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
  },
});
