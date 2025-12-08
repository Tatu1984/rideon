import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ReferralScreen({ navigation }) {
  const referralCode = 'RIDE2025';
  const referralsCount = 12;
  const earnings = 120;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join RideOn with my code ${referralCode} and get $10 off your first ride! https://rideon.app/ref/${referralCode}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refer & Earn</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView>
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Your Referral Code</Text>
          <Text style={styles.code}>{referralCode}</Text>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-social" size={20} color="#FFFFFF" />
            <Text style={styles.shareButtonText}>Share Code</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{referralsCount}</Text>
            <Text style={styles.statLabel}>Referrals</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${earnings}</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
        </View>

        <View style={styles.howItWorks}>
          <Text style={styles.howItWorksTitle}>How it works</Text>
          <View style={styles.step}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
            <Text style={styles.stepText}>Share your code with friends</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
            <Text style={styles.stepText}>They get $10 off their first ride</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
            <Text style={styles.stepText}>You get $10 credit after their first ride</Text>
          </View>
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
  codeCard: { backgroundColor: '#7C3AED', margin: 16, padding: 32, borderRadius: 16, alignItems: 'center' },
  codeLabel: { fontSize: 14, color: '#E9D5FF', marginBottom: 8 },
  code: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20, letterSpacing: 4 },
  shareButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, gap: 8 },
  shareButtonText: { fontSize: 16, fontWeight: '600', color: '#7C3AED' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12 },
  statCard: { flex: 1, backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  statLabel: { fontSize: 14, color: '#6B7280' },
  howItWorks: { backgroundColor: '#FFFFFF', margin: 16, padding: 20, borderRadius: 16 },
  howItWorksTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  step: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 12 },
  stepNumber: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#7C3AED', justifyContent: 'center', alignItems: 'center' },
  stepNumberText: { fontSize: 12, fontWeight: 'bold', color: '#FFFFFF' },
  stepText: { flex: 1, fontSize: 14, color: '#6B7280', paddingTop: 2 },
});
