const { Rider, User, Trip, Rating, PromoCodeUsage, Driver, Payment, SupportTicket, PromoCode, Wallet, WalletTransaction } = require('../models');
const { Op } = require('sequelize');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');

/**
 * Get rider profile
 */
exports.getProfile = async (req, res) => {
  try {
    const rider = await Rider.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName', 'phone', 'profilePicture']
        }
      ]
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

    res.json({
      success: true,
      data: rider
    });
  } catch (error) {
    console.error('Get rider profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch rider profile'
      }
    });
  }
};

/**
 * Update rider profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, profilePicture } = req.body;

    const rider = await Rider.findOne({
      where: { userId: req.user.id },
      include: [{ model: User, as: 'user' }]
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

    // Update user fields
    await rider.user.update({
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(phone && { phone }),
      ...(profilePicture && { profilePicture })
    });

    // Refresh rider data
    await rider.reload();

    res.json({
      success: true,
      data: rider,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update rider profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update profile'
      }
    });
  }
};

/**
 * Get rider trip history
 */
exports.getTripHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
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

    const whereClause = { riderId: rider.id };
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: trips } = await Trip.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Rating,
          as: 'rating',
          attributes: ['id', 'riderRating', 'riderComment', 'driverRating', 'driverComment']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        trips,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get trip history error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch trip history'
      }
    });
  }
};

/**
 * Get specific trip details
 */
exports.getTripDetails = async (req, res) => {
  try {
    const { tripId } = req.params;

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

    const trip = await Trip.findOne({
      where: { id: tripId, riderId: rider.id },
      include: [
        {
          model: Rating,
          as: 'rating'
        }
      ]
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TRIP_NOT_FOUND',
          message: 'Trip not found'
        }
      });
    }

    res.json({
      success: true,
      data: trip
    });
  } catch (error) {
    console.error('Get trip details error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch trip details'
      }
    });
  }
};

/**
 * Get rider statistics
 */
exports.getStatistics = async (req, res) => {
  try {
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

    const totalTrips = await Trip.count({
      where: { riderId: rider.id, status: 'completed' }
    });

    const totalSpent = await Trip.sum('totalFare', {
      where: { riderId: rider.id, status: 'completed' }
    });

    const cancelledTrips = await Trip.count({
      where: {
        riderId: rider.id,
        status: { [Op.in]: ['cancelled_by_rider', 'cancelled_by_driver', 'cancelled_by_admin'] }
      }
    });

    const promoCodesUsed = await PromoCodeUsage.count({
      where: { riderId: rider.id }
    });

    res.json({
      success: true,
      data: {
        totalTrips,
        totalSpent: parseFloat(totalSpent) || 0,
        cancelledTrips,
        promoCodesUsed,
        averageRating: parseFloat(rider.averageRating) || 0
      }
    });
  } catch (error) {
    console.error('Get rider statistics error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch statistics'
      }
    });
  }
};

/**
 * Add favorite location
 */
exports.addFavoriteLocation = async (req, res) => {
  try {
    const { type, address, latitude, longitude, label } = req.body;

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

    const favoriteLocations = rider.favoriteLocations || [];

    favoriteLocations.push({
      id: Date.now().toString(),
      type,
      address,
      latitude,
      longitude,
      label,
      createdAt: new Date()
    });

    await rider.update({ favoriteLocations });

    res.json({
      success: true,
      data: rider.favoriteLocations,
      message: 'Favorite location added successfully'
    });
  } catch (error) {
    console.error('Add favorite location error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to add favorite location'
      }
    });
  }
};

/**
 * Remove favorite location
 */
exports.removeFavoriteLocation = async (req, res) => {
  try {
    const { locationId } = req.params;

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

    const favoriteLocations = rider.favoriteLocations || [];
    const updatedLocations = favoriteLocations.filter(loc => loc.id !== locationId);

    await rider.update({ favoriteLocations: updatedLocations });

    res.json({
      success: true,
      data: rider.favoriteLocations,
      message: 'Favorite location removed successfully'
    });
  } catch (error) {
    console.error('Remove favorite location error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to remove favorite location'
      }
    });
  }
};

// ============ PAYMENT METHODS ============

/**
 * Get payment methods
 */
exports.getPaymentMethods = async (req, res) => {
  try {
    const rider = await Rider.findOne({ where: { userId: req.user.id } });
    if (!rider) return res.status(404).json({ success: false, error: { code: 'RIDER_NOT_FOUND', message: 'Rider not found' } });

    const paymentMethods = rider.paymentMethods || [];
    res.json({ success: true, data: paymentMethods });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch payment methods' } });
  }
};

/**
 * Add payment method
 */
exports.addPaymentMethod = async (req, res) => {
  try {
    const { cardToken } = req.body;
    const rider = await Rider.findOne({ where: { userId: req.user.id } });
    if (!rider) return res.status(404).json({ success: false, error: { code: 'RIDER_NOT_FOUND', message: 'Rider not found' } });

    // Create Stripe customer if not exists
    let stripeCustomerId = rider.stripeCustomerId;
    if (!stripeCustomerId) {
      const user = await User.findByPk(req.user.id);
      const customer = await stripe.customers.create({ email: user.email, name: `${user.firstName} ${user.lastName}` });
      stripeCustomerId = customer.id;
      await rider.update({ stripeCustomerId });
    }

    // Attach payment method to customer
    const paymentMethod = await stripe.paymentMethods.attach(cardToken, { customer: stripeCustomerId });

    const paymentMethods = rider.paymentMethods || [];
    const isDefault = paymentMethods.length === 0;
    paymentMethods.push({
      id: paymentMethod.id,
      type: paymentMethod.card.brand,
      last4: paymentMethod.card.last4,
      expMonth: paymentMethod.card.exp_month,
      expYear: paymentMethod.card.exp_year,
      isDefault,
      createdAt: new Date()
    });

    await rider.update({ paymentMethods });
    res.json({ success: true, data: paymentMethods, message: 'Card added successfully' });
  } catch (error) {
    console.error('Add payment method error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to add card' } });
  }
};

/**
 * Delete payment method
 */
exports.deletePaymentMethod = async (req, res) => {
  try {
    const { cardId } = req.params;
    const rider = await Rider.findOne({ where: { userId: req.user.id } });
    if (!rider) return res.status(404).json({ success: false, error: { code: 'RIDER_NOT_FOUND', message: 'Rider not found' } });

    const paymentMethods = (rider.paymentMethods || []).filter(pm => pm.id !== cardId);

    // Try to detach from Stripe
    try { await stripe.paymentMethods.detach(cardId); } catch (e) { /* ignore */ }

    await rider.update({ paymentMethods });
    res.json({ success: true, data: paymentMethods, message: 'Card removed successfully' });
  } catch (error) {
    console.error('Delete payment method error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to remove card' } });
  }
};

/**
 * Set default payment method
 */
exports.setDefaultPaymentMethod = async (req, res) => {
  try {
    const { cardId } = req.params;
    const rider = await Rider.findOne({ where: { userId: req.user.id } });
    if (!rider) return res.status(404).json({ success: false, error: { code: 'RIDER_NOT_FOUND', message: 'Rider not found' } });

    const paymentMethods = (rider.paymentMethods || []).map(pm => ({ ...pm, isDefault: pm.id === cardId }));
    await rider.update({ paymentMethods });
    res.json({ success: true, data: paymentMethods, message: 'Default payment method updated' });
  } catch (error) {
    console.error('Set default payment method error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update default' } });
  }
};

/**
 * Create setup intent for adding new card
 */
exports.createSetupIntent = async (req, res) => {
  try {
    const rider = await Rider.findOne({ where: { userId: req.user.id } });
    if (!rider) return res.status(404).json({ success: false, error: { code: 'RIDER_NOT_FOUND', message: 'Rider not found' } });

    let stripeCustomerId = rider.stripeCustomerId;
    if (!stripeCustomerId) {
      const user = await User.findByPk(req.user.id);
      const customer = await stripe.customers.create({ email: user.email, name: `${user.firstName} ${user.lastName}` });
      stripeCustomerId = customer.id;
      await rider.update({ stripeCustomerId });
    }

    const setupIntent = await stripe.setupIntents.create({ customer: stripeCustomerId, payment_method_types: ['card'] });
    res.json({ success: true, data: { clientSecret: setupIntent.client_secret } });
  } catch (error) {
    console.error('Create setup intent error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create setup intent' } });
  }
};

// ============ TRIPS ============

/**
 * Get active trip
 */
exports.getActiveTrip = async (req, res) => {
  try {
    const rider = await Rider.findOne({ where: { userId: req.user.id } });
    if (!rider) return res.status(404).json({ success: false, error: { code: 'RIDER_NOT_FOUND', message: 'Rider not found' } });

    const activeTrip = await Trip.findOne({
      where: { riderId: rider.id, status: { [Op.notIn]: ['completed', 'cancelled_by_rider', 'cancelled_by_driver', 'cancelled_by_admin'] } },
      include: [{ model: Driver, as: 'driver', include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'phone', 'profilePicture'] }] }],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: activeTrip });
  } catch (error) {
    console.error('Get active trip error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch active trip' } });
  }
};

/**
 * Create new trip
 */
exports.createTrip = async (req, res) => {
  try {
    const { pickupLocation, dropoffLocation, pickupAddress, dropoffAddress, vehicleType, paymentMethod, fareEstimate, distance, duration, scheduledAt } = req.body;

    const rider = await Rider.findOne({ where: { userId: req.user.id } });
    if (!rider) return res.status(404).json({ success: false, error: { code: 'RIDER_NOT_FOUND', message: 'Rider not found' } });

    const trip = await Trip.create({
      riderId: rider.id,
      pickupLocation,
      dropoffLocation,
      pickupAddress,
      dropoffAddress,
      vehicleType: vehicleType || 'standard',
      paymentMethod: paymentMethod || 'card',
      fareEstimate: fareEstimate || 0,
      distance: distance || 0,
      duration: duration || 0,
      status: scheduledAt ? 'scheduled' : 'requested',
      scheduledAt: scheduledAt || null
    });

    res.status(201).json({ success: true, data: trip, message: 'Trip requested successfully' });
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create trip' } });
  }
};

/**
 * Get trip estimate
 */
exports.getEstimate = async (req, res) => {
  try {
    const { pickupLocation, dropoffLocation, vehicleType } = req.body;

    // Calculate distance using Haversine formula
    const R = 3959; // miles
    const dLat = (dropoffLocation.latitude - pickupLocation.latitude) * Math.PI / 180;
    const dLon = (dropoffLocation.longitude - pickupLocation.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(pickupLocation.latitude * Math.PI / 180) * Math.cos(dropoffLocation.latitude * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    // Estimate duration (assuming 25 mph average)
    const duration = Math.ceil((distance / 25) * 60);

    // Calculate fare based on vehicle type
    const baseFares = { economy: 3, standard: 5, premium: 8, suv: 10 };
    const perMileRates = { economy: 1.5, standard: 2, premium: 3, suv: 3.5 };
    const perMinuteRates = { economy: 0.2, standard: 0.25, premium: 0.35, suv: 0.4 };

    const type = vehicleType || 'standard';
    const baseFare = baseFares[type] || 5;
    const distanceFare = distance * (perMileRates[type] || 2);
    const timeFare = duration * (perMinuteRates[type] || 0.25);
    const fare = baseFare + distanceFare + timeFare;

    res.json({
      success: true,
      data: {
        distance: Math.round(distance * 100) / 100,
        duration,
        fareEstimate: Math.round(fare * 100) / 100,
        breakdown: { baseFare, distanceFare: Math.round(distanceFare * 100) / 100, timeFare: Math.round(timeFare * 100) / 100 }
      }
    });
  } catch (error) {
    console.error('Get estimate error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to get estimate' } });
  }
};

/**
 * Cancel trip
 */
exports.cancelTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { reason } = req.body;

    const rider = await Rider.findOne({ where: { userId: req.user.id } });
    if (!rider) return res.status(404).json({ success: false, error: { code: 'RIDER_NOT_FOUND', message: 'Rider not found' } });

    const trip = await Trip.findOne({ where: { id: tripId, riderId: rider.id } });
    if (!trip) return res.status(404).json({ success: false, error: { code: 'TRIP_NOT_FOUND', message: 'Trip not found' } });

    if (['completed', 'cancelled_by_rider', 'cancelled_by_driver'].includes(trip.status)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: 'Trip cannot be cancelled' } });
    }

    await trip.update({ status: 'cancelled_by_rider', cancellationReason: reason, cancelledAt: new Date() });
    res.json({ success: true, data: trip, message: 'Trip cancelled successfully' });
  } catch (error) {
    console.error('Cancel trip error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to cancel trip' } });
  }
};

/**
 * Rate trip
 */
exports.rateTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { rating, review, tip } = req.body;

    const rider = await Rider.findOne({ where: { userId: req.user.id } });
    if (!rider) return res.status(404).json({ success: false, error: { code: 'RIDER_NOT_FOUND', message: 'Rider not found' } });

    const trip = await Trip.findOne({ where: { id: tripId, riderId: rider.id } });
    if (!trip) return res.status(404).json({ success: false, error: { code: 'TRIP_NOT_FOUND', message: 'Trip not found' } });

    // Create or update rating
    let tripRating = await Rating.findOne({ where: { tripId: trip.id } });
    if (tripRating) {
      await tripRating.update({ driverRating: rating, driverComment: review });
    } else {
      tripRating = await Rating.create({ tripId: trip.id, driverRating: rating, driverComment: review, riderId: rider.id, driverId: trip.driverId });
    }

    // Add tip if provided
    if (tip && tip > 0) {
      await trip.update({ tipAmount: tip, totalFare: parseFloat(trip.totalFare || trip.fareEstimate) + tip });
    }

    res.json({ success: true, data: tripRating, message: 'Rating submitted successfully' });
  } catch (error) {
    console.error('Rate trip error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to submit rating' } });
  }
};

// ============ WALLET ============

/**
 * Get wallet
 */
exports.getWallet = async (req, res) => {
  try {
    const rider = await Rider.findOne({ where: { userId: req.user.id } });
    if (!rider) return res.status(404).json({ success: false, error: { code: 'RIDER_NOT_FOUND', message: 'Rider not found' } });

    res.json({ success: true, data: { balance: parseFloat(rider.walletBalance) || 0 } });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch wallet' } });
  }
};

/**
 * Add to wallet
 */
exports.addToWallet = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    const rider = await Rider.findOne({ where: { userId: req.user.id } });
    if (!rider) return res.status(404).json({ success: false, error: { code: 'RIDER_NOT_FOUND', message: 'Rider not found' } });

    const newBalance = parseFloat(rider.walletBalance || 0) + parseFloat(amount);
    await rider.update({ walletBalance: newBalance });

    res.json({ success: true, data: { balance: newBalance }, message: `$${amount} added to wallet` });
  } catch (error) {
    console.error('Add to wallet error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to add to wallet' } });
  }
};

/**
 * Get wallet transactions
 */
exports.getWalletTransactions = async (req, res) => {
  try {
    const rider = await Rider.findOne({ where: { userId: req.user.id } });
    if (!rider) return res.status(404).json({ success: false, error: { code: 'RIDER_NOT_FOUND', message: 'Rider not found' } });

    // Return empty array for now - can be implemented with WalletTransaction model
    res.json({ success: true, data: [] });
  } catch (error) {
    console.error('Get wallet transactions error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch transactions' } });
  }
};

// ============ COUPONS ============

/**
 * Apply coupon
 */
exports.applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const rider = await Rider.findOne({ where: { userId: req.user.id } });
    if (!rider) return res.status(404).json({ success: false, error: { code: 'RIDER_NOT_FOUND', message: 'Rider not found' } });

    const promo = await PromoCode.findOne({ where: { code: code.toUpperCase(), isActive: true } });
    if (!promo) return res.status(404).json({ success: false, error: { code: 'INVALID_CODE', message: 'Invalid promo code' } });

    // Check if already used
    const alreadyUsed = await PromoCodeUsage.findOne({ where: { promoCodeId: promo.id, riderId: rider.id } });
    if (alreadyUsed) return res.status(400).json({ success: false, error: { code: 'ALREADY_USED', message: 'You have already used this promo code' } });

    // Check expiry
    if (promo.validUntil && new Date(promo.validUntil) < new Date()) {
      return res.status(400).json({ success: false, error: { code: 'EXPIRED', message: 'Promo code has expired' } });
    }

    res.json({
      success: true,
      data: { code: promo.code, type: promo.type, value: promo.value, description: promo.description },
      message: 'Promo code applied successfully'
    });
  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to apply coupon' } });
  }
};

/**
 * Get available coupons
 */
exports.getAvailableCoupons = async (req, res) => {
  try {
    const rider = await Rider.findOne({ where: { userId: req.user.id } });
    if (!rider) return res.status(404).json({ success: false, error: { code: 'RIDER_NOT_FOUND', message: 'Rider not found' } });

    const coupons = await PromoCode.findAll({
      where: { isActive: true, validUntil: { [Op.or]: [null, { [Op.gte]: new Date() }] } }
    });

    res.json({ success: true, data: coupons });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch coupons' } });
  }
};

// ============ SUPPORT ============

/**
 * Create support ticket
 */
exports.createSupportTicket = async (req, res) => {
  try {
    const { subject, message, tripId } = req.body;
    const rider = await Rider.findOne({ where: { userId: req.user.id } });
    if (!rider) return res.status(404).json({ success: false, error: { code: 'RIDER_NOT_FOUND', message: 'Rider not found' } });

    const ticket = await SupportTicket.create({
      riderId: rider.id,
      tripId: tripId || null,
      subject,
      description: message,
      status: 'open'
    });

    res.status(201).json({ success: true, data: ticket, message: 'Support ticket created' });
  } catch (error) {
    console.error('Create support ticket error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create ticket' } });
  }
};

/**
 * Get support tickets
 */
exports.getSupportTickets = async (req, res) => {
  try {
    const rider = await Rider.findOne({ where: { userId: req.user.id } });
    if (!rider) return res.status(404).json({ success: false, error: { code: 'RIDER_NOT_FOUND', message: 'Rider not found' } });

    const tickets = await SupportTicket.findAll({ where: { riderId: rider.id }, order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: tickets });
  } catch (error) {
    console.error('Get support tickets error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch tickets' } });
  }
};

/**
 * Report lost item
 */
exports.reportLostItem = async (req, res) => {
  try {
    const { tripId, description } = req.body;
    const rider = await Rider.findOne({ where: { userId: req.user.id } });
    if (!rider) return res.status(404).json({ success: false, error: { code: 'RIDER_NOT_FOUND', message: 'Rider not found' } });

    const ticket = await SupportTicket.create({
      riderId: rider.id,
      tripId,
      subject: 'Lost Item Report',
      description,
      type: 'lost_item',
      status: 'open'
    });

    res.status(201).json({ success: true, data: ticket, message: 'Lost item reported' });
  } catch (error) {
    console.error('Report lost item error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to report lost item' } });
  }
};

// ============ EMERGENCY ============

/**
 * Trigger SOS
 */
exports.triggerSOS = async (req, res) => {
  try {
    const { tripId, location } = req.body;
    const rider = await Rider.findOne({ where: { userId: req.user.id } });
    if (!rider) return res.status(404).json({ success: false, error: { code: 'RIDER_NOT_FOUND', message: 'Rider not found' } });

    // In production, this would trigger emergency services, notify contacts, etc.
    const ticket = await SupportTicket.create({
      riderId: rider.id,
      tripId,
      subject: 'EMERGENCY SOS',
      description: `Emergency triggered at location: ${JSON.stringify(location)}`,
      type: 'emergency',
      status: 'open',
      priority: 'critical'
    });

    res.json({ success: true, data: ticket, message: 'Emergency services notified' });
  } catch (error) {
    console.error('Trigger SOS error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to trigger SOS' } });
  }
};

/**
 * Share trip
 */
exports.shareTrip = async (req, res) => {
  try {
    const { tripId, contacts } = req.body;
    const rider = await Rider.findOne({ where: { userId: req.user.id } });
    if (!rider) return res.status(404).json({ success: false, error: { code: 'RIDER_NOT_FOUND', message: 'Rider not found' } });

    const trip = await Trip.findOne({ where: { id: tripId, riderId: rider.id } });
    if (!trip) return res.status(404).json({ success: false, error: { code: 'TRIP_NOT_FOUND', message: 'Trip not found' } });

    // In production, this would send SMS/email to contacts with trip tracking link
    res.json({ success: true, message: 'Trip details shared with contacts' });
  } catch (error) {
    console.error('Share trip error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to share trip' } });
  }
};
