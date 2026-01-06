module.exports = (sequelize, DataTypes) => {
  const DriverLocation = sequelize.define('DriverLocation', {
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
      },
      onDelete: 'CASCADE'
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false
    },
    accuracy: {
      type: DataTypes.DECIMAL(10, 2)
    },
    heading: {
      type: DataTypes.DECIMAL(5, 2)
    },
    speed: {
      type: DataTypes.DECIMAL(6, 2)
    },
    address: {
      type: DataTypes.STRING
    },
    recordedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'driver_locations',
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
      { fields: ['driver_id'] },
      { fields: ['recorded_at'] }
    ]
  });

  DriverLocation.associate = (models) => {
    DriverLocation.belongsTo(models.Driver, {
      foreignKey: 'driver_id',
      as: 'driver'
    });
  };

  return DriverLocation;
};
