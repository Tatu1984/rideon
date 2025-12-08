import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../config/constants';

export default function OffersScreen({ navigation }) {
  const [promoCode, setPromoCode] = useState('');
  const [activeTab, setActiveTab] = useState('offers'); // offers, rewards, referral

  const offers = [
    {
      id: 1,
      title: 'FIRST20',
      description: '20% off on your first 5 rides',
      discount: '20% OFF',
      validUntil: '2025-12-31',
      terms: 'Max discount $10. Valid for first 5 rides only.',
      type: 'new_user',
    },
    {
      id: 2,
      title: 'WEEKEND50',
      description: 'Flat $5 off on weekend rides',
      discount: '$5 OFF',
      validUntil: '2025-12-15',
      terms: 'Valid on Sat-Sun only. Min fare $15.',
      type: 'limited_time',
    },
    {
      id: 3,
      title: 'POOL10',
      description: 'Extra 10% off on pool rides',
      discount: '10% OFF',
      validUntil: '2026-01-31',
      terms: 'Valid on shared/pool rides only.',
      type: 'category',
    },
  ];

  const loyaltyTier = {
    current: 'Gold',
    points: 2450,
    nextTier: 'Platinum',
    pointsToNext: 550,
    benefits: [
      'Priority booking during surge',
      '15% lower surge pricing',
      'Free ride upgrades',
      '24/7 priority support',
    ],
  };

  const streakRewards = {
    currentStreak: 3,
    targetStreak: 5,
    reward: '$10 OFF',
    description: 'Take 5 rides this week to earn $10 off',
  };

  const applyPromoCode = () => {
    if (!promoCode.trim()) {
      Alert.alert('Error', 'Please enter a promo code');
      return;
    }
    Alert.alert('Success', `Promo code "${promoCode}" applied successfully!`);
    setPromoCode('');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Offers & Rewards</Text>
        <Text style={styles.headerSubtitle}>Save more on every ride</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'offers' && styles.activeTab]}
          onPress={() => setActiveTab('offers')}
        >
          <Text style={[styles.tabText, activeTab === 'offers' && styles.activeTabText]}>
            Offers
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'rewards' && styles.activeTab]}
          onPress={() => setActiveTab('rewards')}
        >
          <Text style={[styles.tabText, activeTab === 'rewards' && styles.activeTabText]}>
            Rewards
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'referral' && styles.activeTab]}
          onPress={() => setActiveTab('referral')}
        >
          <Text style={[styles.tabText, activeTab === 'referral' && styles.activeTabText]}>
            Referral
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'offers' && (
          <>
            {/* Promo Code Input */}
            <View style={styles.promoSection}>
              <Text style={styles.promoLabel}>Have a promo code?</Text>
              <View style={styles.promoInput}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter code"
                  value={promoCode}
                  onChangeText={setPromoCode}
                  autoCapitalize="characters"
                />
                <TouchableOpacity style={styles.applyButton} onPress={applyPromoCode}>
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Available Offers */}
            {offers.map((offer) => (
              <View key={offer.id} style={styles.offerCard}>
                <View style={styles.offerHeader}>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{offer.discount}</Text>
                  </View>
                  <View style={styles.offerInfo}>
                    <Text style={styles.offerCode}>{offer.title}</Text>
                    <Text style={styles.offerDescription}>{offer.description}</Text>
                  </View>
                </View>

                <View style={styles.offerDetails}>
                  <View style={styles.offerDetail}>
                    <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
                    <Text style={styles.offerDetailText}>Valid until {offer.validUntil}</Text>
                  </View>
                  <Text style={styles.offerTerms}>{offer.terms}</Text>
                </View>

                <TouchableOpacity style={styles.useButton}>
                  <Text style={styles.useButtonText}>Use Code</Text>
                  <Ionicons name="arrow-forward" size={20} color="#7C3AED" />
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {activeTab === 'rewards' && (
          <>
            {/* Loyalty Tier */}
            <View style={styles.loyaltyCard}>
              <View style={styles.loyaltyHeader}>
                <Ionicons name="star" size={48} color="#F59E0B" />
                <View style={styles.loyaltyInfo}>
                  <Text style={styles.loyaltyTier}>{loyaltyTier.current} Member</Text>
                  <Text style={styles.loyaltyPoints}>{loyaltyTier.points} points</Text>
                </View>
              </View>

              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressText}>
                    {loyaltyTier.pointsToNext} points to {loyaltyTier.nextTier}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${
                          ((loyaltyTier.points % 1000) / (loyaltyTier.points % 1000 + loyaltyTier.pointsToNext)) *
                          100
                        }%`,
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.benefits}>
                <Text style={styles.benefitsTitle}>Your Benefits</Text>
                {loyaltyTier.benefits.map((benefit, index) => (
                  <View key={index} style={styles.benefitItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.membershipButton}
                onPress={() => navigation.navigate('Membership')}
              >
                <Text style={styles.membershipButtonText}>Upgrade Membership</Text>
              </TouchableOpacity>
            </View>

            {/* Streak Rewards */}
            <View style={styles.streakCard}>
              <View style={styles.streakHeader}>
                <Ionicons name="flame" size={32} color="#EF4444" />
                <Text style={styles.streakTitle}>Ride Streak</Text>
              </View>
              <Text style={styles.streakDescription}>{streakRewards.description}</Text>

              <View style={styles.streakProgress}>
                {[...Array(streakRewards.targetStreak)].map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.streakDay,
                      index < streakRewards.currentStreak && styles.streakDayActive,
                    ]}
                  >
                    {index < streakRewards.currentStreak ? (
                      <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    ) : (
                      <Text style={styles.streakDayNumber}>{index + 1}</Text>
                    )}
                  </View>
                ))}
              </View>

              <Text style={styles.streakReward}>Reward: {streakRewards.reward}</Text>
            </View>
          </>
        )}

        {activeTab === 'referral' && (
          <View style={styles.referralCard}>
            <Ionicons name="people" size={64} color="#7C3AED" />
            <Text style={styles.referralTitle}>Refer & Earn</Text>
            <Text style={styles.referralDescription}>
              Invite friends and get $10 for each friend who completes their first ride
            </Text>

            <View style={styles.referralCodeBox}>
              <Text style={styles.referralCodeLabel}>Your Referral Code</Text>
              <Text style={styles.referralCode}>RIDE2025</Text>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={() => navigation.navigate('Referral')}
              >
                <Ionicons name="share-social" size={20} color="#FFFFFF" />
                <Text style={styles.shareButtonText}>Share Code</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.referralStats}>
              <View style={styles.referralStat}>
                <Text style={styles.referralStatValue}>5</Text>
                <Text style={styles.referralStatLabel}>Friends Invited</Text>
              </View>
              <View style={styles.referralStat}>
                <Text style={styles.referralStatValue}>$50</Text>
                <Text style={styles.referralStatLabel}>Total Earned</Text>
              </View>
            </View>
          </View>
        )}
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 4,
    margin: 16,
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#7C3AED',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  promoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  promoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  promoInput: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  applyButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  offerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  offerHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  discountBadge: {
    backgroundColor: '#FEF3C7',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  discountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F59E0B',
    textAlign: 'center',
  },
  offerInfo: {
    flex: 1,
  },
  offerCode: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginBottom: 6,
  },
  offerDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  offerDetails: {
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  offerDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  offerDetailText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  offerTerms: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  useButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  useButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
  },
  loyaltyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loyaltyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  loyaltyInfo: {
    marginLeft: 16,
  },
  loyaltyTier: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  loyaltyPoints: {
    fontSize: 16,
    color: '#7C3AED',
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
  },
  benefits: {
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#4B5563',
  },
  membershipButton: {
    backgroundColor: '#7C3AED',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  membershipButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  streakCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  streakTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  streakDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  streakProgress: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  streakDay: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakDayActive: {
    backgroundColor: '#10B981',
  },
  streakDayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  streakReward: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7C3AED',
    textAlign: 'center',
  },
  referralCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  referralTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  referralDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  referralCodeBox: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  referralCodeLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  referralCode: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#7C3AED',
    letterSpacing: 2,
    marginBottom: 16,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  referralStats: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  referralStat: {
    alignItems: 'center',
  },
  referralStatValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginBottom: 4,
  },
  referralStatLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
});
