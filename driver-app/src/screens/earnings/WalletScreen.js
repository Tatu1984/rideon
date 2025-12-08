import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WalletScreen({ navigation }) {
  const [balance] = useState(1250.75);
  const [cashCollected] = useState(340.50);
  const [payableToCompany] = useState(85.25);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const recentTransactions = [
    { id: 1, type: 'earning', description: 'Trip #1234', amount: 25.50, date: '2025-12-06 14:30' },
    { id: 2, type: 'bonus', description: 'Peak Hour Bonus', amount: 15.00, date: '2025-12-06 12:00' },
    { id: 3, type: 'penalty', description: 'Cancellation Fee', amount: -5.00, date: '2025-12-05 18:20' },
    { id: 4, type: 'withdrawal', description: 'Bank Transfer', amount: -500.00, date: '2025-12-05 10:00' },
    { id: 5, type: 'adjustment', description: 'Fare Correction', amount: 8.25, date: '2025-12-04 16:45' },
  ];

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (amount > balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }
    Alert.alert('Success', `Withdrawal request of $${amount.toFixed(2)} submitted successfully!`);
    setWithdrawAmount('');
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'earning': return 'cash';
      case 'bonus': return 'gift';
      case 'penalty': return 'warning';
      case 'withdrawal': return 'arrow-down-circle';
      case 'adjustment': return 'repeat';
      default: return 'cash';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'earning':
      case 'bonus':
      case 'adjustment': return '#10B981';
      case 'penalty':
      case 'withdrawal': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>

        <View style={styles.balanceDetails}>
          <View style={styles.balanceDetailItem}>
            <Text style={styles.balanceDetailLabel}>Cash Collected</Text>
            <Text style={styles.balanceDetailValue}>${cashCollected.toFixed(2)}</Text>
          </View>
          <View style={styles.balanceDetailDivider} />
          <View style={styles.balanceDetailItem}>
            <Text style={styles.balanceDetailLabel}>Payable to Company</Text>
            <Text style={[styles.balanceDetailValue, { color: '#EF4444' }]}>
              ${payableToCompany.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Withdraw Section */}
      <View style={styles.withdrawSection}>
        <Text style={styles.sectionTitle}>Withdraw Funds</Text>
        <View style={styles.withdrawForm}>
          <TextInput
            style={styles.withdrawInput}
            placeholder="Enter amount"
            keyboardType="decimal-pad"
            value={withdrawAmount}
            onChangeText={setWithdrawAmount}
          />
          <TouchableOpacity onPress={handleWithdraw} style={styles.withdrawButton}>
            <Text style={styles.withdrawButtonText}>Withdraw</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('BankDetails')} style={styles.linkButton}>
          <Ionicons name="card" size={16} color="#7C3AED" />
          <Text style={styles.linkButtonText}>Manage Bank Details</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Transactions */}
      <View style={styles.transactionsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('PayoutHistory')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.map((transaction) => (
          <View key={transaction.id} style={styles.transactionItem}>
            <View style={[styles.transactionIcon, { backgroundColor: `${getTransactionColor(transaction.type)}20` }]}>
              <Ionicons
                name={getTransactionIcon(transaction.type)}
                size={24}
                color={getTransactionColor(transaction.type)}
              />
            </View>
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionDescription}>{transaction.description}</Text>
              <Text style={styles.transactionDate}>{transaction.date}</Text>
            </View>
            <Text style={[styles.transactionAmount, { color: getTransactionColor(transaction.type) }]}>
              {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  balanceCard: {
    backgroundColor: '#7C3AED',
    margin: 16,
    marginTop: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#E9D5FF',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  balanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  balanceDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  balanceDetailDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  balanceDetailLabel: {
    fontSize: 12,
    color: '#E9D5FF',
    marginBottom: 4,
    textAlign: 'center',
  },
  balanceDetailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  withdrawSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  withdrawForm: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  withdrawInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  withdrawButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  withdrawButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  linkButtonText: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: '500',
  },
  transactionsSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
