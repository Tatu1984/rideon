import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PayoutHistoryScreen() {
  const [filter, setFilter] = useState('all'); // all, completed, pending, failed

  const payouts = [
    {
      id: 1,
      amount: 500.00,
      status: 'completed',
      method: 'Bank Transfer',
      accountLast4: '4532',
      date: '2025-12-05 10:30',
      transactionId: 'TXN123456789',
    },
    {
      id: 2,
      amount: 750.00,
      status: 'completed',
      method: 'UPI',
      accountLast4: '8976',
      date: '2025-11-28 14:20',
      transactionId: 'TXN123456788',
    },
    {
      id: 3,
      amount: 300.00,
      status: 'pending',
      method: 'Bank Transfer',
      accountLast4: '4532',
      date: '2025-12-07 09:15',
      transactionId: 'TXN123456790',
    },
    {
      id: 4,
      amount: 450.00,
      status: 'completed',
      method: 'PayPal',
      accountLast4: '1234',
      date: '2025-11-20 16:45',
      transactionId: 'TXN123456787',
    },
    {
      id: 5,
      amount: 200.00,
      status: 'failed',
      method: 'Bank Transfer',
      accountLast4: '4532',
      date: '2025-11-15 11:00',
      transactionId: 'TXN123456786',
      failureReason: 'Invalid account details',
    },
  ];

  const filteredPayouts = filter === 'all'
    ? payouts
    : payouts.filter(p => p.status === filter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'failed': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'failed': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const totalCompleted = payouts
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <View style={styles.container}>
      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Payouts</Text>
        <Text style={styles.summaryAmount}>${totalCompleted.toFixed(2)}</Text>
        <Text style={styles.summarySubtext}>{payouts.filter(p => p.status === 'completed').length} successful transactions</Text>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        {['all', 'completed', 'pending', 'failed'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterChip, filter === status && styles.filterChipActive]}
            onPress={() => setFilter(status)}
          >
            <Text style={[styles.filterChipText, filter === status && styles.filterChipTextActive]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Payouts List */}
      <ScrollView style={styles.payoutsList}>
        {filteredPayouts.map((payout) => (
          <View key={payout.id} style={styles.payoutCard}>
            <View style={styles.payoutHeader}>
              <View style={[styles.statusIcon, { backgroundColor: `${getStatusColor(payout.status)}20` }]}>
                <Ionicons name={getStatusIcon(payout.status)} size={24} color={getStatusColor(payout.status)} />
              </View>
              <View style={styles.payoutInfo}>
                <Text style={styles.payoutMethod}>{payout.method}</Text>
                <Text style={styles.payoutAccount}>****{payout.accountLast4}</Text>
              </View>
              <View style={styles.payoutAmountContainer}>
                <Text style={styles.payoutAmount}>${payout.amount.toFixed(2)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(payout.status)}20` }]}>
                  <Text style={[styles.statusBadgeText, { color: getStatusColor(payout.status) }]}>
                    {payout.status}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.payoutDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
                <Text style={styles.detailText}>{payout.date}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="receipt-outline" size={16} color="#9CA3AF" />
                <Text style={styles.detailText}>{payout.transactionId}</Text>
              </View>
            </View>

            {payout.status === 'failed' && payout.failureReason && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                <Text style={styles.errorText}>{payout.failureReason}</Text>
              </View>
            )}

            {payout.status === 'pending' && (
              <View style={styles.infoContainer}>
                <Ionicons name="information-circle" size={16} color="#F59E0B" />
                <Text style={styles.infoText}>Processing time: 1-3 business days</Text>
              </View>
            )}
          </View>
        ))}

        {filteredPayouts.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No payouts found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  summaryCard: {
    backgroundColor: '#160832',
    margin: 16,
    marginTop: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#160832',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#E9D5FF',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 14,
    color: '#E9D5FF',
  },
  filterContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 40,
  },
  filterChipActive: {
    backgroundColor: '#160832',
    borderColor: '#160832',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  payoutsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  payoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  payoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  payoutInfo: {
    flex: 1,
  },
  payoutMethod: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  payoutAccount: {
    fontSize: 14,
    color: '#6B7280',
  },
  payoutAmountContainer: {
    alignItems: 'flex-end',
  },
  payoutAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  payoutDetails: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#6B7280',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#DC2626',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#B45309',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
});
