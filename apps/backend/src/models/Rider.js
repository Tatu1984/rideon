module.exports = (sequelize, DataTypes) => {
  const Rider = sequelize.define('Rider', {
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
    homeAddress: {
      type: DataTypes.STRING
    },
    homeLatitude: {
      type: DataTypes.DECIMAL(10, 8)
    },
    homeLongitude: {
      type: DataTypes.DECIMAL(11, 8)
    },
    workAddress: {
      type: DataTypes.STRING
    },
    workLatitude: {
      type: DataTypes.DECIMAL(10, 8)
    },
    workLongitude: {
      type: DataTypes.DECIMAL(11, 8)
    },
    totalTrips: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    totalSpent: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    averageRating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.00
    },
    paymentMethods: {
      type: DataTypes.JSON,
      defaultValue: []
    }
  }, {
    tableName: 'riders',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id'] }
    ]
  });

  Rider.associate = (models) => {
    Rider.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    Rider.hasMany(models.Trip, {
      foreignKey: 'rider_id',
      as: 'trips'
    });
    Rider.hasMany(models.Rating, {
      foreignKey: 'rider_id',
      as: 'ratingsGiven'
    });
  };

  return Rider;
};
