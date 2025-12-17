module.exports = (sequelize, DataTypes) => {
  const SupportMessage = sequelize.define('SupportMessage', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    ticketId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    senderType: {
      type: DataTypes.ENUM('rider', 'driver', 'admin', 'support'),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    attachmentUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'SupportMessages',
    timestamps: true
  });

  SupportMessage.associate = (models) => {
    SupportMessage.belongsTo(models.SupportTicket, {
      foreignKey: 'ticketId',
      as: 'ticket'
    });
    SupportMessage.belongsTo(models.User, {
      foreignKey: 'senderId',
      as: 'sender'
    });
  };

  return SupportMessage;
};
