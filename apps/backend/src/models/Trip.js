module.exports = (sequelize, DataTypes) => {
  const Trip = sequelize.define('Trip', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    riderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'riders',
        key: 'id'
      }
    },
    driverId: {
      type: DataTypes.UUID,
      references: {
        model: 'drivers',
        key: 'id'
      }
    },
    vehicleId: {
      type: DataTypes.UUID,
      references: {
        model: 'vehicles',
        key: 'id'
      }
    },
    pickupAddress: {
      type: DataTypes.STRING,
      allowNull: false
    },
    pickupLatitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false
    },
    pickupLongitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false
    },
    dropoffAddress: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dropoffLatitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false
    },
    dropoffLongitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM(
        'requested',
        'accepted',
        'driver_arrived',
        'in_progress',
        'completed',
        'cancelled_by_rider',
        'cancelled_by_driver',
        'cancelled_by_admin'
      ),
      defaultValue: 'requested'
    },
    vehicleType: {
      type: DataTypes.ENUM('economy', 'comfort', 'premium', 'suv', 'xl'),
      allowNull: false
    },
    estimatedDistance: {
      type: DataTypes.DECIMAL(10, 2)
    },
    estimatedDuration: {
      type: DataTypes.INTEGER
    },
    actualDistance: {
      type: DataTypes.DECIMAL(10, 2)
    },
    actualDuration: {
      type: DataTypes.INTEGER
    },
    estimatedFare: {
      type: DataTypes.DECIMAL(10, 2)
    },
    baseFare: {
      type: DataTypes.DECIMAL(10, 2)
    },
    distanceFare: {
      type: DataTypes.DECIMAL(10, 2)
    },
    timeFare: {
      type: DataTypes.DECIMAL(10, 2)
    },
    surgeFare: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    totalFare: {
      type: DataTypes.DECIMAL(10, 2)
    },
    platformFee: {
      type: DataTypes.DECIMAL(10, 2)
    },
    driverEarnings: {
      type: DataTypes.DECIMAL(10, 2)
    },
    promoCodeId: {
      type: DataTypes.UUID,
      references: {
        model: 'promo_codes',
        key: 'id'
      }
    },
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'card', 'wallet', 'upi'),
      allowNull: false
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
      defaultValue: 'pending'
    },
    requestedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    acceptedAt: {
      type: DataTypes.DATE
    },
    arrivedAt: {
      type: DataTypes.DATE
    },
    startedAt: {
      type: DataTypes.DATE
    },
    completedAt: {
      type: DataTypes.DATE
    },
    cancelledAt: {
      type: DataTypes.DATE
    },
    cancellationReason: {
      type: DataTypes.TEXT
    },
    cancellationFee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    riderNotes: {
      type: DataTypes.TEXT
    },
    route: {
      type: DataTypes.JSON
    }
  }, {
    tableName: 'trips',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['rider_id'] },
      { fields: ['driver_id'] },
      { fields: ['status'] },
      { fields: ['requestedAt'] },
      { fields: ['completedAt'] }
    ]
  });

  Trip.associate = (models) => {
    Trip.belongsTo(models.Rider, {
      foreignKey: 'rider_id',
      as: 'rider'
    });
    Trip.belongsTo(models.Driver, {
      foreignKey: 'driver_id',
      as: 'driver'
    });
    Trip.belongsTo(models.Vehicle, {
      foreignKey: 'vehicle_id',
      as: 'vehicle'
    });
    Trip.belongsTo(models.PromoCode, {
      foreignKey: 'promo_code_id',
      as: 'promo_code'
    });
    Trip.hasMany(models.TripStatusHistory, {
      foreignKey: 'trip_id',
      as: 'statusHistory'
    });
    Trip.hasOne(models.Payment, {
      foreignKey: 'trip_id',
      as: 'payment'
    });
    Trip.hasOne(models.Rating, {
      foreignKey: 'tripId',
      as: 'rating'
    });
  };

  return Trip;
};
