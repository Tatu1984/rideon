import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SupportScreen({ navigation }) {
  const handleCall = () => {
    Linking.openURL('tel:+18005551234');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@rideon.com');
  };

  const supportOptions = [
    {
      id: 'chat',
      icon: 'chatbubbles',
      color: '#7C3AED',
      title: 'Live Chat',
      description: 'Chat with our support team',
      screen: 'ChatSupport',
    },
    {
      id: 'tickets',
      icon: 'receipt',
      color: '#2563EB',
      title: 'My Tickets',
      description: 'View and track your support requests',
      screen: 'Tickets',
    },
    {
      id: 'faq',
      icon: 'help-circle',
      color: '#10B981',
      title: 'Help Center & FAQ',
      description: 'Find answers to common questions',
      screen: 'FAQ',
    },
  ];

  const quickActions = [
    {
      id: 'trip_issue',
      icon: 'car',
      title: 'Trip Issue',
      description: 'Report a problem with a trip',
    },
    {
      id: 'payment_issue',
      icon: 'card',
      title: 'Payment Issue',
      description: 'Issues with charges or refunds',
    },
    {
      id: 'account_issue',
      icon: 'person',
      title: 'Account Issue',
      description: 'Login, profile, or settings help',
    },
    {
      id: 'safety_concern',
      icon: 'shield-checkmark',
      title: 'Safety Concern',
      description: 'Report a safety issue',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Contact Methods */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>24/7 Support</Text>
          <Text style={styles.contactSubtitle}>We're here to help anytime</Text>

          <View style={styles.contactMethods}>
            <TouchableOpacity style={styles.contactMethod} onPress={handleCall}>
              <View style={styles.contactMethodIcon}>
                <Ionicons name="call" size={24} color="#10B981" />
              </View>
              <Text style={styles.contactMethodText}>Call Us</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactMethod} onPress={handleEmail}>
              <View style={[styles.contactMethodIcon, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="mail" size={24} color="#2563EB" />
              </View>
              <Text style={styles.contactMethodText}>Email</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactMethod}
              onPress={() => navigation.navigate('ChatSupport')}
            >
              <View style={[styles.contactMethodIcon, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons name="chatbubbles" size={24} color="#7C3AED" />
              </View>
              <Text style={styles.contactMethodText}>Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How can we help?</Text>
          {supportOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionCard}
              onPress={() => navigation.navigate(option.screen)}
            >
              <View style={[styles.optionIcon, { backgroundColor: `${option.color}20` }]}>
                <Ionicons name={option.icon} size={24} color={option.color} />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity key={action.id} style={styles.quickActionCard}>
                <Ionicons name={action.icon} size={28} color="#7C3AED" />
                <Text style={styles.quickActionTitle}>{action.title}</Text>
                <Text style={styles.quickActionDescription}>{action.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Popular Topics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Topics</Text>

          <TouchableOpacity style={styles.topicCard}>
            <Ionicons name="document-text" size={20} color="#6B7280" />
            <Text style={styles.topicText}>How to cancel a ride</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.topicCard}>
            <Ionicons name="document-text" size={20} color="#6B7280" />
            <Text style={styles.topicText}>Understanding fare breakdown</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.topicCard}>
            <Ionicons name="document-text" size={20} color="#6B7280" />
            <Text style={styles.topicText}>Payment methods and wallet</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.topicCard}>
            <Ionicons name="document-text" size={20} color="#6B7280" />
            <Text style={styles.topicText}>Safety features explained</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.topicCard}>
            <Ionicons name="document-text" size={20} color="#6B7280" />
            <Text style={styles.topicText}>Promo codes and rewards</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Response Time */}
        <View style={styles.responseCard}>
          <Ionicons name="time" size={20} color="#7C3AED" />
          <Text style={styles.responseText}>
            Average response time: <Text style={styles.responseBold}>Under 5 minutes</Text>
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
  contactCard: {
    backgroundColor: '#7C3AED',
    margin: 16,
    padding: 24,
    borderRadius: 16,
  },
  contactTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#E9D5FF',
    marginBottom: 20,
  },
  contactMethods: {
    flexDirection: 'row',
    gap: 12,
  },
  contactMethod: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  contactMethodIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactMethodText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionDescription: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  topicText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  responseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  responseText: {
    flex: 1,
    fontSize: 13,
    color: '#6B21A8',
  },
  responseBold: {
    fontWeight: 'bold',
  },
});
