/**
 * Scheduled Rides Controller
 * Handles scheduled ride booking, management, and execution
 */

const { Trip, Rider, Driver, Vehicle, User, PricingRule, Zone } = require('../models');
const { Op } = require('sequelize');
const { calculateDistance } = require('../utils/haversine');
const apiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Create a scheduled ride
 */
exports.createScheduledRide = async (req, res) => {
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
      riderNotes,
      scheduledAt
    } = req.body;

    // Validate scheduled time (minimum 30 minutes in advance)
    const scheduledDate = new Date(scheduledAt);
    const minScheduleTime = new Date(Date.now() + 30 * 60 * 1000);

    if (scheduledDate < minScheduleTime) {
      return apiResponse.badRequest(
        res,
        'INVALID_SCHEDULE_TIME',
        'Scheduled time must be at least 30 minutes in the future'
      );
    }

    // Maximum 7 days in advance
    const maxScheduleTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    if (scheduledDate > maxScheduleTime) {
      return apiResponse.badRequest(
        res,
        'INVALID_SCHEDULE_TIME',
        'Scheduled time cannot be more than 7 days in the future'
      );
    }

    // Find rider
    const rider = await Rider.findOne({
      where: { userId: req.user.id }
    });

    if (!rider) {
      return apiResponse.notFound(res, 'Rider');
    }

    // Check for conflicting scheduled rides
    const conflictingRide = await Trip.findOne({
      where: {
        riderId: rider.id,
        isScheduled: true,
        status: { [Op.in]: ['requested', 'accepted'] },
        scheduledAt: {
          [Op.between]: [
            new Date(scheduledDate.getTime() - 60 * 60 * 1000), // 1 hour before
            new Date(scheduledDate.getTime() + 60 * 60 * 1000)  // 1 hour after
          ]
        }
      }
    });

    if (conflictingRide) {
      return apiResponse.badRequest(
        res,
        'CONFLICTING_SCHEDULE',
        'You already have a scheduled ride around this time'
      );
    }

    // Calculate estimated distance and duration
    const estimatedDistance = calculateDistance(
      pickupLatitude,
      pickupLongitude,
      dropoffLatitude,
      dropoffLongitude
    );

    const estimatedDuration = Math.ceil(estimatedDistance / 0.5);

    // Get pricing for the zone and vehicle type
    const baseFare = 50;
    const perKmRate = 15;
    const perMinRate = 2;

    const distanceFare = estimatedDistance * perKmRate;
    const timeFare = estimatedDuration * perMinRate;
    const totalFare = baseFare + distanceFare + timeFare;

    // Create scheduled trip
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
      estimatedFare: totalFare,
      baseFare,
      distanceFare,
      timeFare,
      totalFare,
      riderNotes,
      status: 'requested',
      isScheduled: true,
      scheduledAt: scheduledDate,
      requestedAt: new Date()
    });

    // Emit event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to(`rider:${rider.id}`).emit('scheduled-ride:created', {
        tripId: trip.id,
        scheduledAt: scheduledDate
      });
    }

    return apiResponse.created(res, trip, 'Scheduled ride created successfully');
  } catch (error) {
    logger.error('Create scheduled ride error:', error);
    return apiResponse.serverError(res, 'Failed to create scheduled ride');
  }
};

/**
 * Get rider's scheduled rides
 */
exports.getScheduledRides = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const rider = await Rider.findOne({
      where: { userId: req.user.id }
    });

    if (!rider) {
      return apiResponse.notFound(res, 'Rider');
    }

    const whereClause = {
      riderId: rider.id,
      isScheduled: true,
      scheduledAt: { [Op.gte]: new Date() } // Only future rides
    };

    if (status) {
      whereClause.status = status;
    }

    const { count, rows: rides } = await Trip.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Driver,
          as: 'driver',
          include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'phone', 'profilePicture'] }]
        },
        {
          model: Vehicle,
          as: 'vehicle'
        }
      ],
      order: [['scheduledAt', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return apiResponse.paginated(res, rides, { total: count, page, limit }, 'rides');
  } catch (error) {
    logger.error('Get scheduled rides error:', error);
    return apiResponse.serverError(res, 'Failed to fetch scheduled rides');
  }
};

/**
 * Update scheduled ride
 */
exports.updateScheduledRide = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { scheduledAt, pickupAddress, pickupLatitude, pickupLongitude, riderNotes } = req.body;

    const rider = await Rider.findOne({
      where: { userId: req.user.id }
    });

    if (!rider) {
      return apiResponse.notFound(res, 'Rider');
    }

    const trip = await Trip.findOne({
      where: {
        id: tripId,
        riderId: rider.id,
        isScheduled: true,
        status: 'requested' // Can only update if not yet accepted
      }
    });

    if (!trip) {
      return apiResponse.notFound(res, 'Scheduled ride');
    }

    const updateData = {};

    if (scheduledAt) {
      const scheduledDate = new Date(scheduledAt);
      const minScheduleTime = new Date(Date.now() + 30 * 60 * 1000);

      if (scheduledDate < minScheduleTime) {
        return apiResponse.badRequest(
          res,
          'INVALID_SCHEDULE_TIME',
          'Scheduled time must be at least 30 minutes in the future'
        );
      }

      updateData.scheduledAt = scheduledDate;
    }

    if (pickupAddress) updateData.pickupAddress = pickupAddress;
    if (pickupLatitude) updateData.pickupLatitude = pickupLatitude;
    if (pickupLongitude) updateData.pickupLongitude = pickupLongitude;
    if (riderNotes !== undefined) updateData.riderNotes = riderNotes;

    await trip.update(updateData);

    return apiResponse.success(res, trip, 'Scheduled ride updated successfully');
  } catch (error) {
    logger.error('Update scheduled ride error:', error);
    return apiResponse.serverError(res, 'Failed to update scheduled ride');
  }
};

/**
 * Cancel scheduled ride
 */
exports.cancelScheduledRide = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { reason } = req.body;

    const rider = await Rider.findOne({
      where: { userId: req.user.id }
    });

    if (!rider) {
      return apiResponse.notFound(res, 'Rider');
    }

    const trip = await Trip.findOne({
      where: {
        id: tripId,
        riderId: rider.id,
        isScheduled: true,
        status: { [Op.in]: ['requested', 'accepted'] }
      }
    });

    if (!trip) {
      return apiResponse.notFound(res, 'Scheduled ride');
    }

    // Calculate cancellation fee based on how close to scheduled time
    let cancellationFee = 0;
    const hoursUntilRide = (trip.scheduledAt - new Date()) / (1000 * 60 * 60);

    if (hoursUntilRide < 1) {
      cancellationFee = trip.totalFare * 0.5; // 50% if less than 1 hour
    } else if (hoursUntilRide < 2) {
      cancellationFee = trip.totalFare * 0.25; // 25% if less than 2 hours
    } else if (hoursUntilRide < 4) {
      cancellationFee = trip.totalFare * 0.1; // 10% if less than 4 hours
    }

    await trip.update({
      status: 'cancelled_by_rider',
      cancelledAt: new Date(),
      cancellationReason: reason,
      cancellationFee
    });

    // Notify driver if already assigned
    if (trip.driverId) {
      const io = req.app.get('io');
      if (io) {
        io.to(`driver:${trip.driverId}`).emit('scheduled-ride:cancelled', {
          tripId: trip.id,
          reason
        });
      }
    }

    return apiResponse.success(res, {
      trip,
      cancellationFee
    }, 'Scheduled ride cancelled successfully');
  } catch (error) {
    logger.error('Cancel scheduled ride error:', error);
    return apiResponse.serverError(res, 'Failed to cancel scheduled ride');
  }
};

/**
 * Driver accepts scheduled ride
 */
exports.acceptScheduledRide = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { vehicleId } = req.body;

    const driver = await Driver.findOne({
      where: { userId: req.user.id }
    });

    if (!driver) {
      return apiResponse.notFound(res, 'Driver');
    }

    if (!driver.isVerified) {
      return apiResponse.badRequest(res, 'DRIVER_NOT_VERIFIED', 'Driver is not verified');
    }

    const trip = await Trip.findOne({
      where: {
        id: tripId,
        isScheduled: true,
        status: 'requested',
        driverId: null
      }
    });

    if (!trip) {
      return apiResponse.notFound(res, 'Scheduled ride');
    }

    // Verify vehicle belongs to driver
    const vehicle = await Vehicle.findOne({
      where: {
        id: vehicleId,
        driverId: driver.id,
        isActive: true
      }
    });

    if (!vehicle) {
      return apiResponse.notFound(res, 'Vehicle');
    }

    await trip.update({
      driverId: driver.id,
      vehicleId,
      status: 'accepted',
      acceptedAt: new Date()
    });

    // Notify rider
    const io = req.app.get('io');
    if (io) {
      io.to(`trip:${trip.id}`).emit('scheduled-ride:accepted', {
        tripId: trip.id,
        driverId: driver.id,
        driver: {
          id: driver.id,
          user: await User.findByPk(driver.userId, {
            attributes: ['firstName', 'lastName', 'phone', 'profilePicture']
          })
        },
        vehicle
      });
    }

    return apiResponse.success(res, trip, 'Scheduled ride accepted successfully');
  } catch (error) {
    logger.error('Accept scheduled ride error:', error);
    return apiResponse.serverError(res, 'Failed to accept scheduled ride');
  }
};

/**
 * Get available scheduled rides for drivers
 */
exports.getAvailableScheduledRides = async (req, res) => {
  try {
    const { vehicleType, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const driver = await Driver.findOne({
      where: { userId: req.user.id }
    });

    if (!driver) {
      return apiResponse.notFound(res, 'Driver');
    }

    const whereClause = {
      isScheduled: true,
      status: 'requested',
      driverId: null,
      scheduledAt: {
        [Op.gte]: new Date(Date.now() + 30 * 60 * 1000) // At least 30 mins from now
      }
    };

    if (vehicleType) {
      whereClause.vehicleType = vehicleType;
    }

    const { count, rows: rides } = await Trip.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Rider,
          as: 'rider',
          include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'profilePicture'] }]
        }
      ],
      order: [['scheduledAt', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return apiResponse.paginated(res, rides, { total: count, page, limit }, 'rides');
  } catch (error) {
    logger.error('Get available scheduled rides error:', error);
    return apiResponse.serverError(res, 'Failed to fetch available scheduled rides');
  }
};

/**
 * Get driver's accepted scheduled rides
 */
exports.getDriverScheduledRides = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const driver = await Driver.findOne({
      where: { userId: req.user.id }
    });

    if (!driver) {
      return apiResponse.notFound(res, 'Driver');
    }

    const { count, rows: rides } = await Trip.findAndCountAll({
      where: {
        driverId: driver.id,
        isScheduled: true,
        status: 'accepted',
        scheduledAt: { [Op.gte]: new Date() }
      },
      include: [
        {
          model: Rider,
          as: 'rider',
          include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'phone', 'profilePicture'] }]
        }
      ],
      order: [['scheduledAt', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return apiResponse.paginated(res, rides, { total: count, page, limit }, 'rides');
  } catch (error) {
    logger.error('Get driver scheduled rides error:', error);
    return apiResponse.serverError(res, 'Failed to fetch driver scheduled rides');
  }
};

module.exports = exports;
