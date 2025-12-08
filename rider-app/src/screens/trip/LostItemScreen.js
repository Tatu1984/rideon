import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LostItemScreen({ navigation, route }) {
  const { tripId } = route.params || {};

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [itemDescription, setItemDescription] = useState('');
  const [contactMethod, setContactMethod] = useState('phone');

  const itemCategories = [
    { id: 'phone', label: 'Phone', icon: 'phone-portrait' },
    { id: 'wallet', label: 'Wallet', icon: 'wallet' },
    { id: 'bag', label: 'Bag', icon: 'bag-handle' },
    { id: 'keys', label: 'Keys', icon: 'key' },
    { id: 'laptop', label: 'Laptop', icon: 'laptop' },
    { id: 'clothing', label: 'Clothing', icon: 'shirt' },
    { id: 'jewelry', label: 'Jewelry', icon: 'diamond' },
    { id: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
  ];

  const trip = {
    id: tripId || 'TRIP123456',
    date: '2025-12-05',
    driver: {
      name: 'John Smith',
      photo: 'https://i.pravatar.cc/150?img=12',
    },
    vehicle: {
      name: 'Sedan',
      plate: 'ABC 1234',
    },
  };

  const handleSubmit = () => {
    if (!selectedCategory) {
      alert('Please select an item category');
      return;
    }
    if (!itemDescription.trim()) {
      alert('Please describe the item');
      return;
    }

    // Submit lost item report
    alert('Lost item report submitted!\nWe will contact you if your item is found.');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Lost Item</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Trip Info */}
        <View style={styles.tripCard}>
          <View style={styles.tripHeader}>
            <Image source={{ uri: trip.driver.photo }} style={styles.driverPhoto} />
            <View style={styles.tripInfo}>
              <Text style={styles.driverName}>{trip.driver.name}</Text>
              <Text style={styles.vehicleInfo}>{trip.vehicle.name} • {trip.vehicle.plate}</Text>
              <Text style={styles.tripId}>Trip ID: {trip.id}</Text>
            </View>
          </View>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color="#2563EB" />
          <Text style={styles.infoBannerText}>
            We'll contact your driver and notify you if your item is found.
          </Text>
        </View>

        {/* Item Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What did you lose?</Text>
          <View style={styles.categoriesGrid}>
            {itemCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory === category.id && styles.categoryCardSelected,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Ionicons
                  name={category.icon}
                  size={28}
                  color={selectedCategory === category.id ? '#7C3AED' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.categoryLabel,
                    selectedCategory === category.id && styles.categoryLabelSelected,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Item Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Describe the item</Text>
          <Text style={styles.sectionSubtitle}>
            Include details like color, brand, or any identifying features
          </Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="E.g., Black iPhone 14 Pro with blue case"
            value={itemDescription}
            onChangeText={setItemDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Contact Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How should we contact you?</Text>
          <View style={styles.contactMethods}>
            <TouchableOpacity
              style={[
                styles.contactMethod,
                contactMethod === 'phone' && styles.contactMethodSelected,
              ]}
              onPress={() => setContactMethod('phone')}
            >
              <Ionicons
                name="call"
                size={20}
                color={contactMethod === 'phone' ? '#7C3AED' : '#6B7280'}
              />
              <Text
                style={[
                  styles.contactMethodText,
                  contactMethod === 'phone' && styles.contactMethodTextSelected,
                ]}
              >
                Phone
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.contactMethod,
                contactMethod === 'email' && styles.contactMethodSelected,
              ]}
              onPress={() => setContactMethod('email')}
            >
              <Ionicons
                name="mail"
                size={20}
                color={contactMethod === 'email' ? '#7C3AED' : '#6B7280'}
              />
              <Text
                style={[
                  styles.contactMethodText,
                  contactMethod === 'email' && styles.contactMethodTextSelected,
                ]}
              >
                Email
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.contactMethod,
                contactMethod === 'both' && styles.contactMethodSelected,
              ]}
              onPress={() => setContactMethod('both')}
            >
              <Ionicons
                name="notifications"
                size={20}
                color={contactMethod === 'both' ? '#7C3AED' : '#6B7280'}
              />
              <Text
                style={[
                  styles.contactMethodText,
                  contactMethod === 'both' && styles.contactMethodTextSelected,
                ]}
              >
                Both
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Tips for recovering your item</Text>
          <View style={styles.tip}>
            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            <Text style={styles.tipText}>
              Be as specific as possible in your description
            </Text>
          </View>
          <View style={styles.tip}>
            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            <Text style={styles.tipText}>
              We'll notify you within 24-48 hours if found
            </Text>
          </View>
          <View style={styles.tip}>
            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            <Text style={styles.tipText}>
              You can track your request in Support section
            </Text>
          </View>
        </View>

        {/* Contact Driver Directly */}
        <TouchableOpacity style={styles.contactDriverButton}>
          <View style={styles.contactDriverLeft}>
            <Ionicons name="chatbubbles" size={20} color="#7C3AED" />
            <Text style={styles.contactDriverText}>Contact driver directly</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedCategory || !itemDescription.trim()) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!selectedCategory || !itemDescription.trim()}
        >
          <Text style={styles.submitButtonText}>Submit Report</Text>
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
  },
  driverPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  tripInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  vehicleInfo: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  tripId: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
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
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryCard: {
    width: '23%',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  categoryCardSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#F3E8FF',
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  categoryLabelSelected: {
    color: '#7C3AED',
  },
  descriptionInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1F2937',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  contactMethods: {
    flexDirection: 'row',
    gap: 8,
  },
  contactMethod: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  contactMethodSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#F3E8FF',
  },
  contactMethodText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  contactMethodTextSelected: {
    color: '#7C3AED',
  },
  tipsCard: {
    backgroundColor: '#FEF3C7',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 12,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  contactDriverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  contactDriverLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactDriverText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7C3AED',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submitButton: {
    backgroundColor: '#7C3AED',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
