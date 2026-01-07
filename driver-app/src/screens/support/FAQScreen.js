import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FAQScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const faqCategories = [
    {
      category: 'Getting Started',
      icon: 'rocket',
      color: '#160832',
      faqs: [
        {
          id: 1,
          question: 'How do I get started as a driver?',
          answer: 'Complete your registration, upload required documents, pass background check, and complete the training tutorial. Once verified, you can start accepting trips!',
        },
        {
          id: 2,
          question: 'What documents do I need?',
          answer: 'You\'ll need: Valid driver\'s license, vehicle registration, insurance certificate, and a recent background check clearance.',
        },
        {
          id: 3,
          question: 'How long does verification take?',
          answer: 'Document verification typically takes 24-48 hours. Background checks may take up to 5 business days.',
        },
      ],
    },
    {
      category: 'Earnings & Payments',
      icon: 'wallet',
      color: '#10B981',
      faqs: [
        {
          id: 4,
          question: 'When do I get paid?',
          answer: 'Earnings are deposited weekly every Monday. You can also request instant payouts (subject to fees) anytime.',
        },
        {
          id: 5,
          question: 'How are fares calculated?',
          answer: 'Fares include base rate + time rate + distance rate + any applicable surge pricing or incentives.',
        },
        {
          id: 6,
          question: 'What are the platform fees?',
          answer: 'We charge a 20% service fee on each trip. This covers app maintenance, insurance, and support.',
        },
      ],
    },
    {
      category: 'Trips & Navigation',
      icon: 'car',
      color: '#3B82F6',
      faqs: [
        {
          id: 7,
          question: 'Can I reject trip requests?',
          answer: 'Yes, but maintaining a high acceptance rate (>90%) helps you qualify for incentives and bonuses.',
        },
        {
          id: 8,
          question: 'What if the passenger cancels?',
          answer: 'If cancelled after 2 minutes, you\'ll receive a cancellation fee. This is automatically added to your earnings.',
        },
        {
          id: 9,
          question: 'Can I choose my navigation app?',
          answer: 'Yes! Go to Settings to select your preferred navigation provider (Google Maps, Apple Maps, or Waze).',
        },
      ],
    },
    {
      category: 'Safety & Support',
      icon: 'shield-checkmark',
      color: '#EF4444',
      faqs: [
        {
          id: 10,
          question: 'What should I do in an emergency?',
          answer: 'Use the SOS button in the Safety Toolkit. This alerts our operations team, emergency services, and your emergency contacts immediately.',
        },
        {
          id: 11,
          question: 'How do I report an incident?',
          answer: 'Go to Safety Toolkit > Report Incident. Choose the incident type, provide details, and our safety team will respond within 24 hours.',
        },
        {
          id: 12,
          question: 'Is insurance provided?',
          answer: 'Yes, you\'re covered by our comprehensive insurance policy during active trips. Additional coverage details are in your driver agreement.',
        },
      ],
    },
    {
      category: 'Account & Settings',
      icon: 'settings',
      color: '#F59E0B',
      faqs: [
        {
          id: 13,
          question: 'How do I update my bank details?',
          answer: 'Go to Profile > Bank Details. You can update your bank account or add UPI/PayPal for payouts.',
        },
        {
          id: 14,
          question: 'Can I drive in multiple cities?',
          answer: 'Yes! Your account works across all our service areas. Just ensure your documents are valid for those regions.',
        },
        {
          id: 15,
          question: 'How do I change my vehicle?',
          answer: 'Go to Profile > Vehicle Details. Update your vehicle information and upload new registration documents for verification.',
        },
      ],
    },
  ];

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredCategories = searchQuery
    ? faqCategories.map(category => ({
        ...category,
        faqs: category.faqs.filter(faq =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(category => category.faqs.length > 0)
    : faqCategories;

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search FAQs..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        {filteredCategories.map((category, categoryIndex) => (
          <View key={categoryIndex} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
                <Ionicons name={category.icon} size={24} color={category.color} />
              </View>
              <Text style={styles.categoryTitle}>{category.category}</Text>
            </View>

            <View style={styles.faqList}>
              {category.faqs.map((faq) => (
                <TouchableOpacity
                  key={faq.id}
                  style={styles.faqItem}
                  onPress={() => toggleExpand(faq.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.faqQuestion}>
                    <View style={styles.questionIcon}>
                      <Text style={styles.questionIconText}>Q</Text>
                    </View>
                    <Text style={styles.questionText}>{faq.question}</Text>
                    <Ionicons
                      name={expandedId === faq.id ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color="#9CA3AF"
                    />
                  </View>

                  {expandedId === faq.id && (
                    <View style={styles.faqAnswer}>
                      <View style={styles.answerIcon}>
                        <Text style={styles.answerIconText}>A</Text>
                      </View>
                      <Text style={styles.answerText}>{faq.answer}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {filteredCategories.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="help-circle-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No FAQs found</Text>
            <Text style={styles.emptyStateSubtext}>Try searching with different keywords</Text>
          </View>
        )}

        {/* Still Need Help */}
        <View style={styles.helpCard}>
          <Ionicons name="chatbubbles" size={48} color="#160832" />
          <Text style={styles.helpTitle}>Still need help?</Text>
          <Text style={styles.helpSubtitle}>Our support team is here 24/7</Text>
          <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="headset" size={20} color="#FFFFFF" />
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  categorySection: {
    marginBottom: 24,
    marginHorizontal: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  faqList: {
    gap: 8,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#160832',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  questionIconText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 20,
  },
  faqAnswer: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  answerIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  answerIconText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#160832',
  },
  answerText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#D1D5DB',
    marginTop: 4,
  },
  helpCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  helpTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 12,
  },
  helpSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#160832',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});
