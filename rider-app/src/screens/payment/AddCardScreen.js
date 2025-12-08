import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AddCardScreen({ navigation }) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(true);
  const [setAsDefault, setSetAsDefault] = useState(false);

  const formatCardNumber = (text) => {
    // Remove non-digits
    const cleaned = text.replace(/\D/g, '');
    // Add space every 4 digits
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpiry = (text) => {
    // Remove non-digits
    const cleaned = text.replace(/\D/g, '');
    // Add slash after 2 digits
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (text) => {
    setCardNumber(formatCardNumber(text));
  };

  const handleExpiryChange = (text) => {
    setExpiryDate(formatExpiry(text));
  };

  const handleCvvChange = (text) => {
    setCvv(text.replace(/\D/g, '').slice(0, 4));
  };

  const detectCardType = () => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5')) return 'mastercard';
    if (number.startsWith('3')) return 'amex';
    return 'unknown';
  };

  const handleSaveCard = () => {
    if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
      alert('Please fill in all fields');
      return;
    }

    // Validate card number (basic check)
    if (cardNumber.replace(/\s/g, '').length < 13) {
      alert('Please enter a valid card number');
      return;
    }

    // Validate expiry
    if (expiryDate.length !== 5) {
      alert('Please enter a valid expiry date (MM/YY)');
      return;
    }

    // Validate CVV
    if (cvv.length < 3) {
      alert('Please enter a valid CVV');
      return;
    }

    alert('Card added successfully!');
    navigation.goBack();
  };

  const cardType = detectCardType();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Card</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Card Preview */}
        <View style={styles.cardPreview}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardBrand}>
                {cardType === 'visa' ? 'VISA' : cardType === 'mastercard' ? 'MASTERCARD' : cardType === 'amex' ? 'AMEX' : ''}
              </Text>
              <Ionicons name="card" size={32} color="#FFFFFF" opacity={0.8} />
            </View>
            <Text style={styles.cardNumberPreview}>
              {cardNumber || '•••• •••• •••• ••••'}
            </Text>
            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.cardLabel}>Card Holder</Text>
                <Text style={styles.cardValue}>
                  {cardHolder || 'YOUR NAME'}
                </Text>
              </View>
              <View>
                <Text style={styles.cardLabel}>Expires</Text>
                <Text style={styles.cardValue}>
                  {expiryDate || 'MM/YY'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Card Form */}
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Card Number</Text>
          <TextInput
            style={styles.input}
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChangeText={handleCardNumberChange}
            keyboardType="number-pad"
            maxLength={19}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Card Holder Name</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            value={cardHolder}
            onChangeText={setCardHolder}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formSection, { flex: 1 }]}>
            <Text style={styles.formLabel}>Expiry Date</Text>
            <TextInput
              style={styles.input}
              placeholder="MM/YY"
              value={expiryDate}
              onChangeText={handleExpiryChange}
              keyboardType="number-pad"
              maxLength={5}
            />
          </View>

          <View style={[styles.formSection, { flex: 1 }]}>
            <Text style={styles.formLabel}>CVV</Text>
            <View style={styles.cvvContainer}>
              <TextInput
                style={styles.input}
                placeholder="123"
                value={cvv}
                onChangeText={handleCvvChange}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={4}
              />
              <TouchableOpacity style={styles.cvvInfo}>
                <Ionicons name="information-circle-outline" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Options */}
        <View style={styles.optionsCard}>
          <View style={styles.optionRow}>
            <View style={styles.optionLeft}>
              <Ionicons name="save-outline" size={20} color="#7C3AED" />
              <Text style={styles.optionText}>Save this card</Text>
            </View>
            <Switch
              value={saveCard}
              onValueChange={setSaveCard}
              trackColor={{ false: '#E5E7EB', true: '#C4B5FD' }}
              thumbColor={saveCard ? '#7C3AED' : '#9CA3AF'}
            />
          </View>

          {saveCard && (
            <>
              <View style={styles.divider} />
              <View style={styles.optionRow}>
                <View style={styles.optionLeft}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#7C3AED" />
                  <Text style={styles.optionText}>Set as default payment</Text>
                </View>
                <Switch
                  value={setAsDefault}
                  onValueChange={setSetAsDefault}
                  trackColor={{ false: '#E5E7EB', true: '#C4B5FD' }}
                  thumbColor={setAsDefault ? '#7C3AED' : '#9CA3AF'}
                />
              </View>
            </>
          )}
        </View>

        {/* Security Info */}
        <View style={styles.securityCard}>
          <Ionicons name="shield-checkmark" size={24} color="#10B981" />
          <View style={styles.securityInfo}>
            <Text style={styles.securityTitle}>Your card is secure</Text>
            <Text style={styles.securityText}>
              We use bank-level encryption to protect your payment information.
              Your CVV is never stored.
            </Text>
          </View>
        </View>

        {/* Accepted Cards */}
        <View style={styles.acceptedCards}>
          <Text style={styles.acceptedCardsTitle}>Accepted Cards</Text>
          <View style={styles.cardLogos}>
            <View style={styles.cardLogo}>
              <Text style={styles.cardLogoText}>VISA</Text>
            </View>
            <View style={styles.cardLogo}>
              <Text style={styles.cardLogoText}>MC</Text>
            </View>
            <View style={styles.cardLogo}>
              <Text style={styles.cardLogoText}>AMEX</Text>
            </View>
            <View style={styles.cardLogo}>
              <Text style={styles.cardLogoText}>DISC</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!cardNumber || !cardHolder || !expiryDate || !cvv) && styles.submitButtonDisabled,
          ]}
          onPress={handleSaveCard}
          disabled={!cardNumber || !cardHolder || !expiryDate || !cvv}
        >
          <Text style={styles.submitButtonText}>Add Card</Text>
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
  cardPreview: {
    padding: 16,
  },
  card: {
    backgroundColor: '#7C3AED',
    borderRadius: 16,
    padding: 24,
    height: 200,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBrand: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  cardNumberPreview: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 10,
    color: '#E9D5FF',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  formSection: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cvvContainer: {
    position: 'relative',
  },
  cvvInfo: {
    position: 'absolute',
    right: 12,
    top: 16,
  },
  optionsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  securityCard: {
    flexDirection: 'row',
    backgroundColor: '#D1FAE5',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  securityInfo: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#047857',
    marginBottom: 4,
  },
  securityText: {
    fontSize: 13,
    color: '#047857',
    lineHeight: 18,
  },
  acceptedCards: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  acceptedCardsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  cardLogos: {
    flexDirection: 'row',
    gap: 8,
  },
  cardLogo: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardLogoText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
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
