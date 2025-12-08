import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen({ navigation }) {
  const settingsGroups = [
    {
      title: 'Account',
      items: [
        { icon: 'person', label: 'Edit Profile', screen: 'EditProfile' },
        { icon: 'shield-checkmark', label: 'Emergency Contacts', screen: 'EmergencyContacts' },
        { icon: 'heart', label: 'Favorite Drivers', screen: 'FavoriteDrivers' },
        { icon: 'settings', label: 'Ride Preferences', screen: 'Preferences' },
      ],
    },
    {
      title: 'App Settings',
      items: [
        { icon: 'notifications', label: 'Notifications', screen: 'NotificationSettings' },
        { icon: 'accessibility', label: 'Accessibility', screen: 'Accessibility' },
        { icon: 'lock-closed', label: 'Privacy & Data', screen: 'Privacy' },
        { icon: 'language', label: 'Language', value: 'English' },
      ],
    },
    {
      title: 'Legal',
      items: [
        { icon: 'document-text', label: 'Terms & Conditions' },
        { icon: 'shield', label: 'Privacy Policy' },
        { icon: 'information-circle', label: 'About' },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {settingsGroups.map((group, index) => (
          <View key={index} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupItems}>
              {group.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={styles.item}
                  onPress={() => item.screen && navigation.navigate(item.screen)}
                >
                  <Ionicons name={item.icon} size={22} color="#7C3AED" />
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  {item.value && <Text style={styles.itemValue}>{item.value}</Text>}
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 50, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  content: { flex: 1 },
  group: { marginTop: 24 },
  groupTitle: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginLeft: 16, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  groupItems: { backgroundColor: '#FFFFFF' },
  item: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', gap: 12 },
  itemLabel: { flex: 1, fontSize: 16, color: '#1F2937' },
  itemValue: { fontSize: 14, color: '#6B7280' },
});
