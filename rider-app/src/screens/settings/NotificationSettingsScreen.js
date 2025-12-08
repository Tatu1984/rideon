import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationSettingsScreen({ navigation }) {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [tripUpdates, setTripUpdates] = useState(true);
  const [promos, setPromos] = useState(true);
  const [rewards, setRewards] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView>
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="notifications" size={22} color="#7C3AED" />
              <Text style={styles.rowText}>Push Notifications</Text>
            </View>
            <Switch value={pushEnabled} onValueChange={setPushEnabled} />
          </View>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="car" size={22} color="#7C3AED" />
              <Text style={styles.rowText}>Trip Updates</Text>
            </View>
            <Switch value={tripUpdates} onValueChange={setTripUpdates} />
          </View>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="pricetag" size={22} color="#7C3AED" />
              <Text style={styles.rowText}>Promos & Offers</Text>
            </View>
            <Switch value={promos} onValueChange={setPromos} />
          </View>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="gift" size={22} color="#7C3AED" />
              <Text style={styles.rowText}>Rewards Updates</Text>
            </View>
            <Switch value={rewards} onValueChange={setRewards} />
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
  section: { backgroundColor: '#FFFFFF', marginTop: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowText: { fontSize: 16, color: '#1F2937' },
});
