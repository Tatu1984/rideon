import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RideStatsScreen({ navigation }) {
  const stats = {
    totalRides: 156,
    totalDistance: 1250,
    totalSpent: 2840,
    co2Saved: 125,
    favoritePlaces: ['Downtown SF', 'Marina District', 'Mission Bay'],
    topDriver: 'John Smith',
    avgRating: 4.8,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ride Statistics</Text>
        <TouchableOpacity>
          <Ionicons name="share-social" size={24} color="#7C3AED" />
        </TouchableOpacity>
      </View>

      <ScrollView>
        <View style={styles.heroCard}>
          <Text style={styles.heroValue}>{stats.totalRides}</Text>
          <Text style={styles.heroLabel}>Total Rides</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="speedometer" size={32} color="#7C3AED" />
            <Text style={styles.statValue}>{stats.totalDistance} km</Text>
            <Text style={styles.statLabel}>Distance Traveled</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="cash" size={32} color="#10B981" />
            <Text style={styles.statValue}>${stats.totalSpent}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
        </View>

        <View style={styles.impactCard}>
          <View style={styles.impactHeader}>
            <Ionicons name="leaf" size={28} color="#10B981" />
            <Text style={styles.impactTitle}>Environmental Impact</Text>
          </View>
          <Text style={styles.impactValue}>{stats.co2Saved} kg CO₂ Saved</Text>
          <Text style={styles.impactText}>By choosing shared rides and carpooling</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Top Places</Text>
          {stats.favoritePlaces.map((place, index) => (
            <View key={index} style={styles.placeCard}>
              <View style={styles.placeNumber}><Text style={styles.placeNumberText}>{index + 1}</Text></View>
              <Ionicons name="location" size={20} color="#7C3AED" />
              <Text style={styles.placeText}>{place}</Text>
            </View>
          ))}
        </View>

        <View style={styles.achievementCard}>
          <Ionicons name="trophy" size={48} color="#F59E0B" />
          <Text style={styles.achievementTitle}>Riding Champion!</Text>
          <Text style={styles.achievementText}>You're in the top 10% of riders this month</Text>
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
  heroCard: { backgroundColor: '#7C3AED', margin: 16, padding: 32, borderRadius: 16, alignItems: 'center' },
  heroValue: { fontSize: 64, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  heroLabel: { fontSize: 18, color: '#E9D5FF' },
  statsGrid: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginTop: 12, marginBottom: 4 },
  statLabel: { fontSize: 13, color: '#6B7280', textAlign: 'center' },
  impactCard: { backgroundColor: '#D1FAE5', margin: 16, padding: 20, borderRadius: 16 },
  impactHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  impactTitle: { fontSize: 18, fontWeight: 'bold', color: '#047857' },
  impactValue: { fontSize: 28, fontWeight: 'bold', color: '#047857', marginBottom: 4 },
  impactText: { fontSize: 14, color: '#047857' },
  section: { backgroundColor: '#FFFFFF', padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 12 },
  placeCard: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#F9FAFB', borderRadius: 8, marginBottom: 8, gap: 12 },
  placeNumber: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#7C3AED', justifyContent: 'center', alignItems: 'center' },
  placeNumberText: { fontSize: 12, fontWeight: 'bold', color: '#FFFFFF' },
  placeText: { flex: 1, fontSize: 15, color: '#1F2937' },
  achievementCard: { backgroundColor: '#FEF3C7', margin: 16, padding: 24, borderRadius: 16, alignItems: 'center' },
  achievementTitle: { fontSize: 20, fontWeight: 'bold', color: '#92400E', marginTop: 12, marginBottom: 4 },
  achievementText: { fontSize: 14, color: '#92400E', textAlign: 'center' },
});
