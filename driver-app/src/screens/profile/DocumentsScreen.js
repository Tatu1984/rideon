import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { driverAPI } from '../../services/api.service';

const DOCUMENT_TYPES = [
  { id: 'license', title: "Driver's License", description: 'Valid government-issued driving license', icon: 'card-outline', required: true },
  { id: 'registration', title: 'Vehicle Registration', description: 'Current vehicle registration certificate', icon: 'document-text-outline', required: true },
  { id: 'insurance', title: 'Insurance Certificate', description: 'Valid vehicle insurance document', icon: 'shield-checkmark-outline', required: true },
  { id: 'background_check', title: 'Background Check', description: 'Background verification certificate', icon: 'checkmark-circle-outline', required: true },
  { id: 'profile_photo', title: 'Profile Photo', description: 'Clear photo of yourself', icon: 'person-outline', required: true },
  { id: 'vehicle_photo', title: 'Vehicle Photos', description: 'Photos of your vehicle', icon: 'car-outline', required: false },
];

const STATUS_COLORS = { pending: '#F59E0B', approved: '#10B981', rejected: '#EF4444', expired: '#6B7280', missing: '#9CA3AF' };

export default function DocumentsScreen({ navigation }) {
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);

  useEffect(() => { fetchDocuments(); }, []);

  const fetchDocuments = async () => {
    try {
      const response = await driverAPI.getDocuments();
      if (response.data?.success) {
        const docs = {};
        (response.data.data || []).forEach(doc => { docs[doc.type] = doc; });
        setDocuments(docs);
      }
    } catch (error) { console.error('Error fetching documents:', error); }
    finally { setLoading(false); }
  };

  const pickImage = async (docType) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission Required', 'Please allow access to your photo library'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8 });
    if (!result.canceled) { uploadDocument(docType, result.assets[0]); }
  };

  const takePhoto = async (docType) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission Required', 'Please allow camera access'); return; }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 });
    if (!result.canceled) { uploadDocument(docType, result.assets[0]); }
  };

  const uploadDocument = async (docType, file) => {
    setUploading(docType);
    try {
      const formData = new FormData();
      formData.append('document', { uri: file.uri, type: file.mimeType || 'image/jpeg', name: `${docType}_${Date.now()}.jpg` });
      formData.append('type', docType);
      const response = await driverAPI.uploadDocument(formData);
      if (response.data?.success) { Alert.alert('Success', 'Document uploaded successfully'); fetchDocuments(); }
      else { Alert.alert('Error', response.data?.message || 'Failed to upload document'); }
    } catch (error) { Alert.alert('Error', 'Failed to upload document'); }
    finally { setUploading(null); }
  };

  const showUploadOptions = (docType) => {
    Alert.alert('Upload Document', 'Choose an option', [
      { text: 'Take Photo', onPress: () => takePhoto(docType) },
      { text: 'Choose from Gallery', onPress: () => pickImage(docType) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const getDocumentStatus = (docType) => {
    const doc = documents[docType];
    if (!doc) return { status: 'missing', label: 'Not Uploaded' };
    if (doc.expiresAt && new Date(doc.expiresAt) < new Date()) return { status: 'expired', label: 'Expired' };
    return { status: doc.status, label: doc.status.charAt(0).toUpperCase() + doc.status.slice(1) };
  };

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#7C3AED" /></View>;

  const approvedCount = DOCUMENT_TYPES.filter(dt => documents[dt.id]?.status === 'approved').length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{approvedCount}/{DOCUMENT_TYPES.length}</Text>
          <Text style={styles.statLabel}>Documents Verified</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(approvedCount / DOCUMENT_TYPES.length) * 100}%` }]} />
        </View>
        {approvedCount < DOCUMENT_TYPES.filter(d => d.required).length && (
          <Text style={styles.warningText}>Please upload all required documents to start driving</Text>
        )}
      </View>

      {DOCUMENT_TYPES.map((docType) => {
        const doc = documents[docType.id];
        const { status, label } = getDocumentStatus(docType.id);
        const isUploading = uploading === docType.id;

        return (
          <View key={docType.id} style={styles.documentCard}>
            <View style={styles.documentHeader}>
              <View style={styles.documentIcon}><Ionicons name={docType.icon} size={24} color="#7C3AED" /></View>
              <View style={styles.documentInfo}>
                <View style={styles.titleRow}>
                  <Text style={styles.documentTitle}>{docType.title}</Text>
                  {docType.required && <Text style={styles.requiredBadge}>Required</Text>}
                </View>
                <Text style={styles.documentDescription}>{docType.description}</Text>
              </View>
            </View>

            {doc && (
              <View style={styles.documentDetails}>
                {doc.fileUrl && <Image source={{ uri: doc.fileUrl }} style={styles.thumbnail} resizeMode="cover" />}
                <View style={styles.detailsText}>
                  <Text style={styles.detailLabel}>Uploaded: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}</Text>
                  {doc.expiresAt && <Text style={styles.detailLabel}>Expires: {new Date(doc.expiresAt).toLocaleDateString()}</Text>}
                  {doc.rejectionReason && <Text style={styles.rejectionReason}>Reason: {doc.rejectionReason}</Text>}
                </View>
              </View>
            )}

            <View style={styles.documentFooter}>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[status] + '20' }]}>
                <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[status] }]} />
                <Text style={[styles.statusText, { color: STATUS_COLORS[status] }]}>{label}</Text>
              </View>
              <TouchableOpacity style={[styles.uploadButton, isUploading && styles.uploadingButton]} onPress={() => showUploadOptions(docType.id)} disabled={isUploading}>
                {isUploading ? <ActivityIndicator size="small" color="#fff" /> : (
                  <><Ionicons name={doc ? 'cloud-upload-outline' : 'add'} size={18} color="#fff" /><Text style={styles.uploadButtonText}>{doc ? 'Update' : 'Upload'}</Text></>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statsCard: { backgroundColor: '#fff', margin: 16, padding: 20, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  statItem: { alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#7C3AED' },
  statLabel: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  progressBar: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#10B981', borderRadius: 4 },
  warningText: { fontSize: 12, color: '#F59E0B', textAlign: 'center', marginTop: 12 },
  documentCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  documentHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  documentIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F3E8FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  documentInfo: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  documentTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginRight: 8 },
  requiredBadge: { fontSize: 10, color: '#EF4444', backgroundColor: '#FEE2E2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  documentDescription: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  documentDetails: { flexDirection: 'row', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  thumbnail: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  detailsText: { flex: 1, justifyContent: 'center' },
  detailLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  rejectionReason: { fontSize: 12, color: '#EF4444', marginTop: 4 },
  documentFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: '600' },
  uploadButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#7C3AED', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  uploadingButton: { opacity: 0.7 },
  uploadButtonText: { color: '#fff', fontSize: 14, fontWeight: '600', marginLeft: 6 },
  bottomPadding: { height: 32 },
});
