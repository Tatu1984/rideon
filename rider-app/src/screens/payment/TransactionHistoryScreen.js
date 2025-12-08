import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TransactionHistoryScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const transactions = [
    {
      id: '1',
      type: 'debit',
      description: 'Trip Payment',
      tripId: 'TRIP123456',
      amount: 19.10,
      date: '2025-12-05',
      time: '10:30 AM',
      method: 'Visa ****4242',
      status: 'completed',
    },
    {
      id: '2',
      type: 'credit',
      description: 'Refund - Cancelled Trip',
      tripId: 'TRIP123455',
      amount: 15.00,
      date: '2025-12-04',
      time: '03:20 PM',
      method: 'Wallet',
      status: 'completed',
    },
    {
      id: '3',
      type: 'credit',
      description: 'Wallet Top-up',
      tripId: null,
      amount: 100.00,
      date: '2025-12-03',
      time: '09:15 AM',
      method: 'Visa ****4242',
      status: 'completed',
    },
    {
      id: '4',
      type: 'debit',
      description: 'Trip Payment',
      tripId: 'TRIP123454',
      amount: 25.50,
      date: '2025-12-02',
      time: '06:45 PM',
      method: 'Wallet',
      status: 'completed',
    },
    {
      id: '5',
      type: 'debit',
      description: 'Driver Tip',
      tripId: 'TRIP123454',
      amount: 5.00,
      date: '2025-12-02',
      time: '06:46 PM',
      method: 'Wallet',
      status: 'completed',
    },
    {
      id: '6',
      type: 'debit',
      description: 'Trip Payment',
      tripId: 'TRIP123453',
      amount: 32.80,
      date: '2025-12-01',
      time: '11:30 AM',
      method: 'Mastercard ****8888',
      status: 'completed',
    },
    {
      id: '7',
      type: 'credit',
      description: 'Promo Code Credit',
      tripId: null,
      amount: 10.00,
      date: '2025-11-30',
      time: '02:00 PM',
      method: 'Wallet',
      status: 'completed',
    },
    {
      id: '8',
      type: 'debit',
      description: 'Trip Payment',
      tripId: 'TRIP123452',
      amount: 18.20,
      date: '2025-11-29',
      time: '05:15 PM',
      method: 'Wallet',
      status: 'pending',
    },
  ];

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'debit', label: 'Debits' },
    { id: 'credit', label: 'Credits' },
    { id: 'pending', label: 'Pending' },
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'debit') return transaction.type === 'debit';
    if (selectedFilter === 'credit') return transaction.type === 'credit';
    if (selectedFilter === 'pending') return transaction.status === 'pending';
    return true;
  }).filter((transaction) => {
    if (!searchQuery) return true;
    return (
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.tripId?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalDebits = transactions
    .filter(t => t.type === 'debit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCredits = transactions
    .filter(t => t.type === 'credit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleTransactionPress = (transaction) => {
    if (transaction.tripId) {
      navigation.navigate('TripDetails', { tripId: transaction.tripId });
    }
  };

  const handleDownloadStatement = () => {
    alert('Statement downloaded to your device');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <TouchableOpacity onPress={handleDownloadStatement}>
          <Ionicons name="download-outline" size={24} color="#7C3AED" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Summary Cards */}
        <View style={styles.summaryCards}>
          <View style={styles.summaryCard}>
            <Ionicons name="arrow-down" size={20} color="#EF4444" />
            <Text style={styles.summaryLabel}>Total Spent</Text>
            <Text style={[styles.summaryValue, { color: '#EF4444' }]}>
              ${totalDebits.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="arrow-up" size={20} color="#10B981" />
            <Text style={styles.summaryLabel}>Total Received</Text>
            <Text style={[styles.summaryValue, { color: '#10B981' }]}>
              ${totalCredits.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filters}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                selectedFilter === filter.id && styles.filterChipSelected,
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === filter.id && styles.filterChipTextSelected,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Transactions List */}
        <View style={styles.transactionsList}>
          {filteredTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={64} color="#E5E7EB" />
              <Text style={styles.emptyStateText}>No transactions found</Text>
            </View>
          ) : (
            filteredTransactions.map((transaction) => (
              <TouchableOpacity
                key={transaction.id}
                style={styles.transactionCard}
                onPress={() => handleTransactionPress(transaction)}
                disabled={!transaction.tripId}
              >
                <View
                  style={[
                    styles.transactionIcon,
                    transaction.type === 'credit'
                      ? styles.transactionIconCredit
                      : styles.transactionIconDebit,
                  ]}
                >
                  <Ionicons
                    name={transaction.type === 'credit' ? 'arrow-down' : 'arrow-up'}
                    size={20}
                    color={transaction.type === 'credit' ? '#10B981' : '#EF4444'}
                  />
                </View>

                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDescription}>
                    {transaction.description}
                  </Text>
                  {transaction.tripId && (
                    <Text style={styles.transactionTripId}>{transaction.tripId}</Text>
                  )}
                  <Text style={styles.transactionDetails}>
                    {transaction.date} • {transaction.time}
                  </Text>
                  <Text style={styles.transactionMethod}>{transaction.method}</Text>
                </View>

                <View style={styles.transactionRight}>
                  <Text
                    style={[
                      styles.transactionAmount,
                      transaction.type === 'credit'
                        ? styles.transactionAmountCredit
                        : styles.transactionAmountDebit,
                    ]}
                  >
                    {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </Text>
                  {transaction.status === 'pending' && (
                    <View style={styles.pendingBadge}>
                      <Text style={styles.pendingText}>Pending</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
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
  summaryCards: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  filters: {
    marginBottom: 16,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipSelected: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
  },
  transactionsList: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    padding: 48,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
  transactionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionIconCredit: {
    backgroundColor: '#D1FAE5',
  },
  transactionIconDebit: {
    backgroundColor: '#FEE2E2',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  transactionTripId: {
    fontSize: 12,
    color: '#7C3AED',
    marginBottom: 4,
  },
  transactionDetails: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  transactionMethod: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  transactionAmountCredit: {
    color: '#10B981',
  },
  transactionAmountDebit: {
    color: '#EF4444',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pendingText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#92400E',
  },
});
