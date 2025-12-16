module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      unique: true
    },
    role: {
      type: DataTypes.ENUM('admin', 'rider', 'driver'),
      allowNull: false,
      defaultValue: 'rider'
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastLoginAt: {
      type: DataTypes.DATE
    },
    profilePicture: {
      type: DataTypes.STRING
    },
    deviceTokens: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['email'] },
      { fields: ['phone'] },
      { fields: ['role'] }
    ]
  });

  User.associate = (models) => {
    User.hasOne(models.Rider, {
      foreignKey: 'user_id',
      as: 'riderProfile'
    });
    User.hasOne(models.Driver, {
      foreignKey: 'user_id',
      as: 'driverProfile'
    });
    User.hasMany(models.RefreshToken, {
      foreignKey: 'user_id',
      as: 'refreshTokens'
    });
    User.hasMany(models.Notification, {
      foreignKey: 'user_id',
      as: 'notifications'
    });
  };

  return User;
};
