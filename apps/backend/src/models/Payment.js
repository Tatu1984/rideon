module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    tripId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'trips',
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'card', 'wallet', 'upi'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'disputed'),
      defaultValue: 'pending'
    },
    transactionId: {
      type: DataTypes.STRING,
      unique: true
    },
    stripeChargeId: {
      type: DataTypes.STRING
    },
    disputeReason: {
      type: DataTypes.TEXT
    },
    paymentGateway: {
      type: DataTypes.STRING
    },
    paymentGatewayResponse: {
      type: DataTypes.JSON
    },
    refundAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    refundReason: {
      type: DataTypes.TEXT
    },
    refundedAt: {
      type: DataTypes.DATE
    },
    paidAt: {
      type: DataTypes.DATE
    },
    failureReason: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'payments',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['trip_id'] },
      { fields: ['status'] },
      { fields: ['transaction_id'] }
    ]
  });

  Payment.associate = (models) => {
    Payment.belongsTo(models.Trip, {
      foreignKey: 'trip_id',
      as: 'trip'
    });
  };

  return Payment;
};
