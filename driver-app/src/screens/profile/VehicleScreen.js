import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { driverAPI } from '../../services/api.service';

const VEHICLE_TYPES = [
  { id: 'economy', name: 'Economy', icon: 'car-outline' },
  { id: 'standard', name: 'Standard', icon: 'car-sport-outline' },
  { id: 'premium', name: 'Premium', icon: 'car' },
  { id: 'suv', name: 'SUV', icon: 'bus-outline' },
];

export default function VehicleScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vehicle, setVehicle] = useState({ make: '', model: '', year: '', color: '', licensePlate: '', vehicleType: 'standard', vin: '', seats: '4' });
  const [photos, setPhotos] = useState({ front: null, back: null, interior: null, side: null });

  useEffect(() => { fetchVehicleInfo(); }, []);

  const fetchVehicleInfo = async () => {
    try {
      const response = await driverAPI.getVehicle();
      if (response.data?.success && response.data.data) {
        const v = response.data.data;
        setVehicle({ make: v.make || '', model: v.model || '', year: v.year?.toString() || '', color: v.color || '', licensePlate: v.licensePlate || '', vehicleType: v.vehicleType || 'standard', vin: v.vin || '', seats: v.seats?.toString() || '4' });
        setPhotos({ front: v.frontPhoto || null, back: v.backPhoto || null, interior: v.interiorPhoto || null, side: v.sidePhoto || null });
      }
    } catch (error) { console.error('Error fetching vehicle:', error); }
    finally { setLoading(false); }
  };

  const handleInputChange = (field, value) => { setVehicle(prev => ({ ...prev, [field]: value })); };

  const pickPhoto = async (type) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission Required', 'Please allow access to your photo library'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!result.canceled) { setPhotos(prev => ({ ...prev, [type]: result.assets[0].uri })); }
  };

  const showPhotoOptions = (type) => {
    Alert.alert('Add Photo', `Add ${type} photo of your vehicle`, [
      { text: 'Choose from Gallery', onPress: () => pickPhoto(type) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    if (!vehicle.make || !vehicle.model || !vehicle.year || !vehicle.licensePlate) { Alert.alert('Error', 'Please fill in all required fields'); return; }
    setSaving(true);
    try {
      const formData = new FormData();
      Object.keys(vehicle).forEach(key => { formData.append(key, vehicle[key]); });
      Object.keys(photos).forEach(key => {
        if (photos[key] && photos[key].startsWith('file://')) {
          formData.append(`${key}Photo`, { uri: photos[key], type: 'image/jpeg', name: `${key}_${Date.now()}.jpg` });
        }
      });
      const response = await driverAPI.updateVehicle(formData);
      if (response.data?.success) { Alert.alert('Success', 'Vehicle information updated successfully'); navigation.goBack(); }
      else { Alert.alert('Error', response.data?.message || 'Failed to update vehicle'); }
    } catch (error) { Alert.alert('Error', 'Failed to save vehicle information'); }
    finally { setSaving(false); }
  };

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#7C3AED" /></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vehicle Type</Text>
        <View style={styles.typeGrid}>
          {VEHICLE_TYPES.map((type) => (
            <TouchableOpacity key={type.id} style={[styles.typeCard, vehicle.vehicleType === type.id && styles.typeCardSelected]} onPress={() => handleInputChange('vehicleType', type.id)}>
              <Ionicons name={type.icon} size={28} color={vehicle.vehicleType === type.id ? '#7C3AED' : '#6B7280'} />
              <Text style={[styles.typeName, vehicle.vehicleType === type.id && styles.typeNameSelected]}>{type.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vehicle Details</Text>
        <View style={styles.row}>
          <View style={styles.inputHalf}>
            <Text style={styles.label}>Make *</Text>
            <TextInput style={styles.input} value={vehicle.make} onChangeText={(v) => handleInputChange('make', v)} placeholder="e.g., Toyota" />
          </View>
          <View style={styles.inputHalf}>
            <Text style={styles.label}>Model *</Text>
            <TextInput style={styles.input} value={vehicle.model} onChangeText={(v) => handleInputChange('model', v)} placeholder="e.g., Camry" />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.inputHalf}>
            <Text style={styles.label}>Year *</Text>
            <TextInput style={styles.input} value={vehicle.year} onChangeText={(v) => handleInputChange('year', v)} placeholder="e.g., 2022" keyboardType="number-pad" maxLength={4} />
          </View>
          <View style={styles.inputHalf}>
            <Text style={styles.label}>Color *</Text>
            <TextInput style={styles.input} value={vehicle.color} onChangeText={(v) => handleInputChange('color', v)} placeholder="e.g., Black" />
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>License Plate *</Text>
          <TextInput style={styles.input} value={vehicle.licensePlate} onChangeText={(v) => handleInputChange('licensePlate', v.toUpperCase())} placeholder="e.g., ABC 1234" autoCapitalize="characters" />
        </View>
        <View style={styles.row}>
          <View style={styles.inputHalf}>
            <Text style={styles.label}>VIN (Optional)</Text>
            <TextInput style={styles.input} value={vehicle.vin} onChangeText={(v) => handleInputChange('vin', v.toUpperCase())} placeholder="Vehicle ID Number" maxLength={17} />
          </View>
          <View style={styles.inputHalf}>
            <Text style={styles.label}>Seats</Text>
            <TextInput style={styles.input} value={vehicle.seats} onChangeText={(v) => handleInputChange('seats', v)} placeholder="4" keyboardType="number-pad" maxLength={1} />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vehicle Photos</Text>
        <Text style={styles.sectionSubtitle}>Add clear photos of your vehicle for passenger verification</Text>
        <View style={styles.photoGrid}>
          {['front', 'back', 'interior', 'side'].map((type) => (
            <TouchableOpacity key={type} style={styles.photoCard} onPress={() => showPhotoOptions(type)}>
              {photos[type] ? <Image source={{ uri: photos[type] }} style={styles.photoImage} /> : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="camera-outline" size={32} color="#9CA3AF" />
                  <Text style={styles.photoLabel}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                </View>
              )}
              <View style={styles.photoOverlay}><Ionicons name="add-circle" size={24} color="#7C3AED" /></View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Vehicle Information</Text>}
      </TouchableOpacity>
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  section: { backgroundColor: '#fff', margin: 16, marginBottom: 0, padding: 16, borderRadius: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: '#6B7280', marginBottom: 16 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 12 },
  typeCard: { width: '47%', padding: 16, borderRadius: 12, borderWidth: 2, borderColor: '#E5E7EB', alignItems: 'center' },
  typeCardSelected: { borderColor: '#7C3AED', backgroundColor: '#F3E8FF' },
  typeName: { marginTop: 8, fontSize: 14, fontWeight: '500', color: '#6B7280' },
  typeNameSelected: { color: '#7C3AED' },
  row: { flexDirection: 'row', gap: 12 },
  inputGroup: { marginBottom: 16 },
  inputHalf: { flex: 1, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, fontSize: 16 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  photoCard: { width: '47%', aspectRatio: 4/3, borderRadius: 12, overflow: 'hidden', backgroundColor: '#F3F4F6', position: 'relative' },
  photoImage: { width: '100%', height: '100%' },
  photoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  photoLabel: { marginTop: 8, fontSize: 12, color: '#6B7280' },
  photoOverlay: { position: 'absolute', bottom: 8, right: 8, backgroundColor: '#fff', borderRadius: 12 },
  saveButton: { backgroundColor: '#7C3AED', margin: 16, padding: 16, borderRadius: 12, alignItems: 'center' },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  bottomPadding: { height: 32 },
});
