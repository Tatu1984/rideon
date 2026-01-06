module.exports = (sequelize, DataTypes) => {
  const PricingRule = sequelize.define('PricingRule', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    zoneId: {
      type: DataTypes.UUID,
      references: {
        model: 'zones',
        key: 'id'
      }
    },
    vehicleType: {
      type: DataTypes.ENUM('economy', 'comfort', 'premium', 'suv', 'xl'),
      allowNull: false
    },
    baseFare: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    perKmRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    perMinuteRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    bookingFee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    minimumFare: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    cancellationFee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    platformCommissionRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      comment: 'Percentage commission (e.g., 20.00 for 20%)'
    },
    peakHourMultiplier: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 1.00
    },
    peakHourStart: {
      type: DataTypes.TIME
    },
    peakHourEnd: {
      type: DataTypes.TIME
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    effectiveFrom: {
      type: DataTypes.DATE,
      allowNull: false
    },
    effectiveTo: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'pricing_rules',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['zone_id'] },
      { fields: ['vehicle_type'] },
      { fields: ['is_active'] }
    ]
  });

  PricingRule.associate = (models) => {
    PricingRule.belongsTo(models.Zone, {
      foreignKey: 'zone_id',
      as: 'zone'
    });
  };

  return PricingRule;
};
