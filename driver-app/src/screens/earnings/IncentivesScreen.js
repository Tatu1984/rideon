import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from 'react-native-paper';

export default function IncentivesScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('active'); // active, completed, referral

  const activeIncentives = [
    {
      id: 1,
      title: 'Weekend Warrior',
      description: 'Complete 20 trips this weekend',
      reward: 50,
      progress: 12,
      target: 20,
      expiresAt: '2025-12-08 23:59',
      type: 'trips',
    },
    {
      id: 2,
      title: 'Peak Hour Champion',
      description: 'Accept 10 trips during peak hours (7-9 AM, 5-7 PM)',
      reward: 30,
      progress: 6,
      target: 10,
      expiresAt: '2025-12-07 23:59',
      type: 'peak',
    },
    {
      id: 3,
      title: 'Monthly Marathon',
      description: 'Complete 100 trips this month',
      reward: 200,
      progress: 67,
      target: 100,
      expiresAt: '2025-12-31 23:59',
      type: 'trips',
    },
    {
      id: 4,
      title: 'High Ratings Streak',
      description: 'Maintain 4.8+ rating for 50 consecutive trips',
      reward: 75,
      progress: 38,
      target: 50,
      expiresAt: '2025-12-15 23:59',
      type: 'rating',
    },
  ];

  const completedIncentives = [
    {
      id: 5,
      title: 'First Week Hero',
      description: 'Complete 50 trips in your first week',
      reward: 100,
      completedAt: '2025-11-30',
    },
    {
      id: 6,
      title: 'Daily Dynamo',
      description: 'Complete 15 trips in one day',
      reward: 25,
      completedAt: '2025-12-01',
    },
  ];

  const referralProgram = {
    code: 'DRIVER2025',
    totalReferred: 3,
    earnings: 150,
    pending: 1,
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            Completed
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
        {activeTab === 'active' && (
          <>
            {activeIncentives.map((incentive) => (
              <View key={incentive.id} style={styles.incentiveCard}>
                <View style={styles.incentiveHeader}>
                  <View style={styles.incentiveIcon}>
                    <Ionicons name="trophy" size={24} color="#F59E0B" />
                  </View>
                  <View style={styles.incentiveInfo}>
                    <Text style={styles.incentiveTitle}>{incentive.title}</Text>
                    <Text style={styles.incentiveDescription}>{incentive.description}</Text>
                  </View>
                  <View style={styles.rewardBadge}>
                    <Text style={styles.rewardText}>${incentive.reward}</Text>
                  </View>
                </View>

                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressText}>
                      {incentive.progress} / {incentive.target}
                    </Text>
                    <Text style={styles.progressPercentage}>
                      {Math.round((incentive.progress / incentive.target) * 100)}%
                    </Text>
                  </View>
                  <ProgressBar
                    progress={incentive.progress / incentive.target}
                    color="#160832"
                    style={styles.progressBar}
                  />
                </View>

                <View style={styles.incentiveFooter}>
                  <Ionicons name="time-outline" size={16} color="#9CA3AF" />
                  <Text style={styles.expiryText}>Expires: {incentive.expiresAt}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {activeTab === 'completed' && (
          <>
            {completedIncentives.map((incentive) => (
              <View key={incentive.id} style={styles.completedCard}>
                <View style={styles.completedHeader}>
                  <View style={styles.completedIcon}>
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  </View>
                  <View style={styles.incentiveInfo}>
                    <Text style={styles.incentiveTitle}>{incentive.title}</Text>
                    <Text style={styles.incentiveDescription}>{incentive.description}</Text>
                  </View>
                  <View style={[styles.rewardBadge, { backgroundColor: '#D1FAE5' }]}>
                    <Text style={[styles.rewardText, { color: '#10B981' }]}>+${incentive.reward}</Text>
                  </View>
                </View>
                <Text style={styles.completedDate}>Completed: {incentive.completedAt}</Text>
              </View>
            ))}
          </>
        )}

        {activeTab === 'referral' && (
          <View>
            <View style={styles.referralCard}>
              <Text style={styles.referralTitle}>Refer & Earn</Text>
              <Text style={styles.referralSubtitle}>
                Share your code and earn $50 for each driver who completes 20 trips
              </Text>

              <View style={styles.referralCodeBox}>
                <Text style={styles.referralCodeLabel}>Your Referral Code</Text>
                <Text style={styles.referralCode}>{referralProgram.code}</Text>
                <TouchableOpacity style={styles.shareButton}>
                  <Ionicons name="share-social" size={20} color="#FFFFFF" />
                  <Text style={styles.shareButtonText}>Share Code</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.referralStats}>
                <View style={styles.referralStat}>
                  <Text style={styles.referralStatValue}>{referralProgram.totalReferred}</Text>
                  <Text style={styles.referralStatLabel}>Total Referred</Text>
                </View>
                <View style={styles.referralStat}>
                  <Text style={styles.referralStatValue}>${referralProgram.earnings}</Text>
                  <Text style={styles.referralStatLabel}>Total Earned</Text>
                </View>
                <View style={styles.referralStat}>
                  <Text style={styles.referralStatValue}>{referralProgram.pending}</Text>
                  <Text style={styles.referralStatLabel}>Pending</Text>
                </View>
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
    backgroundColor: '#160832',
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
  incentiveCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  incentiveHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  incentiveIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  incentiveInfo: {
    flex: 1,
  },
  incentiveTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  incentiveDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  rewardBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    height: 32,
    justifyContent: 'center',
  },
  rewardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#160832',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  incentiveFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expiryText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  completedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  completedHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  completedIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  completedDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 60,
  },
  referralCard: {
    backgroundColor: '#160832',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  referralTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  referralSubtitle: {
    fontSize: 14,
    color: '#E9D5FF',
    marginBottom: 24,
    lineHeight: 20,
  },
  referralCodeBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  referralCodeLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  referralCode: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#160832',
    letterSpacing: 2,
    marginBottom: 16,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#160832',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  referralStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  referralStat: {
    alignItems: 'center',
  },
  referralStatValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  referralStatLabel: {
    fontSize: 12,
    color: '#E9D5FF',
  },
});
