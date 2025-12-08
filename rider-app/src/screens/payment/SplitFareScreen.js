import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SplitFareScreen({ navigation, route }) {
  const { tripId, totalFare } = route.params || {};

  const [splitMethod, setSplitMethod] = useState('equal');
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [customAmounts, setCustomAmounts] = useState([]);
  const [contacts, setContacts] = useState([
    { id: '1', name: 'John Doe', phone: '+1 234 567 8900', selected: false },
    { id: '2', name: 'Jane Smith', phone: '+1 234 567 8901', selected: false },
    { id: '3', name: 'Mike Johnson', phone: '+1 234 567 8902', selected: false },
    { id: '4', name: 'Sarah Williams', phone: '+1 234 567 8903', selected: false },
  ]);

  const fare = totalFare || 19.10;

  const toggleContact = (contactId) => {
    setContacts(contacts.map(c =>
      c.id === contactId ? { ...c, selected: !c.selected } : c
    ));
  };

  const selectedContacts = contacts.filter(c => c.selected);
  const totalPeople = selectedContacts.length + 1; // +1 for yourself

  const calculateSplitAmount = () => {
    if (splitMethod === 'equal') {
      return (fare / totalPeople).toFixed(2);
    }
    return '0.00';
  };

  const handleSendRequests = () => {
    if (selectedContacts.length === 0) {
      alert('Please select at least one person to split with');
      return;
    }

    alert(`Split fare requests sent to ${selectedContacts.length} people!\nAmount per person: $${calculateSplitAmount()}`);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Split Fare</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Fare Summary */}
        <View style={styles.fareCard}>
          <Text style={styles.fareLabel}>Total Fare</Text>
          <Text style={styles.fareAmount}>${fare.toFixed(2)}</Text>
          {tripId && (
            <Text style={styles.tripId}>Trip ID: {tripId}</Text>
          )}
        </View>

        {/* Split Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Split Method</Text>
          <View style={styles.splitMethods}>
            <TouchableOpacity
              style={[
                styles.splitMethodCard,
                splitMethod === 'equal' && styles.splitMethodCardSelected,
              ]}
              onPress={() => setSplitMethod('equal')}
            >
              <Ionicons
                name="people"
                size={24}
                color={splitMethod === 'equal' ? '#7C3AED' : '#6B7280'}
              />
              <Text
                style={[
                  styles.splitMethodText,
                  splitMethod === 'equal' && styles.splitMethodTextSelected,
                ]}
              >
                Split Equally
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.splitMethodCard,
                splitMethod === 'custom' && styles.splitMethodCardSelected,
              ]}
              onPress={() => setSplitMethod('custom')}
            >
              <Ionicons
                name="calculator"
                size={24}
                color={splitMethod === 'custom' ? '#7C3AED' : '#6B7280'}
              />
              <Text
                style={[
                  styles.splitMethodText,
                  splitMethod === 'custom' && styles.splitMethodTextSelected,
                ]}
              >
                Custom Amount
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Split Preview */}
        {splitMethod === 'equal' && selectedContacts.length > 0 && (
          <View style={styles.previewCard}>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Total People</Text>
              <Text style={styles.previewValue}>{totalPeople}</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Amount per Person</Text>
              <Text style={styles.previewValue}>${calculateSplitAmount()}</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>You Pay</Text>
              <Text style={[styles.previewValue, { color: '#7C3AED' }]}>
                ${calculateSplitAmount()}
              </Text>
            </View>
          </View>
        )}

        {/* Select Contacts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select People to Split With</Text>
          <Text style={styles.sectionSubtitle}>
            Select contacts who shared this ride
          </Text>

          {contacts.map((contact) => (
            <TouchableOpacity
              key={contact.id}
              style={[
                styles.contactCard,
                contact.selected && styles.contactCardSelected,
              ]}
              onPress={() => toggleContact(contact.id)}
            >
              <View style={styles.contactLeft}>
                <View
                  style={[
                    styles.contactAvatar,
                    contact.selected && styles.contactAvatarSelected,
                  ]}
                >
                  <Ionicons
                    name="person"
                    size={20}
                    color={contact.selected ? '#7C3AED' : '#6B7280'}
                  />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactPhone}>{contact.phone}</Text>
                </View>
              </View>

              <View style={styles.contactRight}>
                {contact.selected && splitMethod === 'equal' && (
                  <Text style={styles.contactAmount}>
                    ${calculateSplitAmount()}
                  </Text>
                )}
                <View
                  style={[
                    styles.checkbox,
                    contact.selected && styles.checkboxSelected,
                  ]}
                >
                  {contact.selected && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.addContactButton}>
            <Ionicons name="add-circle-outline" size={20} color="#7C3AED" />
            <Text style={styles.addContactText}>Add from Contacts</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Request Note */}
        {selectedContacts.length > 0 && (
          <View style={styles.noteCard}>
            <Ionicons name="information-circle" size={20} color="#2563EB" />
            <Text style={styles.noteText}>
              Payment requests will be sent via SMS and app notification.
              You can track the status in your wallet.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Send Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.sendButton,
            selectedContacts.length === 0 && styles.sendButtonDisabled,
          ]}
          onPress={handleSendRequests}
          disabled={selectedContacts.length === 0}
        >
          <Text style={styles.sendButtonText}>
            {selectedContacts.length > 0
              ? `Send Request to ${selectedContacts.length} ${selectedContacts.length === 1 ? 'Person' : 'People'}`
              : 'Select People to Split'}
          </Text>
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
  fareCard: {
    backgroundColor: '#7C3AED',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  fareLabel: {
    fontSize: 14,
    color: '#E9D5FF',
    marginBottom: 8,
  },
  fareAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  tripId: {
    fontSize: 12,
    color: '#E9D5FF',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  splitMethods: {
    flexDirection: 'row',
    gap: 12,
  },
  splitMethodCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  splitMethodCardSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#F3E8FF',
  },
  splitMethodText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  splitMethodTextSelected: {
    color: '#7C3AED',
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewLabel: {
    fontSize: 15,
    color: '#6B7280',
  },
  previewValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  contactCardSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#F9FAFB',
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactAvatarSelected: {
    backgroundColor: '#F3E8FF',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 12,
    color: '#6B7280',
  },
  contactRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  addContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  addContactText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7C3AED',
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sendButton: {
    backgroundColor: '#7C3AED',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
