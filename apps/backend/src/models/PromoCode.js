module.exports = (sequelize, DataTypes) => {
  const PromoCode = sequelize.define('PromoCode', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT
    },
    discountType: {
      type: DataTypes.ENUM('percentage', 'fixed'),
      allowNull: false
    },
    discountValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    maxDiscountAmount: {
      type: DataTypes.DECIMAL(10, 2)
    },
    minTripAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    maxUsagePerUser: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    totalUsageLimit: {
      type: DataTypes.INTEGER
    },
    currentUsageCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    validFrom: {
      type: DataTypes.DATE,
      allowNull: false
    },
    validTo: {
      type: DataTypes.DATE,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    applicableVehicleTypes: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    applicableUserTypes: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: ['all']
    }
  }, {
    tableName: 'promo_codes',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['code'] },
      { fields: ['is_active'] },
      { fields: ['valid_from', 'valid_to'] }
    ]
  });

  PromoCode.associate = (models) => {
    PromoCode.hasMany(models.PromoCodeUsage, {
      foreignKey: 'promo_code_id',
      as: 'usages'
    });
    PromoCode.hasMany(models.Trip, {
      foreignKey: 'promo_code_id',
      as: 'trips'
    });
  };

  return PromoCode;
};
