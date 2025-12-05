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
      { fields: ['promoCodeId'] },
      { fields: ['userId'] },
      { fields: ['tripId'] }
    ]
  });

  PromoCodeUsage.associate = (models) => {
    PromoCodeUsage.belongsTo(models.PromoCode, {
      foreignKey: 'promoCodeId',
      as: 'promoCode'
    });
    PromoCodeUsage.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    PromoCodeUsage.belongsTo(models.Trip, {
      foreignKey: 'tripId',
      as: 'trip'
    });
  };

  return PromoCodeUsage;
};
