/**
 * SMS Service
 * Handles all SMS sending functionality using Twilio
 */

class SMSService {
  constructor() {
    this.client = null;
    this.initialized = false;
    this.phoneNumber = null;
  }

  /**
   * Initialize the Twilio client
   */
  initialize() {
    if (this.initialized) return;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && this.phoneNumber) {
      const twilio = require('twilio');
      this.client = twilio(accountSid, authToken);
      this.initialized = true;
      console.log('SMS service initialized');
    } else {
      console.warn('SMS service not configured - Twilio credentials missing');
    }
  }

  /**
   * Send an SMS
   */
  async send(to, body) {
    if (!this.client) {
      console.warn('SMS not sent - service not configured:', { to, body: body.substring(0, 50) });
      return { success: false, reason: 'SMS service not configured' };
    }

    try {
      // Ensure phone number has country code
      const formattedNumber = this.formatPhoneNumber(to);

      const message = await this.client.messages.create({
        body,
        from: this.phoneNumber,
        to: formattedNumber,
      });

      console.log('SMS sent:', message.sid);
      return { success: true, messageId: message.sid };
    } catch (error) {
      console.error('SMS send error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Format phone number to E.164 format
   */
  formatPhoneNumber(phone) {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // Add country code if missing (default to US +1)
    if (cleaned.length === 10) {
      cleaned = '1' + cleaned;
    }

    return '+' + cleaned;
  }

  /**
   * Send OTP verification SMS
   */
  async sendOTP(phoneNumber, otp) {
    const body = `Your RideOn verification code is: ${otp}. This code expires in 10 minutes.`;
    return this.send(phoneNumber, body);
  }

  /**
   * Send trip confirmation SMS to rider
   */
  async sendTripConfirmation(phoneNumber, trip) {
    const body = `RideOn: Your ride is confirmed! Driver is on the way. Vehicle: ${trip.vehicleType}. Track in app.`;
    return this.send(phoneNumber, body);
  }

  /**
   * Send driver arrival notification
   */
  async sendDriverArrived(phoneNumber, driverName, vehicleInfo) {
    const body = `RideOn: ${driverName} has arrived in ${vehicleInfo}. Please proceed to pickup.`;
    return this.send(phoneNumber, body);
  }

  /**
   * Send trip completion SMS with receipt
   */
  async sendTripReceipt(phoneNumber, trip) {
    const body = `RideOn Receipt: Trip completed. Total: $${trip.finalFare || trip.estimatedFare}. Thank you for riding!`;
    return this.send(phoneNumber, body);
  }

  /**
   * Send new trip request to driver
   */
  async sendTripRequest(phoneNumber, pickup, estimatedFare) {
    const body = `RideOn: New trip request! Pickup: ${pickup}. Est. fare: $${estimatedFare}. Open app to accept.`;
    return this.send(phoneNumber, body);
  }

  /**
   * Send split fare invitation SMS
   */
  async sendSplitFareInvitation(phoneNumber, inviterName, amount) {
    const body = `RideOn: ${inviterName} invited you to split a fare. Your share: $${amount}. Download RideOn to pay.`;
    return this.send(phoneNumber, body);
  }

  /**
   * Send emergency alert SMS
   */
  async sendEmergencyAlert(phoneNumber, tripId, location) {
    const body = `RideOn EMERGENCY: Alert triggered for trip ${tripId}. Location: ${location.latitude}, ${location.longitude}. Please respond immediately.`;
    return this.send(phoneNumber, body);
  }

  /**
   * Send driver approval SMS
   */
  async sendDriverApproval(phoneNumber, approved) {
    const body = approved
      ? 'RideOn: Congratulations! Your driver application is approved. Start earning today!'
      : 'RideOn: Your driver application needs attention. Please check your email for details.';
    return this.send(phoneNumber, body);
  }

  /**
   * Send payment reminder SMS
   */
  async sendPaymentReminder(phoneNumber, amount, dueDate) {
    const body = `RideOn: Payment reminder - $${amount} due by ${dueDate}. Update payment method in app to continue riding.`;
    return this.send(phoneNumber, body);
  }

  /**
   * Send promotional SMS
   */
  async sendPromo(phoneNumber, promoCode, discount) {
    const body = `RideOn: Use code ${promoCode} for ${discount}% off your next ride! Limited time offer.`;
    return this.send(phoneNumber, body);
  }
}

// Export singleton instance
const smsService = new SMSService();
smsService.initialize();

module.exports = smsService;
