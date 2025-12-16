module.exports = (sequelize, DataTypes) => {
  const PromoCodeUsage = sequelize.define('PromoCodeUsage', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    promoCodeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'promo_codes',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    tripId: {
      type: DataTypes.UUID,
      references: {
        model: 'trips',
        key: 'id'
      }
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    usedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'promo_code_usages',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['promo_code_id'] },
      { fields: ['user_id'] },
      { fields: ['trip_id'] }
    ]
  });

  PromoCodeUsage.associate = (models) => {
    PromoCodeUsage.belongsTo(models.PromoCode, {
      foreignKey: 'promo_code_id',
      as: 'promo_code'
    });
    PromoCodeUsage.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    PromoCodeUsage.belongsTo(models.Trip, {
      foreignKey: 'trip_id',
      as: 'trip'
    });
  };

  return PromoCodeUsage;
};
