/**
 * Payment Service
 * Handles Stripe payment integration for the rider app
 */

import api from './api.service';

const PaymentService = {
  /**
   * Create a payment intent for a trip
   * @param {number} amount - Amount in cents
   * @param {string} currency - Currency code (default: 'usd')
   * @param {string} tripId - Associated trip ID
   * @returns {Promise<{clientSecret: string, paymentIntentId: string}>}
   */
  createPaymentIntent: async (amount, currency = 'usd', tripId = null, paymentMethod = 'card') => {
    try {
      const response = await api.post('/payment/intent', {
        amount,
        tripId,
        paymentMethod,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  /**
   * Confirm a payment
   * @param {string} paymentIntentId - Stripe payment intent ID
   * @param {string} paymentMethodId - Stripe payment method ID
   * @returns {Promise<{success: boolean, payment: object}>}
   */
  confirmPayment: async (tripId, paymentIntentId, paymentMethod = 'card') => {
    try {
      const response = await api.post('/payment/confirm', {
        tripId,
        paymentIntentId,
        paymentMethod,
      });
      return response.data;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  },

  /**
   * Get saved payment methods for the user
   * @returns {Promise<Array>} List of saved payment methods
   */
  getSavedPaymentMethods: async () => {
    try {
      const response = await api.get('/payments/methods');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  },

  /**
   * Save a new payment method
   * @param {string} paymentMethodId - Stripe payment method ID
   * @param {boolean} setDefault - Whether to set as default
   * @returns {Promise<object>}
   */
  savePaymentMethod: async (paymentMethodId, setDefault = false) => {
    try {
      const response = await api.post('/payments/methods', {
        paymentMethodId,
        setDefault,
      });
      return response.data;
    } catch (error) {
      console.error('Error saving payment method:', error);
      throw error;
    }
  },

  /**
   * Delete a saved payment method
   * @param {string} paymentMethodId - Payment method ID to delete
   * @returns {Promise<{success: boolean}>}
   */
  deletePaymentMethod: async (paymentMethodId) => {
    try {
      const response = await api.delete(`/payments/methods/${paymentMethodId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  },

  /**
   * Set default payment method
   * @param {string} paymentMethodId - Payment method ID
   * @returns {Promise<{success: boolean}>}
   */
  setDefaultPaymentMethod: async (paymentMethodId) => {
    try {
      const response = await api.put(`/payments/methods/${paymentMethodId}/default`);
      return response.data;
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  },

  /**
   * Get payment history
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<{payments: Array, pagination: object}>}
   */
  getPaymentHistory: async (page = 1, limit = 20) => {
    try {
      const response = await api.get('/payment/history', {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  },

  /**
   * Request a refund for a payment
   * @param {string} paymentId - Payment ID to refund
   * @param {string} reason - Reason for refund
   * @returns {Promise<{success: boolean, refund: object}>}
   */
  requestRefund: async (paymentId, reason) => {
    try {
      const response = await api.post('/payment/refund', {
        paymentId,
        reason,
      });
      return response.data;
    } catch (error) {
      console.error('Error requesting refund:', error);
      throw error;
    }
  },

  /**
   * Add money to wallet
   * @param {number} amount - Amount in cents
   * @returns {Promise<{clientSecret: string}>}
   */
  createWalletTopUp: async (amount) => {
    try {
      const response = await api.post('/rider/wallet/add', {
        amount,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating wallet top-up:', error);
      throw error;
    }
  },

  /**
   * Get wallet balance
   * @returns {Promise<{balance: number}>}
   */
  getWalletBalance: async () => {
    try {
      const response = await api.get('/rider/wallet');
      return response.data;
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      throw error;
    }
  },
};

export default PaymentService;
