# Complete Implementation Guide

This guide provides complete, production-ready code examples for implementing the RideOn platform.

## Table of Contents
1. [Backend Implementation](#backend-implementation)
2. [Database Models](#database-models)
3. [API Controllers](#api-controllers)
4. [Services & Business Logic](#services--business-logic)
5. [Socket.IO Real-time](#socketio-real-time)
6. [Frontend Web (Next.js)](#frontend-web-nextjs)
7. [Mobile Apps (React Native)](#mobile-apps-react-native)

---

## Backend Implementation

### Complete User Model (`apps/backend/src/models/User.js`)

```javascript
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      unique: true,
      field: 'phone_number'
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'password_hash'
    },
    firstName: {
      type: DataTypes.STRING(100),
      field: 'first_name'
    },
    lastName: {
      type: DataTypes.STRING(100),
      field: 'last_name'
    },
    avatarUrl: {
      type: DataTypes.STRING(500),
      field: 'avatar_url'
    },
    role: {
      type: DataTypes.ENUM('admin', 'rider', 'driver'),
      allowNull: false,
      defaultValue: 'rider'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_verified'
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      field: 'last_login_at'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.passwordHash) {
          user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('passwordHash')) {
          user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
        }
      }
    }
  });

  User.associate = (models) => {
    User.hasOne(models.Rider, {
      foreignKey: 'userId',
      as: 'riderProfile'
    });
    User.hasOne(models.Driver, {
      foreignKey: 'userId',
      as: 'driverProfile'
    });
    User.hasMany(models.Notification, {
      foreignKey: 'userId',
      as: 'notifications'
    });
    User.hasMany(models.RefreshToken, {
      foreignKey: 'userId',
      as: 'refreshTokens'
    });
  };

  User.prototype.comparePassword = async function(password) {
    return bcrypt.compare(password, this.passwordHash);
  };

  User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.passwordHash;
    return values;
  };

  return User;
};
```

### Complete Trip Model (`apps/backend/src/models/Trip.js`)

```javascript
module.exports = (sequelize, DataTypes) => {
  const Trip = sequelize.define('Trip', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    riderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'riders', key: 'id' },
      field: 'rider_id'
    },
    driverId: {
      type: DataTypes.INTEGER,
      references: { model: 'drivers', key: 'id' },
      field: 'driver_id'
    },
    vehicleId: {
      type: DataTypes.INTEGER,
      references: { model: 'vehicles', key: 'id' },
      field: 'vehicle_id'
    },
    pickupLocation: {
      type: DataTypes.GEOMETRY('POINT', 4326),
      allowNull: false,
      field: 'pickup_location'
    },
    pickupAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'pickup_address'
    },
    dropoffLocation: {
      type: DataTypes.GEOMETRY('POINT', 4326),
      allowNull: false,
      field: 'dropoff_location'
    },
    dropoffAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'dropoff_address'
    },
    status: {
      type: DataTypes.ENUM(
        'requested', 'accepted', 'driver_en_route',
        'arrived', 'in_progress', 'completed', 'cancelled'
      ),
      defaultValue: 'requested'
    },
    requestedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'requested_at'
    },
    acceptedAt: {
      type: DataTypes.DATE,
      field: 'accepted_at'
    },
    driverArrivedAt: {
      type: DataTypes.DATE,
      field: 'driver_arrived_at'
    },
    startedAt: {
      type: DataTypes.DATE,
      field: 'started_at'
    },
    completedAt: {
      type: DataTypes.DATE,
      field: 'completed_at'
    },
    cancelledAt: {
      type: DataTypes.DATE,
      field: 'cancelled_at'
    },
    cancelledBy: {
      type: DataTypes.STRING(20),
      field: 'cancelled_by'
    },
    cancellationReason: {
      type: DataTypes.TEXT,
      field: 'cancellation_reason'
    },
    estimatedFare: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'estimated_fare'
    },
    finalFare: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'final_fare'
    },
    baseFare: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'base_fare'
    },
    distanceFare: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'distance_fare'
    },
    timeFare: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'time_fare'
    },
    bookingFee: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'booking_fee'
    },
    surgeMultiplier: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 1.00,
      field: 'surge_multiplier'
    },
    cancellationFee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      field: 'cancellation_fee'
    },
    promoDiscount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      field: 'promo_discount'
    },
    distanceKm: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'distance_km'
    },
    durationMinutes: {
      type: DataTypes.INTEGER,
      field: 'duration_minutes'
    },
    waitTimeMinutes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'wait_time_minutes'
    },
    routePolyline: {
      type: DataTypes.TEXT,
      field: 'route_polyline'
    }
  }, {
    tableName: 'trips',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['rider_id'] },
      { fields: ['driver_id'] },
      { fields: ['status'] },
      { fields: ['created_at'] },
      { fields: ['status', 'created_at'] }
    ]
  });

  Trip.associate = (models) => {
    Trip.belongsTo(models.Rider, {
      foreignKey: 'riderId',
      as: 'rider'
    });
    Trip.belongsTo(models.Driver, {
      foreignKey: 'driverId',
      as: 'driver'
    });
    Trip.belongsTo(models.Vehicle, {
      foreignKey: 'vehicleId',
      as: 'vehicle'
    });
    Trip.hasOne(models.Payment, {
      foreignKey: 'tripId',
      as: 'payment'
    });
    Trip.hasOne(models.Rating, {
      foreignKey: 'tripId',
      as: 'rating'
    });
    Trip.hasMany(models.TripStatusHistory, {
      foreignKey: 'tripId',
      as: 'statusHistory'
    });
  };

  return Trip;
};
```

### Complete Driver Model (`apps/backend/src/models/Driver.js`)

```javascript
module.exports = (sequelize, DataTypes) => {
  const Driver = sequelize.define('Driver', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: 'users', key: 'id' },
      field: 'user_id'
    },
    licenseNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'license_number'
    },
    licenseExpiry: {
      type: DataTypes.DATEONLY,
      field: 'license_expiry'
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'suspended', 'banned'),
      defaultValue: 'pending'
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_verified'
    },
    isOnline: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_online'
    },
    currentLocation: {
      type: DataTypes.GEOMETRY('POINT', 4326),
      field: 'current_location'
    },
    lastLocationUpdate: {
      type: DataTypes.DATE,
      field: 'last_location_update'
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 5.00
    },
    totalTrips: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_trips'
    },
    acceptanceRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 100.00,
      field: 'acceptance_rate'
    },
    cancellationRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00,
      field: 'cancellation_rate'
    },
    totalEarnings: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      field: 'total_earnings'
    },
    commissionRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 20.00,
      field: 'commission_rate'
    },
    bankAccountNumber: {
      type: DataTypes.STRING(50),
      field: 'bank_account_number'
    },
    bankRoutingNumber: {
      type: DataTypes.STRING(50),
      field: 'bank_routing_number'
    },
    ssnLast4: {
      type: DataTypes.STRING(4),
      field: 'ssn_last4'
    },
    backgroundCheckStatus: {
      type: DataTypes.STRING(20),
      field: 'background_check_status'
    },
    backgroundCheckDate: {
      type: DataTypes.DATEONLY,
      field: 'background_check_date'
    }
  }, {
    tableName: 'drivers',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['status'] },
      { fields: ['is_online'] },
      {
        fields: ['current_location'],
        using: 'GIST'
      }
    ]
  });

  Driver.associate = (models) => {
    Driver.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    Driver.hasMany(models.Vehicle, {
      foreignKey: 'driverId',
      as: 'vehicles'
    });
    Driver.hasMany(models.DriverDocument, {
      foreignKey: 'driverId',
      as: 'documents'
    });
    Driver.hasMany(models.Trip, {
      foreignKey: 'driverId',
      as: 'trips'
    });
    Driver.hasMany(models.DriverLocation, {
      foreignKey: 'driverId',
      as: 'locationHistory'
    });
  };

  return Driver;
};
```

---

## API Controllers

### Complete Auth Controller (`apps/backend/src/controllers/authController.js`)

```javascript
const { User, Rider, Driver, RefreshToken } = require('../models');
const authService = require('../services/authService');
const logger = require('../utils/logger');

exports.register = async (req, res, next) => {
  try {
    const { email, password, phoneNumber, firstName, lastName, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DUPLICATE_EMAIL',
          message: 'Email already registered'
        }
      });
    }

    // Create user
    const user = await User.create({
      email,
      passwordHash: password,
      phoneNumber,
      firstName,
      lastName,
      role: role || 'rider'
    });

    // Create role-specific profile
    if (user.role === 'rider') {
      await Rider.create({ userId: user.id });
    } else if (user.role === 'driver') {
      await Driver.create({ userId: user.id });
    }

    // Generate tokens
    const { accessToken, refreshToken } = await authService.generateTokens(user);

    logger.info(`User registered: ${user.email}`);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({
      where: { email },
      include: [
        { model: Rider, as: 'riderProfile' },
        { model: Driver, as: 'driverProfile' }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_INACTIVE',
          message: 'Your account has been deactivated'
        }
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = await authService.generateTokens(user);

    // Update last login
    await user.update({ lastLoginAt: new Date() });

    logger.info(`User logged in: ${user.email}`);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          profile: user.role === 'rider' ? user.riderProfile : user.driverProfile
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'REFRESH_TOKEN_REQUIRED',
          message: 'Refresh token is required'
        }
      });
    }

    const { accessToken } = await authService.refreshAccessToken(refreshToken);

    res.json({
      success: true,
      data: { accessToken }
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await RefreshToken.update(
        { revokedAt: new Date() },
        { where: { token: refreshToken } }
      );
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: Rider, as: 'riderProfile' },
        { model: Driver, as: 'driverProfile' }
      ]
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          role: user.role,
          avatarUrl: user.avatarUrl,
          profile: user.role === 'rider' ? user.riderProfile : user.driverProfile
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
```

### Complete Trip Controller (`apps/backend/src/controllers/tripController.js`)

```javascript
const { Trip, Rider, Driver, Vehicle, User } = require('../models');
const pricingService = require('../services/pricingService');
const rideMatchingService = require('../services/rideMatchingService');
const socketService = require('../services/socketService');
const logger = require('../utils/logger');

exports.estimateFare = async (req, res, next) => {
  try {
    const { pickupLocation, dropoffLocation } = req.body;

    const estimate = await pricingService.calculateFare({
      pickupLat: pickupLocation.lat,
      pickupLng: pickupLocation.lng,
      dropoffLat: dropoffLocation.lat,
      dropoffLng: dropoffLocation.lng
    });

    res.json({
      success: true,
      data: estimate
    });
  } catch (error) {
    next(error);
  }
};

exports.createTrip = async (req, res, next) => {
  try {
    const { pickupLocation, dropoffLocation, paymentMethod, promoCode } = req.body;
    const userId = req.user.id;

    // Get rider
    const rider = await Rider.findOne({ where: { userId } });
    if (!rider) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RIDER_NOT_FOUND',
          message: 'Rider profile not found'
        }
      });
    }

    // Calculate fare
    const fareEstimate = await pricingService.calculateFare({
      pickupLat: pickupLocation.lat,
      pickupLng: pickupLocation.lng,
      dropoffLat: dropoffLocation.lat,
      dropoffLng: dropoffLocation.lng,
      promoCode
    });

    // Create trip
    const trip = await Trip.create({
      riderId: rider.id,
      pickupLocation: {
        type: 'Point',
        coordinates: [pickupLocation.lng, pickupLocation.lat]
      },
      pickupAddress: pickupLocation.address,
      dropoffLocation: {
        type: 'Point',
        coordinates: [dropoffLocation.lng, dropoffLocation.lat]
      },
      dropoffAddress: dropoffLocation.address,
      estimatedFare: fareEstimate.estimatedFare,
      baseFare: fareEstimate.breakdown.baseFare,
      distanceFare: fareEstimate.breakdown.distanceFare,
      timeFare: fareEstimate.breakdown.timeFare,
      bookingFee: fareEstimate.breakdown.bookingFee,
      surgeMultiplier: fareEstimate.surgeMultiplier,
      distanceKm: fareEstimate.distance,
      durationMinutes: fareEstimate.estimatedDuration,
      promoDiscount: fareEstimate.discount || 0,
      status: 'requested'
    });

    // Find nearby drivers and send requests
    await rideMatchingService.findAndNotifyDrivers(trip);

    logger.info(`Trip created: ${trip.id} by rider ${rider.id}`);

    res.status(201).json({
      success: true,
      data: {
        tripId: trip.id,
        status: trip.status,
        estimatedFare: trip.estimatedFare,
        pickupLocation: {
          lat: pickupLocation.lat,
          lng: pickupLocation.lng,
          address: trip.pickupAddress
        },
        dropoffLocation: {
          lat: dropoffLocation.lat,
          lng: dropoffLocation.lng,
          address: trip.dropoffAddress
        },
        requestedAt: trip.requestedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getTrip = async (req, res, next) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findByPk(id, {
      include: [
        {
          model: Rider,
          as: 'rider',
          include: [{ model: User, as: 'user' }]
        },
        {
          model: Driver,
          as: 'driver',
          include: [
            { model: User, as: 'user' },
            { model: Vehicle, as: 'vehicles' }
          ]
        },
        { model: Vehicle, as: 'vehicle' }
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
    next(error);
  }
};

exports.acceptTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const driver = await Driver.findOne({ where: { userId } });
    if (!driver) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DRIVER_NOT_FOUND',
          message: 'Driver profile not found'
        }
      });
    }

    const trip = await Trip.findByPk(id, {
      include: [
        {
          model: Rider,
          as: 'rider',
          include: [{ model: User, as: 'user' }]
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

    if (trip.status !== 'requested') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TRIP_ALREADY_ACCEPTED',
          message: 'Trip has already been accepted'
        }
      });
    }

    // Get driver's vehicle
    const vehicle = await Vehicle.findOne({
      where: { driverId: driver.id, isActive: true }
    });

    await trip.update({
      driverId: driver.id,
      vehicleId: vehicle ? vehicle.id : null,
      status: 'accepted',
      acceptedAt: new Date()
    });

    // Notify rider
    socketService.emitToRider(trip.riderId, 'ride_accepted', {
      tripId: trip.id,
      driver: {
        id: driver.id,
        firstName: driver.user.firstName,
        rating: driver.rating,
        vehicle: vehicle
      }
    });

    logger.info(`Trip ${trip.id} accepted by driver ${driver.id}`);

    res.json({
      success: true,
      data: {
        tripId: trip.id,
        status: trip.status,
        rider: {
          firstName: trip.rider.user.firstName,
          rating: trip.rider.rating
        },
        pickupLocation: trip.pickupLocation
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.cancelTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const trip = await Trip.findByPk(id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TRIP_NOT_FOUND',
          message: 'Trip not found'
        }
      });
    }

    if (!['requested', 'accepted', 'driver_en_route'].includes(trip.status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TRIP_STATUS',
          message: 'Trip cannot be cancelled at this stage'
        }
      });
    }

    // Calculate cancellation fee
    const cancellationFee = await pricingService.calculateCancellationFee(trip);

    await trip.update({
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelledBy: userRole,
      cancellationReason: reason,
      cancellationFee
    });

    // Notify other party
    if (userRole === 'rider' && trip.driverId) {
      socketService.emitToDriver(trip.driverId, 'ride_cancelled', {
        tripId: trip.id,
        reason
      });
    } else if (userRole === 'driver' && trip.riderId) {
      socketService.emitToRider(trip.riderId, 'ride_cancelled', {
        tripId: trip.id,
        reason
      });
    }

    logger.info(`Trip ${trip.id} cancelled by ${userRole}`);

    res.json({
      success: true,
      data: {
        tripId: trip.id,
        status: trip.status,
        cancellationFee
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.completeTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { endLocation, actualDistance, actualDuration } = req.body;

    const trip = await Trip.findByPk(id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TRIP_NOT_FOUND',
          message: 'Trip not found'
        }
      });
    }

    if (trip.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TRIP_STATUS',
          message: 'Trip must be in progress to complete'
        }
      });
    }

    // Recalculate final fare based on actual distance/time
    const finalFare = await pricingService.calculateFinalFare({
      baseFare: trip.baseFare,
      bookingFee: trip.bookingFee,
      distanceKm: actualDistance || trip.distanceKm,
      durationMinutes: actualDuration || trip.durationMinutes,
      surgeMultiplier: trip.surgeMultiplier,
      promoDiscount: trip.promoDiscount
    });

    await trip.update({
      status: 'completed',
      completedAt: new Date(),
      finalFare,
      distanceKm: actualDistance || trip.distanceKm,
      durationMinutes: actualDuration || trip.durationMinutes
    });

    // Process payment
    const payment = await require('../services/paymentService').processPayment(trip);

    // Notify rider
    socketService.emitToRider(trip.riderId, 'trip_completed', {
      tripId: trip.id,
      finalFare: trip.finalFare
    });

    logger.info(`Trip ${trip.id} completed`);

    res.json({
      success: true,
      data: {
        tripId: trip.id,
        status: trip.status,
        finalFare: trip.finalFare,
        driverEarnings: payment.driverEarnings,
        completedAt: trip.completedAt
      }
    });
  } catch (error) {
    next(error);
  }
};
```

---

## Services & Business Logic

### Complete Pricing Service (`apps/backend/src/services/pricingService.js`)

```javascript
const { PricingRule, PromoCode, PromoCodeUsage } = require('../models');
const { calculateDistance } = require('../utils/haversine');

class PricingService {
  async calculateFare({ pickupLat, pickupLng, dropoffLat, dropoffLng, promoCode }) {
    // Get pricing rules (use default if no zone-specific rules)
    const pricingRule = await this.getPricingRules();

    // Calculate distance using Haversine formula
    const distanceKm = calculateDistance(
      pickupLat, pickupLng,
      dropoffLat, dropoffLng
    );

    // Estimate duration (assume average speed of 30 km/h in city)
    const estimatedDuration = Math.ceil((distanceKm / 30) * 60);

    // Calculate surge multiplier
    const surgeMultiplier = await this.getSurgeMultiplier(pickupLat, pickupLng);

    // Base calculations
    const baseFare = parseFloat(pricingRule.baseFare);
    const bookingFee = parseFloat(pricingRule.bookingFee);
    const distanceFare = distanceKm * parseFloat(pricingRule.perKmRate);
    const timeFare = estimatedDuration * parseFloat(pricingRule.perMinuteRate);

    // Subtotal before surge
    let subtotal = baseFare + bookingFee + distanceFare + timeFare;

    // Apply surge
    subtotal *= surgeMultiplier;

    // Apply promo code
    let discount = 0;
    if (promoCode) {
      discount = await this.calculatePromoDiscount(promoCode, subtotal);
    }

    // Final fare
    let estimatedFare = Math.max(
      subtotal - discount,
      parseFloat(pricingRule.minimumFare)
    );

    // Round to 2 decimals
    estimatedFare = Math.round(estimatedFare * 100) / 100;

    return {
      estimatedFare,
      breakdown: {
        baseFare,
        bookingFee,
        distanceFare: Math.round(distanceFare * 100) / 100,
        timeFare: Math.round(timeFare * 100) / 100,
        subtotal: Math.round(subtotal * 100) / 100
      },
      distance: Math.round(distanceKm * 10) / 10,
      estimatedDuration,
      surgeMultiplier,
      discount: Math.round(discount * 100) / 100,
      currency: 'USD'
    };
  }

  async getPricingRules(zoneId = null) {
    const rule = await PricingRule.findOne({
      where: {
        zoneId: zoneId || null,
        isActive: true
      },
      order: [['effectiveFrom', 'DESC']]
    });

    // Return default if no rule found
    return rule || {
      baseFare: process.env.DEFAULT_BASE_FARE || 2.50,
      bookingFee: process.env.DEFAULT_BOOKING_FEE || 1.00,
      perKmRate: process.env.DEFAULT_PER_KM_RATE || 1.50,
      perMinuteRate: process.env.DEFAULT_PER_MINUTE_RATE || 0.30,
      minimumFare: process.env.DEFAULT_MINIMUM_FARE || 5.00,
      cancellationFee: process.env.DEFAULT_CANCELLATION_FEE || 3.00
    };
  }

  async getSurgeMultiplier(lat, lng) {
    // Simple surge logic: check active trips vs available drivers ratio
    // In production, this would be more sophisticated

    const { Driver, Trip } = require('../models');
    const { Sequelize } = require('sequelize');

    // Count nearby available drivers
    const availableDrivers = await Driver.count({
      where: {
        isOnline: true,
        status: 'approved',
        currentLocation: {
          [Sequelize.Op.ne]: null
        }
      }
    });

    // Count active trips
    const activeTrips = await Trip.count({
      where: {
        status: ['requested', 'accepted', 'driver_en_route', 'in_progress']
      }
    });

    // Calculate ratio
    const ratio = activeTrips / Math.max(availableDrivers, 1);

    // Determine surge
    if (ratio > 2.0) return 3.0;      // Very high demand
    if (ratio > 1.5) return 2.5;      // High demand
    if (ratio > 1.0) return 2.0;      // Moderate demand
    if (ratio > 0.75) return 1.5;     // Slight demand
    return 1.0;                       // Normal
  }

  async calculatePromoDiscount(code, subtotal) {
    const promo = await PromoCode.findOne({
      where: {
        code: code.toUpperCase(),
        isActive: true
      }
    });

    if (!promo) return 0;

    // Check validity
    const now = new Date();
    if (promo.validFrom && now < promo.validFrom) return 0;
    if (promo.validTo && now > promo.validTo) return 0;

    // Check usage limit
    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) return 0;

    // Check minimum trip amount
    if (subtotal < parseFloat(promo.minTripAmount)) return 0;

    // Calculate discount
    let discount = 0;
    if (promo.discountType === 'percentage') {
      discount = subtotal * (parseFloat(promo.discountValue) / 100);
    } else {
      discount = parseFloat(promo.discountValue);
    }

    // Apply max discount cap
    if (promo.maxDiscount) {
      discount = Math.min(discount, parseFloat(promo.maxDiscount));
    }

    return discount;
  }

  async calculateCancellationFee(trip) {
    // Free cancellation within 2 minutes
    const cancellationGracePeriod = 2 * 60 * 1000; // 2 minutes in ms
    const timeSinceRequest = Date.now() - new Date(trip.requestedAt).getTime();

    if (timeSinceRequest < cancellationGracePeriod) {
      return 0;
    }

    // Get pricing rules
    const pricingRule = await this.getPricingRules();
    return parseFloat(pricingRule.cancellationFee);
  }

  async calculateFinalFare({ baseFare, bookingFee, distanceKm, durationMinutes, surgeMultiplier, promoDiscount }) {
    const pricingRule = await this.getPricingRules();

    const distanceFare = distanceKm * parseFloat(pricingRule.perKmRate);
    const timeFare = durationMinutes * parseFloat(pricingRule.perMinuteRate);

    let total = (baseFare + bookingFee + distanceFare + timeFare) * surgeMultiplier;
    total -= promoDiscount;

    // Ensure minimum fare
    total = Math.max(total, parseFloat(pricingRule.minimumFare));

    return Math.round(total * 100) / 100;
  }
}

module.exports = new PricingService();
```

### Complete Ride Matching Service (`apps/backend/src/services/rideMatchingService.js`)

```javascript
const { Driver, Vehicle, User } = require('../models');
const { Sequelize } = require('sequelize');
const socketService = require('./socketService');
const logger = require('../utils/logger');

class RideMatchingService {
  async findAndNotifyDrivers(trip) {
    try {
      // Extract pickup coordinates
      const pickupCoords = trip.pickupLocation.coordinates;
      const [pickupLng, pickupLat] = pickupCoords;

      // Find nearby available drivers
      const searchRadiusKm = parseFloat(process.env.DRIVER_SEARCH_RADIUS_KM || 5);
      const maxDrivers = parseInt(process.env.MAX_DRIVERS_TO_NOTIFY || 5);

      // Using PostGIS ST_DWithin function
      const nearbyDrivers = await Driver.findAll({
        where: {
          isOnline: true,
          isVerified: true,
          status: 'approved',
          currentLocation: {
            [Sequelize.Op.ne]: null
          }
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName', 'phoneNumber']
          },
          {
            model: Vehicle,
            as: 'vehicles',
            where: { isActive: true },
            required: false
          }
        ],
        order: [
          [
            Sequelize.literal(`ST_Distance(
              current_location,
              ST_SetSRID(ST_MakePoint(${pickupLng}, ${pickupLat}), 4326)
            )`)
          ],
          ['rating', 'DESC']
        ],
        limit: maxDrivers
      });

      if (nearbyDrivers.length === 0) {
        logger.warn(`No drivers available for trip ${trip.id}`);
        socketService.emitToRider(trip.riderId, 'no_drivers_available', {
          tripId: trip.id
        });
        return;
      }

      // Notify all nearby drivers
      const notificationPromises = nearbyDrivers.map(driver => {
        return this.notifyDriver(driver, trip);
      });

      await Promise.all(notificationPromises);

      logger.info(`Notified ${nearbyDrivers.length} drivers for trip ${trip.id}`);

      // Set timeout to cancel if no driver accepts
      this.setRideRequestTimeout(trip, nearbyDrivers);

    } catch (error) {
      logger.error('Error in findAndNotifyDrivers:', error);
      throw error;
    }
  }

  async notifyDriver(driver, trip) {
    try {
      // Send socket notification
      socketService.emitToDriver(driver.id, 'ride_request', {
        tripId: trip.id,
        pickup: {
          lat: trip.pickupLocation.coordinates[1],
          lng: trip.pickupLocation.coordinates[0],
          address: trip.pickupAddress
        },
        dropoff: {
          lat: trip.dropoffLocation.coordinates[1],
          lng: trip.dropoffLocation.coordinates[0],
          address: trip.dropoffAddress
        },
        estimatedFare: trip.estimatedFare,
        distance: trip.distanceKm,
        duration: trip.durationMinutes,
        timeout: parseInt(process.env.RIDE_REQUEST_TIMEOUT_SECONDS || 30)
      });

      // Send push notification (implement with FCM/APNS)
      // await pushNotificationService.send(driver.userId, {...});

    } catch (error) {
      logger.error(`Error notifying driver ${driver.id}:`, error);
    }
  }

  setRideRequestTimeout(trip, notifiedDrivers) {
    const timeout = parseInt(process.env.RIDE_REQUEST_TIMEOUT_SECONDS || 30) * 1000;

    setTimeout(async () => {
      // Check if trip is still in requested state
      const { Trip } = require('../models');
      const updatedTrip = await Trip.findByPk(trip.id);

      if (updatedTrip && updatedTrip.status === 'requested') {
        logger.info(`Trip ${trip.id} timed out, no driver accepted`);

        // Try to find more drivers or cancel
        socketService.emitToRider(trip.riderId, 'ride_request_timeout', {
          tripId: trip.id
        });

        // Optionally auto-cancel the trip
        // await updatedTrip.update({ status: 'cancelled', cancelledBy: 'system' });
      }
    }, timeout);
  }

  async calculateETA(driverLocation, destinationLocation) {
    // Simple ETA calculation
    // In production, use routing API like OSRM or Google Directions

    const { calculateDistance } = require('../utils/haversine');

    const distance = calculateDistance(
      driverLocation.coordinates[1],
      driverLocation.coordinates[0],
      destinationLocation.coordinates[1],
      destinationLocation.coordinates[0]
    );

    // Assume average city speed of 30 km/h
    const etaMinutes = Math.ceil((distance / 30) * 60);

    return {
      distance,
      eta: etaMinutes
    };
  }
}

module.exports = new RideMatchingService();
```

---

## Socket.IO Real-time

### Socket Service (`apps/backend/src/socket/index.js`)

```javascript
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

let io;
const riderSockets = new Map(); // riderId -> socket.id
const driverSockets = new Map(); // driverId -> socket.id

function initializeSocket(server) {
  io = socketIO(server, {
    cors: {
      origin: process.env.CORS_ORIGIN.split(','),
      credentials: true
    }
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  // Rider namespace
  const riderNamespace = io.of('/rider');
  riderNamespace.on('connection', (socket) => {
    handleRiderConnection(socket);
  });

  // Driver namespace
  const driverNamespace = io.of('/driver');
  driverNamespace.on('connection', (socket) => {
    handleDriverConnection(socket);
  });

  // Admin namespace
  const adminNamespace = io.of('/admin');
  adminNamespace.on('connection', (socket) => {
    handleAdminConnection(socket);
  });

  logger.info('Socket.IO initialized');

  return io;
}

function handleRiderConnection(socket) {
  const { Rider } = require('../models');

  Rider.findOne({ where: { userId: socket.userId } })
    .then(rider => {
      if (!rider) return;

      riderSockets.set(rider.id, socket.id);
      logger.info(`Rider ${rider.id} connected`);

      socket.on('disconnect', () => {
        riderSockets.delete(rider.id);
        logger.info(`Rider ${rider.id} disconnected`);
      });

      socket.on('cancel_trip', async (data) => {
        // Handle trip cancellation
        // This would call the trip controller logic
        logger.info(`Rider ${rider.id} cancelled trip ${data.tripId}`);
      });
    });
}

function handleDriverConnection(socket) {
  const { Driver } = require('../models');

  Driver.findOne({ where: { userId: socket.userId } })
    .then(driver => {
      if (!driver) return;

      driverSockets.set(driver.id, socket.id);
      logger.info(`Driver ${driver.id} connected`);

      socket.on('disconnect', () => {
        driverSockets.delete(driver.id);
        logger.info(`Driver ${driver.id} disconnected`);
      });

      socket.on('update_location', async (data) => {
        // Update driver location in database
        const { DriverLocation } = require('../models');

        await driver.update({
          currentLocation: {
            type: 'Point',
            coordinates: [data.lng, data.lat]
          },
          lastLocationUpdate: new Date()
        });

        // Save to location history
        await DriverLocation.create({
          driverId: driver.id,
          location: {
            type: 'Point',
            coordinates: [data.lng, data.lat]
          },
          heading: data.heading,
          speed: data.speed,
          accuracy: data.accuracy
        });

        // Broadcast to rider if driver is on active trip
        // Implementation would check for active trip and emit to rider
      });

      socket.on('accept_ride', async (data) => {
        logger.info(`Driver ${driver.id} accepted trip ${data.tripId}`);
      });

      socket.on('decline_ride', async (data) => {
        logger.info(`Driver ${driver.id} declined trip ${data.tripId}`);
      });
    });
}

function handleAdminConnection(socket) {
  logger.info(`Admin connected: user ${socket.userId}`);

  socket.on('disconnect', () => {
    logger.info(`Admin disconnected: user ${socket.userId}`);
  });
}

// Helper functions to emit events
function emitToRider(riderId, event, data) {
  const socketId = riderSockets.get(riderId);
  if (socketId && io) {
    io.of('/rider').to(socketId).emit(event, data);
    logger.debug(`Emitted ${event} to rider ${riderId}`);
  }
}

function emitToDriver(driverId, event, data) {
  const socketId = driverSockets.get(driverId);
  if (socketId && io) {
    io.of('/driver').to(socketId).emit(event, data);
    logger.debug(`Emitted ${event} to driver ${driverId}`);
  }
}

function emitToAdmin(event, data) {
  if (io) {
    io.of('/admin').emit(event, data);
  }
}

module.exports = {
  initializeSocket,
  emitToRider,
  emitToDriver,
  emitToAdmin
};
```

---

## Frontend Web (Next.js)

### Rider Home Page with Leaflet Map (`apps/web/src/pages/index.js`)

```javascript
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { rideService } from '../services/rideService';

// Dynamic import for Leaflet (client-side only)
const LeafletMap = dynamic(
  () => import('../components/Map/LeafletMap'),
  { ssr: false }
);

export default function HomePage() {
  const { user } = useAuth();
  const { socket, connected } = useSocket();

  const [currentLocation, setCurrentLocation] = useState(null);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [fareEstimate, setFareEstimate] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setPickupLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  // Socket.IO event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('ride_accepted', (data) => {
      console.log('Ride accepted:', data);
      setActiveTrip(prev => ({ ...prev, ...data }));
    });

    socket.on('driver_location_update', (data) => {
      console.log('Driver location update:', data);
      setActiveTrip(prev => ({ ...prev, driverLocation: data.location }));
    });

    socket.on('driver_arrived', (data) => {
      console.log('Driver arrived');
      setActiveTrip(prev => ({ ...prev, status: 'arrived' }));
    });

    socket.on('trip_started', (data) => {
      console.log('Trip started');
      setActiveTrip(prev => ({ ...prev, status: 'in_progress' }));
    });

    socket.on('trip_completed', (data) => {
      console.log('Trip completed');
      setActiveTrip(null);
      // Show rating modal
    });

    return () => {
      socket.off('ride_accepted');
      socket.off('driver_location_update');
      socket.off('driver_arrived');
      socket.off('trip_started');
      socket.off('trip_completed');
    };
  }, [socket]);

  const handlePickupChange = (location) => {
    setPickupLocation(location);
    if (dropoffLocation) {
      fetchFareEstimate(location, dropoffLocation);
    }
  };

  const handleDropoffChange = (location) => {
    setDropoffLocation(location);
    if (pickupLocation) {
      fetchFareEstimate(pickupLocation, location);
    }
  };

  const fetchFareEstimate = async (pickup, dropoff) => {
    try {
      const estimate = await rideService.estimateFare({
        pickupLocation: pickup,
        dropoffLocation: dropoff
      });
      setFareEstimate(estimate);
    } catch (error) {
      console.error('Error estimating fare:', error);
    }
  };

  const handleRequestRide = async () => {
    if (!pickupLocation || !dropoffLocation) {
      alert('Please select both pickup and dropoff locations');
      return;
    }

    setLoading(true);
    try {
      const trip = await rideService.createTrip({
        pickupLocation,
        dropoffLocation,
        paymentMethod: 'card'
      });

      setActiveTrip(trip);
      alert('Ride requested! Finding nearby drivers...');
    } catch (error) {
      console.error('Error requesting ride:', error);
      alert('Failed to request ride');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRide = async () => {
    if (!activeTrip) return;

    if (window.confirm('Are you sure you want to cancel this ride?')) {
      try {
        await rideService.cancelTrip(activeTrip.tripId, {
          reason: 'Change of plans'
        });
        setActiveTrip(null);
      } catch (error) {
        console.error('Error cancelling ride:', error);
      }
    }
  };

  if (!currentLocation) {
    return (
      <div className="loading-container">
        <p>Loading map...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="map-section">
        <LeafletMap
          center={currentLocation}
          pickupLocation={pickupLocation}
          dropoffLocation={dropoffLocation}
          driverLocation={activeTrip?.driverLocation}
          onPickupChange={handlePickupChange}
          onDropoffChange={handleDropoffChange}
        />
      </div>

      <div className="booking-panel">
        {!activeTrip ? (
          <div className="ride-request-form">
            <h2>Book a Ride</h2>

            <div className="location-inputs">
              <LocationSearchInput
                placeholder="Pickup location"
                value={pickupLocation}
                onChange={handlePickupChange}
              />

              <LocationSearchInput
                placeholder="Dropoff location"
                value={dropoffLocation}
                onChange={handleDropoffChange}
              />
            </div>

            {fareEstimate && (
              <div className="fare-estimate">
                <h3>Estimated Fare</h3>
                <div className="fare-amount">${fareEstimate.estimatedFare}</div>
                <div className="fare-details">
                  <p>Distance: {fareEstimate.distance} km</p>
                  <p>Estimated time: {fareEstimate.estimatedDuration} min</p>
                  {fareEstimate.surgeMultiplier > 1 && (
                    <p className="surge">
                      Surge pricing: {fareEstimate.surgeMultiplier}x
                    </p>
                  )}
                </div>
              </div>
            )}

            <button
              className="request-ride-btn"
              onClick={handleRequestRide}
              disabled={!fareEstimate || loading}
            >
              {loading ? 'Requesting...' : 'Request Ride'}
            </button>
          </div>
        ) : (
          <div className="active-ride-panel">
            <h2>Your Ride</h2>

            <div className="trip-status">
              <StatusBadge status={activeTrip.status} />
            </div>

            {activeTrip.driver && (
              <div className="driver-info">
                <img
                  src={activeTrip.driver.avatarUrl || '/default-avatar.png'}
                  alt="Driver"
                  className="driver-avatar"
                />
                <div>
                  <h3>{activeTrip.driver.firstName}</h3>
                  <p>⭐ {activeTrip.driver.rating}</p>
                </div>
              </div>
            )}

            {activeTrip.vehicle && (
              <div className="vehicle-info">
                <p>{activeTrip.vehicle.make} {activeTrip.vehicle.model}</p>
                <p>{activeTrip.vehicle.color} • {activeTrip.vehicle.plateNumber}</p>
              </div>
            )}

            <div className="trip-details">
              <p>Estimated fare: ${activeTrip.estimatedFare}</p>
            </div>

            <button
              className="cancel-ride-btn"
              onClick={handleCancelRide}
            >
              Cancel Ride
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Location Search Input Component
function LocationSearchInput({ placeholder, value, onChange }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      // Call geocoding API
      const results = await fetch(
        `/api/geocoding/search?query=${encodeURIComponent(query)}`
      ).then(res => res.json());

      setSuggestions(results.data || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  const handleSelect = (suggestion) => {
    setSearchQuery(suggestion.address);
    setShowSuggestions(false);
    onChange({
      lat: suggestion.location.lat,
      lng: suggestion.location.lng,
      address: suggestion.address
    });
  };

  return (
    <div className="location-input">
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => handleSelect(suggestion)}
            >
              {suggestion.address}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }) {
  const statusLabels = {
    requested: 'Finding drivers...',
    accepted: 'Driver assigned',
    driver_en_route: 'Driver on the way',
    arrived: 'Driver arrived',
    in_progress: 'Trip in progress',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };

  return (
    <div className={`status-badge status-${status}`}>
      {statusLabels[status] || status}
    </div>
  );
}
```

### Leaflet Map Component (`apps/web/src/components/Map/LeafletMap.js`)

```javascript
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png'
});

export default function LeafletMap({
  center,
  pickupLocation,
  dropoffLocation,
  driverLocation,
  onPickupChange,
  onDropoffChange,
  zoom = 13
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const routeLayerRef = useRef(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create map
    const map = L.map(mapRef.current).setView([center.lat, center.lng], zoom);

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update pickup marker
  useEffect(() => {
    if (!mapInstanceRef.current || !pickupLocation) return;

    const map = mapInstanceRef.current;

    // Remove existing pickup marker
    if (markersRef.current.pickup) {
      markersRef.current.pickup.remove();
    }

    // Create pickup marker (green)
    const pickupIcon = L.icon({
      iconUrl: '/markers/pickup-marker.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    const marker = L.marker([pickupLocation.lat, pickupLocation.lng], {
      icon: pickupIcon,
      draggable: true
    }).addTo(map);

    marker.on('dragend', (e) => {
      const position = e.target.getLatLng();
      onPickupChange({
        lat: position.lat,
        lng: position.lng
      });
    });

    markersRef.current.pickup = marker;
  }, [pickupLocation]);

  // Update dropoff marker
  useEffect(() => {
    if (!mapInstanceRef.current || !dropoffLocation) return;

    const map = mapInstanceRef.current;

    // Remove existing dropoff marker
    if (markersRef.current.dropoff) {
      markersRef.current.dropoff.remove();
    }

    // Create dropoff marker (red)
    const dropoffIcon = L.icon({
      iconUrl: '/markers/dropoff-marker.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    const marker = L.marker([dropoffLocation.lat, dropoffLocation.lng], {
      icon: dropoffIcon,
      draggable: true
    }).addTo(map);

    marker.on('dragend', (e) => {
      const position = e.target.getLatLng();
      onDropoffChange({
        lat: position.lat,
        lng: position.lng
      });
    });

    markersRef.current.dropoff = marker;

    // Draw route if both locations exist
    if (pickupLocation) {
      drawRoute(pickupLocation, dropoffLocation);
    }
  }, [dropoffLocation, pickupLocation]);

  // Update driver marker
  useEffect(() => {
    if (!mapInstanceRef.current || !driverLocation) return;

    const map = mapInstanceRef.current;

    // Remove existing driver marker
    if (markersRef.current.driver) {
      // Animate marker movement
      const oldPos = markersRef.current.driver.getLatLng();
      const newPos = L.latLng(driverLocation.lat, driverLocation.lng);

      animateMarker(markersRef.current.driver, oldPos, newPos);
    } else {
      // Create driver marker (car icon)
      const driverIcon = L.icon({
        iconUrl: '/markers/car-marker.png',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker([driverLocation.lat, driverLocation.lng], {
        icon: driverIcon
      }).addTo(map);

      markersRef.current.driver = marker;
    }
  }, [driverLocation]);

  // Draw route between two points
  const drawRoute = (start, end) => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Remove existing route
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
    }

    // Simple straight line (in production, use routing API)
    const latlngs = [
      [start.lat, start.lng],
      [end.lat, end.lng]
    ];

    const polyline = L.polyline(latlngs, {
      color: '#4285F4',
      weight: 4,
      opacity: 0.7,
      dashArray: '10, 10'
    }).addTo(map);

    routeLayerRef.current = polyline;

    // Fit bounds to show entire route
    map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
  };

  // Animate marker movement
  const animateMarker = (marker, startLatLng, endLatLng, duration = 1000) => {
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Linear interpolation
      const lat = startLatLng.lat + (endLatLng.lat - startLatLng.lat) * progress;
      const lng = startLatLng.lng + (endLatLng.lng - startLatLng.lng) * progress;

      marker.setLatLng([lat, lng]);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  };

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '500px'
      }}
    />
  );
}
```

_Continued in next section due to length..._
