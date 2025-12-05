const { Driver, User, Vehicle, Trip, Rating, DriverDocument, DriverPayout, DriverLocation } = require('../models');
const { Op } = require('sequelize');

/**
 * Get driver profile
 */
exports.getProfile = async (req, res) => {
  try {
    const driver = await Driver.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName', 'phone', 'profilePicture']
        },
        {
          model: Vehicle,
          as: 'vehicles'
        },
        {
          model: DriverDocument,
          as: 'documents'
        }
      ]
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

    res.json({
      success: true,
      data: driver
    });
  } catch (error) {
    console.error('Get driver profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch driver profile'
      }
    });
  }
};

/**
 * Update driver profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, profilePicture, bankAccountNumber, bankName, bankAccountName } = req.body;

    const driver = await Driver.findOne({
      where: { userId: req.user.id },
      include: [{ model: User, as: 'user' }]
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

    // Update user fields
    if (firstName || lastName || phone || profilePicture) {
      await driver.user.update({
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone && { phone }),
        ...(profilePicture && { profilePicture })
      });
    }

    // Update driver fields
    await driver.update({
      ...(bankAccountNumber && { bankAccountNumber }),
      ...(bankName && { bankName }),
      ...(bankAccountName && { bankAccountName })
    });

    await driver.reload();

    res.json({
      success: true,
      data: driver,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update driver profile error:', error);
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
 * Update driver status (online/offline/busy)
 */
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['online', 'offline', 'busy'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Invalid status value'
        }
      });
    }

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

    if (!driver.isVerified) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'DRIVER_NOT_VERIFIED',
          message: 'Driver account is not verified'
        }
      });
    }

    await driver.update({ status });

    // Emit status update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`driver:${driver.id}`).emit('driver:status-updated', { status });
    }

    res.json({
      success: true,
      data: { status },
      message: 'Status updated successfully'
    });
  } catch (error) {
    console.error('Update driver status error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update status'
      }
    });
  }
};

/**
 * Update driver location
 */
exports.updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, heading, speed } = req.body;

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

    // Update driver's current location
    await driver.update({
      currentLatitude: latitude,
      currentLongitude: longitude,
      lastLocationUpdate: new Date()
    });

    // Save location history
    await DriverLocation.create({
      driverId: driver.id,
      latitude,
      longitude,
      heading,
      speed
    });

    // Emit location update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('driver:location-updated', {
        driverId: driver.id,
        latitude,
        longitude,
        heading,
        speed
      });
    }

    res.json({
      success: true,
      message: 'Location updated successfully'
    });
  } catch (error) {
    console.error('Update driver location error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update location'
      }
    });
  }
};

/**
 * Get driver trip history
 */
exports.getTripHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

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

    const whereClause = { driverId: driver.id };
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
    console.error('Get driver trip history error:', error);
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
 * Get driver earnings
 */
exports.getEarnings = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

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

    const whereClause = {
      driverId: driver.id,
      status: 'completed'
    };

    if (startDate && endDate) {
      whereClause.completedAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const totalEarnings = await Trip.sum('driverEarnings', { where: whereClause });
    const tripCount = await Trip.count({ where: whereClause });

    const payouts = await DriverPayout.findAll({
      where: { driverId: driver.id },
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      data: {
        totalEarnings: parseFloat(totalEarnings) || 0,
        tripCount,
        availableBalance: parseFloat(driver.availableBalance) || 0,
        recentPayouts: payouts
      }
    });
  } catch (error) {
    console.error('Get driver earnings error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch earnings'
      }
    });
  }
};

/**
 * Get driver statistics
 */
exports.getStatistics = async (req, res) => {
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

    const totalTrips = driver.totalTrips || 0;
    const totalEarnings = driver.totalEarnings || 0;
    const averageRating = driver.averageRating || 0;
    const completionRate = driver.completionRate || 0;
    const acceptanceRate = driver.acceptanceRate || 0;

    const todayTrips = await Trip.count({
      where: {
        driverId: driver.id,
        status: 'completed',
        completedAt: {
          [Op.gte]: new Date().setHours(0, 0, 0, 0)
        }
      }
    });

    const todayEarnings = await Trip.sum('driverEarnings', {
      where: {
        driverId: driver.id,
        status: 'completed',
        completedAt: {
          [Op.gte]: new Date().setHours(0, 0, 0, 0)
        }
      }
    });

    res.json({
      success: true,
      data: {
        totalTrips,
        totalEarnings: parseFloat(totalEarnings),
        averageRating: parseFloat(averageRating),
        completionRate: parseFloat(completionRate),
        acceptanceRate: parseFloat(acceptanceRate),
        todayTrips,
        todayEarnings: parseFloat(todayEarnings) || 0,
        status: driver.status,
        isVerified: driver.isVerified
      }
    });
  } catch (error) {
    console.error('Get driver statistics error:', error);
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
 * Request payout
 */
exports.requestPayout = async (req, res) => {
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

    const availableBalance = parseFloat(driver.availableBalance) || 0;

    if (amount > availableBalance) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_BALANCE',
          message: 'Insufficient balance for payout'
        }
      });
    }

    const payout = await DriverPayout.create({
      driverId: driver.id,
      amount,
      status: 'pending'
    });

    // Deduct from available balance
    await driver.update({
      availableBalance: availableBalance - amount
    });

    res.json({
      success: true,
      data: payout,
      message: 'Payout request submitted successfully'
    });
  } catch (error) {
    console.error('Request payout error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to request payout'
      }
    });
  }
};
