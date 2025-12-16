module.exports = (sequelize, DataTypes) => {
  const DriverPayout = sequelize.define('DriverPayout', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    driverId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'drivers',
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled'),
      defaultValue: 'pending'
    },
    paymentMethod: {
      type: DataTypes.ENUM('bank_transfer', 'upi', 'wallet', 'cash', 'cheque'),
      allowNull: false
    },
    transactionId: {
      type: DataTypes.STRING,
      unique: true
    },
    bankAccountNumber: {
      type: DataTypes.STRING
    },
    bankName: {
      type: DataTypes.STRING
    },
    periodStart: {
      type: DataTypes.DATE,
      allowNull: false
    },
    periodEnd: {
      type: DataTypes.DATE,
      allowNull: false
    },
    totalTrips: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    totalEarnings: {
      type: DataTypes.DECIMAL(10, 2)
    },
    platformFee: {
      type: DataTypes.DECIMAL(10, 2)
    },
    deductions: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    bonus: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    notes: {
      type: DataTypes.TEXT
    },
    processedBy: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    processedAt: {
      type: DataTypes.DATE
    },
    failureReason: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'driver_payouts',
    timestamps: true,
    indexes: [
      { fields: ['driver_id'] },
      { fields: ['status'] },
      { fields: ['period_start', 'period_end'] }
    ]
  });

  DriverPayout.associate = (models) => {
    DriverPayout.belongsTo(models.Driver, {
      foreignKey: 'driver_id',
      as: 'driver'
    });
    DriverPayout.belongsTo(models.User, {
      foreignKey: 'processed_by',
      as: 'processor'
    });
  };

  return DriverPayout;
};
