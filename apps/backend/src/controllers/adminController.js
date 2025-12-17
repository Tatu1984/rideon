const { User, Rider, Driver, Trip, Payment, PromoCode, SupportTicket, DriverDocument, Vehicle, PricingRule } = require('../models');
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
 * Create new user (admin function)
 */
exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: { code: 'USER_EXISTS', message: 'User with this email already exists' }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password || 'TempPass123!', 10);

    // Create user
    const { v4: uuidv4 } = require('uuid');
    const user = await User.create({
      id: uuidv4(),
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      role: role || 'rider',
      isVerified: true,
      isActive: true
    });

    // Create rider/driver profile if needed
    if (role === 'rider' || !role) {
      await Rider.create({
        id: uuidv4(),
        userId: user.id
      });
    } else if (role === 'driver') {
      await Driver.create({
        id: uuidv4(),
        userId: user.id,
        status: 'pending',
        isVerified: false
      });
    }

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to create user' }
    });
  }
};

/**
 * Update user (admin function)
 */
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, email, phone, role, isActive } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' }
      });
    }

    // Check if email is being changed to an existing email
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: { code: 'EMAIL_EXISTS', message: 'Email already in use' }
        });
      }
    }

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (role) updateData.role = role;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    await user.update(updateData);

    res.json({
      success: true,
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive
      },
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to update user' }
    });
  }
};

/**
 * Delete user (admin function)
 */
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' }
      });
    }

    // Prevent deleting your own account
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        error: { code: 'CANNOT_DELETE_SELF', message: 'Cannot delete your own account' }
      });
    }

    // Delete associated rider/driver profiles
    if (user.role === 'rider') {
      await Rider.destroy({ where: { userId: user.id } });
    } else if (user.role === 'driver') {
      await Driver.destroy({ where: { userId: user.id } });
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to delete user' }
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

/**
 * Get all drivers with pagination and filtering
 */
exports.getDrivers = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search, verified } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (verified !== undefined) whereClause.isVerified = verified === 'true';

    const includeOptions = [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'firstName', 'lastName', 'phone', 'profilePicture', 'isActive'],
        where: search ? {
          [Op.or]: [
            { email: { [Op.iLike]: `%${search}%` } },
            { firstName: { [Op.iLike]: `%${search}%` } },
            { lastName: { [Op.iLike]: `%${search}%` } },
            { phone: { [Op.iLike]: `%${search}%` } }
          ]
        } : undefined
      },
      { model: Vehicle, as: 'vehicles' },
      { model: DriverDocument, as: 'documents' }
    ];

    const { count, rows: drivers } = await Driver.findAndCountAll({
      where: whereClause,
      include: includeOptions,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: drivers,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch drivers' }
    });
  }
};

/**
 * Get single driver details
 */
exports.getDriver = async (req, res) => {
  try {
    const { driverId } = req.params;

    const driver = await Driver.findByPk(driverId, {
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: Vehicle, as: 'vehicles' },
        { model: DriverDocument, as: 'documents' },
        {
          model: Trip,
          as: 'trips',
          limit: 10,
          order: [['createdAt', 'DESC']],
          include: [{ model: Rider, as: 'rider', include: [{ model: User, as: 'user' }] }]
        }
      ]
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: { code: 'DRIVER_NOT_FOUND', message: 'Driver not found' }
      });
    }

    res.json({
      success: true,
      data: driver
    });
  } catch (error) {
    console.error('Get driver error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch driver' }
    });
  }
};

/**
 * Update driver status
 */
exports.updateDriverStatus = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { status, notes } = req.body;

    const driver = await Driver.findByPk(driverId);

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: { code: 'DRIVER_NOT_FOUND', message: 'Driver not found' }
      });
    }

    await driver.update({
      status,
      verificationNotes: notes || driver.verificationNotes
    });

    res.json({
      success: true,
      data: driver,
      message: 'Driver status updated successfully'
    });
  } catch (error) {
    console.error('Update driver status error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to update driver status' }
    });
  }
};

/**
 * Get all riders with pagination
 */
exports.getRiders = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    const includeOptions = [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'firstName', 'lastName', 'phone', 'profilePicture', 'isActive'],
        where: search ? {
          [Op.or]: [
            { email: { [Op.iLike]: `%${search}%` } },
            { firstName: { [Op.iLike]: `%${search}%` } },
            { lastName: { [Op.iLike]: `%${search}%` } },
            { phone: { [Op.iLike]: `%${search}%` } }
          ]
        } : undefined
      }
    ];

    const { count, rows: riders } = await Rider.findAndCountAll({
      include: includeOptions,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: riders,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get riders error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch riders' }
    });
  }
};

/**
 * Get single rider details
 */
exports.getRider = async (req, res) => {
  try {
    const { riderId } = req.params;

    const rider = await Rider.findByPk(riderId, {
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        {
          model: Trip,
          as: 'trips',
          limit: 10,
          order: [['createdAt', 'DESC']],
          include: [{ model: Driver, as: 'driver', include: [{ model: User, as: 'user' }] }]
        }
      ]
    });

    if (!rider) {
      return res.status(404).json({
        success: false,
        error: { code: 'RIDER_NOT_FOUND', message: 'Rider not found' }
      });
    }

    res.json({
      success: true,
      data: rider
    });
  } catch (error) {
    console.error('Get rider error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch rider' }
    });
  }
};

/**
 * Get all promo codes
 */
exports.getPromoCodes = async (req, res) => {
  try {
    const { page = 1, limit = 20, isActive } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (isActive !== undefined) whereClause.isActive = isActive === 'true';

    const { count, rows: promoCodes } = await PromoCode.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: promoCodes,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get promo codes error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch promo codes' }
    });
  }
};

/**
 * Update promo code
 */
exports.updatePromoCode = async (req, res) => {
  try {
    const { promoId } = req.params;
    const updateData = req.body;

    const promoCode = await PromoCode.findByPk(promoId);

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        error: { code: 'PROMO_NOT_FOUND', message: 'Promo code not found' }
      });
    }

    await promoCode.update(updateData);

    res.json({
      success: true,
      data: promoCode,
      message: 'Promo code updated successfully'
    });
  } catch (error) {
    console.error('Update promo code error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to update promo code' }
    });
  }
};

/**
 * Delete promo code
 */
exports.deletePromoCode = async (req, res) => {
  try {
    const { promoId } = req.params;

    const promoCode = await PromoCode.findByPk(promoId);

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        error: { code: 'PROMO_NOT_FOUND', message: 'Promo code not found' }
      });
    }

    await promoCode.destroy();

    res.json({
      success: true,
      message: 'Promo code deleted successfully'
    });
  } catch (error) {
    console.error('Delete promo code error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to delete promo code' }
    });
  }
};

/**
 * Get revenue analytics
 */
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    const whereClause = { status: 'completed' };
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const payments = await Payment.findAll({
      where: whereClause,
      order: [['createdAt', 'ASC']]
    });

    // Group by day/week/month
    const groupedData = {};
    payments.forEach(payment => {
      let key;
      const date = new Date(payment.createdAt);

      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!groupedData[key]) {
        groupedData[key] = { date: key, revenue: 0, count: 0 };
      }
      groupedData[key].revenue += parseFloat(payment.amount);
      groupedData[key].count += 1;
    });

    const totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const totalTrips = payments.length;
    const averagePerTrip = totalTrips > 0 ? totalRevenue / totalTrips : 0;

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalTrips,
          averagePerTrip
        },
        timeline: Object.values(groupedData)
      }
    });
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch revenue analytics' }
    });
  }
};

/**
 * Get trip analytics
 */
exports.getTripAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const whereClause = {};
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const totalTrips = await Trip.count({ where: whereClause });
    const completedTrips = await Trip.count({ where: { ...whereClause, status: 'completed' } });
    const cancelledTrips = await Trip.count({
      where: {
        ...whereClause,
        status: { [Op.in]: ['cancelled_by_rider', 'cancelled_by_driver', 'cancelled_by_admin'] }
      }
    });

    const tripsByStatus = await Trip.findAll({
      where: whereClause,
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['status']
    });

    res.json({
      success: true,
      data: {
        total: totalTrips,
        completed: completedTrips,
        cancelled: cancelledTrips,
        completionRate: totalTrips > 0 ? ((completedTrips / totalTrips) * 100).toFixed(2) : 0,
        byStatus: tripsByStatus.map(s => ({
          status: s.status,
          count: parseInt(s.dataValues.count)
        }))
      }
    });
  } catch (error) {
    console.error('Get trip analytics error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch trip analytics' }
    });
  }
};

/**
 * Update trip status (admin)
 */
exports.updateTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { status } = req.body;

    const trip = await Trip.findByPk(tripId);

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: { code: 'TRIP_NOT_FOUND', message: 'Trip not found' }
      });
    }

    await trip.update({ status });

    res.json({
      success: true,
      data: trip,
      message: 'Trip updated successfully'
    });
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to update trip' }
    });
  }
};

/**
 * Delete trip (admin)
 */
exports.deleteTrip = async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await Trip.findByPk(tripId);

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: { code: 'TRIP_NOT_FOUND', message: 'Trip not found' }
      });
    }

    await trip.destroy();

    res.json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to delete trip' }
    });
  }
};

/**
 * Get pricing rules
 */
exports.getPricingRules = async (req, res) => {
  try {
    const pricingRules = await PricingRule.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { pricingRules }
    });
  } catch (error) {
    console.error('Get pricing rules error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch pricing rules' }
    });
  }
};

/**
 * Create pricing rule
 */
exports.createPricingRule = async (req, res) => {
  try {
    const { v4: uuidv4 } = require('uuid');
    const pricingRule = await PricingRule.create({
      id: uuidv4(),
      ...req.body
    });

    res.status(201).json({
      success: true,
      data: pricingRule,
      message: 'Pricing rule created successfully'
    });
  } catch (error) {
    console.error('Create pricing rule error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to create pricing rule' }
    });
  }
};

/**
 * Update pricing rule
 */
exports.updatePricingRule = async (req, res) => {
  try {
    const { pricingId } = req.params;

    const pricingRule = await PricingRule.findByPk(pricingId);

    if (!pricingRule) {
      return res.status(404).json({
        success: false,
        error: { code: 'PRICING_NOT_FOUND', message: 'Pricing rule not found' }
      });
    }

    await pricingRule.update(req.body);

    res.json({
      success: true,
      data: pricingRule,
      message: 'Pricing rule updated successfully'
    });
  } catch (error) {
    console.error('Update pricing rule error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to update pricing rule' }
    });
  }
};

/**
 * Delete pricing rule
 */
exports.deletePricingRule = async (req, res) => {
  try {
    const { pricingId } = req.params;

    const pricingRule = await PricingRule.findByPk(pricingId);

    if (!pricingRule) {
      return res.status(404).json({
        success: false,
        error: { code: 'PRICING_NOT_FOUND', message: 'Pricing rule not found' }
      });
    }

    await pricingRule.destroy();

    res.json({
      success: true,
      message: 'Pricing rule deleted successfully'
    });
  } catch (error) {
    console.error('Delete pricing rule error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to delete pricing rule' }
    });
  }
};

/**
 * Get vehicle types
 */
exports.getVehicleTypes = async (req, res) => {
  try {
    // Return predefined vehicle types
    const vehicleTypes = [
      { id: 1, name: 'Economy', description: 'Affordable everyday rides', baseFare: 5.00, perKmRate: 1.50, capacity: 4, features: ['AC', 'Music'] },
      { id: 2, name: 'Comfort', description: 'Newer cars with extra legroom', baseFare: 8.00, perKmRate: 2.00, capacity: 4, features: ['AC', 'Music', 'Charger'] },
      { id: 3, name: 'Premium', description: 'High-end vehicles', baseFare: 15.00, perKmRate: 3.50, capacity: 4, features: ['AC', 'Music', 'Charger', 'WiFi', 'Leather'] },
      { id: 4, name: 'XL', description: 'SUVs for larger groups', baseFare: 12.00, perKmRate: 2.50, capacity: 6, features: ['AC', 'Music', 'Charger', 'Extra Space'] },
      { id: 5, name: 'Black', description: 'Luxury sedans with professional drivers', baseFare: 25.00, perKmRate: 5.00, capacity: 4, features: ['AC', 'Music', 'Charger', 'WiFi', 'Leather', 'Pro Driver'] }
    ];

    res.json({
      success: true,
      data: { vehicleTypes }
    });
  } catch (error) {
    console.error('Get vehicle types error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch vehicle types' }
    });
  }
};
