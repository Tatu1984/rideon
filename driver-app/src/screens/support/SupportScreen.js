import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal, FlatList, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { driverAPI } from '../../services/api.service';

const SUPPORT_CATEGORIES = [
  { id: 'trip_issue', name: 'Trip Issues', icon: 'car-outline', description: 'Problems during a trip' },
  { id: 'payment', name: 'Payment & Earnings', icon: 'wallet-outline', description: 'Payment questions or issues' },
  { id: 'account', name: 'Account Help', icon: 'person-outline', description: 'Profile, documents, verification' },
  { id: 'app', name: 'App Problems', icon: 'phone-portrait-outline', description: 'Technical issues or bugs' },
  { id: 'safety', name: 'Safety Concern', icon: 'shield-outline', description: 'Safety incidents or concerns' },
  { id: 'other', name: 'Other', icon: 'help-circle-outline', description: 'General questions' },
];

const QUICK_ACTIONS = [
  { id: 'call', name: 'Call Support', icon: 'call-outline', color: '#10B981' },
  { id: 'faq', name: 'FAQs', icon: 'book-outline', color: '#3B82F6' },
  { id: 'safety', name: 'Safety Toolkit', icon: 'shield-checkmark-outline', color: '#EF4444' },
];

const STATUS_COLORS = { open: '#F59E0B', in_progress: '#3B82F6', resolved: '#10B981', closed: '#6B7280' };

export default function SupportScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    try {
      const response = await driverAPI.getSupportTickets();
      if (response.data?.success) setTickets(response.data.data || []);
    } catch (error) { console.error('Error fetching tickets:', error); }
    finally { setLoading(false); }
  };

  const handleQuickAction = (action) => {
    if (action.id === 'call') Linking.openURL('tel:+18001234567');
    else if (action.id === 'faq') navigation.navigate('FAQ');
    else if (action.id === 'safety') navigation.navigate('SafetyToolkit');
  };

  const handleSubmitTicket = async () => {
    if (!selectedCategory) { Alert.alert('Error', 'Please select a category'); return; }
    if (!ticketSubject.trim()) { Alert.alert('Error', 'Please enter a subject'); return; }
    if (!ticketDescription.trim()) { Alert.alert('Error', 'Please describe your issue'); return; }
    setSubmitting(true);
    try {
      const response = await driverAPI.createSupportTicket({ category: selectedCategory, subject: ticketSubject, description: ticketDescription });
      if (response.data?.success) {
        Alert.alert('Success', 'Your support ticket has been submitted. We\'ll get back to you soon.');
        setShowNewTicket(false);
        setSelectedCategory(null);
        setTicketSubject('');
        setTicketDescription('');
        fetchTickets();
      } else { Alert.alert('Error', response.data?.message || 'Failed to submit ticket'); }
    } catch (error) { Alert.alert('Error', 'Failed to submit ticket'); }
    finally { setSubmitting(false); }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setSendingMessage(true);
    try {
      const response = await driverAPI.addTicketMessage(selectedTicket.id, newMessage);
      if (response.data?.success) {
        setSelectedTicket(prev => ({ ...prev, messages: [...(prev.messages || []), { text: newMessage, sender: 'driver', createdAt: new Date().toISOString() }] }));
        setNewMessage('');
      }
    } catch (error) { Alert.alert('Error', 'Failed to send message'); }
    finally { setSendingMessage(false); }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#7C3AED" /></View>;

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.quickActions}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity key={action.id} style={styles.quickActionCard} onPress={() => handleQuickAction(action)}>
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={styles.quickActionText}>{action.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.newTicketButton} onPress={() => setShowNewTicket(true)}>
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.newTicketText}>Create New Support Ticket</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Tickets</Text>
          {tickets.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No support tickets yet</Text>
              <Text style={styles.emptySubtext}>Create a ticket if you need help</Text>
            </View>
          ) : (
            tickets.map((ticket) => (
              <TouchableOpacity key={ticket.id} style={styles.ticketCard} onPress={() => setSelectedTicket(ticket)}>
                <View style={styles.ticketHeader}>
                  <View style={styles.ticketIcon}>
                    <Ionicons name={SUPPORT_CATEGORIES.find(c => c.id === ticket.category)?.icon || 'help-circle-outline'} size={20} color="#7C3AED" />
                  </View>
                  <View style={styles.ticketInfo}>
                    <Text style={styles.ticketSubject} numberOfLines={1}>{ticket.subject}</Text>
                    <Text style={styles.ticketDate}>{formatDate(ticket.createdAt)}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[ticket.status] + '20' }]}>
                    <Text style={[styles.statusText, { color: STATUS_COLORS[ticket.status] }]}>{ticket.status?.replace('_', ' ')}</Text>
                  </View>
                </View>
                <Text style={styles.ticketPreview} numberOfLines={2}>{ticket.description}</Text>
                <View style={styles.ticketFooter}>
                  <Text style={styles.ticketId}>Ticket #{ticket.id?.slice(-8)}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <Modal visible={showNewTicket} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowNewTicket(false)}><Ionicons name="close" size={28} color="#1F2937" /></TouchableOpacity>
            <Text style={styles.modalTitle}>New Support Ticket</Text>
            <View style={{ width: 28 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.formLabel}>Select Category</Text>
            <View style={styles.categoryGrid}>
              {SUPPORT_CATEGORIES.map((cat) => (
                <TouchableOpacity key={cat.id} style={[styles.categoryCard, selectedCategory === cat.id && styles.categoryCardSelected]} onPress={() => setSelectedCategory(cat.id)}>
                  <Ionicons name={cat.icon} size={24} color={selectedCategory === cat.id ? '#7C3AED' : '#6B7280'} />
                  <Text style={[styles.categoryName, selectedCategory === cat.id && styles.categoryNameSelected]}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.formLabel}>Subject</Text>
            <TextInput style={styles.input} value={ticketSubject} onChangeText={setTicketSubject} placeholder="Brief summary of your issue" />
            <Text style={styles.formLabel}>Description</Text>
            <TextInput style={[styles.input, styles.textArea]} value={ticketDescription} onChangeText={setTicketDescription} placeholder="Describe your issue in detail..." multiline numberOfLines={5} textAlignVertical="top" />
            <TouchableOpacity style={[styles.submitButton, submitting && styles.submitButtonDisabled]} onPress={handleSubmitTicket} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Submit Ticket</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={!!selectedTicket} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedTicket(null)}><Ionicons name="arrow-back" size={28} color="#1F2937" /></TouchableOpacity>
            <Text style={styles.modalTitle}>Ticket Details</Text>
            <View style={{ width: 28 }} />
          </View>
          {selectedTicket && (
            <>
              <View style={styles.ticketDetailHeader}>
                <Text style={styles.ticketDetailSubject}>{selectedTicket.subject}</Text>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[selectedTicket.status] + '20' }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLORS[selectedTicket.status] }]}>{selectedTicket.status?.replace('_', ' ')}</Text>
                </View>
              </View>
              <FlatList
                style={styles.messagesList}
                data={[{ text: selectedTicket.description, sender: 'driver', createdAt: selectedTicket.createdAt, isInitial: true }, ...(selectedTicket.messages || [])]}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <View style={[styles.messageBubble, item.sender === 'driver' ? styles.driverMessage : styles.supportMessage]}>
                    {item.isInitial && <Text style={styles.messageLabel}>Your Request:</Text>}
                    <Text style={styles.messageText}>{item.text}</Text>
                    <Text style={styles.messageTime}>{formatDate(item.createdAt)}</Text>
                  </View>
                )}
              />
              {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
                <View style={styles.messageInputContainer}>
                  <TextInput style={styles.messageInput} value={newMessage} onChangeText={setNewMessage} placeholder="Type a message..." />
                  <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage} disabled={sendingMessage}>
                    {sendingMessage ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="send" size={20} color="#fff" />}
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  quickActions: { flexDirection: 'row', padding: 16, gap: 12 },
  quickActionCard: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center' },
  quickActionIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  quickActionText: { fontSize: 12, fontWeight: '600', color: '#374151', textAlign: 'center' },
  newTicketButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#7C3AED', margin: 16, marginTop: 0, padding: 16, borderRadius: 12, gap: 8 },
  newTicketText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  section: { backgroundColor: '#fff', margin: 16, marginTop: 0, padding: 16, borderRadius: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 16 },
  emptyState: { alignItems: 'center', padding: 32 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#6B7280', marginTop: 12 },
  emptySubtext: { fontSize: 14, color: '#9CA3AF', marginTop: 4 },
  ticketCard: { backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  ticketHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  ticketIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3E8FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  ticketInfo: { flex: 1 },
  ticketSubject: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  ticketDate: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  ticketPreview: { fontSize: 13, color: '#6B7280', marginBottom: 12 },
  ticketFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  ticketId: { fontSize: 12, color: '#9CA3AF' },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
  modalContent: { flex: 1, padding: 16 },
  formLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 12, marginTop: 16 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryCard: { width: '47%', padding: 16, borderRadius: 12, borderWidth: 2, borderColor: '#E5E7EB', alignItems: 'center' },
  categoryCardSelected: { borderColor: '#7C3AED', backgroundColor: '#F3E8FF' },
  categoryName: { marginTop: 8, fontSize: 13, fontWeight: '500', color: '#6B7280', textAlign: 'center' },
  categoryNameSelected: { color: '#7C3AED' },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, fontSize: 16 },
  textArea: { height: 120 },
  submitButton: { backgroundColor: '#7C3AED', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24, marginBottom: 32 },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  ticketDetailHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#F9FAFB', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  ticketDetailSubject: { fontSize: 16, fontWeight: '600', color: '#1F2937', flex: 1, marginRight: 12 },
  messagesList: { flex: 1, padding: 16 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 12 },
  driverMessage: { alignSelf: 'flex-end', backgroundColor: '#7C3AED' },
  supportMessage: { alignSelf: 'flex-start', backgroundColor: '#E5E7EB' },
  messageLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  messageText: { fontSize: 14, color: '#fff' },
  messageTime: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 4, textAlign: 'right' },
  messageInputContainer: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB', gap: 12 },
  messageInput: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14 },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#7C3AED', justifyContent: 'center', alignItems: 'center' },
});
