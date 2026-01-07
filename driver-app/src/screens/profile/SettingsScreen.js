import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen({ navigation }) {
  const [autoAccept, setAutoAccept] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [hideProfile, setHideProfile] = useState(false);
  const [hideTripHistory, setHideTripHistory] = useState(false);
  const [audioRecording, setAudioRecording] = useState(false);
  const [videoRecording, setVideoRecording] = useState(false);
  const [navigationProvider, setNavigationProvider] = useState('Google Maps');
  const [language, setLanguage] = useState('English');
  const [vehicleCategory, setVehicleCategory] = useState('Standard');

  const settingSections = [
    {
      title: 'Trip Preferences',
      items: [
        {
          label: 'Auto-Accept Trips',
          subtitle: 'Automatically accept trip requests',
          type: 'switch',
          value: autoAccept,
          onValueChange: setAutoAccept,
        },
        {
          label: 'Preferred Vehicle Category',
          subtitle: vehicleCategory,
          type: 'select',
          icon: 'car',
          onPress: () => {
            Alert.alert('Vehicle Category', 'Select your preferred vehicle category', [
              { text: 'Standard', onPress: () => setVehicleCategory('Standard') },
              { text: 'Premium', onPress: () => setVehicleCategory('Premium') },
              { text: 'XL', onPress: () => setVehicleCategory('XL') },
              { text: 'Cancel', style: 'cancel' },
            ]);
          },
        },
        {
          label: 'Navigation Provider',
          subtitle: navigationProvider,
          type: 'select',
          icon: 'navigate',
          onPress: () => {
            Alert.alert('Navigation Provider', 'Choose your navigation app', [
              { text: 'Google Maps', onPress: () => setNavigationProvider('Google Maps') },
              { text: 'Apple Maps', onPress: () => setNavigationProvider('Apple Maps') },
              { text: 'Waze', onPress: () => setNavigationProvider('Waze') },
              { text: 'Cancel', style: 'cancel' },
            ]);
          },
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          label: 'Push Notifications',
          subtitle: 'Receive trip requests and updates',
          type: 'switch',
          value: notifications,
          onValueChange: setNotifications,
        },
        {
          label: 'Sound',
          subtitle: 'Play sound for notifications',
          type: 'switch',
          value: soundEnabled,
          onValueChange: setSoundEnabled,
        },
        {
          label: 'Vibration',
          subtitle: 'Vibrate for notifications',
          type: 'switch',
          value: vibrationEnabled,
          onValueChange: setVibrationEnabled,
        },
      ],
    },
    {
      title: 'Privacy',
      items: [
        {
          label: 'Hide Profile Photo',
          subtitle: 'Mask your profile photo from riders',
          type: 'switch',
          value: hideProfile,
          onValueChange: setHideProfile,
        },
        {
          label: 'Hide Trip History',
          subtitle: 'Hide trip history from others',
          type: 'switch',
          value: hideTripHistory,
          onValueChange: setHideTripHistory,
        },
      ],
    },
    {
      title: 'Safety',
      items: [
        {
          label: 'Trip Audio Recording',
          subtitle: 'Record audio during trips (if supported)',
          type: 'switch',
          value: audioRecording,
          onValueChange: setAudioRecording,
        },
        {
          label: 'Trip Video Recording',
          subtitle: 'Record video during trips (if supported)',
          type: 'switch',
          value: videoRecording,
          onValueChange: setVideoRecording,
        },
        {
          label: 'Emergency Contacts',
          subtitle: 'Manage emergency contacts',
          type: 'action',
          icon: 'medical',
          onPress: () => Alert.alert('Emergency Contacts', 'This feature is coming soon!'),
        },
      ],
    },
    {
      title: 'App Settings',
      items: [
        {
          label: 'Language',
          subtitle: language,
          type: 'select',
          icon: 'language',
          onPress: () => {
            Alert.alert('Language', 'Select your preferred language', [
              { text: 'English', onPress: () => setLanguage('English') },
              { text: 'Spanish', onPress: () => setLanguage('Spanish') },
              { text: 'French', onPress: () => setLanguage('French') },
              { text: 'Hindi', onPress: () => setLanguage('Hindi') },
              { text: 'Cancel', style: 'cancel' },
            ]);
          },
        },
        {
          label: 'Dark Mode',
          subtitle: 'Use dark theme',
          type: 'switch',
          value: darkMode,
          onValueChange: setDarkMode,
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          label: 'Clear Cache',
          subtitle: 'Free up storage space',
          type: 'action',
          icon: 'trash',
          onPress: () => {
            Alert.alert('Clear Cache', 'Are you sure you want to clear the cache?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Clear', onPress: () => Alert.alert('Success', 'Cache cleared!') },
            ]);
          },
        },
        {
          label: 'About',
          subtitle: 'Version 1.0.0',
          type: 'action',
          icon: 'information-circle',
          onPress: () => Alert.alert('About', 'RideOn Driver App v1.0.0'),
        },
      ],
    },
  ];

  const renderSettingItem = (item) => {
    if (item.type === 'switch') {
      return (
        <View key={item.label} style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingLabel}>{item.label}</Text>
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          </View>
          <Switch
            value={item.value}
            onValueChange={item.onValueChange}
            trackColor={{ false: '#D1D5DB', true: 'rgba(22, 8, 50, 0.5)' }}
            thumbColor={item.value ? '#160832' : '#F3F4F6'}
          />
        </View>
      );
    }

    return (
      <TouchableOpacity
        key={item.label}
        style={styles.settingItem}
        onPress={item.onPress}
      >
        <View style={styles.settingLeft}>
          <Text style={styles.settingLabel}>{item.label}</Text>
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        </View>
        <Ionicons name={item.icon || 'chevron-forward'} size={20} color="#9CA3AF" />
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {settingSections.map((section, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionCard}>
            {section.items.map((item, itemIndex) => (
              <View key={itemIndex}>
                {renderSettingItem(item)}
                {itemIndex < section.items.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>
      ))}

      <View style={styles.footer}>
        <Text style={styles.footerText}>RideOn Driver © 2025</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  section: {
    marginTop: 20,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 16,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
});
