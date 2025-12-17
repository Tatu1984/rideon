const { Payment, Trip, Rider, Driver } = require('../models');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Create payment intent
 */
exports.createPaymentIntent = async (req, res) => {
  try {
    const { tripId, amount, paymentMethod } = req.body;

    const rider = await Rider.findOne({
      where: { userId: req.user.id }
    });

    if (!rider) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RIDER_NOT_FOUND',
          message: 'Rider profile not found'
        }
      });
    }

    const trip = await Trip.findByPk(tripId);

    if (!trip || trip.riderId !== rider.id) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TRIP_NOT_FOUND',
          message: 'Trip not found'
        }
      });
    }

    if (paymentMethod === 'card') {
      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          tripId: trip.id,
          riderId: rider.id
        }
      });

      res.json({
        success: true,
        data: {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id
        }
      });
    } else {
      // For cash/wallet/upi, just return success
      res.json({
        success: true,
        data: {
          paymentMethod,
          amount
        }
      });
    }
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to create payment intent'
      }
    });
  }
};

/**
 * Confirm payment
 */
exports.confirmPayment = async (req, res) => {
  try {
    const { tripId, paymentIntentId, paymentMethod } = req.body;

    const rider = await Rider.findOne({
      where: { userId: req.user.id }
    });

    if (!rider) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RIDER_NOT_FOUND',
          message: 'Rider profile not found'
        }
      });
    }

    const trip = await Trip.findByPk(tripId);

    if (!trip || trip.riderId !== rider.id) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TRIP_NOT_FOUND',
          message: 'Trip not found'
        }
      });
    }

    let paymentStatus = 'completed';
    let transactionId = paymentIntentId;

    if (paymentMethod === 'card' && paymentIntentId) {
      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        paymentStatus = 'failed';
      }
    }

    // Create payment record
    const payment = await Payment.create({
      tripId: trip.id,
      amount: trip.totalFare,
      paymentMethod,
      transactionId,
      status: paymentStatus
    });

    // Update trip payment status
    await trip.update({ paymentStatus });

    // Calculate platform fee and driver earnings
    const platformFeePercentage = 20; // 20%
    const platformFee = (parseFloat(trip.totalFare) * platformFeePercentage) / 100;
    const driverEarnings = parseFloat(trip.totalFare) - platformFee;

    await trip.update({
      platformFee,
      driverEarnings
    });

    res.json({
      success: true,
      data: payment,
      message: 'Payment confirmed successfully'
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to confirm payment'
      }
    });
  }
};

/**
 * Get payment history
 */
exports.getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const rider = await Rider.findOne({
      where: { userId: req.user.id }
    });

    if (!rider) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RIDER_NOT_FOUND',
          message: 'Rider profile not found'
        }
      });
    }

    const { count, rows: payments } = await Payment.findAndCountAll({
      include: [
        {
          model: Trip,
          as: 'trip',
          where: { riderId: rider.id },
          attributes: ['id', 'pickupAddress', 'dropoffAddress', 'totalFare', 'completedAt']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch payment history'
      }
    });
  }
};

/**
 * Request refund
 */
exports.requestRefund = async (req, res) => {
  try {
    const { paymentId, reason } = req.body;

    const payment = await Payment.findByPk(paymentId, {
      include: [
        {
          model: Trip,
          as: 'trip',
          include: [{ model: Rider, as: 'rider' }]
        }
      ]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PAYMENT_NOT_FOUND',
          message: 'Payment not found'
        }
      });
    }

    const rider = await Rider.findOne({
      where: { userId: req.user.id }
    });

    if (!rider || payment.trip.riderId !== rider.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to request refund for this payment'
        }
      });
    }

    if (payment.status === 'refunded') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_REFUNDED',
          message: 'Payment has already been refunded'
        }
      });
    }

    // Process refund with Stripe if card payment
    if (payment.paymentMethod === 'card' && payment.transactionId) {
      await stripe.refunds.create({
        payment_intent: payment.transactionId,
        reason: 'requested_by_customer'
      });
    }

    await payment.update({
      status: 'refunded',
      refundReason: reason,
      refundedAt: new Date()
    });

    res.json({
      success: true,
      data: payment,
      message: 'Refund processed successfully'
    });
  } catch (error) {
    console.error('Request refund error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to process refund'
      }
    });
  }
};

/**
 * Handle Stripe webhook events
 * This endpoint should NOT use the auth middleware
 */
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      // For development without webhook secret
      event = req.body;
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object);
      break;
    case 'charge.refunded':
      await handleRefund(event.data.object);
      break;
    case 'charge.dispute.created':
      await handleDispute(event.data.object);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent) {
  try {
    const { tripId, riderId } = paymentIntent.metadata;

    if (!tripId) {
      console.log('No tripId in payment metadata');
      return;
    }

    const trip = await Trip.findByPk(tripId);
    if (!trip) {
      console.error(`Trip ${tripId} not found for payment`);
      return;
    }

    // Check if payment record already exists
    let payment = await Payment.findOne({
      where: { transactionId: paymentIntent.id }
    });

    if (!payment) {
      // Create payment record
      payment = await Payment.create({
        tripId,
        amount: paymentIntent.amount / 100, // Convert from cents
        paymentMethod: 'card',
        transactionId: paymentIntent.id,
        status: 'completed',
        stripeChargeId: paymentIntent.latest_charge
      });
    } else {
      await payment.update({ status: 'completed' });
    }

    // Update trip payment status
    await trip.update({ paymentStatus: 'completed' });

    // Calculate and update driver earnings
    const platformFeePercentage = 20;
    const platformFee = (parseFloat(trip.totalFare) * platformFeePercentage) / 100;
    const driverEarnings = parseFloat(trip.totalFare) - platformFee;

    await trip.update({
      platformFee,
      driverEarnings
    });

    // Update driver's available balance if driver exists
    if (trip.driverId) {
      const driver = await Driver.findByPk(trip.driverId);
      if (driver) {
        await driver.increment('availableBalance', { by: driverEarnings });
        await driver.increment('totalEarnings', { by: driverEarnings });
      }
    }

    console.log(`Payment ${paymentIntent.id} succeeded for trip ${tripId}`);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailure(paymentIntent) {
  try {
    const { tripId } = paymentIntent.metadata;

    if (!tripId) return;

    const trip = await Trip.findByPk(tripId);
    if (!trip) return;

    // Update or create payment record
    let payment = await Payment.findOne({
      where: { transactionId: paymentIntent.id }
    });

    if (payment) {
      await payment.update({
        status: 'failed',
        failureReason: paymentIntent.last_payment_error?.message || 'Payment failed'
      });
    } else {
      await Payment.create({
        tripId,
        amount: paymentIntent.amount / 100,
        paymentMethod: 'card',
        transactionId: paymentIntent.id,
        status: 'failed',
        failureReason: paymentIntent.last_payment_error?.message || 'Payment failed'
      });
    }

    await trip.update({ paymentStatus: 'failed' });

    console.log(`Payment ${paymentIntent.id} failed for trip ${tripId}`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

/**
 * Handle refund
 */
async function handleRefund(charge) {
  try {
    const payment = await Payment.findOne({
      where: { stripeChargeId: charge.id }
    });

    if (!payment) {
      console.log(`No payment found for charge ${charge.id}`);
      return;
    }

    await payment.update({
      status: 'refunded',
      refundedAt: new Date()
    });

    // Update trip payment status
    const trip = await Trip.findByPk(payment.tripId);
    if (trip) {
      await trip.update({ paymentStatus: 'refunded' });

      // Deduct from driver's balance if refunded
      if (trip.driverId && trip.driverEarnings) {
        const driver = await Driver.findByPk(trip.driverId);
        if (driver) {
          await driver.decrement('availableBalance', { by: parseFloat(trip.driverEarnings) });
        }
      }
    }

    console.log(`Refund processed for charge ${charge.id}`);
  } catch (error) {
    console.error('Error handling refund:', error);
  }
}

/**
 * Handle dispute
 */
async function handleDispute(dispute) {
  try {
    console.log(`Dispute created for charge ${dispute.charge}`);

    // Find payment by charge ID
    const payment = await Payment.findOne({
      where: { stripeChargeId: dispute.charge }
    });

    if (payment) {
      await payment.update({
        status: 'disputed',
        disputeReason: dispute.reason
      });

      // Could also send notification to admin here
    }
  } catch (error) {
    console.error('Error handling dispute:', error);
  }
}

/**
 * Create Stripe Connect account for driver payouts
 */
exports.createConnectAccount = async (req, res) => {
  try {
    const driver = await Driver.findOne({
      where: { userId: req.user.id }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DRIVER_NOT_FOUND',
          message: 'Driver profile not found'
        }
      });
    }

    // Create Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: req.user.email,
      capabilities: {
        transfers: { requested: true }
      },
      metadata: {
        driverId: driver.id,
        userId: req.user.id
      }
    });

    // Update driver with Stripe account ID
    await driver.update({ stripeAccountId: account.id });

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.APP_URL}/driver/stripe/refresh`,
      return_url: `${process.env.APP_URL}/driver/stripe/return`,
      type: 'account_onboarding'
    });

    res.json({
      success: true,
      data: {
        accountId: account.id,
        onboardingUrl: accountLink.url
      }
    });
  } catch (error) {
    console.error('Create Connect account error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to create Stripe account'
      }
    });
  }
};

/**
 * Process driver payout
 */
exports.processDriverPayout = async (req, res) => {
  try {
    const { amount } = req.body;

    const driver = await Driver.findOne({
      where: { userId: req.user.id }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DRIVER_NOT_FOUND',
          message: 'Driver profile not found'
        }
      });
    }

    if (!driver.stripeAccountId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_STRIPE_ACCOUNT',
          message: 'Please set up your payout account first'
        }
      });
    }

    const availableBalance = parseFloat(driver.availableBalance || 0);

    if (amount > availableBalance) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_BALANCE',
          message: 'Insufficient balance for payout'
        }
      });
    }

    // Create transfer to driver's Connect account
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      destination: driver.stripeAccountId,
      metadata: {
        driverId: driver.id,
        userId: req.user.id
      }
    });

    // Update driver's balance
    await driver.decrement('availableBalance', { by: amount });

    res.json({
      success: true,
      data: {
        transferId: transfer.id,
        amount,
        newBalance: availableBalance - amount
      },
      message: 'Payout initiated successfully'
    });
  } catch (error) {
    console.error('Process payout error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to process payout'
      }
    });
  }
};
