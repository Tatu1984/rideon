import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AccessibilityScreen({ navigation }) {
  const [voicePrompts, setVoicePrompts] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Accessibility</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView>
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="volume-high" size={22} color="#7C3AED" />
              <View style={styles.rowContent}>
                <Text style={styles.rowText}>Voice Prompts</Text>
                <Text style={styles.rowSubtext}>Audio assistance for navigation</Text>
              </View>
            </View>
            <Switch value={voicePrompts} onValueChange={setVoicePrompts} />
          </View>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="contrast" size={22} color="#7C3AED" />
              <View style={styles.rowContent}>
                <Text style={styles.rowText}>High Contrast</Text>
                <Text style={styles.rowSubtext}>Improve text visibility</Text>
              </View>
            </View>
            <Switch value={highContrast} onValueChange={setHighContrast} />
          </View>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="text" size={22} color="#7C3AED" />
              <View style={styles.rowContent}>
                <Text style={styles.rowText}>Large Text</Text>
                <Text style={styles.rowSubtext}>Increase font size</Text>
              </View>
            </View>
            <Switch value={largeText} onValueChange={setLargeText} />
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
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  rowContent: { flex: 1 },
  rowText: { fontSize: 16, color: '#1F2937', marginBottom: 2 },
  rowSubtext: { fontSize: 13, color: '#6B7280' },
});
