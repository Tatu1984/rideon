import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../config/constants';

export default function WalletScreen({ navigation }) {
  const [walletBalance] = useState(145.50);
  const [autoPayEnabled, setAutoPayEnabled] = useState(true);
  const [cashEnabled, setCashEnabled] = useState(false);

  const paymentMethods = [
    { id: 1, type: 'card', name: 'Visa •••• 4242', icon: 'card', default: true },
    { id: 2, type: 'upi', name: 'user@upi', icon: 'phone-portrait', default: false },
    { id: 3, type: 'paypal', name: 'user@email.com', icon: 'logo-paypal', default: false },
  ];

  const recentTransactions = [
    { id: 1, type: 'debit', description: 'Trip to Airport', amount: -25.50, date: '2025-12-06 14:30', status: 'completed' },
    { id: 2, type: 'credit', description: 'Wallet Top-up', amount: 100.00, date: '2025-12-06 10:15', status: 'completed' },
    { id: 3, type: 'credit', description: 'Refund - Trip #1234', amount: 12.50, date: '2025-12-05 18:20', status: 'completed' },
    { id: 4, type: 'debit', description: 'Trip to Downtown', amount: -18.25, date: '2025-12-05 09:45', status: 'completed' },
    { id: 5, type: 'credit', description: 'Promo Code Applied', amount: 10.00, date: '2025-12-04 16:30', status: 'completed' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wallet</Text>
        <Text style={styles.headerSubtitle}>Manage payments & balance</Text>
      </View>

      {/* Wallet Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Wallet Balance</Text>
        <Text style={styles.balanceAmount}>${walletBalance.toFixed(2)}</Text>
        <TouchableOpacity style={styles.topUpButton} onPress={() => {}}>
          <Ionicons name="add-circle" size={20} color="#FFFFFF" />
          <Text style={styles.topUpButtonText}>Top Up Wallet</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Settings */}
      <View style={styles.settingsCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="flash" size={24} color="#7C3AED" />
            <Text style={styles.settingLabel}>Auto-pay</Text>
          </View>
          <Switch
            value={autoPayEnabled}
            onValueChange={setAutoPayEnabled}
            trackColor={{ false: '#D1D5DB', true: '#A78BFA' }}
            thumbColor={autoPayEnabled ? '#7C3AED' : '#F3F4F6'}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="cash" size={24} color="#10B981" />
            <Text style={styles.settingLabel}>Cash Payments</Text>
          </View>
          <Switch
            value={cashEnabled}
            onValueChange={setCashEnabled}
            trackColor={{ false: '#D1D5DB', true: '#A78BFA' }}
            thumbColor={cashEnabled ? '#7C3AED' : '#F3F4F6'}
          />
        </View>
      </View>

      {/* Payment Methods */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          <TouchableOpacity onPress={() => navigation.navigate('PaymentMethods')}>
            <Text style={styles.viewAllText}>Manage</Text>
          </TouchableOpacity>
        </View>

        {paymentMethods.map((method) => (
          <View key={method.id} style={styles.paymentCard}>
            <View style={styles.paymentIcon}>
              <Ionicons name={method.icon} size={24} color="#7C3AED" />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentName}>{method.name}</Text>
              <Text style={styles.paymentType}>{method.type.toUpperCase()}</Text>
            </View>
            {method.default && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>Default</Text>
              </View>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={styles.addPaymentButton}
          onPress={() => navigation.navigate('AddCard')}
        >
          <Ionicons name="add-circle-outline" size={24} color="#7C3AED" />
          <Text style={styles.addPaymentText}>Add Payment Method</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TransactionHistory')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.map((transaction) => (
          <View key={transaction.id} style={styles.transactionCard}>
            <View
              style={[
                styles.transactionIcon,
                { backgroundColor: transaction.type === 'credit' ? '#D1FAE5' : '#FEE2E2' },
              ]}
            >
              <Ionicons
                name={transaction.type === 'credit' ? 'arrow-down' : 'arrow-up'}
                size={20}
                color={transaction.type === 'credit' ? '#10B981' : '#EF4444'}
              />
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionDescription}>{transaction.description}</Text>
              <Text style={styles.transactionDate}>{transaction.date}</Text>
            </View>
            <Text
              style={[
                styles.transactionAmount,
                { color: transaction.type === 'credit' ? '#10B981' : '#EF4444' },
              ]}
            >
              {transaction.type === 'credit' ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
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
  header: {
    backgroundColor: '#7C3AED',
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
  balanceCard: {
    backgroundColor: '#7C3AED',
    margin: 16,
    marginTop: -30,
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
  topUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  topUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  paymentType: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  defaultBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  addPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  addPaymentText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
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
