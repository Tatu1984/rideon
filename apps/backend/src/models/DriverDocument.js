module.exports = (sequelize, DataTypes) => {
  const DriverDocument = sequelize.define('DriverDocument', {
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
    documentType: {
      type: DataTypes.ENUM(
        'license',
        'vehicle_registration',
        'insurance',
        'identity_proof',
        'address_proof',
        'background_check',
        'vehicle_inspection',
        'other'
      ),
      allowNull: false
    },
    documentNumber: {
      type: DataTypes.STRING
    },
    documentUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    expiryDate: {
      type: DataTypes.DATE
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    },
    verifiedBy: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    verifiedAt: {
      type: DataTypes.DATE
    },
    rejectionReason: {
      type: DataTypes.TEXT
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'driver_documents',
    timestamps: true,
    indexes: [
      { fields: ['driverId'] },
      { fields: ['documentType'] },
      { fields: ['status'] }
    ]
  });

  DriverDocument.associate = (models) => {
    DriverDocument.belongsTo(models.Driver, {
      foreignKey: 'driverId',
      as: 'driver'
    });
    DriverDocument.belongsTo(models.User, {
      foreignKey: 'verifiedBy',
      as: 'verifier'
    });
  };

  return DriverDocument;
};
