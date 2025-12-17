import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CardField, useStripe, useConfirmSetupIntent } from '@stripe/stripe-react-native';
import PaymentService from '../../services/payment.service';

export default function AddCardScreen({ navigation }) {
  const { createPaymentMethod } = useStripe();
  const { confirmSetupIntent } = useConfirmSetupIntent();

  const [cardComplete, setCardComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [setAsDefault, setSetAsDefault] = useState(true);

  const handleAddCard = async () => {
    if (!cardComplete) {
      Alert.alert('Error', 'Please complete the card details');
      return;
    }

    setLoading(true);

    try {
      // Create a payment method with Stripe
      const { paymentMethod, error } = await createPaymentMethod({
        paymentMethodType: 'Card',
      });

      if (error) {
        Alert.alert('Error', error.message);
        setLoading(false);
        return;
      }

      // Save the payment method to our backend
      await PaymentService.savePaymentMethod(paymentMethod.id, setAsDefault);

      Alert.alert(
        'Success',
        'Card added successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error adding card:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error?.message || 'Failed to add card. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

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
        {/* Card Input Section */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Card Details</Text>
          <Text style={styles.sectionSubtitle}>
            Enter your card information securely
          </Text>

          <View style={styles.cardFieldContainer}>
            <CardField
              postalCodeEnabled={true}
              placeholders={{
                number: '4242 4242 4242 4242',
              }}
              cardStyle={styles.cardFieldStyle}
              style={styles.cardField}
              onCardChange={(cardDetails) => {
                setCardComplete(cardDetails.complete);
              }}
            />
          </View>
        </View>

        {/* Set as Default Option */}
        <TouchableOpacity
          style={styles.optionRow}
          onPress={() => setSetAsDefault(!setAsDefault)}
        >
          <View style={styles.optionLeft}>
            <Ionicons
              name={setAsDefault ? "checkmark-circle" : "ellipse-outline"}
              size={24}
              color={setAsDefault ? "#7C3AED" : "#9CA3AF"}
            />
            <Text style={styles.optionText}>Set as default payment method</Text>
          </View>
        </TouchableOpacity>

        {/* Security Info */}
        <View style={styles.securityCard}>
          <Ionicons name="shield-checkmark" size={24} color="#10B981" />
          <View style={styles.securityInfo}>
            <Text style={styles.securityTitle}>Your card is secure</Text>
            <Text style={styles.securityText}>
              Your payment details are encrypted and securely processed by Stripe.
              We never store your full card number.
            </Text>
          </View>
        </View>

        {/* Stripe Badge */}
        <View style={styles.stripeBadge}>
          <Ionicons name="lock-closed" size={16} color="#6B7280" />
          <Text style={styles.stripeBadgeText}>Powered by Stripe</Text>
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
            (!cardComplete || loading) && styles.submitButtonDisabled,
          ]}
          onPress={handleAddCard}
          disabled={!cardComplete || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Add Card</Text>
          )}
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
  cardSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  cardFieldContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardField: {
    width: '100%',
    height: 50,
  },
  cardFieldStyle: {
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    fontSize: 16,
    placeholderColor: '#9CA3AF',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
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
  stripeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginVertical: 16,
  },
  stripeBadgeText: {
    fontSize: 12,
    color: '#6B7280',
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
