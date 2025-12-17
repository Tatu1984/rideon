const { Trip, Rider, Driver, Vehicle, User, Rating, TripStatusHistory, PromoCode, PromoCodeUsage } = require('../models');
const { Op } = require('sequelize');
const { calculateDistance } = require('../utils/haversine');
const driverMatchingService = require('../services/driverMatchingService');

/**
 * Request a new trip
 */
exports.requestTrip = async (req, res) => {
  try {
    const {
      pickupAddress,
      pickupLatitude,
      pickupLongitude,
      dropoffAddress,
      dropoffLatitude,
      dropoffLongitude,
      vehicleType,
      paymentMethod,
      promoCode,
      riderNotes
    } = req.body;

    // Find rider
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

    // Calculate estimated distance and duration
    const estimatedDistance = calculateDistance(
      pickupLatitude,
      pickupLongitude,
      dropoffLatitude,
      dropoffLongitude
    );

    // Simple duration estimate (can be improved with routing API)
    const estimatedDuration = Math.ceil(estimatedDistance / 0.5); // Assume 30 km/h average speed

    // Calculate fare (this should use PricingRule model in production)
    const baseFare = 50;
    const perKmRate = 15;
    const perMinRate = 2;

    const distanceFare = estimatedDistance * perKmRate;
    const timeFare = estimatedDuration * perMinRate;
    let estimatedFare = baseFare + distanceFare + timeFare;

    let discount = 0;
    let promoCodeId = null;

    // Apply promo code if provided
    if (promoCode) {
      const promo = await PromoCode.findOne({
        where: {
          code: promoCode,
          isActive: true,
          validFrom: { [Op.lte]: new Date() },
          validTo: { [Op.gte]: new Date() }
        }
      });

      if (promo) {
        // Check usage limit
        const usageCount = await PromoCodeUsage.count({
          where: {
            promoCodeId: promo.id,
            riderId: rider.id
          }
        });

        if (usageCount < promo.maxUsagePerUser) {
          if (promo.discountType === 'percentage') {
            discount = (estimatedFare * promo.discountValue) / 100;
            if (promo.maxDiscountAmount) {
              discount = Math.min(discount, promo.maxDiscountAmount);
            }
          } else {
            discount = promo.discountValue;
          }
          promoCodeId = promo.id;
        }
      }
    }

    const totalFare = Math.max(estimatedFare - discount, 0);

    // Create trip
    const trip = await Trip.create({
      riderId: rider.id,
      pickupAddress,
      pickupLatitude,
      pickupLongitude,
      dropoffAddress,
      dropoffLatitude,
      dropoffLongitude,
      vehicleType,
      paymentMethod,
      estimatedDistance,
      estimatedDuration,
      estimatedFare,
      baseFare,
      distanceFare,
      timeFare,
      discount,
      totalFare,
      promoCodeId,
      riderNotes,
      status: 'requested',
      requestedAt: new Date()
    });

    // Create status history entry
    await TripStatusHistory.create({
      tripId: trip.id,
      status: 'requested',
      timestamp: new Date()
    });

    // Record promo code usage
    if (promoCodeId) {
      await PromoCodeUsage.create({
        promoCodeId,
        riderId: rider.id,
        tripId: trip.id,
        discountAmount: discount
      });
    }

    // Find and notify nearby drivers using matching service
    const io = req.app.get('io');
    const matchedDrivers = await driverMatchingService.matchDriversForTrip({
      pickupLatitude,
      pickupLongitude,
      vehicleType
    });

    // Notify matched drivers via Socket.IO
    if (io && matchedDrivers.length > 0) {
      await driverMatchingService.notifyDriversAboutTrip(io, matchedDrivers, trip);
    }

    // Format matched drivers for client response
    const nearbyDrivers = matchedDrivers.map(d =>
      driverMatchingService.formatDriverForClient(d)
    );

    res.status(201).json({
      success: true,
      data: {
        trip,
        nearbyDrivers,
        driversNotified: matchedDrivers.length
      },
      message: matchedDrivers.length > 0
        ? 'Trip requested successfully. Finding drivers...'
        : 'Trip requested. No drivers available nearby, expanding search...'
    });
  } catch (error) {
    console.error('Request trip error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to request trip'
      }
    });
  }
};

/**
 * Get trip details
 */
exports.getTripDetails = async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await Trip.findByPk(tripId, {
      include: [
        {
          model: Rider,
          as: 'rider',
          include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'phone', 'profilePicture'] }]
        },
        {
          model: Driver,
          as: 'driver',
          include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'phone', 'profilePicture'] }]
        },
        {
          model: Vehicle,
          as: 'vehicle'
        },
        {
          model: Rating,
          as: 'rating'
        },
        {
          model: TripStatusHistory,
          as: 'statusHistory',
          order: [['timestamp', 'ASC']]
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

    // Check authorization
    const rider = await Rider.findOne({ where: { userId: req.user.id } });
    const driver = await Driver.findOne({ where: { userId: req.user.id } });

    const isRider = rider && trip.riderId === rider.id;
    const isDriver = driver && trip.driverId === driver.id;
    const isAdmin = req.user.role === 'admin';

    if (!isRider && !isDriver && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to view this trip'
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
 * Accept trip (driver)
 */
exports.acceptTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { vehicleId } = req.body;

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

    if (driver.status !== 'online') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DRIVER_NOT_AVAILABLE',
          message: 'Driver must be online to accept trips'
        }
      });
    }

    const trip = await Trip.findByPk(tripId);

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TRIP_NOT_FOUND',
          message: 'Trip not found'
        }
      });
    }

    if (trip.status !== 'requested') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TRIP_NOT_AVAILABLE',
          message: 'Trip is no longer available'
        }
      });
    }

    // Update trip
    await trip.update({
      driverId: driver.id,
      vehicleId,
      status: 'accepted',
      acceptedAt: new Date()
    });

    // Update driver status
    await driver.update({ status: 'busy' });

    // Create status history
    await TripStatusHistory.create({
      tripId: trip.id,
      status: 'accepted',
      timestamp: new Date()
    });

    // Emit event via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`trip:${trip.id}`).emit('trip:accepted', {
        tripId: trip.id,
        driverId: driver.id
      });
    }

    res.json({
      success: true,
      data: trip,
      message: 'Trip accepted successfully'
    });
  } catch (error) {
    console.error('Accept trip error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to accept trip'
      }
    });
  }
};

/**
 * Update trip status
 */
exports.updateTripStatus = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { status } = req.body;

    const validStatuses = ['driver_arrived', 'in_progress', 'completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Invalid status value'
        }
      });
    }

    const trip = await Trip.findByPk(tripId);

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TRIP_NOT_FOUND',
          message: 'Trip not found'
        }
      });
    }

    // Verify driver authorization
    const driver = await Driver.findOne({ where: { userId: req.user.id } });
    if (!driver || trip.driverId !== driver.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this trip'
        }
      });
    }

    const updateData = { status };

    if (status === 'driver_arrived') {
      updateData.arrivedAt = new Date();
    } else if (status === 'in_progress') {
      updateData.startedAt = new Date();
    } else if (status === 'completed') {
      updateData.completedAt = new Date();
      // Update driver status back to online
      await driver.update({ status: 'online' });

      // Update driver stats
      await driver.increment('totalTrips');
      if (trip.driverEarnings) {
        await driver.increment('totalEarnings', { by: parseFloat(trip.driverEarnings) });
        await driver.increment('availableBalance', { by: parseFloat(trip.driverEarnings) });
      }
    }

    await trip.update(updateData);

    // Create status history
    await TripStatusHistory.create({
      tripId: trip.id,
      status,
      timestamp: new Date()
    });

    // Emit event via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`trip:${trip.id}`).emit('trip:status-updated', {
        tripId: trip.id,
        status
      });
    }

    res.json({
      success: true,
      data: trip,
      message: 'Trip status updated successfully'
    });
  } catch (error) {
    console.error('Update trip status error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update trip status'
      }
    });
  }
};

/**
 * Cancel trip
 */
exports.cancelTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { reason } = req.body;

    const trip = await Trip.findByPk(tripId);

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TRIP_NOT_FOUND',
          message: 'Trip not found'
        }
      });
    }

    // Check authorization
    const rider = await Rider.findOne({ where: { userId: req.user.id } });
    const driver = await Driver.findOne({ where: { userId: req.user.id } });

    const isRider = rider && trip.riderId === rider.id;
    const isDriver = driver && trip.driverId === driver.id;

    if (!isRider && !isDriver) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to cancel this trip'
        }
      });
    }

    if (['completed', 'cancelled_by_rider', 'cancelled_by_driver', 'cancelled_by_admin'].includes(trip.status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TRIP_CANNOT_BE_CANCELLED',
          message: 'Trip cannot be cancelled'
        }
      });
    }

    const cancelledStatus = isRider ? 'cancelled_by_rider' : 'cancelled_by_driver';

    await trip.update({
      status: cancelledStatus,
      cancelledAt: new Date(),
      cancellationReason: reason
    });

    // If driver cancels, set status back to online
    if (isDriver) {
      await driver.update({ status: 'online' });
    }

    // Create status history
    await TripStatusHistory.create({
      tripId: trip.id,
      status: cancelledStatus,
      timestamp: new Date()
    });

    // Emit event via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`trip:${trip.id}`).emit('trip:cancelled', {
        tripId: trip.id,
        cancelledBy: isRider ? 'rider' : 'driver'
      });
    }

    res.json({
      success: true,
      data: trip,
      message: 'Trip cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel trip error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to cancel trip'
      }
    });
  }
};

/**
 * Rate trip
 */
exports.rateTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { rating, comment } = req.body;

    const trip = await Trip.findByPk(tripId);

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TRIP_NOT_FOUND',
          message: 'Trip not found'
        }
      });
    }

    if (trip.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TRIP_NOT_COMPLETED',
          message: 'Trip must be completed before rating'
        }
      });
    }

    // Check if user is rider or driver
    const rider = await Rider.findOne({ where: { userId: req.user.id } });
    const driver = await Driver.findOne({ where: { userId: req.user.id } });

    const isRider = rider && trip.riderId === rider.id;
    const isDriver = driver && trip.driverId === driver.id;

    if (!isRider && !isDriver) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to rate this trip'
        }
      });
    }

    // Find or create rating
    let tripRating = await Rating.findOne({ where: { tripId: trip.id } });

    if (!tripRating) {
      tripRating = await Rating.create({
        tripId: trip.id,
        riderId: trip.riderId,
        driverId: trip.driverId
      });
    }

    // Update rating based on who is rating
    const updateData = {};
    if (isRider) {
      updateData.driverRating = rating;
      updateData.driverComment = comment;
    } else {
      updateData.riderRating = rating;
      updateData.riderComment = comment;
    }

    await tripRating.update(updateData);

    // Update average ratings
    if (isRider && trip.driverId) {
      const driverRatings = await Rating.findAll({
        where: { driverId: trip.driverId, driverRating: { [Op.not]: null } }
      });
      const avgRating = driverRatings.reduce((sum, r) => sum + parseFloat(r.driverRating), 0) / driverRatings.length;
      await Driver.update(
        { averageRating: avgRating },
        { where: { id: trip.driverId } }
      );
    } else if (isDriver) {
      const riderRatings = await Rating.findAll({
        where: { riderId: trip.riderId, riderRating: { [Op.not]: null } }
      });
      const avgRating = riderRatings.reduce((sum, r) => sum + parseFloat(r.riderRating), 0) / riderRatings.length;
      await Rider.update(
        { averageRating: avgRating },
        { where: { id: trip.riderId } }
      );
    }

    res.json({
      success: true,
      data: tripRating,
      message: 'Trip rated successfully'
    });
  } catch (error) {
    console.error('Rate trip error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to rate trip'
      }
    });
  }
};
