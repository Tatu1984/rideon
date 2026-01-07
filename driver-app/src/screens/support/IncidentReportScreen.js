import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function IncidentReportScreen({ navigation }) {
  const [incidentType, setIncidentType] = useState('');
  const [tripId, setTripId] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [photos, setPhotos] = useState([]);

  const incidentTypes = [
    { value: 'accident', label: 'Accident', icon: 'car-sport', color: '#EF4444' },
    { value: 'harassment', label: 'Harassment', icon: 'warning', color: '#F59E0B' },
    { value: 'safety', label: 'Safety Concern', icon: 'shield-checkmark', color: '#3B82F6' },
    { value: 'vehicle', label: 'Vehicle Issue', icon: 'build', color: '#6366F1' },
    { value: 'payment', label: 'Payment Dispute', icon: 'card', color: '#8B5CF6' },
    { value: 'other', label: 'Other', icon: 'help-circle', color: '#6B7280' },
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', color: '#10B981' },
    { value: 'medium', label: 'Medium', color: '#F59E0B' },
    { value: 'high', label: 'High', color: '#EF4444' },
  ];

  const handleSubmit = () => {
    if (!incidentType) {
      Alert.alert('Error', 'Please select an incident type');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description');
      return;
    }

    Alert.alert(
      'Submit Report',
      'Your incident report will be reviewed by our safety team within 24 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: () => {
            Alert.alert('Success', 'Incident report submitted successfully');
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleAddPhoto = () => {
    Alert.alert('Add Photo', 'Photo upload feature coming soon!');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Info */}
      <View style={styles.headerCard}>
        <Ionicons name="shield-checkmark" size={48} color="#160832" />
        <Text style={styles.headerTitle}>Safety First</Text>
        <Text style={styles.headerSubtitle}>
          Your safety is our priority. Report any incidents and our team will respond promptly.
        </Text>
      </View>

      {/* Incident Type Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Incident Type *</Text>
        <View style={styles.typeGrid}>
          {incidentTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeCard,
                incidentType === type.value && styles.typeCardActive,
              ]}
              onPress={() => setIncidentType(type.value)}
            >
              <View style={[styles.typeIcon, { backgroundColor: `${type.color}20` }]}>
                <Ionicons name={type.icon} size={24} color={type.color} />
              </View>
              <Text style={styles.typeLabel}>{type.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Severity Level */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Severity Level</Text>
        <View style={styles.severityButtons}>
          {severityLevels.map((level) => (
            <TouchableOpacity
              key={level.value}
              style={[
                styles.severityButton,
                severity === level.value && {
                  backgroundColor: level.color,
                  borderColor: level.color,
                },
              ]}
              onPress={() => setSeverity(level.value)}
            >
              <Text
                style={[
                  styles.severityButtonText,
                  severity === level.value && styles.severityButtonTextActive,
                ]}
              >
                {level.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Trip ID (Optional) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trip ID (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter trip ID if applicable"
          value={tripId}
          onChangeText={setTripId}
        />
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe what happened in detail..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>

      {/* Add Photos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Photos (Optional)</Text>
        <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
          <Ionicons name="camera" size={32} color="#160832" />
          <Text style={styles.addPhotoText}>Add Photos</Text>
          <Text style={styles.addPhotoSubtext}>Upload evidence or damage photos</Text>
        </TouchableOpacity>

        {photos.length > 0 && (
          <View style={styles.photosList}>
            {photos.map((photo, index) => (
              <View key={index} style={styles.photoItem}>
                <Ionicons name="image" size={24} color="#160832" />
                <Text style={styles.photoName}>Photo {index + 1}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Important Note */}
      <View style={styles.noteCard}>
        <Ionicons name="information-circle" size={24} color="#3B82F6" />
        <View style={styles.noteContent}>
          <Text style={styles.noteTitle}>Important</Text>
          <Text style={styles.noteText}>
            • Reports are reviewed within 24 hours{'\n'}
            • High severity reports get priority{'\n'}
            • You'll receive updates via notifications{'\n'}
            • All reports are confidential
          </Text>
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Report</Text>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  typeCardActive: {
    borderColor: '#160832',
    backgroundColor: '#F3F4F6',
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  severityButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  severityButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  severityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  severityButtonTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 16,
  },
  addPhotoButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  addPhotoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#160832',
    marginTop: 12,
  },
  addPhotoSubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
  photosList: {
    marginTop: 12,
    gap: 8,
  },
  photoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  photoName: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  noteContent: {
    flex: 1,
    marginLeft: 12,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 6,
  },
  noteText: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: '#160832',
    marginHorizontal: 16,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#160832',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 40,
  },
});
