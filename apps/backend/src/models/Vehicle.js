module.exports = (sequelize, DataTypes) => {
  const Vehicle = sequelize.define('Vehicle', {
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
    make: {
      type: DataTypes.STRING,
      allowNull: false
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false
    },
    licensePlate: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    vehicleType: {
      type: DataTypes.ENUM('economy', 'comfort', 'premium', 'suv', 'xl'),
      allowNull: false,
      defaultValue: 'economy'
    },
    seatingCapacity: {
      type: DataTypes.INTEGER,
      defaultValue: 4
    },
    registrationNumber: {
      type: DataTypes.STRING,
      unique: true
    },
    registrationExpiry: {
      type: DataTypes.DATE
    },
    insuranceNumber: {
      type: DataTypes.STRING
    },
    insuranceExpiry: {
      type: DataTypes.DATE
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    photos: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    }
  }, {
    tableName: 'vehicles',
    timestamps: true,
    indexes: [
      { fields: ['driverId'] },
      { fields: ['licensePlate'] },
      { fields: ['vehicleType'] }
    ]
  });

  Vehicle.associate = (models) => {
    Vehicle.belongsTo(models.Driver, {
      foreignKey: 'driverId',
      as: 'driver'
    });
    Vehicle.hasMany(models.Trip, {
      foreignKey: 'vehicleId',
      as: 'trips'
    });
  };

  return Vehicle;
};
