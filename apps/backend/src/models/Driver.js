module.exports = (sequelize, DataTypes) => {
  const Driver = sequelize.define('Driver', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    licenseNumber: {
      type: DataTypes.STRING,
      unique: true
    },
    licenseExpiry: {
      type: DataTypes.DATE
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'suspended', 'online', 'offline', 'busy'),
      defaultValue: 'pending'
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verificationNotes: {
      type: DataTypes.TEXT
    },
    totalTrips: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    totalEarnings: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    averageRating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.00
    },
    completionRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00
    },
    acceptanceRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00
    },
    currentLatitude: {
      type: DataTypes.DECIMAL(10, 8)
    },
    currentLongitude: {
      type: DataTypes.DECIMAL(11, 8)
    },
    currentAddress: {
      type: DataTypes.STRING
    },
    lastLocationUpdate: {
      type: DataTypes.DATE
    },
    bankAccountNumber: {
      type: DataTypes.STRING
    },
    bankName: {
      type: DataTypes.STRING
    },
    bankAccountName: {
      type: DataTypes.STRING
    },
    availableBalance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    }
  }, {
    tableName: 'drivers',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['status'] },
      { fields: ['license_number'] }
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
    Driver.hasMany(models.Rating, {
      foreignKey: 'driverId',
      as: 'ratingsReceived'
    });
    Driver.hasMany(models.DriverLocation, {
      foreignKey: 'driverId',
      as: 'locationHistory'
    });
    Driver.hasMany(models.DriverPayout, {
      foreignKey: 'driverId',
      as: 'payouts'
    });
  };

  return Driver;
};
