module.exports = (sequelize, DataTypes) => {
  const Rating = sequelize.define('Rating', {
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
      allowNull: false,
      references: {
        model: 'drivers',
        key: 'id'
      }
    },
    riderRating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    driverRating: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
        max: 5
      }
    },
    riderComment: {
      type: DataTypes.TEXT
    },
    driverComment: {
      type: DataTypes.TEXT
    },
    riderTags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    driverTags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    ratedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'ratings',
    timestamps: true,
    indexes: [
      { fields: ['trip_id'] },
      { fields: ['rider_id'] },
      { fields: ['driver_id'] }
    ]
  });

  Rating.associate = (models) => {
    Rating.belongsTo(models.Trip, {
      foreignKey: 'trip_id',
      as: 'trip'
    });
    Rating.belongsTo(models.Rider, {
      foreignKey: 'rider_id',
      as: 'rider'
    });
    Rating.belongsTo(models.Driver, {
      foreignKey: 'driver_id',
      as: 'driver'
    });
  };

  return Rating;
};
