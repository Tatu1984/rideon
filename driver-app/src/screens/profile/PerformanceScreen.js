import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from 'react-native-paper';

export default function PerformanceScreen() {
  const performance = {
    acceptanceRate: 92,
    cancellationRate: 3,
    rating: 4.8,
    completedTrips: 487,
    onTimePickup: 94,
    attendanceStreak: 12,
    strikes: 0,
  };

  const metrics = [
    {
      label: 'Acceptance Rate',
      value: performance.acceptanceRate,
      target: 90,
      icon: 'checkmark-circle',
      color: '#10B981',
      status: 'good',
    },
    {
      label: 'Cancellation Rate',
      value: performance.cancellationRate,
      target: 5,
      icon: 'close-circle',
      color: '#10B981',
      status: 'good',
      inverse: true, // Lower is better
    },
    {
      label: 'On-Time Pickup',
      value: performance.onTimePickup,
      target: 85,
      icon: 'time',
      color: '#10B981',
      status: 'good',
    },
  ];

  const warnings = [
    {
      id: 1,
      type: 'info',
      message: 'Your acceptance rate is excellent! Keep it up.',
      date: '2025-12-01',
    },
  ];

  const documents = [
    { name: 'Driver License', status: 'active', expiresAt: '2026-05-15' },
    { name: 'Vehicle Registration', status: 'active', expiresAt: '2025-12-20' },
    { name: 'Insurance', status: 'expiring', expiresAt: '2025-12-15' },
    { name: 'Background Check', status: 'active', expiresAt: '2026-01-30' },
  ];

  const getDocumentStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'expiring': return '#F59E0B';
      case 'expired': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Rating Card */}
      <View style={styles.ratingCard}>
        <View style={styles.ratingHeader}>
          <Ionicons name="star" size={48} color="#F59E0B" />
          <View style={styles.ratingDetails}>
            <Text style={styles.ratingValue}>{performance.rating.toFixed(1)}</Text>
            <Text style={styles.ratingLabel}>Overall Rating</Text>
          </View>
        </View>
        <View style={styles.ratingStats}>
          <View style={styles.ratingStat}>
            <Text style={styles.ratingStatValue}>{performance.completedTrips}</Text>
            <Text style={styles.ratingStatLabel}>Completed Trips</Text>
          </View>
          <View style={styles.ratingStatDivider} />
          <View style={styles.ratingStat}>
            <Text style={styles.ratingStatValue}>{performance.attendanceStreak}</Text>
            <Text style={styles.ratingStatLabel}>Day Streak</Text>
          </View>
        </View>
      </View>

      {/* Performance Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Metrics</Text>

        {metrics.map((metric, index) => (
          <View key={index} style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <View style={styles.metricIcon}>
                <Ionicons name={metric.icon} size={24} color={metric.color} />
              </View>
              <View style={styles.metricInfo}>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <Text style={styles.metricTarget}>
                  Target: {metric.inverse ? 'Below' : 'Above'} {metric.target}%
                </Text>
              </View>
              <Text style={[styles.metricValue, { color: metric.color }]}>
                {metric.value}%
              </Text>
            </View>
            <ProgressBar
              progress={metric.value / 100}
              color={metric.color}
              style={styles.metricProgress}
            />
          </View>
        ))}
      </View>

      {/* Strikes & Warnings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Strikes & Warnings</Text>
          <View style={styles.strikesBadge}>
            <Text style={styles.strikesText}>{performance.strikes}/3</Text>
          </View>
        </View>

        {performance.strikes === 0 ? (
          <View style={styles.noStrikesCard}>
            <Ionicons name="shield-checkmark" size={48} color="#10B981" />
            <Text style={styles.noStrikesText}>Clean Record!</Text>
            <Text style={styles.noStrikesSubtext}>
              You have no active strikes. Keep up the good work!
            </Text>
          </View>
        ) : (
          warnings.map((warning) => (
            <View key={warning.id} style={styles.warningCard}>
              <Ionicons
                name={warning.type === 'warning' ? 'warning' : 'information-circle'}
                size={24}
                color={warning.type === 'warning' ? '#F59E0B' : '#3B82F6'}
              />
              <View style={styles.warningContent}>
                <Text style={styles.warningMessage}>{warning.message}</Text>
                <Text style={styles.warningDate}>{warning.date}</Text>
              </View>
            </View>
          ))
        )}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
          <Text style={styles.infoText}>
            3 strikes may result in temporary or permanent suspension
          </Text>
        </View>
      </View>

      {/* Document Expiry Alerts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Document Status</Text>

        {documents.map((doc, index) => (
          <View key={index} style={styles.documentCard}>
            <View style={styles.documentInfo}>
              <View
                style={[
                  styles.documentStatus,
                  { backgroundColor: `${getDocumentStatusColor(doc.status)}20` },
                ]}
              >
                <View
                  style={[
                    styles.documentStatusDot,
                    { backgroundColor: getDocumentStatusColor(doc.status) },
                  ]}
                />
              </View>
              <View style={styles.documentDetails}>
                <Text style={styles.documentName}>{doc.name}</Text>
                <Text style={styles.documentExpiry}>Expires: {doc.expiresAt}</Text>
              </View>
            </View>
            {doc.status === 'expiring' && (
              <TouchableOpacity style={styles.renewButton}>
                <Text style={styles.renewButtonText}>Renew</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  ratingCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  ratingDetails: {
    marginLeft: 16,
  },
  ratingValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  ratingLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  ratingStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  ratingStat: {
    alignItems: 'center',
    flex: 1,
  },
  ratingStatDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  ratingStatValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginBottom: 4,
  },
  ratingStatLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metricInfo: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  metricTarget: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  metricProgress: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
  },
  strikesBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  strikesText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  noStrikesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  noStrikesText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
    marginTop: 12,
    marginBottom: 4,
  },
  noStrikesSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  warningCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 12,
  },
  warningContent: {
    flex: 1,
    marginLeft: 12,
  },
  warningMessage: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 4,
  },
  warningDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
  },
  documentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentStatus: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentStatusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  documentDetails: {
    flex: 1,
  },
  documentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  documentExpiry: {
    fontSize: 13,
    color: '#6B7280',
  },
  renewButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  renewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
