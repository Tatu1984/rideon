const { Driver, User, Vehicle, Trip, Rating, DriverDocument, DriverPayout, DriverLocation, SupportTicket, SupportMessage, DriverReferral, Notification, Rider } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

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

/**
 * Get payout history
 */
exports.getPayoutHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const driver = await Driver.findOne({
      where: { userId: req.user.id }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: { code: 'DRIVER_NOT_FOUND', message: 'Driver profile not found' }
      });
    }

    const { count, rows: payouts } = await DriverPayout.findAndCountAll({
      where: { driverId: driver.id },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        payouts,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get payout history error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch payout history' }
    });
  }
};

// ==================== Document Management ====================

/**
 * Get driver documents
 */
exports.getDocuments = async (req, res) => {
  try {
    const driver = await Driver.findOne({
      where: { userId: req.user.id }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: { code: 'DRIVER_NOT_FOUND', message: 'Driver profile not found' }
      });
    }

    const documents = await DriverDocument.findAll({
      where: { driverId: driver.id },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch documents' }
    });
  }
};

/**
 * Upload document
 */
exports.uploadDocument = async (req, res) => {
  try {
    const { documentType, documentNumber, frontImageUrl, backImageUrl, expiryDate } = req.body;

    const driver = await Driver.findOne({
      where: { userId: req.user.id }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: { code: 'DRIVER_NOT_FOUND', message: 'Driver profile not found' }
      });
    }

    // Check if document type already exists
    const existingDoc = await DriverDocument.findOne({
      where: { driverId: driver.id, documentType }
    });

    let document;
    if (existingDoc) {
      // Update existing
      await existingDoc.update({
        documentNumber,
        frontImageUrl,
        backImageUrl,
        expiryDate,
        status: 'pending',
        verifiedAt: null
      });
      document = existingDoc;
    } else {
      // Create new
      document = await DriverDocument.create({
        driverId: driver.id,
        documentType,
        documentNumber,
        frontImageUrl,
        backImageUrl,
        expiryDate,
        status: 'pending'
      });
    }

    res.json({
      success: true,
      data: document,
      message: 'Document uploaded successfully'
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to upload document' }
    });
  }
};

/**
 * Delete document
 */
exports.deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    const driver = await Driver.findOne({
      where: { userId: req.user.id }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: { code: 'DRIVER_NOT_FOUND', message: 'Driver profile not found' }
      });
    }

    const document = await DriverDocument.findOne({
      where: { id: documentId, driverId: driver.id }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: { code: 'DOCUMENT_NOT_FOUND', message: 'Document not found' }
      });
    }

    await document.destroy();

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to delete document' }
    });
  }
};

// ==================== Vehicle Management ====================

/**
 * Get vehicles
 */
exports.getVehicles = async (req, res) => {
  try {
    const driver = await Driver.findOne({
      where: { userId: req.user.id }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: { code: 'DRIVER_NOT_FOUND', message: 'Driver profile not found' }
      });
    }

    const vehicles = await Vehicle.findAll({
      where: { driverId: driver.id },
      order: [['isActive', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: vehicles
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch vehicles' }
    });
  }
};

/**
 * Add vehicle
 */
exports.addVehicle = async (req, res) => {
  try {
    const { make, model, year, color, licensePlate, vehicleType, seats, photoUrl } = req.body;

    const driver = await Driver.findOne({
      where: { userId: req.user.id }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: { code: 'DRIVER_NOT_FOUND', message: 'Driver profile not found' }
      });
    }

    // Check if this is the first vehicle
    const existingVehicles = await Vehicle.count({ where: { driverId: driver.id } });
    const isActive = existingVehicles === 0;

    const vehicle = await Vehicle.create({
      driverId: driver.id,
      make,
      model,
      year,
      color,
      licensePlate,
      vehicleType: vehicleType || 'Economy',
      seats: seats || 4,
      photoUrl,
      isActive,
      isVerified: false
    });

    res.json({
      success: true,
      data: vehicle,
      message: 'Vehicle added successfully'
    });
  } catch (error) {
    console.error('Add vehicle error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to add vehicle' }
    });
  }
};

/**
 * Update vehicle
 */
exports.updateVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { make, model, year, color, licensePlate, vehicleType, seats, photoUrl } = req.body;

    const driver = await Driver.findOne({
      where: { userId: req.user.id }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: { code: 'DRIVER_NOT_FOUND', message: 'Driver profile not found' }
      });
    }

    const vehicle = await Vehicle.findOne({
      where: { id: vehicleId, driverId: driver.id }
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: { code: 'VEHICLE_NOT_FOUND', message: 'Vehicle not found' }
      });
    }

    await vehicle.update({
      ...(make && { make }),
      ...(model && { model }),
      ...(year && { year }),
      ...(color && { color }),
      ...(licensePlate && { licensePlate }),
      ...(vehicleType && { vehicleType }),
      ...(seats && { seats }),
      ...(photoUrl && { photoUrl })
    });

    res.json({
      success: true,
      data: vehicle,
      message: 'Vehicle updated successfully'
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to update vehicle' }
    });
  }
};

/**
 * Delete vehicle
 */
exports.deleteVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    const driver = await Driver.findOne({
      where: { userId: req.user.id }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: { code: 'DRIVER_NOT_FOUND', message: 'Driver profile not found' }
      });
    }

    const vehicle = await Vehicle.findOne({
      where: { id: vehicleId, driverId: driver.id }
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: { code: 'VEHICLE_NOT_FOUND', message: 'Vehicle not found' }
      });
    }

    await vehicle.destroy();

    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to delete vehicle' }
    });
  }
};

/**
 * Set active vehicle
 */
exports.setActiveVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    const driver = await Driver.findOne({
      where: { userId: req.user.id }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: { code: 'DRIVER_NOT_FOUND', message: 'Driver profile not found' }
      });
    }

    const vehicle = await Vehicle.findOne({
      where: { id: vehicleId, driverId: driver.id }
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: { code: 'VEHICLE_NOT_FOUND', message: 'Vehicle not found' }
      });
    }

    // Deactivate all other vehicles
    await Vehicle.update(
      { isActive: false },
      { where: { driverId: driver.id } }
    );

    // Activate selected vehicle
    await vehicle.update({ isActive: true });

    res.json({
      success: true,
      data: vehicle,
      message: 'Active vehicle updated'
    });
  } catch (error) {
    console.error('Set active vehicle error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to set active vehicle' }
    });
  }
};

// ==================== Bank Details ====================

/**
 * Get bank details
 */
exports.getBankDetails = async (req, res) => {
  try {
    const driver = await Driver.findOne({
      where: { userId: req.user.id },
      attributes: ['id', 'bankName', 'bankAccountNumber', 'bankAccountName', 'bankRoutingNumber']
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: { code: 'DRIVER_NOT_FOUND', message: 'Driver profile not found' }
      });
    }

    res.json({
      success: true,
      data: {
        bankName: driver.bankName,
        bankAccountNumber: driver.bankAccountNumber ? `****${driver.bankAccountNumber.slice(-4)}` : null,
        bankAccountName: driver.bankAccountName,
        bankRoutingNumber: driver.bankRoutingNumber ? `****${driver.bankRoutingNumber.slice(-4)}` : null
      }
    });
  } catch (error) {
    console.error('Get bank details error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch bank details' }
    });
  }
};

/**
 * Update bank details
 */
exports.updateBankDetails = async (req, res) => {
  try {
    const { bankName, bankAccountNumber, bankAccountName, bankRoutingNumber } = req.body;

    const driver = await Driver.findOne({
      where: { userId: req.user.id }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: { code: 'DRIVER_NOT_FOUND', message: 'Driver profile not found' }
      });
    }

    await driver.update({
      bankName,
      bankAccountNumber,
      bankAccountName,
      bankRoutingNumber
    });

    res.json({
      success: true,
      message: 'Bank details updated successfully'
    });
  } catch (error) {
    console.error('Update bank details error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to update bank details' }
    });
  }
};

// ==================== Support Tickets ====================

/**
 * Get support tickets
 */
exports.getSupportTickets = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const driver = await Driver.findOne({
      where: { userId: req.user.id }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: { code: 'DRIVER_NOT_FOUND', message: 'Driver profile not found' }
      });
    }

    const whereClause = { userId: req.user.id };
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: tickets } = await SupportTicket.findAndCountAll({
      where: whereClause,
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
 * Create support ticket
 */
exports.createSupportTicket = async (req, res) => {
  try {
    const { subject, category, description, tripId } = req.body;

    const ticket = await SupportTicket.create({
      userId: req.user.id,
      subject,
      category: category || 'general',
      description,
      tripId,
      status: 'open',
      priority: 'medium'
    });

    res.json({
      success: true,
      data: ticket,
      message: 'Support ticket created successfully'
    });
  } catch (error) {
    console.error('Create support ticket error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to create support ticket' }
    });
  }
};

/**
 * Get support ticket details
 */
exports.getSupportTicketDetails = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await SupportTicket.findOne({
      where: { id: ticketId, userId: req.user.id },
      include: [
        {
          model: SupportMessage,
          as: 'messages',
          order: [['createdAt', 'ASC']]
        }
      ]
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: { code: 'TICKET_NOT_FOUND', message: 'Support ticket not found' }
      });
    }

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Get support ticket details error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch ticket details' }
    });
  }
};

/**
 * Add message to support ticket
 */
exports.addSupportTicketMessage = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;

    const ticket = await SupportTicket.findOne({
      where: { id: ticketId, userId: req.user.id }
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: { code: 'TICKET_NOT_FOUND', message: 'Support ticket not found' }
      });
    }

    const supportMessage = await SupportMessage.create({
      ticketId: ticket.id,
      senderId: req.user.id,
      senderType: 'driver',
      message
    });

    // Update ticket status if it was resolved
    if (ticket.status === 'resolved') {
      await ticket.update({ status: 'open' });
    }

    res.json({
      success: true,
      data: supportMessage,
      message: 'Message added successfully'
    });
  } catch (error) {
    console.error('Add support ticket message error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to add message' }
    });
  }
};

// ==================== Referrals ====================

/**
 * Get referrals
 */
exports.getReferrals = async (req, res) => {
  try {
    const driver = await Driver.findOne({
      where: { userId: req.user.id }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: { code: 'DRIVER_NOT_FOUND', message: 'Driver profile not found' }
      });
    }

    const referrals = await DriverReferral.findAll({
      where: { referrerId: driver.id },
      order: [['createdAt', 'DESC']]
    });

    const stats = {
      totalReferrals: referrals.length,
      pendingReferrals: referrals.filter(r => r.status === 'pending').length,
      completedReferrals: referrals.filter(r => r.status === 'completed').length,
      totalEarnings: referrals.filter(r => r.status === 'completed').reduce((sum, r) => sum + parseFloat(r.bonusAmount || 0), 0)
    };

    res.json({
      success: true,
      data: {
        referrals,
        stats
      }
    });
  } catch (error) {
    console.error('Get referrals error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch referrals' }
    });
  }
};

/**
 * Get referral code
 */
exports.getReferralCode = async (req, res) => {
  try {
    const driver = await Driver.findOne({
      where: { userId: req.user.id }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: { code: 'DRIVER_NOT_FOUND', message: 'Driver profile not found' }
      });
    }

    // Generate or get existing referral code
    let referralCode = driver.referralCode;
    if (!referralCode) {
      referralCode = `DRV${driver.id.toString(36).toUpperCase()}${uuidv4().slice(0, 4).toUpperCase()}`;
      await driver.update({ referralCode });
    }

    res.json({
      success: true,
      data: {
        referralCode,
        referralLink: `https://rideon.app/signup?ref=${referralCode}`,
        bonusAmount: 50 // Configurable
      }
    });
  } catch (error) {
    console.error('Get referral code error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get referral code' }
    });
  }
};

// ==================== Notifications ====================

/**
 * Get notifications
 */
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 50, unreadOnly } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { userId: req.user.id };
    if (unreadOnly === 'true') {
      whereClause.isRead = false;
    }

    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    const unreadCount = await Notification.count({
      where: { userId: req.user.id, isRead: false }
    });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch notifications' }
    });
  }
};

/**
 * Mark notification as read
 */
exports.markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      where: { id: notificationId, userId: req.user.id }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOTIFICATION_NOT_FOUND', message: 'Notification not found' }
      });
    }

    await notification.update({ isRead: true, readAt: new Date() });

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to mark notification as read' }
    });
  }
};

/**
 * Mark all notifications as read
 */
exports.markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { userId: req.user.id, isRead: false } }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to mark notifications as read' }
    });
  }
};

// ==================== Trip Management ====================

/**
 * Get available trips for driver
 */
exports.getAvailableTrips = async (req, res) => {
  try {
    const driver = await Driver.findOne({
      where: { userId: req.user.id }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: { code: 'DRIVER_NOT_FOUND', message: 'Driver profile not found' }
      });
    }

    if (!driver.isVerified) {
      return res.status(403).json({
        success: false,
        error: { code: 'DRIVER_NOT_VERIFIED', message: 'Driver account is not verified' }
      });
    }

    // Get trips that are pending (waiting for driver) and within driver's vicinity
    const trips = await Trip.findAll({
      where: {
        status: 'pending',
        driverId: null
      },
      include: [
        {
          model: Rider,
          as: 'rider',
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName', 'profilePicture']
          }]
        }
      ],
      order: [['createdAt', 'ASC']],
      limit: 10
    });

    res.json({
      success: true,
      data: trips
    });
  } catch (error) {
    console.error('Get available trips error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch available trips' }
    });
  }
};

/**
 * Accept trip
 */
exports.acceptTrip = async (req, res) => {
  try {
    const { tripId } = req.params;

    const driver = await Driver.findOne({
      where: { userId: req.user.id }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: { code: 'DRIVER_NOT_FOUND', message: 'Driver profile not found' }
      });
    }

    const trip = await Trip.findByPk(tripId);

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: { code: 'TRIP_NOT_FOUND', message: 'Trip not found' }
      });
    }

    if (trip.status !== 'pending' || trip.driverId) {
      return res.status(400).json({
        success: false,
        error: { code: 'TRIP_NOT_AVAILABLE', message: 'Trip is no longer available' }
      });
    }

    await trip.update({
      driverId: driver.id,
      status: 'accepted',
      acceptedAt: new Date()
    });

    await driver.update({ status: 'busy' });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`trip:${tripId}`).emit('trip:accepted', {
        tripId,
        driverId: driver.id,
        timestamp: new Date()
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
      error: { code: 'SERVER_ERROR', message: 'Failed to accept trip' }
    });
  }
};

/**
 * Reject trip
 */
exports.rejectTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { reason } = req.body;

    const driver = await Driver.findOne({
      where: { userId: req.user.id }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: { code: 'DRIVER_NOT_FOUND', message: 'Driver profile not found' }
      });
    }

    // Just acknowledge rejection - trip remains available for other drivers
    res.json({
      success: true,
      message: 'Trip rejected'
    });
  } catch (error) {
    console.error('Reject trip error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to reject trip' }
    });
  }
};

/**
 * Arrive at pickup
 */
exports.arriveAtPickup = async (req, res) => {
  try {
    const { tripId } = req.params;

    const driver = await Driver.findOne({
      where: { userId: req.user.id }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: { code: 'DRIVER_NOT_FOUND', message: 'Driver profile not found' }
      });
    }

    const trip = await Trip.findOne({
      where: { id: tripId, driverId: driver.id }
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: { code: 'TRIP_NOT_FOUND', message: 'Trip not found' }
      });
    }

    await trip.update({
      status: 'arrived',
      arrivedAt: new Date()
    });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`trip:${tripId}`).emit('trip:status-updated', {
        tripId,
        status: 'arrived',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: trip,
      message: 'Marked as arrived at pickup'
    });
  } catch (error) {
    console.error('Arrive at pickup error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to update trip status' }
    });
  }
};

/**
 * Start trip
 */
exports.startTrip = async (req, res) => {
  try {
    const { tripId } = req.params;

    const driver = await Driver.findOne({
      where: { userId: req.user.id }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: { code: 'DRIVER_NOT_FOUND', message: 'Driver profile not found' }
      });
    }

    const trip = await Trip.findOne({
      where: { id: tripId, driverId: driver.id }
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: { code: 'TRIP_NOT_FOUND', message: 'Trip not found' }
      });
    }

    await trip.update({
      status: 'in_progress',
      startedAt: new Date()
    });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`trip:${tripId}`).emit('trip:status-updated', {
        tripId,
        status: 'in_progress',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: trip,
      message: 'Trip started'
    });
  } catch (error) {
    console.error('Start trip error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to start trip' }
    });
  }
};

/**
 * Complete trip
 */
exports.completeTrip = async (req, res) => {
  try {
    const { tripId } = req.params;

    const driver = await Driver.findOne({
      where: { userId: req.user.id }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: { code: 'DRIVER_NOT_FOUND', message: 'Driver profile not found' }
      });
    }

    const trip = await Trip.findOne({
      where: { id: tripId, driverId: driver.id }
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: { code: 'TRIP_NOT_FOUND', message: 'Trip not found' }
      });
    }

    await trip.update({
      status: 'completed',
      completedAt: new Date()
    });

    // Update driver stats
    await driver.update({
      totalTrips: (driver.totalTrips || 0) + 1,
      totalEarnings: parseFloat(driver.totalEarnings || 0) + parseFloat(trip.driverEarnings || 0),
      availableBalance: parseFloat(driver.availableBalance || 0) + parseFloat(trip.driverEarnings || 0),
      status: 'online'
    });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`trip:${tripId}`).emit('trip:status-updated', {
        tripId,
        status: 'completed',
        timestamp: new Date()
      });
      io.to('admin').emit('trip:status-updated', {
        tripId,
        status: 'completed',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: trip,
      message: 'Trip completed'
    });
  } catch (error) {
    console.error('Complete trip error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to complete trip' }
    });
  }
};

/**
 * Cancel trip (by driver)
 */
exports.cancelTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { reason } = req.body;

    const driver = await Driver.findOne({
      where: { userId: req.user.id }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: { code: 'DRIVER_NOT_FOUND', message: 'Driver profile not found' }
      });
    }

    const trip = await Trip.findOne({
      where: { id: tripId, driverId: driver.id }
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: { code: 'TRIP_NOT_FOUND', message: 'Trip not found' }
      });
    }

    if (trip.status === 'completed' || trip.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: { code: 'TRIP_ALREADY_ENDED', message: 'Trip has already ended' }
      });
    }

    await trip.update({
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelledBy: 'driver',
      cancellationReason: reason
    });

    await driver.update({ status: 'online' });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`trip:${tripId}`).emit('trip:status-updated', {
        tripId,
        status: 'cancelled',
        cancelledBy: 'driver',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Trip cancelled'
    });
  } catch (error) {
    console.error('Cancel trip error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to cancel trip' }
    });
  }
};
