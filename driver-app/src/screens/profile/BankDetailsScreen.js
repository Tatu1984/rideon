import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { driverAPI } from '../../services/api.service';

const ACCOUNT_TYPES = [{ id: 'checking', name: 'Checking', icon: 'wallet-outline' }, { id: 'savings', name: 'Savings', icon: 'cash-outline' }];
const PAYOUT_METHODS = [
  { id: 'bank', name: 'Bank Transfer', icon: 'business-outline', description: '2-3 business days' },
  { id: 'instant', name: 'Instant Payout', icon: 'flash-outline', description: 'Within minutes (fee applies)' },
];

export default function BankDetailsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bankDetails, setBankDetails] = useState({ accountHolderName: '', bankName: '', accountNumber: '', routingNumber: '', accountType: 'checking', payoutMethod: 'bank' });
  const [savedAccount, setSavedAccount] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetchBankDetails(); }, []);

  const fetchBankDetails = async () => {
    try {
      const response = await driverAPI.getBankDetails();
      if (response.data?.success && response.data.data) { setSavedAccount(response.data.data); }
    } catch (error) { console.error('Error fetching bank details:', error); }
    finally { setLoading(false); }
  };

  const handleInputChange = (field, value) => { setBankDetails(prev => ({ ...prev, [field]: value })); };

  const validateForm = () => {
    if (!bankDetails.accountHolderName.trim()) { Alert.alert('Error', 'Please enter account holder name'); return false; }
    if (!bankDetails.bankName.trim()) { Alert.alert('Error', 'Please enter bank name'); return false; }
    if (!bankDetails.accountNumber || bankDetails.accountNumber.length < 8) { Alert.alert('Error', 'Please enter a valid account number'); return false; }
    if (!bankDetails.routingNumber || bankDetails.routingNumber.length !== 9) { Alert.alert('Error', 'Please enter a valid 9-digit routing number'); return false; }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const response = await driverAPI.updateBankDetails(bankDetails);
      if (response.data?.success) 
        { Alert.alert('Success', 'Bank details saved successfully'); setSavedAccount(response.data.data); setShowForm(false); }
      else { Alert.alert('Error', response.data?.message || 'Failed to save bank details'); }
    } catch (error) { 
      console.error('Error updating bank details:', error); 
      Alert.alert('Error', 'Failed to save bank details'); 
    }
    finally { setSaving(false); }
  };

  const handleDelete = () => {
    Alert.alert('Remove Bank Account', 'Are you sure you want to remove this bank account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        try { await driverAPI.deleteBankDetails(); setSavedAccount(null); Alert.alert('Success', 'Bank account removed'); }
        catch (error) { Alert.alert('Error', 'Failed to remove bank account'); }
      }},
    ]);
  };

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#160832" /></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.infoBanner}>
        <Ionicons name="shield-checkmark" size={24} color="#10B981" />
        <View style={styles.infoTextContainer}>
          <Text style={styles.infoTitle}>Secure & Encrypted</Text>
          <Text style={styles.infoText}>Your bank information is encrypted and securely stored</Text>
        </View>
      </View>

      {savedAccount && !showForm && (
        <View style={styles.savedAccountCard}>
          <View style={styles.savedAccountHeader}>
            <View style={styles.bankIcon}><Ionicons name="business" size={24} color="#160832" /></View>
            <View style={styles.savedAccountInfo}>
              <Text style={styles.bankName}>{savedAccount.bankName}</Text>
              <Text style={styles.accountNumber}>****{savedAccount.accountNumber?.slice(-4)}</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>
          <View style={styles.savedAccountDetails}>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Account Holder</Text><Text style={styles.detailValue}>{savedAccount.accountHolderName}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Account Type</Text><Text style={styles.detailValue}>{savedAccount.accountType?.charAt(0).toUpperCase() + savedAccount.accountType?.slice(1)}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Payout Method</Text><Text style={styles.detailValue}>{savedAccount.payoutMethod === 'instant' ? 'Instant Payout' : 'Bank Transfer'}</Text></View>
          </View>
          <View style={styles.savedAccountActions}>
            <TouchableOpacity style={styles.editButton} onPress={() => { setBankDetails({ ...savedAccount, accountNumber: '', routingNumber: '' }); setShowForm(true); }}>
              <Ionicons name="pencil" size={18} color="#160832" /><Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={18} color="#EF4444" /><Text style={styles.deleteButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {(showForm || !savedAccount) && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>{savedAccount ? 'Update Bank Account' : 'Add Bank Account'}</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account Holder Name</Text>
            <TextInput style={styles.input} value={bankDetails.accountHolderName} onChangeText={(v) => handleInputChange('accountHolderName', v)} placeholder="Name as it appears on account" autoCapitalize="words" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bank Name</Text>
            <TextInput style={styles.input} value={bankDetails.bankName} onChangeText={(v) => handleInputChange('bankName', v)} placeholder="e.g., Chase, Bank of America" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account Number</Text>
            <TextInput style={styles.input} value={bankDetails.accountNumber} onChangeText={(v) => handleInputChange('accountNumber', v.replace(/\D/g, ''))} placeholder="Enter account number" keyboardType="number-pad" secureTextEntry />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Routing Number (9 digits)</Text>
            <TextInput style={styles.input} value={bankDetails.routingNumber} onChangeText={(v) => handleInputChange('routingNumber', v.replace(/\D/g, '').slice(0, 9))} placeholder="e.g., 021000021" keyboardType="number-pad" maxLength={9} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account Type</Text>
            <View style={styles.optionRow}>
              {ACCOUNT_TYPES.map((type) => (
                <TouchableOpacity key={type.id} style={[styles.optionButton, bankDetails.accountType === type.id && styles.optionButtonSelected]} onPress={() => handleInputChange('accountType', type.id)}>
                  <Ionicons name={type.icon} size={20} color={bankDetails.accountType === type.id ? '#160832' : '#6B7280'} />
                  <Text style={[styles.optionText, bankDetails.accountType === type.id && styles.optionTextSelected]}>{type.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Payout Method</Text>
            {PAYOUT_METHODS.map((method) => (
              <TouchableOpacity key={method.id} style={[styles.payoutOption, bankDetails.payoutMethod === method.id && styles.payoutOptionSelected]} onPress={() => handleInputChange('payoutMethod', method.id)}>
                <View style={styles.payoutIcon}><Ionicons name={method.icon} size={24} color={bankDetails.payoutMethod === method.id ? '#160832' : '#6B7280'} /></View>
                <View style={styles.payoutInfo}>
                  <Text style={[styles.payoutName, bankDetails.payoutMethod === method.id && styles.payoutNameSelected]}>{method.name}</Text>
                  <Text style={styles.payoutDescription}>{method.description}</Text>
                </View>
                <View style={styles.radioButton}>{bankDetails.payoutMethod === method.id && <View style={styles.radioButtonInner} />}</View>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.buttonRow}>
            {savedAccount && <TouchableOpacity style={styles.cancelButton} onPress={() => setShowForm(false)}><Text style={styles.cancelButtonText}>Cancel</Text></TouchableOpacity>}
            <TouchableOpacity style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Bank Details</Text>}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {savedAccount && !showForm && (
        <TouchableOpacity style={styles.addNewButton} onPress={() => { setBankDetails({ accountHolderName: '', bankName: '', accountNumber: '', routingNumber: '', accountType: 'checking', payoutMethod: 'bank' }); setShowForm(true); }}>
          <Ionicons name="add-circle-outline" size={20} color="#160832" /><Text style={styles.addNewText}>Add New Bank Account</Text>
        </TouchableOpacity>
      )}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  infoBanner: { flexDirection: 'row', backgroundColor: '#ECFDF5', margin: 16, padding: 16, borderRadius: 12, alignItems: 'center' },
  infoTextContainer: { marginLeft: 12, flex: 1 },
  infoTitle: { fontSize: 14, fontWeight: '600', color: '#065F46' },
  infoText: { fontSize: 12, color: '#047857', marginTop: 2 },
  savedAccountCard: { backgroundColor: '#fff', margin: 16, marginTop: 0, borderRadius: 12, overflow: 'hidden' },
  savedAccountHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  bankIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F3E8FF', justifyContent: 'center', alignItems: 'center' },
  savedAccountInfo: { flex: 1, marginLeft: 12 },
  bankName: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  accountNumber: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  verifiedText: { fontSize: 12, color: '#10B981', marginLeft: 4 },
  savedAccountDetails: { padding: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  detailLabel: { fontSize: 14, color: '#6B7280' },
  detailValue: { fontSize: 14, fontWeight: '500', color: '#1F2937' },
  savedAccountActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  editButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 14, borderRightWidth: 1, borderRightColor: '#E5E7EB' },
  editButtonText: { marginLeft: 6, fontSize: 14, fontWeight: '600', color: '#160832' },
  deleteButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 14 },
  deleteButtonText: { marginLeft: 6, fontSize: 14, fontWeight: '600', color: '#EF4444' },
  formContainer: { backgroundColor: '#fff', margin: 16, marginTop: 0, padding: 16, borderRadius: 12 },
  formTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, fontSize: 16 },
  optionRow: { flexDirection: 'row', gap: 12 },
  optionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 8 },
  optionButtonSelected: { borderColor: '#160832', backgroundColor: '#F3E8FF' },
  optionText: { marginLeft: 8, fontSize: 14, fontWeight: '500', color: '#6B7280' },
  optionTextSelected: { color: '#160832' },
  payoutOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 12, marginBottom: 12 },
  payoutOptionSelected: { borderColor: '#160832', backgroundColor: '#F3E8FF' },
  payoutIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  payoutInfo: { flex: 1, marginLeft: 12 },
  payoutName: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  payoutNameSelected: { color: '#160832' },
  payoutDescription: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  radioButton: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center' },
  radioButtonInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#160832' },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelButton: { flex: 1, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: '#6B7280' },
  saveButton: { flex: 2, backgroundColor: '#160832', padding: 14, borderRadius: 8, alignItems: 'center' },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  addNewButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', margin: 16, marginTop: 0, padding: 14, backgroundColor: '#fff', borderRadius: 12, borderWidth: 2, borderColor: '#160832', borderStyle: 'dashed' },
  addNewText: { marginLeft: 8, fontSize: 14, fontWeight: '600', color: '#160832' },
  bottomPadding: { height: 32 },
});
