module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
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
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM(
        'trip_request',
        'trip_accepted',
        'trip_started',
        'trip_completed',
        'trip_cancelled',
        'payment_success',
        'payment_failed',
        'driver_arrived',
        'promo_code',
        'rating_reminder',
        'document_verification',
        'payout',
        'general'
      ),
      allowNull: false
    },
    data: {
      type: DataTypes.JSON,
      comment: 'Additional data like tripId, driverId, etc.'
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    readAt: {
      type: DataTypes.DATE
    },
    sentAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'notifications',
    timestamps: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['type'] },
      { fields: ['is_read'] },
      { fields: ['sent_at'] }
    ]
  });

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return Notification;
};
