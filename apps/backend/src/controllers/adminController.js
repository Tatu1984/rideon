const { User, Rider, Driver, Trip, Payment, PromoCode, SupportTicket, DriverDocument, Vehicle } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

/**
 * Get dashboard statistics
 */
exports.getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalRiders = await Rider.count();
    const totalDrivers = await Driver.count();
    const activeDrivers = await Driver.count({ where: { status: 'online' } });

    const totalTrips = await Trip.count();
    const activeTrips = await Trip.count({
      where: { status: { [Op.in]: ['requested', 'accepted', 'driver_arrived', 'in_progress'] } }
    });
    const completedTrips = await Trip.count({ where: { status: 'completed' } });

    const totalRevenue = await Payment.sum('amount', { where: { status: 'completed' } });

    const pendingVerifications = await Driver.count({ where: { isVerified: false, status: 'pending' } });
    const openTickets = await SupportTicket.count({ where: { status: 'open' } });

    res.json({
      success: true,
      data: {
        users: { total: totalUsers, riders: totalRiders, drivers: totalDrivers, activeDrivers },
        trips: { total: totalTrips, active: activeTrips, completed: completedTrips },
        revenue: { total: parseFloat(totalRevenue) || 0 },
        pending: { verifications: pendingVerifications, tickets: openTickets }
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch dashboard data' }
    });
  }
};

/**
 * Get all users with pagination
 */
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (role) whereClause.role = role;
    if (search) {
      whereClause[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch users' }
    });
  }
};

/**
 * Get pending driver verifications
 */
exports.getPendingVerifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: drivers } = await Driver.findAndCountAll({
      where: { isVerified: false, status: 'pending' },
      include: [
        { model: User, as: 'user', attributes: ['id', 'email', 'firstName', 'lastName', 'phone'] },
        { model: DriverDocument, as: 'documents' },
        { model: Vehicle, as: 'vehicles' }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        drivers,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get pending verifications error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch pending verifications' }
    });
  }
};

/**
 * Verify/reject driver
 */
exports.verifyDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { action, notes } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ACTION', message: 'Action must be approve or reject' }
      });
    }

    const driver = await Driver.findByPk(driverId);

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: { code: 'DRIVER_NOT_FOUND', message: 'Driver not found' }
      });
    }

    await driver.update({
      isVerified: action === 'approve',
      status: action === 'approve' ? 'offline' : 'rejected',
      verificationNotes: notes
    });

    res.json({
      success: true,
      data: driver,
      message: `Driver ${action === 'approve' ? 'approved' : 'rejected'} successfully`
    });
  } catch (error) {
    console.error('Verify driver error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to verify driver' }
    });
  }
};

/**
 * Get all trips with filters
 */
exports.getAllTrips = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const { count, rows: trips } = await Trip.findAndCountAll({
      where: whereClause,
      include: [
        { model: Rider, as: 'rider', include: [{ model: User, as: 'user' }] },
        { model: Driver, as: 'driver', include: [{ model: User, as: 'user' }] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
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
    console.error('Get all trips error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch trips' }
    });
  }
};

/**
 * Create promo code
 */
exports.createPromoCode = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      maxDiscountAmount,
      minTripAmount,
      maxUsagePerUser,
      totalUsageLimit,
      validFrom,
      validTo
    } = req.body;

    const promoCode = await PromoCode.create({
      code,
      description,
      discountType,
      discountValue,
      maxDiscountAmount,
      minTripAmount,
      maxUsagePerUser,
      totalUsageLimit,
      validFrom,
      validTo,
      isActive: true
    });

    res.status(201).json({
      success: true,
      data: promoCode,
      message: 'Promo code created successfully'
    });
  } catch (error) {
    console.error('Create promo code error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to create promo code' }
    });
  }
};

/**
 * Toggle user active status
 */
exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' }
      });
    }

    await user.update({ isActive: !user.isActive });

    res.json({
      success: true,
      data: user,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to toggle user status' }
    });
  }
};

/**
 * Get support tickets
 */
exports.getSupportTickets = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;

    const { count, rows: tickets } = await SupportTicket.findAndCountAll({
      where: whereClause,
      include: [{ model: User, as: 'user', attributes: ['id', 'email', 'firstName', 'lastName'] }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        tickets,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get support tickets error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch support tickets' }
    });
  }
};

/**
 * Update support ticket
 */
exports.updateSupportTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status, adminNotes } = req.body;

    const ticket = await SupportTicket.findByPk(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: { code: 'TICKET_NOT_FOUND', message: 'Support ticket not found' }
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (adminNotes) updateData.adminNotes = adminNotes;
    if (status === 'resolved') updateData.resolvedAt = new Date();

    await ticket.update(updateData);

    res.json({
      success: true,
      data: ticket,
      message: 'Support ticket updated successfully'
    });
  } catch (error) {
    console.error('Update support ticket error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to update support ticket' }
    });
  }
};
