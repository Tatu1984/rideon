module.exports = (sequelize, DataTypes) => {
  const SupportTicket = sequelize.define('SupportTicket', {
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
      }
    },
    tripId: {
      type: DataTypes.UUID,
      references: {
        model: 'trips',
        key: 'id'
      }
    },
    category: {
      type: DataTypes.ENUM(
        'general',
        'trip_issue',
        'payment_issue',
        'driver_behavior',
        'rider_behavior',
        'app_issue',
        'account_issue',
        'refund_request',
        'document_verification',
        'other'
      ),
      allowNull: false,
      defaultValue: 'general'
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
      defaultValue: 'open'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium'
    },
    assignedTo: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    attachments: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    resolution: {
      type: DataTypes.TEXT
    },
    resolvedAt: {
      type: DataTypes.DATE
    },
    closedAt: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'support_tickets',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['tripId'] },
      { fields: ['status'] },
      { fields: ['priority'] },
      { fields: ['category'] }
    ]
  });

  SupportTicket.associate = (models) => {
    SupportTicket.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    SupportTicket.belongsTo(models.Trip, {
      foreignKey: 'tripId',
      as: 'trip'
    });
    SupportTicket.belongsTo(models.User, {
      foreignKey: 'assignedTo',
      as: 'assignee'
    });
    SupportTicket.hasMany(models.SupportMessage, {
      foreignKey: 'ticketId',
      as: 'messages'
    });
  };

  return SupportTicket;
};
