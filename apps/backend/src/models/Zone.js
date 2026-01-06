module.exports = (sequelize, DataTypes) => {
  const Zone = sequelize.define('Zone', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false
    },
    coordinates: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'GeoJSON polygon coordinates'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    surgeMultiplier: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 1.00
    }
  }, {
    tableName: 'zones',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['city'] },
      { fields: ['is_active'] }
    ]
  });

  Zone.associate = (models) => {
    Zone.hasMany(models.PricingRule, {
      foreignKey: 'zone_id',
      as: 'pricingRules'
    });
  };

  return Zone;
};
