import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PreferencesScreen({ navigation }) {
  const [poolRides, setPoolRides] = useState(true);
  const [acPreference, setAcPreference] = useState('always');
  const [musicPreference, setMusicPreference] = useState('moderate');
  const [conversationPreference, setConversationPreference] = useState('minimal');
  const [petFriendly, setPetFriendly] = useState(false);
  const [accessibleVehicle, setAccessibleVehicle] = useState(false);

  const handleSave = () => {
    alert('Preferences saved successfully!');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ride Preferences</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color="#7C3AED" />
          <Text style={styles.infoText}>
            Customize your ride experience. We'll try to match you with drivers who meet your preferences.
          </Text>
        </View>

        {/* Ride Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ride Type</Text>

          <View style={styles.preferenceRow}>
            <View style={styles.preferenceLeft}>
              <Ionicons name="people" size={22} color="#7C3AED" />
              <View style={styles.preferenceInfo}>
                <Text style={styles.preferenceName}>Pool/Shared Rides</Text>
                <Text style={styles.preferenceDescription}>
                  Share rides with others and save money
                </Text>
              </View>
            </View>
            <Switch
              value={poolRides}
              onValueChange={setPoolRides}
              trackColor={{ false: '#E5E7EB', true: '#C4B5FD' }}
              thumbColor={poolRides ? '#7C3AED' : '#9CA3AF'}
            />
          </View>
        </View>

        {/* Climate Preference */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Climate</Text>

          <TouchableOpacity
            style={[
              styles.optionCard,
              acPreference === 'always' && styles.optionCardSelected,
            ]}
            onPress={() => setAcPreference('always')}
          >
            <View style={styles.optionLeft}>
              <Ionicons
                name="snow"
                size={22}
                color={acPreference === 'always' ? '#7C3AED' : '#6B7280'}
              />
              <View style={styles.optionInfo}>
                <Text
                  style={[
                    styles.optionName,
                    acPreference === 'always' && styles.optionNameSelected,
                  ]}
                >
                  AC Always On
                </Text>
                <Text style={styles.optionDescription}>
                  Keep air conditioning running throughout the ride
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.radio,
                acPreference === 'always' && styles.radioSelected,
              ]}
            >
              {acPreference === 'always' && (
                <View style={styles.radioDot} />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              acPreference === 'moderate' && styles.optionCardSelected,
            ]}
            onPress={() => setAcPreference('moderate')}
          >
            <View style={styles.optionLeft}>
              <Ionicons
                name="partly-sunny"
                size={22}
                color={acPreference === 'moderate' ? '#7C3AED' : '#6B7280'}
              />
              <View style={styles.optionInfo}>
                <Text
                  style={[
                    styles.optionName,
                    acPreference === 'moderate' && styles.optionNameSelected,
                  ]}
                >
                  Moderate
                </Text>
                <Text style={styles.optionDescription}>
                  AC based on weather conditions
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.radio,
                acPreference === 'moderate' && styles.radioSelected,
              ]}
            >
              {acPreference === 'moderate' && (
                <View style={styles.radioDot} />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              acPreference === 'windows' && styles.optionCardSelected,
            ]}
            onPress={() => setAcPreference('windows')}
          >
            <View style={styles.optionLeft}>
              <Ionicons
                name="leaf"
                size={22}
                color={acPreference === 'windows' ? '#7C3AED' : '#6B7280'}
              />
              <View style={styles.optionInfo}>
                <Text
                  style={[
                    styles.optionName,
                    acPreference === 'windows' && styles.optionNameSelected,
                  ]}
                >
                  Windows Down
                </Text>
                <Text style={styles.optionDescription}>
                  Prefer fresh air over AC
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.radio,
                acPreference === 'windows' && styles.radioSelected,
              ]}
            >
              {acPreference === 'windows' && (
                <View style={styles.radioDot} />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Music Preference */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Music</Text>

          <TouchableOpacity
            style={[
              styles.optionCard,
              musicPreference === 'loud' && styles.optionCardSelected,
            ]}
            onPress={() => setMusicPreference('loud')}
          >
            <View style={styles.optionLeft}>
              <Ionicons
                name="volume-high"
                size={22}
                color={musicPreference === 'loud' ? '#7C3AED' : '#6B7280'}
              />
              <Text
                style={[
                  styles.optionName,
                  musicPreference === 'loud' && styles.optionNameSelected,
                ]}
              >
                Loud Music
              </Text>
            </View>
            <View
              style={[
                styles.radio,
                musicPreference === 'loud' && styles.radioSelected,
              ]}
            >
              {musicPreference === 'loud' && (
                <View style={styles.radioDot} />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              musicPreference === 'moderate' && styles.optionCardSelected,
            ]}
            onPress={() => setMusicPreference('moderate')}
          >
            <View style={styles.optionLeft}>
              <Ionicons
                name="volume-medium"
                size={22}
                color={musicPreference === 'moderate' ? '#7C3AED' : '#6B7280'}
              />
              <Text
                style={[
                  styles.optionName,
                  musicPreference === 'moderate' && styles.optionNameSelected,
                ]}
              >
                Moderate Music
              </Text>
            </View>
            <View
              style={[
                styles.radio,
                musicPreference === 'moderate' && styles.radioSelected,
              ]}
            >
              {musicPreference === 'moderate' && (
                <View style={styles.radioDot} />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              musicPreference === 'quiet' && styles.optionCardSelected,
            ]}
            onPress={() => setMusicPreference('quiet')}
          >
            <View style={styles.optionLeft}>
              <Ionicons
                name="volume-mute"
                size={22}
                color={musicPreference === 'quiet' ? '#7C3AED' : '#6B7280'}
              />
              <Text
                style={[
                  styles.optionName,
                  musicPreference === 'quiet' && styles.optionNameSelected,
                ]}
              >
                Quiet Please
              </Text>
            </View>
            <View
              style={[
                styles.radio,
                musicPreference === 'quiet' && styles.radioSelected,
              ]}
            >
              {musicPreference === 'quiet' && (
                <View style={styles.radioDot} />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Conversation Preference */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conversation</Text>

          <TouchableOpacity
            style={[
              styles.optionCard,
              conversationPreference === 'chatty' && styles.optionCardSelected,
            ]}
            onPress={() => setConversationPreference('chatty')}
          >
            <View style={styles.optionLeft}>
              <Ionicons
                name="chatbubbles"
                size={22}
                color={conversationPreference === 'chatty' ? '#7C3AED' : '#6B7280'}
              />
              <Text
                style={[
                  styles.optionName,
                  conversationPreference === 'chatty' && styles.optionNameSelected,
                ]}
              >
                Let's Chat
              </Text>
            </View>
            <View
              style={[
                styles.radio,
                conversationPreference === 'chatty' && styles.radioSelected,
              ]}
            >
              {conversationPreference === 'chatty' && (
                <View style={styles.radioDot} />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              conversationPreference === 'minimal' && styles.optionCardSelected,
            ]}
            onPress={() => setConversationPreference('minimal')}
          >
            <View style={styles.optionLeft}>
              <Ionicons
                name="chatbubble-outline"
                size={22}
                color={conversationPreference === 'minimal' ? '#7C3AED' : '#6B7280'}
              />
              <Text
                style={[
                  styles.optionName,
                  conversationPreference === 'minimal' && styles.optionNameSelected,
                ]}
              >
                Minimal Chat
              </Text>
            </View>
            <View
              style={[
                styles.radio,
                conversationPreference === 'minimal' && styles.radioSelected,
              ]}
            >
              {conversationPreference === 'minimal' && (
                <View style={styles.radioDot} />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              conversationPreference === 'quiet' && styles.optionCardSelected,
            ]}
            onPress={() => setConversationPreference('quiet')}
          >
            <View style={styles.optionLeft}>
              <Ionicons
                name="ban"
                size={22}
                color={conversationPreference === 'quiet' ? '#7C3AED' : '#6B7280'}
              />
              <Text
                style={[
                  styles.optionName,
                  conversationPreference === 'quiet' && styles.optionNameSelected,
                ]}
              >
                Quiet Ride
              </Text>
            </View>
            <View
              style={[
                styles.radio,
                conversationPreference === 'quiet' && styles.radioSelected,
              ]}
            >
              {conversationPreference === 'quiet' && (
                <View style={styles.radioDot} />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Special Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Requirements</Text>

          <View style={styles.preferenceRow}>
            <View style={styles.preferenceLeft}>
              <Ionicons name="paw" size={22} color="#7C3AED" />
              <View style={styles.preferenceInfo}>
                <Text style={styles.preferenceName}>Pet-Friendly</Text>
                <Text style={styles.preferenceDescription}>
                  Prefer drivers who allow pets
                </Text>
              </View>
            </View>
            <Switch
              value={petFriendly}
              onValueChange={setPetFriendly}
              trackColor={{ false: '#E5E7EB', true: '#C4B5FD' }}
              thumbColor={petFriendly ? '#7C3AED' : '#9CA3AF'}
            />
          </View>

          <View style={styles.preferenceRow}>
            <View style={styles.preferenceLeft}>
              <Ionicons name="accessibility" size={22} color="#7C3AED" />
              <View style={styles.preferenceInfo}>
                <Text style={styles.preferenceName}>Wheelchair Accessible</Text>
                <Text style={styles.preferenceDescription}>
                  Request wheelchair-accessible vehicles
                </Text>
              </View>
            </View>
            <Switch
              value={accessibleVehicle}
              onValueChange={setAccessibleVehicle}
              trackColor={{ false: '#E5E7EB', true: '#C4B5FD' }}
              thumbColor={accessibleVehicle ? '#7C3AED' : '#9CA3AF'}
            />
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
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
  },
  content: {
    flex: 1,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#F3E8FF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#6B21A8',
    lineHeight: 18,
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
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  preferenceInfo: {
    flex: 1,
  },
  preferenceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  preferenceDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  optionCardSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#F3E8FF',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  optionInfo: {
    flex: 1,
  },
  optionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  optionNameSelected: {
    color: '#7C3AED',
  },
  optionDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
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
});
