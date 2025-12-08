import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RateTripScreen({ navigation, route }) {
  const { tripId, driver } = route.params || {};

  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tip, setTip] = useState(null);
  const [feedback, setFeedback] = useState('');

  const driverInfo = driver || {
    name: 'John Smith',
    photo: 'https://i.pravatar.cc/150?img=12',
  };

  const complimentTags = [
    { id: 'friendly', label: 'Friendly', icon: 'happy-outline' },
    { id: 'clean', label: 'Clean Car', icon: 'sparkles-outline' },
    { id: 'safe', label: 'Safe Driver', icon: 'shield-checkmark-outline' },
    { id: 'punctual', label: 'On Time', icon: 'time-outline' },
    { id: 'helpful', label: 'Helpful', icon: 'hand-right-outline' },
    { id: 'music', label: 'Good Music', icon: 'musical-notes-outline' },
  ];

  const tipOptions = [
    { value: 2, label: '$2' },
    { value: 5, label: '$5' },
    { value: 10, label: '$10' },
    { value: 15, label: '$15' },
  ];

  const toggleTag = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleSubmit = () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    // Submit rating to backend
    alert(`Rating submitted!\nRating: ${rating} stars\nTip: ${tip ? `$${tip}` : 'No tip'}\nCompliments: ${selectedTags.length}`);
    navigation.navigate('MainTabs');
  };

  const handleSkip = () => {
    navigation.navigate('MainTabs');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate Your Trip</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Driver Info */}
        <View style={styles.driverCard}>
          <Image source={{ uri: driverInfo.photo }} style={styles.driverPhoto} />
          <Text style={styles.driverName}>{driverInfo.name}</Text>
          <Text style={styles.tripId}>Trip ID: {tripId || 'TRIP123456'}</Text>
        </View>

        {/* Rating Stars */}
        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>How was your ride?</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={48}
                  color={star <= rating ? '#F59E0B' : '#E5E7EB'}
                />
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text style={styles.ratingText}>
              {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great!' : rating === 3 ? 'Good' : rating === 2 ? 'Okay' : 'Poor'}
            </Text>
          )}
        </View>

        {/* Compliments */}
        {rating >= 4 && (
          <View style={styles.complimentsSection}>
            <Text style={styles.sectionTitle}>Add compliments (Optional)</Text>
            <View style={styles.tagsContainer}>
              {complimentTags.map((tag) => (
                <TouchableOpacity
                  key={tag.id}
                  style={[
                    styles.tag,
                    selectedTags.includes(tag.id) && styles.tagSelected,
                  ]}
                  onPress={() => toggleTag(tag.id)}
                >
                  <Ionicons
                    name={tag.icon}
                    size={18}
                    color={selectedTags.includes(tag.id) ? '#7C3AED' : '#6B7280'}
                  />
                  <Text
                    style={[
                      styles.tagText,
                      selectedTags.includes(tag.id) && styles.tagTextSelected,
                    ]}
                  >
                    {tag.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Feedback */}
        <View style={styles.feedbackSection}>
          <Text style={styles.sectionTitle}>Additional Feedback (Optional)</Text>
          <TextInput
            style={styles.feedbackInput}
            placeholder="Tell us more about your experience..."
            value={feedback}
            onChangeText={setFeedback}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Tip Driver */}
        {rating >= 4 && (
          <View style={styles.tipSection}>
            <Text style={styles.sectionTitle}>Add a tip for {driverInfo.name}?</Text>
            <Text style={styles.tipSubtitle}>100% goes to your driver</Text>
            <View style={styles.tipOptions}>
              {tipOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.tipOption,
                    tip === option.value && styles.tipOptionSelected,
                  ]}
                  onPress={() => setTip(tip === option.value ? null : option.value)}
                >
                  <Text
                    style={[
                      styles.tipOptionText,
                      tip === option.value && styles.tipOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {tip && (
              <View style={styles.tipNote}>
                <Ionicons name="heart" size={16} color="#10B981" />
                <Text style={styles.tipNoteText}>
                  Thank you for supporting your driver!
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Issues (Low Rating) */}
        {rating > 0 && rating < 4 && (
          <View style={styles.issuesSection}>
            <Text style={styles.sectionTitle}>What went wrong?</Text>
            <Text style={styles.issueSubtitle}>Help us improve your experience</Text>
            <TouchableOpacity
              style={styles.issueButton}
              onPress={() => navigation.navigate('SupportScreen', { tripId })}
            >
              <Ionicons name="flag-outline" size={20} color="#EF4444" />
              <Text style={styles.issueButtonText}>Report an Issue</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, rating === 0 && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={rating === 0}
        >
          <Text style={styles.submitButtonText}>
            {tip ? `Submit Rating & Tip $${tip}` : 'Submit Rating'}
          </Text>
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
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skipText: {
    fontSize: 15,
    color: '#7C3AED',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  driverCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  driverPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  driverName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  tripId: {
    fontSize: 13,
    color: '#6B7280',
  },
  ratingSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  complimentsSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  tagSelected: {
    backgroundColor: '#F3E8FF',
    borderColor: '#7C3AED',
  },
  tagText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  tagTextSelected: {
    color: '#7C3AED',
  },
  feedbackSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  },
  feedbackInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#1F2937',
    minHeight: 100,
  },
  tipSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  },
  tipSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  tipOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  tipOption: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  tipOptionSelected: {
    backgroundColor: '#F3E8FF',
    borderColor: '#7C3AED',
  },
  tipOptionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  tipOptionTextSelected: {
    color: '#7C3AED',
  },
  tipNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  tipNoteText: {
    flex: 1,
    fontSize: 13,
    color: '#10B981',
    fontWeight: '500',
  },
  issuesSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  },
  issueSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  issueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  issueButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
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
