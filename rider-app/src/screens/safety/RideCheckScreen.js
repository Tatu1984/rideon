import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RideCheckScreen({ navigation, route }) {
  const { tripId } = route.params || {};

  const [responseGiven, setResponseGiven] = useState(false);

  const handleImFine = () => {
    setResponseGiven(true);
    alert('Great! Your response has been recorded. Enjoy your ride!');
    setTimeout(() => navigation.goBack(), 1500);
  };

  const handleNeedHelp = () => {
    alert('Safety Protocol Activated!\n\n• Emergency contacts notified\n• Support team alerted\n• Your location is being tracked\n• Help is on the way');
    navigation.navigate('SafetyToolkit', { tripId });
  };

  const handleContactSupport = () => {
    alert('Connecting you to 24/7 Safety Support...');
  };

  const checkReasons = [
    {
      id: 'long_duration',
      icon: 'time',
      color: '#F59E0B',
      title: 'Unusual Trip Duration',
      description: 'This trip is taking longer than expected',
    },
    {
      id: 'route_deviation',
      icon: 'navigate',
      color: '#F59E0B',
      title: 'Route Deviation Detected',
      description: 'The driver has deviated from the recommended route',
    },
    {
      id: 'stationary',
      icon: 'pause-circle',
      color: '#F59E0B',
      title: 'Vehicle Stationary',
      description: 'The vehicle has been stopped for an extended period',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>Ride Check</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {!responseGiven ? (
          <>
            {/* Main Question */}
            <View style={styles.questionCard}>
              <View style={styles.iconContainer}>
                <Ionicons name="shield-checkmark" size={60} color="#7C3AED" />
              </View>
              <Text style={styles.questionTitle}>Are you okay?</Text>
              <Text style={styles.questionSubtitle}>
                We noticed something unusual about your trip and want to make sure you're safe.
              </Text>
            </View>

            {/* Reasons for Check */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Why we're checking in:</Text>
              {checkReasons.map((reason) => (
                <View key={reason.id} style={styles.reasonCard}>
                  <View
                    style={[
                      styles.reasonIcon,
                      { backgroundColor: `${reason.color}20` },
                    ]}
                  >
                    <Ionicons name={reason.icon} size={24} color={reason.color} />
                  </View>
                  <View style={styles.reasonInfo}>
                    <Text style={styles.reasonTitle}>{reason.title}</Text>
                    <Text style={styles.reasonDescription}>{reason.description}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsCard}>
              <TouchableOpacity style={styles.primaryButton} onPress={handleImFine}>
                <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>I'm Fine</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.dangerButton} onPress={handleNeedHelp}>
                <Ionicons name="warning" size={24} color="#FFFFFF" />
                <Text style={styles.dangerButtonText}>I Need Help</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton} onPress={handleContactSupport}>
                <Ionicons name="call" size={20} color="#7C3AED" />
                <Text style={styles.secondaryButtonText}>Call Safety Support</Text>
              </TouchableOpacity>
            </View>

            {/* What Happens */}
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>If you don't respond:</Text>
              <View style={styles.infoItem}>
                <Ionicons name="time" size={16} color="#6B7280" />
                <Text style={styles.infoText}>
                  We'll wait 60 seconds for your response
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="notifications" size={16} color="#6B7280" />
                <Text style={styles.infoText}>
                  Your emergency contacts will be notified
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="headset" size={16} color="#6B7280" />
                <Text style={styles.infoText}>
                  Our safety team will call you
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="location" size={16} color="#6B7280" />
                <Text style={styles.infoText}>
                  We'll continue tracking your location
                </Text>
              </View>
            </View>

            {/* Safety Tips */}
            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>Remember:</Text>
              <View style={styles.tip}>
                <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                <Text style={styles.tipText}>
                  Your safety is our priority
                </Text>
              </View>
              <View style={styles.tip}>
                <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                <Text style={styles.tipText}>
                  You can activate SOS at any time
                </Text>
              </View>
              <View style={styles.tip}>
                <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                <Text style={styles.tipText}>
                  All rides are tracked and recorded
                </Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={80} color="#10B981" />
            <Text style={styles.successTitle}>All Good!</Text>
            <Text style={styles.successText}>
              Thanks for confirming. We hope you have a safe journey!
            </Text>
          </View>
        )}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  questionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  questionSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  reasonCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  reasonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reasonInfo: {
    flex: 1,
  },
  reasonTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  reasonDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  actionsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    padding: 18,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    padding: 18,
    borderRadius: 12,
    gap: 8,
  },
  dangerButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
  },
  tipsCard: {
    backgroundColor: '#D1FAE5',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#047857',
    marginBottom: 12,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#047857',
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 48,
    borderRadius: 16,
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginTop: 16,
    marginBottom: 8,
  },
  successText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});
