import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PrivacyScreen({ navigation }) {
  const [locationSharing, setLocationSharing] = useState(true);
  const [activityTracking, setActivityTracking] = useState(true);
  const [dataCollection, setDataCollection] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Data</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView>
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="location" size={22} color="#7C3AED" />
              <View style={styles.rowContent}>
                <Text style={styles.rowText}>Location Sharing</Text>
                <Text style={styles.rowSubtext}>Share location during trips</Text>
              </View>
            </View>
            <Switch value={locationSharing} onValueChange={setLocationSharing} />
          </View>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="analytics" size={22} color="#7C3AED" />
              <View style={styles.rowContent}>
                <Text style={styles.rowText}>Activity Tracking</Text>
                <Text style={styles.rowSubtext}>Help improve our service</Text>
              </View>
            </View>
            <Switch value={activityTracking} onValueChange={setActivityTracking} />
          </View>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="shield" size={22} color="#7C3AED" />
              <View style={styles.rowContent}>
                <Text style={styles.rowText}>Data Collection</Text>
                <Text style={styles.rowSubtext}>Share anonymized usage data</Text>
              </View>
            </View>
            <Switch value={dataCollection} onValueChange={setDataCollection} />
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Download My Data</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.dangerButton]}>
            <Text style={[styles.actionButtonText, styles.dangerButtonText]}>Delete My Account</Text>
          </TouchableOpacity>
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
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  rowContent: { flex: 1 },
  rowText: { fontSize: 16, color: '#1F2937', marginBottom: 2 },
  rowSubtext: { fontSize: 13, color: '#6B7280' },
  actions: { padding: 16, gap: 12 },
  actionButton: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, alignItems: 'center' },
  actionButtonText: { fontSize: 16, fontWeight: '600', color: '#7C3AED' },
  dangerButton: { borderWidth: 1, borderColor: '#EF4444' },
  dangerButtonText: { color: '#EF4444' },
});
