import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SafetyToolkitScreen({ navigation, route }) {
  const { tripId } = route.params || {};

  const [audioRecording, setAudioRecording] = useState(false);
  const [videoRecording, setVideoRecording] = useState(false);

  const handleSOS = () => {
    alert('SOS ACTIVATED!\n\n• Emergency services notified\n• Your emergency contacts alerted\n• Trip details shared with authorities\n• Live location being tracked');
  };

  const handleShareTrip = () => {
    navigation.navigate('ShareTrip', { tripId });
  };

  const handleReportSafety = () => {
    navigation.navigate('ReportSafety', { tripId });
  };

  const handleCallEmergency = () => {
    alert('Calling 911...');
  };

  const handleCallSupport = () => {
    alert('Calling 24/7 Safety Hotline...');
  };

  const emergencyContacts = [
    { id: '1', name: 'Sarah Doe', phone: '+1 234 567 8901', primary: true },
    { id: '2', name: 'Michael Doe', phone: '+1 234 567 8902', primary: false },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Safety Toolkit</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Emergency SOS */}
        <TouchableOpacity style={styles.sosButton} onPress={handleSOS}>
          <View style={styles.sosIconContainer}>
            <Ionicons name="warning" size={40} color="#FFFFFF" />
          </View>
          <View style={styles.sosInfo}>
            <Text style={styles.sosTitle}>Emergency SOS</Text>
            <Text style={styles.sosSubtitle}>
              Tap to immediately alert emergency services and your contacts
            </Text>
          </View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={handleShareTrip}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="share-social" size={24} color="#7C3AED" />
            </View>
            <Text style={styles.quickActionText}>Share Trip</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction} onPress={handleCallEmergency}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="call" size={24} color="#EF4444" />
            </View>
            <Text style={styles.quickActionText}>Call 911</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction} onPress={handleCallSupport}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="headset" size={24} color="#2563EB" />
            </View>
            <Text style={styles.quickActionText}>Safety Line</Text>
          </TouchableOpacity>
        </View>

        {/* Recording Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recording Features</Text>

          <View style={styles.featureCard}>
            <View style={styles.featureLeft}>
              <Ionicons name="mic" size={24} color={audioRecording ? '#EF4444' : '#7C3AED'} />
              <View style={styles.featureInfo}>
                <Text style={styles.featureName}>Audio Recording</Text>
                <Text style={styles.featureDescription}>
                  {audioRecording ? 'Recording in progress...' : 'Record audio for evidence'}
                </Text>
              </View>
            </View>
            <Switch
              value={audioRecording}
              onValueChange={setAudioRecording}
              trackColor={{ false: '#E5E7EB', true: '#FCA5A5' }}
              thumbColor={audioRecording ? '#EF4444' : '#9CA3AF'}
            />
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureLeft}>
              <Ionicons name="videocam" size={24} color={videoRecording ? '#EF4444' : '#7C3AED'} />
              <View style={styles.featureInfo}>
                <Text style={styles.featureName}>Video Recording</Text>
                <Text style={styles.featureDescription}>
                  {videoRecording ? 'Recording in progress...' : 'Record video for evidence'}
                </Text>
              </View>
            </View>
            <Switch
              value={videoRecording}
              onValueChange={setVideoRecording}
              trackColor={{ false: '#E5E7EB', true: '#FCA5A5' }}
              thumbColor={videoRecording ? '#EF4444' : '#9CA3AF'}
            />
          </View>

          {(audioRecording || videoRecording) && (
            <View style={styles.recordingNote}>
              <Ionicons name="information-circle" size={16} color="#EF4444" />
              <Text style={styles.recordingNoteText}>
                Recordings are encrypted and stored securely. Only you and authorities can access them.
              </Text>
            </View>
          )}
        </View>

        {/* Emergency Contacts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
            <TouchableOpacity onPress={() => navigation.navigate('EmergencyContacts')}>
              <Text style={styles.manageText}>Manage</Text>
            </TouchableOpacity>
          </View>

          {emergencyContacts.map((contact) => (
            <View key={contact.id} style={styles.contactCard}>
              <View style={styles.contactLeft}>
                <View style={styles.contactAvatar}>
                  <Ionicons name="person" size={20} color="#7C3AED" />
                </View>
                <View style={styles.contactInfo}>
                  <View style={styles.contactNameRow}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    {contact.primary && (
                      <View style={styles.primaryBadge}>
                        <Text style={styles.primaryText}>Primary</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.contactPhone}>{contact.phone}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.callButton}>
                <Ionicons name="call" size={20} color="#10B981" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Report Safety Issue */}
        <TouchableOpacity style={styles.reportButton} onPress={handleReportSafety}>
          <Ionicons name="flag" size={20} color="#EF4444" />
          <Text style={styles.reportButtonText}>Report Safety Issue</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Safety Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Safety Tips</Text>

          <View style={styles.tip}>
            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            <Text style={styles.tipText}>
              Always verify driver and vehicle details before entering
            </Text>
          </View>

          <View style={styles.tip}>
            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            <Text style={styles.tipText}>
              Share your trip with friends or family for longer rides
            </Text>
          </View>

          <View style={styles.tip}>
            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            <Text style={styles.tipText}>
              Sit in the back seat for added safety
            </Text>
          </View>

          <View style={styles.tip}>
            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            <Text style={styles.tipText}>
              Trust your instincts - if something feels wrong, end the trip
            </Text>
          </View>

          <View style={styles.tip}>
            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            <Text style={styles.tipText}>
              Keep your phone charged and easily accessible
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  sosButton: {
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sosIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosInfo: {
    flex: 1,
  },
  sosTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sosSubtitle: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 18,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  quickAction: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  manageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  featureLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  featureInfo: {
    flex: 1,
  },
  featureName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  recordingNote: {
    flexDirection: 'row',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  recordingNoteText: {
    flex: 1,
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  primaryBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  primaryText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#92400E',
  },
  contactPhone: {
    fontSize: 13,
    color: '#6B7280',
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  reportButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  tipsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
