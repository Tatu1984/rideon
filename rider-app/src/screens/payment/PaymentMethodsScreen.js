import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PaymentMethodsScreen({ navigation }) {
  const [defaultPayment, setDefaultPayment] = useState('card1');
  const [autoPayEnabled, setAutoPayEnabled] = useState(true);
  const [cashEnabled, setCashEnabled] = useState(false);

  const paymentMethods = [
    {
      id: 'card1',
      type: 'card',
      icon: 'card',
      name: 'Visa ****4242',
      expiry: '12/25',
      isDefault: true,
    },
    {
      id: 'card2',
      type: 'card',
      icon: 'card',
      name: 'Mastercard ****8888',
      expiry: '03/26',
      isDefault: false,
    },
    {
      id: 'upi1',
      type: 'upi',
      icon: 'qr-code',
      name: 'user@upi',
      expiry: null,
      isDefault: false,
    },
    {
      id: 'paypal',
      type: 'paypal',
      icon: 'logo-paypal',
      name: 'user@email.com',
      expiry: null,
      isDefault: false,
    },
  ];

  const handleSetDefault = (methodId) => {
    setDefaultPayment(methodId);
    alert('Default payment method updated');
  };

  const handleDeleteMethod = (methodId, methodName) => {
    alert(`Delete ${methodName}?\nThis action cannot be undone.`);
  };

  const handleAddCard = () => {
    navigation.navigate('AddCard');
  };

  const handleAddUPI = () => {
    alert('Add UPI payment method');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Settings */}
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="flash" size={20} color="#7C3AED" />
              <View style={styles.settingInfo}>
                <Text style={styles.settingName}>Auto-pay</Text>
                <Text style={styles.settingDescription}>
                  Automatically charge after trip
                </Text>
              </View>
            </View>
            <Switch
              value={autoPayEnabled}
              onValueChange={setAutoPayEnabled}
              trackColor={{ false: '#E5E7EB', true: '#C4B5FD' }}
              thumbColor={autoPayEnabled ? '#7C3AED' : '#9CA3AF'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="cash" size={20} color="#10B981" />
              <View style={styles.settingInfo}>
                <Text style={styles.settingName}>Cash Payment</Text>
                <Text style={styles.settingDescription}>
                  Enable cash as payment option
                </Text>
              </View>
            </View>
            <Switch
              value={cashEnabled}
              onValueChange={setCashEnabled}
              trackColor={{ false: '#E5E7EB', true: '#A7F3D0' }}
              thumbColor={cashEnabled ? '#10B981' : '#9CA3AF'}
            />
          </View>
        </View>

        {/* Saved Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Methods</Text>
          {paymentMethods.map((method) => (
            <View key={method.id} style={styles.methodCard}>
              <View style={styles.methodLeft}>
                <View style={styles.methodIcon}>
                  <Ionicons name={method.icon} size={24} color="#7C3AED" />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodName}>{method.name}</Text>
                  {method.expiry && (
                    <Text style={styles.methodExpiry}>Expires {method.expiry}</Text>
                  )}
                  {defaultPayment === method.id && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.methodActions}>
                {defaultPayment !== method.id && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSetDefault(method.id)}
                  >
                    <Text style={styles.actionButtonText}>Set Default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => handleDeleteMethod(method.id, method.name)}
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Add New Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add New Method</Text>

          <TouchableOpacity style={styles.addMethodButton} onPress={handleAddCard}>
            <View style={styles.addMethodLeft}>
              <Ionicons name="card-outline" size={24} color="#7C3AED" />
              <Text style={styles.addMethodText}>Add Credit/Debit Card</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.addMethodButton} onPress={handleAddUPI}>
            <View style={styles.addMethodLeft}>
              <Ionicons name="qr-code-outline" size={24} color="#7C3AED" />
              <Text style={styles.addMethodText}>Add UPI</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.addMethodButton}>
            <View style={styles.addMethodLeft}>
              <Ionicons name="business-outline" size={24} color="#7C3AED" />
              <Text style={styles.addMethodText}>Add Net Banking</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.addMethodButton}>
            <View style={styles.addMethodLeft}>
              <Ionicons name="logo-paypal" size={24} color="#7C3AED" />
              <Text style={styles.addMethodText}>Link PayPal</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Ionicons name="shield-checkmark" size={20} color="#10B981" />
          <Text style={styles.securityText}>
            Your payment information is encrypted and secure. We never store your full card details.
          </Text>
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
  settingsCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  methodExpiry: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  defaultBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  defaultText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#10B981',
  },
  methodActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C3AED',
  },
  addMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  addMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addMethodText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  securityNote: {
    flexDirection: 'row',
    backgroundColor: '#D1FAE5',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    color: '#047857',
    lineHeight: 18,
  },
});
