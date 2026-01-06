module.exports = (sequelize, DataTypes) => {
  const DriverReferral = sequelize.define('DriverReferral', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    referrerId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    referredDriverId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    referredEmail: {
      type: DataTypes.STRING,
      allowNull: true
    },
    referredPhone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    referralCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'signed_up', 'completed', 'expired'),
      defaultValue: 'pending'
    },
    bonusAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 50.00
    },
    bonusPaidAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    signedUpAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'DriverReferrals',
    underscored: true,
    timestamps: true
  });

  DriverReferral.associate = (models) => {
    DriverReferral.belongsTo(models.Driver, {
      foreignKey: 'referrerId',
      as: 'referrer'
    });
    DriverReferral.belongsTo(models.Driver, {
      foreignKey: 'referredDriverId',
      as: 'referredDriver'
    });
  };

  return DriverReferral;
};
