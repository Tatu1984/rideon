import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function EmergencyContactsScreen({ navigation }) {
  const [contacts, setContacts] = useState([
    {
      id: '1',
      name: 'Sarah Doe',
      phone: '+1 234 567 8901',
      relationship: 'Spouse',
      primary: true,
    },
    {
      id: '2',
      name: 'Michael Doe',
      phone: '+1 234 567 8902',
      relationship: 'Father',
      primary: false,
    },
    {
      id: '3',
      name: 'Emma Smith',
      phone: '+1 234 567 8903',
      relationship: 'Friend',
      primary: false,
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelationship, setNewContactRelationship] = useState('');

  const handleSetPrimary = (contactId) => {
    setContacts(contacts.map(c => ({
      ...c,
      primary: c.id === contactId,
    })));
    alert('Primary contact updated');
  };

  const handleDeleteContact = (contactId, contactName) => {
    alert(`Delete ${contactName}?\nThis action cannot be undone.`);
    // setContacts(contacts.filter(c => c.id !== contactId));
  };

  const handleAddContact = () => {
    if (!newContactName || !newContactPhone || !newContactRelationship) {
      alert('Please fill in all fields');
      return;
    }

    const newContact = {
      id: Date.now().toString(),
      name: newContactName,
      phone: newContactPhone,
      relationship: newContactRelationship,
      primary: contacts.length === 0,
    };

    setContacts([...contacts, newContact]);
    setNewContactName('');
    setNewContactPhone('');
    setNewContactRelationship('');
    setShowAddForm(false);
    alert('Emergency contact added successfully!');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Contacts</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="shield-checkmark" size={24} color="#2563EB" />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Your Safety Matters</Text>
            <Text style={styles.infoDescription}>
              These contacts can be notified during emergencies and will receive your live trip updates when you share.
            </Text>
          </View>
        </View>

        {/* Emergency Contacts List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Contacts</Text>
          {contacts.map((contact) => (
            <View key={contact.id} style={styles.contactCard}>
              <View style={styles.contactLeft}>
                <View style={styles.contactAvatar}>
                  <Ionicons name="person" size={24} color="#7C3AED" />
                </View>
                <View style={styles.contactInfo}>
                  <View style={styles.contactNameRow}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    {contact.primary && (
                      <View style={styles.primaryBadge}>
                        <Ionicons name="star" size={10} color="#F59E0B" />
                        <Text style={styles.primaryText}>Primary</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.contactPhone}>{contact.phone}</Text>
                  <Text style={styles.contactRelationship}>{contact.relationship}</Text>
                </View>
              </View>

              <View style={styles.contactActions}>
                {!contact.primary && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSetPrimary(contact.id)}
                  >
                    <Ionicons name="star-outline" size={20} color="#7C3AED" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteContact(contact.id, contact.name)}
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Add New Contact Form */}
        {showAddForm ? (
          <View style={styles.addForm}>
            <Text style={styles.formTitle}>Add Emergency Contact</Text>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={newContactName}
                onChangeText={setNewContactName}
                placeholder="Enter full name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={newContactPhone}
                onChangeText={setNewContactPhone}
                placeholder="+1 234 567 8900"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Relationship</Text>
              <TextInput
                style={styles.input}
                value={newContactRelationship}
                onChangeText={setNewContactRelationship}
                placeholder="e.g., Spouse, Parent, Friend"
              />
            </View>

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddForm(false);
                  setNewContactName('');
                  setNewContactPhone('');
                  setNewContactRelationship('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddContact}
              >
                <Text style={styles.addButtonText}>Add Contact</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addContactButton}
            onPress={() => setShowAddForm(true)}
          >
            <Ionicons name="add-circle" size={24} color="#7C3AED" />
            <Text style={styles.addContactText}>Add Emergency Contact</Text>
          </TouchableOpacity>
        )}

        {/* Features */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>What emergency contacts can do:</Text>

          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.featureText}>
              Receive live trip updates when you share
            </Text>
          </View>

          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.featureText}>
              Be notified during SOS emergencies
            </Text>
          </View>

          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.featureText}>
              View your real-time location on map
            </Text>
          </View>

          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.featureText}>
              Contact driver on your behalf
            </Text>
          </View>
        </View>

        {/* Privacy Note */}
        <View style={styles.privacyNote}>
          <Ionicons name="lock-closed" size={16} color="#6B7280" />
          <Text style={styles.privacyText}>
            Your emergency contacts will only be notified when you explicitly share your trip or trigger an SOS alert.
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
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
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
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
    gap: 8,
    marginBottom: 4,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  primaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  primaryText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#92400E',
  },
  contactPhone: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  contactRelationship: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addForm: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  addButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  addContactText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
  },
  featuresCard: {
    backgroundColor: '#D1FAE5',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  featuresTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#047857',
    marginBottom: 12,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  featureText: {
    flex: 1,
    fontSize: 13,
    color: '#047857',
    lineHeight: 18,
  },
  privacyNote: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    gap: 8,
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
});
