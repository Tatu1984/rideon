import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RewardsScreen({ navigation }) {
  const points = 2450;
  const tier = 'Gold';
  const nextTier = 'Platinum';
  const pointsToNext = 550;

  const rewards = [
    { id: 1, icon: 'gift', title: '$5 Ride Credit', points: 500, category: 'rides' },
    { id: 2, icon: 'pricetag', title: '10% Off Next Ride', points: 300, category: 'discounts' },
    { id: 3, icon: 'star', title: 'Priority Booking', points: 1000, category: 'perks' },
    { id: 4, icon: 'shield-checkmark', title: '1 Month Premium', points: 2000, category: 'membership' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rewards</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView>
        <View style={styles.pointsCard}>
          <View style={styles.pointsHeader}>
            <View>
              <Text style={styles.pointsLabel}>Your Points</Text>
              <Text style={styles.pointsValue}>{points}</Text>
            </View>
            <View style={styles.tierBadge}>
              <Ionicons name="star" size={20} color="#F59E0B" />
              <Text style={styles.tierText}>{tier}</Text>
            </View>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(points / 3000) * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>{pointsToNext} points to {nextTier}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Redeem Rewards</Text>
          {rewards.map(reward => (
            <TouchableOpacity key={reward.id} style={styles.rewardCard}>
              <View style={styles.rewardIcon}>
                <Ionicons name={reward.icon} size={24} color="#7C3AED" />
              </View>
              <View style={styles.rewardInfo}>
                <Text style={styles.rewardTitle}>{reward.title}</Text>
                <Text style={styles.rewardPoints}>{reward.points} points</Text>
              </View>
              <TouchableOpacity style={styles.redeemButton}>
                <Text style={styles.redeemText}>Redeem</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 50, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  pointsCard: { backgroundColor: '#7C3AED', margin: 16, padding: 24, borderRadius: 16 },
  pointsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  pointsLabel: { fontSize: 14, color: '#E9D5FF', marginBottom: 4 },
  pointsValue: { fontSize: 36, fontWeight: 'bold', color: '#FFFFFF' },
  tierBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
  tierText: { fontSize: 14, fontWeight: 'bold', color: '#FFFFFF' },
  progressContainer: { gap: 8 },
  progressBar: { height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#FFFFFF', borderRadius: 4 },
  progressText: { fontSize: 13, color: '#E9D5FF' },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 12 },
  rewardCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, marginBottom: 8, gap: 12 },
  rewardIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F3E8FF', justifyContent: 'center', alignItems: 'center' },
  rewardInfo: { flex: 1 },
  rewardTitle: { fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
  rewardPoints: { fontSize: 13, color: '#6B7280' },
  redeemButton: { backgroundColor: '#7C3AED', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  redeemText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
});
