import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ReportSafetyScreen({ navigation, route }) {
  const { tripId } = route.params || {};

  const [selectedIssue, setSelectedIssue] = useState(null);
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('normal'); // low, normal, high, emergency

  const safetyIssues = [
    {
      id: 'reckless_driving',
      icon: 'speedometer',
      color: '#EF4444',
      title: 'Reckless Driving',
      description: 'Speeding, sudden braking, dangerous maneuvers',
    },
    {
      id: 'harassment',
      icon: 'warning',
      color: '#EF4444',
      title: 'Harassment',
      description: 'Inappropriate behavior or language',
    },
    {
      id: 'route_deviation',
      icon: 'navigate',
      color: '#F59E0B',
      title: 'Route Deviation',
      description: 'Driver took unexpected or unsafe route',
    },
    {
      id: 'unsafe_vehicle',
      icon: 'car',
      color: '#F59E0B',
      title: 'Unsafe Vehicle',
      description: 'Vehicle condition concerns',
    },
    {
      id: 'intoxication',
      icon: 'medical',
      color: '#EF4444',
      title: 'Driver Intoxication',
      description: 'Driver appears impaired',
    },
    {
      id: 'privacy',
      icon: 'eye-off',
      color: '#F59E0B',
      title: 'Privacy Violation',
      description: 'Recording without consent, data misuse',
    },
    {
      id: 'theft',
      icon: 'hand-right',
      color: '#EF4444',
      title: 'Theft or Fraud',
      description: 'Missing items or unauthorized charges',
    },
    {
      id: 'other',
      icon: 'ellipsis-horizontal',
      color: '#6B7280',
      title: 'Other Safety Concern',
      description: 'Different safety issue',
    },
  ];

  const handleSubmitReport = () => {
    if (!selectedIssue) {
      alert('Please select a safety issue');
      return;
    }

    if (!description.trim()) {
      alert('Please provide details about the incident');
      return;
    }

    alert('Safety report submitted!\n\nTicket #SR' + Date.now() + '\n\nOur safety team will review this immediately and contact you within 24 hours.');

    if (urgency === 'emergency') {
      alert('EMERGENCY ALERT TRIGGERED\n\nSafety team has been notified immediately. You will receive a call shortly.');
    }

    navigation.goBack();
  };

  const handleEmergency = () => {
    alert('EMERGENCY SOS ACTIVATED!\n\n• Authorities notified\n• Emergency contacts alerted\n• Location tracked\n• Help is on the way');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Safety Issue</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Emergency Banner */}
        <TouchableOpacity style={styles.emergencyBanner} onPress={handleEmergency}>
          <Ionicons name="warning" size={24} color="#FFFFFF" />
          <View style={styles.emergencyInfo}>
            <Text style={styles.emergencyTitle}>In Immediate Danger?</Text>
            <Text style={styles.emergencyText}>Tap here for emergency assistance</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Trip Info */}
        {tripId && (
          <View style={styles.tripInfo}>
            <Ionicons name="information-circle" size={18} color="#6B7280" />
            <Text style={styles.tripInfoText}>Trip ID: {tripId}</Text>
          </View>
        )}

        {/* Select Issue */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What happened?</Text>
          <View style={styles.issuesGrid}>
            {safetyIssues.map((issue) => (
              <TouchableOpacity
                key={issue.id}
                style={[
                  styles.issueCard,
                  selectedIssue === issue.id && styles.issueCardSelected,
                ]}
                onPress={() => setSelectedIssue(issue.id)}
              >
                <View
                  style={[
                    styles.issueIcon,
                    {
                      backgroundColor: selectedIssue === issue.id
                        ? `${issue.color}20`
                        : '#F9FAFB',
                    },
                  ]}
                >
                  <Ionicons
                    name={issue.icon}
                    size={24}
                    color={selectedIssue === issue.id ? issue.color : '#6B7280'}
                  />
                </View>
                <Text
                  style={[
                    styles.issueTitle,
                    selectedIssue === issue.id && styles.issueTitleSelected,
                  ]}
                >
                  {issue.title}
                </Text>
                <Text style={styles.issueDescription}>{issue.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tell us more</Text>
          <Text style={styles.sectionSubtitle}>
            Please provide details to help us investigate
          </Text>
          <TextInput
            style={styles.textArea}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe what happened, when it occurred, and any other relevant details..."
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Urgency Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Urgency Level</Text>

          <TouchableOpacity
            style={[
              styles.urgencyCard,
              urgency === 'emergency' && styles.urgencyCardSelected,
            ]}
            onPress={() => setUrgency('emergency')}
          >
            <Ionicons
              name="warning"
              size={24}
              color={urgency === 'emergency' ? '#EF4444' : '#6B7280'}
            />
            <View style={styles.urgencyInfo}>
              <Text
                style={[
                  styles.urgencyTitle,
                  urgency === 'emergency' && { color: '#EF4444' },
                ]}
              >
                Emergency
              </Text>
              <Text style={styles.urgencyDescription}>
                I'm in immediate danger
              </Text>
            </View>
            <View
              style={[
                styles.radio,
                urgency === 'emergency' && styles.radioSelected,
              ]}
            >
              {urgency === 'emergency' && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.urgencyCard,
              urgency === 'high' && styles.urgencyCardSelected,
            ]}
            onPress={() => setUrgency('high')}
          >
            <Ionicons
              name="alert-circle"
              size={24}
              color={urgency === 'high' ? '#F59E0B' : '#6B7280'}
            />
            <View style={styles.urgencyInfo}>
              <Text
                style={[
                  styles.urgencyTitle,
                  urgency === 'high' && { color: '#F59E0B' },
                ]}
              >
                High Priority
              </Text>
              <Text style={styles.urgencyDescription}>
                Serious concern requiring quick attention
              </Text>
            </View>
            <View
              style={[
                styles.radio,
                urgency === 'high' && styles.radioSelected,
              ]}
            >
              {urgency === 'high' && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.urgencyCard,
              urgency === 'normal' && styles.urgencyCardSelected,
            ]}
            onPress={() => setUrgency('normal')}
          >
            <Ionicons
              name="information-circle"
              size={24}
              color={urgency === 'normal' ? '#7C3AED' : '#6B7280'}
            />
            <View style={styles.urgencyInfo}>
              <Text
                style={[
                  styles.urgencyTitle,
                  urgency === 'normal' && { color: '#7C3AED' },
                ]}
              >
                Normal
              </Text>
              <Text style={styles.urgencyDescription}>
                Report for review and investigation
              </Text>
            </View>
            <View
              style={[
                styles.radio,
                urgency === 'normal' && styles.radioSelected,
              ]}
            >
              {urgency === 'normal' && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Privacy Notice */}
        <View style={styles.privacyCard}>
          <Ionicons name="lock-closed" size={20} color="#6B7280" />
          <Text style={styles.privacyText}>
            Your report is confidential and will be reviewed by our safety team. We may contact you for additional information.
          </Text>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedIssue || !description.trim()) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmitReport}
          disabled={!selectedIssue || !description.trim()}
        >
          <Text style={styles.submitButtonText}>Submit Report</Text>
        </TouchableOpacity>
      </View>
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
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  emergencyInfo: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  emergencyText: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  tripInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  tripInfoText: {
    fontSize: 13,
    color: '#1E40AF',
    fontWeight: '500',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  issuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  issueCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  issueCardSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#F9FAFB',
  },
  issueIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  issueTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  issueTitleSelected: {
    color: '#7C3AED',
  },
  issueDescription: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 15,
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 120,
  },
  urgencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  urgencyCardSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#F9FAFB',
  },
  urgencyInfo: {
    flex: 1,
  },
  urgencyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  urgencyDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#7C3AED',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7C3AED',
  },
  privacyCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    gap: 10,
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submitButton: {
    backgroundColor: '#7C3AED',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
