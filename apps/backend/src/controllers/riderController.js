const { Rider, User, Trip, Rating, PromoCodeUsage } = require('../models');
const { Op } = require('sequelize');

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
