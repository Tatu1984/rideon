import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ScheduleRideScreen({ navigation, route }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const dates = [
    { id: 'today', label: 'Today', date: '2025-12-07' },
    { id: 'tomorrow', label: 'Tomorrow', date: '2025-12-08' },
    { id: 'day3', label: 'Monday', date: '2025-12-09' },
    { id: 'day4', label: 'Tuesday', date: '2025-12-10' },
  ];

  const times = [
    '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
    '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM',
  ];

  const handleSchedule = () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time');
      return;
    }
    navigation.navigate('VehicleSelection', {
      ...route.params,
      scheduledDate: selectedDate,
      scheduledTime: selectedTime,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule Ride</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <View style={styles.dateGrid}>
            {dates.map((date) => (
              <TouchableOpacity
                key={date.id}
                style={[styles.dateCard, selectedDate === date.id && styles.dateCardSelected]}
                onPress={() => setSelectedDate(date.id)}
              >
                <Text style={[styles.dateLabel, selectedDate === date.id && styles.dateLabelSelected]}>
                  {date.label}
                </Text>
                <Text style={[styles.dateValue, selectedDate === date.id && styles.dateValueSelected]}>
                  {date.date.slice(-2)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Time</Text>
          <View style={styles.timeGrid}>
            {times.map((time) => (
              <TouchableOpacity
                key={time}
                style={[styles.timeCard, selectedTime === time && styles.timeCardSelected]}
                onPress={() => setSelectedTime(time)}
              >
                <Text style={[styles.timeText, selectedTime === time && styles.timeTextSelected]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.note}>
          <Ionicons name="information-circle" size={20} color="#6B7280" />
          <Text style={styles.noteText}>
            Your ride will be booked for the selected date and time. Driver will arrive 5 minutes before.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.scheduleButton, (!selectedDate || !selectedTime) && styles.scheduleButtonDisabled]}
          onPress={handleSchedule}
          disabled={!selectedDate || !selectedTime}
        >
          <Text style={styles.scheduleButtonText}>Schedule Ride</Text>
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
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  dateGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  dateCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  dateCardSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#7C3AED',
  },
  dateLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  dateLabelSelected: {
    color: '#E9D5FF',
  },
  dateValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  dateValueSelected: {
    color: '#FFFFFF',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  timeCardSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#F3F4F6',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  timeTextSelected: {
    color: '#7C3AED',
  },
  note: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  scheduleButton: {
    backgroundColor: '#7C3AED',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  scheduleButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  scheduleButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
