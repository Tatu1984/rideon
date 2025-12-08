import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function EditProfileScreen({ navigation }) {
  const [firstName, setFirstName] = useState('John');
  const [lastName, setLastName] = useState('Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [phone, setPhone] = useState('+1 234 567 8900');
  const [dateOfBirth, setDateOfBirth] = useState('01/15/1990');
  const [gender, setGender] = useState('male');

  const profilePhoto = 'https://i.pravatar.cc/150?img=1';

  const handleSave = () => {
    if (!firstName || !lastName || !email || !phone) {
      alert('Please fill in all required fields');
      return;
    }

    alert('Profile updated successfully!');
    navigation.goBack();
  };

  const handleChangePhoto = () => {
    alert('Photo picker opened');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Photo */}
        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            <Image source={{ uri: profilePhoto }} style={styles.photo} />
            <TouchableOpacity style={styles.photoButton} onPress={handleChangePhoto}>
              <Ionicons name="camera" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.photoLabel}>Tap to change photo</Text>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>First Name *</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter first name"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Last Name *</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter last name"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Email *</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Phone Number *</Text>
            <View style={styles.phoneContainer}>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Date of Birth</Text>
            <TextInput
              style={styles.input}
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              placeholder="MM/DD/YYYY"
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Gender</Text>
            <View style={styles.genderOptions}>
              <TouchableOpacity
                style={[
                  styles.genderOption,
                  gender === 'male' && styles.genderOptionSelected,
                ]}
                onPress={() => setGender('male')}
              >
                <Ionicons
                  name="male"
                  size={20}
                  color={gender === 'male' ? '#7C3AED' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.genderText,
                    gender === 'male' && styles.genderTextSelected,
                  ]}
                >
                  Male
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderOption,
                  gender === 'female' && styles.genderOptionSelected,
                ]}
                onPress={() => setGender('female')}
              >
                <Ionicons
                  name="female"
                  size={20}
                  color={gender === 'female' ? '#7C3AED' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.genderText,
                    gender === 'female' && styles.genderTextSelected,
                  ]}
                >
                  Female
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderOption,
                  gender === 'other' && styles.genderOptionSelected,
                ]}
                onPress={() => setGender('other')}
              >
                <Ionicons
                  name="transgender"
                  size={20}
                  color={gender === 'other' ? '#7C3AED' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.genderText,
                    gender === 'other' && styles.genderTextSelected,
                  ]}
                >
                  Other
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>

          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionLeft}>
              <Ionicons name="key-outline" size={20} color="#7C3AED" />
              <Text style={styles.actionText}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionLeft}>
              <Ionicons name="call-outline" size={20} color="#7C3AED" />
              <Text style={styles.actionText}>Change Phone Number</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionLeft}>
              <Ionicons name="mail-outline" size={20} color="#7C3AED" />
              <Text style={styles.actionText}>Change Email</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, { borderBottomWidth: 0 }]}>
            <View style={styles.actionLeft}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
              <Text style={[styles.actionText, { color: '#EF4444' }]}>Delete Account</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
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
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
  },
  content: {
    flex: 1,
  },
  photoSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  photoLabel: {
    fontSize: 13,
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
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 20,
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
  phoneContainer: {
    position: 'relative',
  },
  verifiedBadge: {
    position: 'absolute',
    right: 12,
    top: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#10B981',
  },
  genderOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  genderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  genderOptionSelected: {
    backgroundColor: '#F3E8FF',
    borderColor: '#7C3AED',
  },
  genderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  genderTextSelected: {
    color: '#7C3AED',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
  },
});
