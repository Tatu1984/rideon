module.exports = (sequelize, DataTypes) => {
  const TripStatusHistory = sequelize.define('TripStatusHistory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    tripId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'trips',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    status: {
      type: DataTypes.ENUM(
        'requested',
        'accepted',
        'driver_arrived',
        'in_progress',
        'completed',
        'cancelled_by_rider',
        'cancelled_by_driver',
        'cancelled_by_admin'
      ),
      allowNull: false
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8)
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8)
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'trip_status_history',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['tripId'] },
      { fields: ['status'] },
      { fields: ['createdAt'] }
    ]
  });

  TripStatusHistory.associate = (models) => {
    TripStatusHistory.belongsTo(models.Trip, {
      foreignKey: 'tripId',
      as: 'trip'
    });
  };

  return TripStatusHistory;
};
