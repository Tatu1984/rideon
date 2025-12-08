import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MembershipScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Premium Membership</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView>
        <View style={styles.currentPlan}>
          <Text style={styles.currentPlanLabel}>Current Plan</Text>
          <Text style={styles.currentPlanName}>Free Plan</Text>
          <TouchableOpacity style={styles.upgradeButton}>
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <View>
              <Text style={styles.planName}>Premium</Text>
              <Text style={styles.planPrice}>$9.99/month</Text>
            </View>
            <Ionicons name="star" size={32} color="#F59E0B" />
          </View>
          <View style={styles.benefits}>
            <View style={styles.benefit}><Ionicons name="checkmark-circle" size={20} color="#10B981" /><Text style={styles.benefitText}>Priority booking</Text></View>
            <View style={styles.benefit}><Ionicons name="checkmark-circle" size={20} color="#10B981" /><Text style={styles.benefitText}>No surge pricing</Text></View>
            <View style={styles.benefit}><Ionicons name="checkmark-circle" size={20} color="#10B981" /><Text style={styles.benefitText}>Free cancellation</Text></View>
            <View style={styles.benefit}><Ionicons name="checkmark-circle" size={20} color="#10B981" /><Text style={styles.benefitText}>24/7 priority support</Text></View>
            <View style={styles.benefit}><Ionicons name="checkmark-circle" size={20} color="#10B981" /><Text style={styles.benefitText}>Exclusive discounts</Text></View>
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
  currentPlan: { backgroundColor: '#FFFFFF', margin: 16, padding: 24, borderRadius: 16, alignItems: 'center' },
  currentPlanLabel: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  currentPlanName: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  upgradeButton: { backgroundColor: '#7C3AED', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12 },
  upgradeButtonText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  planCard: { backgroundColor: '#FFFFFF', margin: 16, padding: 20, borderRadius: 16 },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  planName: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  planPrice: { fontSize: 16, color: '#6B7280' },
  benefits: { gap: 12 },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  benefitText: { fontSize: 15, color: '#1F2937' },
});
