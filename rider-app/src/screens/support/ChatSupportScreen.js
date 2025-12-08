import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ChatSupportScreen({ navigation }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, type: 'received', text: 'Hi! How can I help you today?', time: '10:30 AM' },
    { id: 2, type: 'sent', text: 'I have a question about my recent trip', time: '10:31 AM' },
    { id: 3, type: 'received', text: 'Sure! Please provide your trip ID and I\'ll look into it.', time: '10:31 AM' },
  ]);

  const handleSend = () => {
    if (message.trim()) {
      setMessages([...messages, {
        id: messages.length + 1,
        type: 'sent',
        text: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setMessage('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Support Agent</Text>
          <Text style={styles.headerSubtitle}>Online</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.messagesContainer}>
        {messages.map(msg => (
          <View
            key={msg.id}
            style={[styles.messageBubble, msg.type === 'sent' ? styles.sentMessage : styles.receivedMessage]}
          >
            <Text style={[styles.messageText, msg.type === 'sent' && styles.sentMessageText]}>
              {msg.text}
            </Text>
            <Text style={[styles.messageTime, msg.type === 'sent' && styles.sentMessageTime]}>
              {msg.time}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <Ionicons name="attach" size={24} color="#6B7280" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Ionicons name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginRight: 12,
  },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  headerSubtitle: { fontSize: 12, color: '#10B981' },
  messagesContainer: { flex: 1, padding: 16 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 12 },
  sentMessage: { alignSelf: 'flex-end', backgroundColor: '#7C3AED' },
  receivedMessage: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF' },
  messageText: { fontSize: 15, color: '#1F2937' },
  sentMessageText: { color: '#FFFFFF' },
  messageTime: { fontSize: 11, color: '#6B7280', marginTop: 4 },
  sentMessageTime: { color: '#E9D5FF' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  attachButton: { padding: 8 },
  input: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginHorizontal: 8, maxHeight: 100 },
  sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#7C3AED', justifyContent: 'center', alignItems: 'center' },
});
