import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function KYCScreen({ navigation }) {
  const [kycStatus, setKycStatus] = useState('pending'); // pending, verified, rejected
  const [idType, setIdType] = useState('passport');
  const [idNumber, setIdNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  const handleSubmitKYC = () => {
    if (!idNumber || !address || !city || !state || !zipCode) {
      alert('Please fill in all required fields');
      return;
    }

    alert('KYC documents submitted!\nVerification typically takes 24-48 hours.');
    setKycStatus('pending');
  };

  const handleUploadDocument = (docType) => {
    alert(`Upload ${docType}\nImage picker will open`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KYC Verification</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Status Banner */}
        {kycStatus === 'verified' && (
          <View style={styles.statusBanner}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>Verification Complete</Text>
              <Text style={styles.statusText}>
                Your identity has been verified successfully.
              </Text>
            </View>
          </View>
        )}

        {kycStatus === 'pending' && (
          <View style={[styles.statusBanner, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="time" size={24} color="#F59E0B" />
            <View style={styles.statusInfo}>
              <Text style={[styles.statusTitle, { color: '#92400E' }]}>
                Verification Pending
              </Text>
              <Text style={[styles.statusText, { color: '#92400E' }]}>
                We're reviewing your documents. This usually takes 24-48 hours.
              </Text>
            </View>
          </View>
        )}

        {kycStatus === 'rejected' && (
          <View style={[styles.statusBanner, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="close-circle" size={24} color="#EF4444" />
            <View style={styles.statusInfo}>
              <Text style={[styles.statusTitle, { color: '#991B1B' }]}>
                Verification Failed
              </Text>
              <Text style={[styles.statusText, { color: '#991B1B' }]}>
                Please review and resubmit your documents with correct information.
              </Text>
            </View>
          </View>
        )}

        {/* Why KYC */}
        {kycStatus !== 'verified' && (
          <View style={styles.whyKycCard}>
            <Text style={styles.whyKycTitle}>Why verify your identity?</Text>
            <View style={styles.benefit}>
              <Ionicons name="shield-checkmark" size={18} color="#10B981" />
              <Text style={styles.benefitText}>Enhanced account security</Text>
            </View>
            <View style={styles.benefit}>
              <Ionicons name="card" size={18} color="#10B981" />
              <Text style={styles.benefitText}>Access to payment features</Text>
            </View>
            <View style={styles.benefit}>
              <Ionicons name="gift" size={18} color="#10B981" />
              <Text style={styles.benefitText}>Unlock exclusive rewards</Text>
            </View>
            <View style={styles.benefit}>
              <Ionicons name="star" size={18} color="#10B981" />
              <Text style={styles.benefitText}>Priority customer support</Text>
            </View>
          </View>
        )}

        {/* ID Type Selection */}
        {kycStatus !== 'verified' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select ID Type</Text>

              <TouchableOpacity
                style={[
                  styles.idTypeCard,
                  idType === 'passport' && styles.idTypeCardSelected,
                ]}
                onPress={() => setIdType('passport')}
              >
                <Ionicons
                  name="airplane"
                  size={24}
                  color={idType === 'passport' ? '#7C3AED' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.idTypeText,
                    idType === 'passport' && styles.idTypeTextSelected,
                  ]}
                >
                  Passport
                </Text>
                <View
                  style={[
                    styles.radio,
                    idType === 'passport' && styles.radioSelected,
                  ]}
                >
                  {idType === 'passport' && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.idTypeCard,
                  idType === 'license' && styles.idTypeCardSelected,
                ]}
                onPress={() => setIdType('license')}
              >
                <Ionicons
                  name="car"
                  size={24}
                  color={idType === 'license' ? '#7C3AED' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.idTypeText,
                    idType === 'license' && styles.idTypeTextSelected,
                  ]}
                >
                  Driver's License
                </Text>
                <View
                  style={[
                    styles.radio,
                    idType === 'license' && styles.radioSelected,
                  ]}
                >
                  {idType === 'license' && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.idTypeCard,
                  idType === 'national' && styles.idTypeCardSelected,
                ]}
                onPress={() => setIdType('national')}
              >
                <Ionicons
                  name="card"
                  size={24}
                  color={idType === 'national' ? '#7C3AED' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.idTypeText,
                    idType === 'national' && styles.idTypeTextSelected,
                  ]}
                >
                  National ID
                </Text>
                <View
                  style={[
                    styles.radio,
                    idType === 'national' && styles.radioSelected,
                  ]}
                >
                  {idType === 'national' && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            </View>

            {/* ID Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ID Information</Text>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>ID Number *</Text>
                <TextInput
                  style={styles.input}
                  value={idNumber}
                  onChangeText={setIdNumber}
                  placeholder="Enter your ID number"
                />
              </View>
            </View>

            {/* Address Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Address Information</Text>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Street Address *</Text>
                <TextInput
                  style={styles.input}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="123 Main Street"
                  multiline
                />
              </View>

              <View style={styles.formRow}>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.formLabel}>City *</Text>
                  <TextInput
                    style={styles.input}
                    value={city}
                    onChangeText={setCity}
                    placeholder="San Francisco"
                  />
                </View>

                <View style={styles.formGroupHalf}>
                  <Text style={styles.formLabel}>State *</Text>
                  <TextInput
                    style={styles.input}
                    value={state}
                    onChangeText={setState}
                    placeholder="CA"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>ZIP Code *</Text>
                <TextInput
                  style={styles.input}
                  value={zipCode}
                  onChangeText={setZipCode}
                  placeholder="94102"
                  keyboardType="number-pad"
                />
              </View>
            </View>

            {/* Document Upload */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Upload Documents</Text>

              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => handleUploadDocument('ID Front')}
              >
                <View style={styles.uploadContent}>
                  <Ionicons name="camera" size={32} color="#7C3AED" />
                  <Text style={styles.uploadTitle}>ID Front Photo</Text>
                  <Text style={styles.uploadSubtitle}>
                    Take a clear photo of the front of your ID
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => handleUploadDocument('ID Back')}
              >
                <View style={styles.uploadContent}>
                  <Ionicons name="camera" size={32} color="#7C3AED" />
                  <Text style={styles.uploadTitle}>ID Back Photo</Text>
                  <Text style={styles.uploadSubtitle}>
                    Take a clear photo of the back of your ID
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => handleUploadDocument('Selfie')}
              >
                <View style={styles.uploadContent}>
                  <Ionicons name="person-circle" size={32} color="#7C3AED" />
                  <Text style={styles.uploadTitle}>Selfie Photo</Text>
                  <Text style={styles.uploadSubtitle}>
                    Take a selfie holding your ID next to your face
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Privacy Notice */}
            <View style={styles.privacyCard}>
              <Ionicons name="lock-closed" size={20} color="#6B7280" />
              <Text style={styles.privacyText}>
                Your documents are encrypted and stored securely. We will never share your personal information without your consent.
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Submit Button */}
      {kycStatus !== 'verified' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitKYC}
          >
            <Text style={styles.submitButtonText}>
              {kycStatus === 'pending' ? 'Update Submission' : 'Submit for Verification'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
  statusBanner: {
    flexDirection: 'row',
    backgroundColor: '#D1FAE5',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#047857',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 13,
    color: '#047857',
    lineHeight: 18,
  },
  whyKycCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 16,
  },
  whyKycTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  idTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    gap: 12,
  },
  idTypeCardSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#F3E8FF',
  },
  idTypeText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  idTypeTextSelected: {
    color: '#7C3AED',
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
  formGroup: {
    marginBottom: 16,
  },
  formGroupHalf: {
    flex: 1,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    backgroundColor: '#F9FAFB',
  },
  uploadContent: {
    flex: 1,
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 12,
    color: '#6B7280',
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
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
