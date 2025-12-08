import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FAQScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const categories = ['all', 'Trips', 'Payments', 'Account', 'Safety', 'Promos'];

  const faqs = [
    { id: 1, category: 'Trips', question: 'How do I book a ride?', answer: 'Open the app, enter your destination, select vehicle type, and tap "Book Ride".' },
    { id: 2, category: 'Trips', question: 'Can I cancel a ride?', answer: 'Yes, you can cancel before the driver arrives. Cancellation fees may apply after 2 minutes.' },
    { id: 3, category: 'Payments', question: 'What payment methods are accepted?', answer: 'We accept credit/debit cards, UPI, PayPal, net banking, and cash.' },
    { id: 4, category: 'Payments', question: 'How do refunds work?', answer: 'Refunds are processed within 5-7 business days to your original payment method.' },
    { id: 5, category: 'Account', question: 'How do I update my profile?', answer: 'Go to Profile > Edit Profile to update your information.' },
    { id: 6, category: 'Safety', question: 'How do I share my trip?', answer: 'During a trip, tap Share Trip and select contacts to send live tracking link.' },
    { id: 7, category: 'Promos', question: 'Where do I enter promo codes?', answer: 'Enter promo codes in the booking screen before confirming your ride.' },
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for help..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content}>
        {filteredFaqs.map(faq => (
          <TouchableOpacity
            key={faq.id}
            style={styles.faqCard}
            onPress={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Ionicons
                name={expandedFaq === faq.id ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#7C3AED"
              />
            </View>
            {expandedFaq === faq.id && (
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
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
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#1F2937' },
  categories: { marginBottom: 16, paddingHorizontal: 16 },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  categoryChipActive: { backgroundColor: '#7C3AED' },
  categoryText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  categoryTextActive: { color: '#FFFFFF' },
  content: { flex: 1, paddingHorizontal: 16 },
  faqCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1F2937' },
  faqAnswer: { fontSize: 14, color: '#6B7280', marginTop: 12, lineHeight: 20 },
});
