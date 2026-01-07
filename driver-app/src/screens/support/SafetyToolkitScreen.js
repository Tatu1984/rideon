import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SafetyToolkitScreen() {
  const [audioRecording, setAudioRecording] = useState(false);
  const [videoRecording, setVideoRecording] = useState(false);

  const handleEmergencySOS = () => {
    Alert.alert(
      'Emergency SOS',
      'This will immediately alert:\n• Operations Team\n• Emergency Services\n• Your Emergency Contacts\n\nContinue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Emergency',
          style: 'destructive',
          onPress: () => {
            // In real app, this would trigger emergency protocol
            Linking.openURL('tel:911');
            Alert.alert('SOS Activated', 'Emergency services and operations team have been notified');
          },
        },
      ]
    );
  };

  const handleShareLocation = () => {
    Alert.alert('Success', 'Your live location is being shared with emergency contacts');
  };

  const handleReportIncident = () => {
    Alert.alert(
      'Report Incident',
      'What type of incident would you like to report?',
      [
        { text: 'Accident', onPress: () => Alert.alert('Incident Report', 'Accident report started') },
        { text: 'Harassment', onPress: () => Alert.alert('Incident Report', 'Harassment report started') },
        { text: 'Safety Concern', onPress: () => Alert.alert('Incident Report', 'Safety concern report started') },
        { text: 'Other', onPress: () => Alert.alert('Incident Report', 'General incident report started') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleToggleAudioRecording = () => {
    setAudioRecording(!audioRecording);
    Alert.alert(
      audioRecording ? 'Audio Recording Stopped' : 'Audio Recording Started',
      audioRecording
        ? 'Trip audio recording has been disabled'
        : 'All trips will now be audio recorded for your safety'
    );
  };

  const handleToggleVideoRecording = () => {
    setVideoRecording(!videoRecording);
    Alert.alert(
      videoRecording ? 'Video Recording Stopped' : 'Video Recording Started',
      videoRecording
        ? 'Trip video recording has been disabled'
        : 'All trips will now be video recorded for your safety'
    );
  };

  const safetyFeatures = [
    {
      id: 1,
      title: 'Emergency SOS',
      description: 'Instantly alert emergency services and operations team',
      icon: 'alert-circle',
      color: '#EF4444',
      action: handleEmergencySOS,
      type: 'critical',
    },
    {
      id: 2,
      title: 'Share Live Location',
      description: 'Share your real-time location with emergency contacts',
      icon: 'location',
      color: '#F59E0B',
      action: handleShareLocation,
      type: 'important',
    },
    {
      id: 3,
      title: 'Report Incident',
      description: 'Report safety concerns, accidents, or harassment',
      icon: 'warning',
      color: '#3B82F6',
      action: handleReportIncident,
      type: 'normal',
    },
  ];

  const recordingControls = [
    {
      title: 'Trip Audio Recording',
      description: 'Record audio during trips for safety',
      icon: 'mic',
      enabled: audioRecording,
      onToggle: handleToggleAudioRecording,
    },
    {
      title: 'Trip Video Recording',
      description: 'Record video during trips (dashcam)',
      icon: 'videocam',
      enabled: videoRecording,
      onToggle: handleToggleVideoRecording,
    },
  ];

  const emergencyContacts = [
    { name: 'Operations Center', number: '1-800-RIDEON', available: '24/7' },
    { name: 'Local Police', number: '911', available: 'Emergency' },
    { name: 'Roadside Assistance', number: '1-800-ASSIST', available: '24/7' },
  ];

  const safetyTips = [
    'Always verify passenger identity before starting trip',
    'Keep doors locked until passenger is verified',
    'Trust your instincts - cancel trip if you feel unsafe',
    'Stay on well-lit, populated routes when possible',
    'Never share personal information with passengers',
    'Report suspicious behavior immediately',
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Emergency Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Actions</Text>
        {safetyFeatures.map((feature) => (
          <TouchableOpacity
            key={feature.id}
            style={[
              styles.emergencyCard,
              feature.type === 'critical' && styles.criticalCard,
            ]}
            onPress={feature.action}
          >
            <View style={[styles.emergencyIcon, { backgroundColor: `${feature.color}20` }]}>
              <Ionicons name={feature.icon} size={32} color={feature.color} />
            </View>
            <View style={styles.emergencyInfo}>
              <Text style={styles.emergencyTitle}>{feature.title}</Text>
              <Text style={styles.emergencyDescription}>{feature.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Recording Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trip Recording</Text>
        <View style={styles.recordingCard}>
          {recordingControls.map((control, index) => (
            <View key={index}>
              <View style={styles.recordingControl}>
                <View style={styles.recordingLeft}>
                  <View style={styles.recordingIconContainer}>
                    <Ionicons
                      name={control.icon}
                      size={24}
                      color={control.enabled ? '#160832' : '#9CA3AF'}
                    />
                  </View>
                  <View style={styles.recordingInfo}>
                    <Text style={styles.recordingTitle}>{control.title}</Text>
                    <Text style={styles.recordingDescription}>{control.description}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.recordingToggle,
                    control.enabled && styles.recordingToggleActive,
                  ]}
                  onPress={control.onToggle}
                >
                  <Ionicons
                    name={control.enabled ? 'stop-circle' : 'radio-button-on'}
                    size={28}
                    color={control.enabled ? '#EF4444' : '#160832'}
                  />
                </TouchableOpacity>
              </View>
              {index < recordingControls.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
      </View>

      {/* Emergency Contacts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        <View style={styles.contactsCard}>
          {emergencyContacts.map((contact, index) => (
            <TouchableOpacity
              key={index}
              style={styles.contactItem}
              onPress={() => Linking.openURL(`tel:${contact.number}`)}
            >
              <View style={styles.contactIcon}>
                <Ionicons name="call" size={20} color="#160832" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactNumber}>{contact.number}</Text>
              </View>
              <View style={styles.contactBadge}>
                <Text style={styles.contactBadgeText}>{contact.available}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Safety Tips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety Tips</Text>
        <View style={styles.tipsCard}>
          {safetyTips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <View style={styles.tipBullet}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              </View>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
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
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  criticalCard: {
    borderWidth: 2,
    borderColor: '#FEE2E2',
  },
  emergencyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emergencyInfo: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  emergencyDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  recordingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordingControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  recordingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recordingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recordingInfo: {
    flex: 1,
  },
  recordingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  recordingDescription: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  recordingToggle: {
    marginLeft: 12,
  },
  recordingToggleActive: {
    // Add any active styling if needed
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 8,
  },
  contactsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  contactNumber: {
    fontSize: 14,
    color: '#160832',
    fontWeight: '500',
  },
  contactBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  contactBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B45309',
  },
  tipsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipBullet: {
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
});
