import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TicketsScreen({ navigation }) {
  const [selectedTab, setSelectedTab] = useState('open'); // open, resolved

  const tickets = [
    {
      id: 'TCK001',
      title: 'Fare Overcharge Issue',
      category: 'Payment',
      status: 'open',
      priority: 'high',
      date: '2025-12-05',
      lastUpdate: '2 hours ago',
    },
    {
      id: 'TCK002',
      title: 'Lost Item Report',
      category: 'Trip',
      status: 'open',
      priority: 'medium',
      date: '2025-12-04',
      lastUpdate: '1 day ago',
    },
    {
      id: 'TCK003',
      title: 'Driver Rating Inquiry',
      category: 'Account',
      status: 'resolved',
      priority: 'low',
      date: '2025-12-03',
      lastUpdate: '3 days ago',
      resolution: 'Issue has been resolved. Your rating has been updated.',
    },
    {
      id: 'TCK004',
      title: 'Refund Request',
      category: 'Payment',
      status: 'resolved',
      priority: 'high',
      date: '2025-12-01',
      lastUpdate: '5 days ago',
      resolution: 'Refund of $15.50 has been processed to your wallet.',
    },
  ];

  const filteredTickets = tickets.filter(t => t.status === selectedTab);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Tickets</Text>
        <TouchableOpacity>
          <Ionicons name="add-circle" size={28} color="#7C3AED" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'open' && styles.tabActive]}
          onPress={() => setSelectedTab('open')}
        >
          <Text style={[styles.tabText, selectedTab === 'open' && styles.tabTextActive]}>
            Open ({tickets.filter(t => t.status === 'open').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'resolved' && styles.tabActive]}
          onPress={() => setSelectedTab('resolved')}
        >
          <Text style={[styles.tabText, selectedTab === 'resolved' && styles.tabTextActive]}>
            Resolved ({tickets.filter(t => t.status === 'resolved').length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {filteredTickets.map((ticket) => (
          <TouchableOpacity key={ticket.id} style={styles.ticketCard}>
            <View style={styles.ticketHeader}>
              <Text style={styles.ticketId}>#{ticket.id}</Text>
              <View style={[styles.priorityBadge, { backgroundColor: `${getPriorityColor(ticket.priority)}20` }]}>
                <Text style={[styles.priorityText, { color: getPriorityColor(ticket.priority) }]}>
                  {ticket.priority}
                </Text>
              </View>
            </View>
            <Text style={styles.ticketTitle}>{ticket.title}</Text>
            <View style={styles.ticketMeta}>
              <View style={styles.ticketMetaItem}>
                <Ionicons name="folder" size={14} color="#6B7280" />
                <Text style={styles.ticketMetaText}>{ticket.category}</Text>
              </View>
              <View style={styles.ticketMetaItem}>
                <Ionicons name="time" size={14} color="#6B7280" />
                <Text style={styles.ticketMetaText}>{ticket.lastUpdate}</Text>
              </View>
            </View>
            {ticket.resolution && (
              <View style={styles.resolution}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.resolutionText}>{ticket.resolution}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
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
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 4,
    margin: 16,
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: '#7C3AED' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { color: '#FFFFFF' },
  content: { flex: 1, paddingHorizontal: 16 },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketId: { fontSize: 12, fontWeight: '600', color: '#7C3AED' },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  priorityText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  ticketTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
  ticketMeta: { flexDirection: 'row', gap: 16 },
  ticketMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ticketMetaText: { fontSize: 12, color: '#6B7280' },
  resolution: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  resolutionText: { flex: 1, fontSize: 12, color: '#047857' },
});
