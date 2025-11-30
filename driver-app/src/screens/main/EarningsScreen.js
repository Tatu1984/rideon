import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useDriver } from '../../contexts/DriverContext';

export default function EarningsScreen() {
  const { earnings, fetchEarnings } = useDriver();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEarnings();
    setRefreshing(false);
  };

  const earningsData = [
    { label: 'Today', amount: earnings.today || 0, icon: '📅' },
    { label: 'This Week', amount: earnings.week || 0, icon: '📊' },
    { label: 'This Month', amount: earnings.month || 0, icon: '📈' },
    { label: 'Total Earnings', amount: earnings.total || 0, icon: '💰' },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Earnings</Text>
        <Text style={styles.headerSubtitle}>Track your income</Text>
      </View>

      <View style={styles.cardsContainer}>
        {earningsData.map((item, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>{item.icon}</Text>
              <Text style={styles.cardLabel}>{item.label}</Text>
            </View>
            <Text style={styles.cardAmount}>${item.amount.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Earnings Breakdown</Text>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Average per trip</Text>
          <Text style={styles.statValue}>
            ${earnings.averagePerTrip ? earnings.averagePerTrip.toFixed(2) : '0.00'}
          </Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total trips</Text>
          <Text style={styles.statValue}>{earnings.totalTrips || 0}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Hours online</Text>
          <Text style={styles.statValue}>{earnings.hoursOnline || 0}h</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Earnings per hour</Text>
          <Text style={styles.statValue}>
            ${earnings.earningsPerHour ? earnings.earningsPerHour.toFixed(2) : '0.00'}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.withdrawButton}>
        <Text style={styles.withdrawButtonText}>Withdraw Earnings</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#7C3AED',
    padding: 24,
    paddingTop: 60,
    paddingBottom: 32,
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
  cardsContainer: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#7C3AED',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  cardLabel: {
    fontSize: 16,
    color: '#E9D5FF',
    fontWeight: '600',
  },
  cardAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  withdrawButton: {
    backgroundColor: '#7C3AED',
    margin: 16,
    marginTop: 8,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  withdrawButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
