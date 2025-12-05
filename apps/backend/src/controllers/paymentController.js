const { Payment, Trip, Rider } = require('../models');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
