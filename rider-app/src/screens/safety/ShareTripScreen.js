import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ShareTripScreen({ navigation, route }) {
  const { tripId } = route.params || {};

  const [selectedContacts, setSelectedContacts] = useState([]);
  const [customMessage, setCustomMessage] = useState('');

  const contacts = [
    { id: '1', name: 'Sarah Doe', phone: '+1 234 567 8901', isEmergency: true },
    { id: '2', name: 'Michael Doe', phone: '+1 234 567 8902', isEmergency: true },
    { id: '3', name: 'Emma Smith', phone: '+1 234 567 8903', isEmergency: false },
    { id: '4', name: 'David Brown', phone: '+1 234 567 8904', isEmergency: false },
  ];

  const trip = {
    id: tripId || 'TRIP123456',
    pickup: '123 Main St, San Francisco',
    dropoff: '456 Market St, San Francisco',
    driver: {
      name: 'John Smith',
      vehicle: 'Toyota Camry',
      plate: 'ABC 1234',
    },
    eta: '5:30 PM',
    trackingLink: 'https://rideon.app/track/TRIP123456',
  };

  const toggleContact = (contactId) => {
    if (selectedContacts.includes(contactId)) {
      setSelectedContacts(selectedContacts.filter(id => id !== contactId));
    } else {
      setSelectedContacts([...selectedContacts, contactId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(c => c.id));
    }
  };

  const handleShareTrip = async () => {
    if (selectedContacts.length === 0) {
      alert('Please select at least one contact');
      return;
    }

    const message = customMessage || `I'm on my way! Track my ride:\n${trip.trackingLink}\n\nDriver: ${trip.driver.name}\nVehicle: ${trip.driver.vehicle} (${trip.driver.plate})\nETA: ${trip.eta}`;

    try {
      await Share.share({
        message,
        title: 'Track My Ride',
      });
      alert(`Trip shared with ${selectedContacts.length} ${selectedContacts.length === 1 ? 'contact' : 'contacts'}!`);
      navigation.goBack();
    } catch (error) {
      alert('Failed to share trip');
    }
  };

  const handleCopyLink = () => {
    alert(`Tracking link copied to clipboard!\n${trip.trackingLink}`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share Trip</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Trip Info */}
        <View style={styles.tripCard}>
          <View style={styles.tripHeader}>
            <Ionicons name="location" size={24} color="#7C3AED" />
            <Text style={styles.tripTitle}>Trip Details</Text>
          </View>

          <View style={styles.tripDetail}>
            <Ionicons name="flag" size={16} color="#10B981" />
            <Text style={styles.tripDetailText}>{trip.pickup}</Text>
          </View>

          <View style={styles.tripDetail}>
            <Ionicons name="location" size={16} color="#EF4444" />
            <Text style={styles.tripDetailText}>{trip.dropoff}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.tripDetail}>
            <Ionicons name="person" size={16} color="#6B7280" />
            <Text style={styles.tripDetailText}>{trip.driver.name}</Text>
          </View>

          <View style={styles.tripDetail}>
            <Ionicons name="car" size={16} color="#6B7280" />
            <Text style={styles.tripDetailText}>
              {trip.driver.vehicle} • {trip.driver.plate}
            </Text>
          </View>

          <View style={styles.tripDetail}>
            <Ionicons name="time" size={16} color="#6B7280" />
            <Text style={styles.tripDetailText}>ETA: {trip.eta}</Text>
          </View>
        </View>

        {/* Tracking Link */}
        <View style={styles.linkCard}>
          <View style={styles.linkHeader}>
            <Ionicons name="link" size={20} color="#7C3AED" />
            <Text style={styles.linkTitle}>Live Tracking Link</Text>
          </View>
          <View style={styles.linkContainer}>
            <Text style={styles.linkText} numberOfLines={1}>{trip.trackingLink}</Text>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopyLink}>
              <Ionicons name="copy" size={18} color="#7C3AED" />
            </TouchableOpacity>
          </View>
          <Text style={styles.linkDescription}>
            Anyone with this link can track your trip in real-time
          </Text>
        </View>

        {/* Select Contacts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Select Contacts</Text>
            <TouchableOpacity onPress={handleSelectAll}>
              <Text style={styles.selectAllText}>
                {selectedContacts.length === contacts.length ? 'Deselect All' : 'Select All'}
              </Text>
            </TouchableOpacity>
          </View>

          {contacts.map((contact) => (
            <TouchableOpacity
              key={contact.id}
              style={[
                styles.contactCard,
                selectedContacts.includes(contact.id) && styles.contactCardSelected,
              ]}
              onPress={() => toggleContact(contact.id)}
            >
              <View style={styles.contactLeft}>
                <View style={styles.contactAvatar}>
                  <Ionicons name="person" size={20} color="#7C3AED" />
                </View>
                <View style={styles.contactInfo}>
                  <View style={styles.contactNameRow}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    {contact.isEmergency && (
                      <View style={styles.emergencyBadge}>
                        <Ionicons name="shield-checkmark" size={10} color="#10B981" />
                        <Text style={styles.emergencyText}>Emergency</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.contactPhone}>{contact.phone}</Text>
                </View>
              </View>
              <View
                style={[
                  styles.checkbox,
                  selectedContacts.includes(contact.id) && styles.checkboxSelected,
                ]}
              >
                {selectedContacts.includes(contact.id) && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.addContactButton}>
            <Ionicons name="add-circle-outline" size={20} color="#7C3AED" />
            <Text style={styles.addContactText}>Add from Contacts</Text>
          </TouchableOpacity>
        </View>

        {/* Custom Message */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Custom Message (Optional)</Text>
          <TextInput
            style={styles.messageInput}
            value={customMessage}
            onChangeText={setCustomMessage}
            placeholder="Add a personal message..."
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <Text style={styles.messageHint}>
            Default message includes tracking link and driver details
          </Text>
        </View>

        {/* What They'll See */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What your contacts will see:</Text>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.infoText}>Your live location on map</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.infoText}>Driver and vehicle details</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.infoText}>Estimated arrival time</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.infoText}>Trip route and progress</Text>
          </View>
        </View>
      </ScrollView>

      {/* Share Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.shareButton,
            selectedContacts.length === 0 && styles.shareButtonDisabled,
          ]}
          onPress={handleShareTrip}
          disabled={selectedContacts.length === 0}
        >
          <Ionicons name="share-social" size={20} color="#FFFFFF" />
          <Text style={styles.shareButtonText}>
            {selectedContacts.length > 0
              ? `Share with ${selectedContacts.length} ${selectedContacts.length === 1 ? 'Contact' : 'Contacts'}`
              : 'Select Contacts to Share'}
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
  tripCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 16,
  },
  tripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  tripTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  tripDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  tripDetailText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  linkCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
  },
  linkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  linkTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  linkText: {
    flex: 1,
    fontSize: 13,
    color: '#7C3AED',
    fontFamily: 'monospace',
  },
  copyButton: {
    padding: 4,
  },
  linkDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  emergencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  emergencyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#047857',
  },
  contactPhone: {
    fontSize: 13,
    color: '#6B7280',
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
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    gap: 8,
  },
  addContactText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7C3AED',
  },
  messageInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 80,
    marginBottom: 8,
  },
  messageHint: {
    fontSize: 12,
    color: '#6B7280',
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1E40AF',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    padding: 18,
    borderRadius: 12,
    gap: 8,
  },
  shareButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
