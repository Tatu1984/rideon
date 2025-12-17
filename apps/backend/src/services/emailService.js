/**
 * Email Service
 * Handles all email sending functionality using Nodemailer
 */

const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  /**
   * Initialize the email transporter
   */
  initialize() {
    if (this.initialized) return;

    const config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    };

    // Only create transporter if credentials are provided
    if (config.auth.user && config.auth.pass) {
      this.transporter = nodemailer.createTransport(config);
      this.initialized = true;
      console.log('Email service initialized');
    } else {
      console.warn('Email service not configured - SMTP credentials missing');
    }
  }

  /**
   * Send an email
   */
  async send({ to, subject, html, text }) {
    if (!this.transporter) {
      console.warn('Email not sent - service not configured:', { to, subject });
      return { success: false, reason: 'Email service not configured' };
    }

    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || `"RideOn" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send welcome email after registration
   */
  async sendWelcomeEmail(user) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7C3AED;">Welcome to RideOn!</h1>
        <p>Hi ${user.firstName || 'there'},</p>
        <p>Thank you for joining RideOn. We're excited to have you on board!</p>
        <p>You can now:</p>
        <ul>
          <li>Book rides instantly</li>
          <li>Track your driver in real-time</li>
          <li>Pay securely through the app</li>
        </ul>
        <p>If you have any questions, our support team is here to help.</p>
        <p>Happy riding!</p>
        <p>The RideOn Team</p>
      </div>
    `;

    return this.send({
      to: user.email,
      subject: 'Welcome to RideOn!',
      html,
    });
  }

  /**
   * Send trip receipt email
   */
  async sendTripReceipt(user, trip) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7C3AED;">Trip Receipt</h1>
        <p>Hi ${user.firstName || 'there'},</p>
        <p>Thank you for riding with RideOn!</p>

        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Trip Details</h3>
          <p><strong>Date:</strong> ${new Date(trip.createdAt).toLocaleDateString()}</p>
          <p><strong>From:</strong> ${trip.pickupAddress}</p>
          <p><strong>To:</strong> ${trip.dropoffAddress}</p>
          <p><strong>Distance:</strong> ${trip.distance} km</p>
          <p><strong>Duration:</strong> ${trip.duration} mins</p>
          <hr style="border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 18px;"><strong>Total:</strong> $${trip.finalFare || trip.estimatedFare}</p>
        </div>

        <p>Rate your trip in the app to help us improve!</p>
        <p>Thanks for choosing RideOn.</p>
      </div>
    `;

    return this.send({
      to: user.email,
      subject: `Your RideOn Trip Receipt - $${trip.finalFare || trip.estimatedFare}`,
      html,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7C3AED;">Reset Your Password</h1>
        <p>Hi ${user.firstName || 'there'},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #7C3AED; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Reset Password
          </a>
        </div>

        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>The RideOn Team</p>
      </div>
    `;

    return this.send({
      to: user.email,
      subject: 'Reset Your RideOn Password',
      html,
    });
  }

  /**
   * Send driver approval email
   */
  async sendDriverApprovalEmail(driver, approved) {
    const html = approved ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10B981;">Congratulations! You're Approved!</h1>
        <p>Hi ${driver.firstName || 'there'},</p>
        <p>Great news! Your driver application has been approved.</p>
        <p>You can now:</p>
        <ul>
          <li>Go online and start accepting rides</li>
          <li>Earn money on your own schedule</li>
          <li>Track your earnings in real-time</li>
        </ul>
        <p>Download our driver app and start earning today!</p>
        <p>Welcome to the RideOn driver community!</p>
      </div>
    ` : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #EF4444;">Application Update</h1>
        <p>Hi ${driver.firstName || 'there'},</p>
        <p>Thank you for your interest in driving with RideOn.</p>
        <p>Unfortunately, we're unable to approve your application at this time.</p>
        <p>This could be due to incomplete documentation or other requirements not being met.</p>
        <p>Please contact our support team for more information.</p>
        <p>The RideOn Team</p>
      </div>
    `;

    return this.send({
      to: driver.email,
      subject: approved ? 'Your RideOn Driver Application is Approved!' : 'RideOn Driver Application Update',
      html,
    });
  }

  /**
   * Send split fare invitation email
   */
  async sendSplitFareInvitation(email, inviter, trip, shareAmount) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7C3AED;">You're Invited to Split a Fare!</h1>
        <p>Hi there,</p>
        <p>${inviter.firstName || 'Someone'} has invited you to split a ride fare on RideOn.</p>

        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your Share</h3>
          <p style="font-size: 24px; font-weight: bold; color: #7C3AED;">$${shareAmount}</p>
          <p><strong>From:</strong> ${trip.pickupAddress}</p>
          <p><strong>To:</strong> ${trip.dropoffAddress}</p>
        </div>

        <p>Download RideOn to pay your share and start enjoying rides with friends!</p>
        <p>The RideOn Team</p>
      </div>
    `;

    return this.send({
      to: email,
      subject: `${inviter.firstName || 'Someone'} invited you to split a fare on RideOn`,
      html,
    });
  }

  /**
   * Send OTP verification email
   */
  async sendOTPEmail(user, otp) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7C3AED;">Verify Your Email</h1>
        <p>Hi ${user.firstName || 'there'},</p>
        <p>Your verification code is:</p>

        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #7C3AED;">${otp}</span>
        </div>

        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <p>The RideOn Team</p>
      </div>
    `;

    return this.send({
      to: user.email,
      subject: 'Your RideOn Verification Code',
      html,
    });
  }
}

// Export singleton instance
const emailService = new EmailService();
emailService.initialize();

module.exports = emailService;
