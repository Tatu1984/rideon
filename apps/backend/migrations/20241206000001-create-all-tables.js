module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create users table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING,
        unique: true
      },
      role: {
        type: Sequelize.ENUM('admin', 'rider', 'driver'),
        allowNull: false,
        defaultValue: 'rider'
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      total_spent:{
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
      },
      last_login_at: {
        type: Sequelize.DATE
      },
      profile_picture: {
        type: Sequelize.STRING
      },
      device_tokens: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: []
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
await queryInterface.createTable('ratings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      tripId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'trips',
          key: 'id'
        }
      },
      riderId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'riders',
          key: 'id'
        }
      },
      driverId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'drivers',
          key: 'id'
        }
      },
      riderRating: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5
        }
      },
      driverRating: {
        type: Sequelize.INTEGER,
        validate: {
          min: 1,
          max: 5
        }
      },
      riderComment: {
        type: Sequelize.TEXT
      },
      driverComment: {
        type: Sequelize.TEXT
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
    // Add indexes
    await queryInterface.addIndex('ratings', ['tripId']);
    await queryInterface.addIndex('ratings', ['riderId']);
    await queryInterface.addIndex('ratings', ['driverId']);
    // Create riders table
    await queryInterface.createTable('riders', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      home_address: {
        type: Sequelize.STRING,
        allowNull: true
      },
      home_latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true
      },
      home_longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true
      },
      work_address: {
        type: Sequelize.STRING,
        allowNull: true
      },
      work_latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true
      },
      work_longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true
      },
      total_trips: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      total_spent: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      average_rating: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0.00
      },
      payment_methods: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add index on user_id
// Add index on user_id if it doesn't exist
const [results] = await queryInterface.sequelize.query(`
  SELECT 1
  FROM pg_indexes
  WHERE indexname = 'riders_user_id'
  AND tablename = 'riders'
`);

if (results.length === 0) {
  await queryInterface.addIndex('riders', ['user_id']);
}
    // Create drivers table
    await queryInterface.createTable('drivers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      license_number: {
        type: Sequelize.STRING,
        unique: true
      },
      license_expiry: {
        type: Sequelize.DATE
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'suspended', 'online', 'offline', 'busy'),
        defaultValue: 'pending'
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      verification_notes: {
        type: Sequelize.TEXT
      },
      total_trips: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      total_earnings: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      average_rating: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0.00
      },
      completion_rate: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0.00
      },
      acceptance_rate: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0.00
      },
      current_latitude: {
        type: Sequelize.DECIMAL(10, 8)
      },
      current_longitude: {
        type: Sequelize.DECIMAL(11, 8)
      },
      current_address: {
        type: Sequelize.STRING
      },
      last_location_update: {
        type: Sequelize.DATE
      },
      bank_account_number: {
        type: Sequelize.STRING
      },
      bank_name: {
        type: Sequelize.STRING
      },
      bank_account_name: {
        type: Sequelize.STRING
      },
      available_balance: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create refresh_tokens table
    await queryInterface.createTable('refresh_tokens', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      token: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      revoked_at: {
        type: Sequelize.DATE
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
      await queryInterface.createTable('vehicles', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    driverId: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'drivers',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    make: {
      type: Sequelize.STRING,
      allowNull: false
    },
    model: {
      type: Sequelize.STRING,
      allowNull: false
    },
    year: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    color: {
      type: Sequelize.STRING,
      allowNull: false
    },
    licensePlate: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    vehicleType: {
      type: Sequelize.ENUM('economy', 'comfort', 'premium', 'suv', 'xl'),
      allowNull: false,
      defaultValue: 'economy'
    },
    seatingCapacity: {
      type: Sequelize.INTEGER,
      defaultValue: 4
    },
    registrationNumber: {
      type: Sequelize.STRING,
      unique: true
    },
    registrationExpiry: {
      type: Sequelize.DATE
    },
    insuranceNumber: {
      type: Sequelize.STRING
    },
    insuranceExpiry: {
      type: Sequelize.DATE
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    isVerified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    photos: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      defaultValue: []
    }
  })
await queryInterface.createTable('trips', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  riderId: {
    type: Sequelize.UUID,
    allowNull: false,
    references: {
      model: 'riders',
      key: 'id'
    }
  },
  driverId: {
    type: Sequelize.UUID,
    references: {
      model: 'drivers',
      key: 'id'
    }
  },
  vehicleId: {
    type: Sequelize.UUID,
    references: {
      model: 'vehicles',
      key: 'id'
    }
  },
  pickupAddress: {
    type: Sequelize.STRING,
    allowNull: false
  },
  pickupLatitude: {
    type: Sequelize.DECIMAL(10, 8),
    allowNull: false
  },
  pickupLongitude: {
    type: Sequelize.DECIMAL(11, 8),
    allowNull: false
  },
  dropoffAddress: {
    type: Sequelize.STRING,
    allowNull: false
  },
  dropoffLatitude: {
    type: Sequelize.DECIMAL(10, 8),
    allowNull: false
  },
  dropoffLongitude: {
    type: Sequelize.DECIMAL(11, 8),
    allowNull: false
  },
  status: {
    type: Sequelize.ENUM(
      'pending',
      'accepted',
      'arrived',
      'started',
      'completed',
      'cancelled'
    ),
    defaultValue: 'pending',
    allowNull: false
  },
  fare: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: true
  },
  distance: {
    type: Sequelize.DECIMAL(10, 2),
    comment: 'Distance in kilometers'
  },
  startedAt: {
    type: Sequelize.DATE
  },
  completedAt: {
    type: Sequelize.DATE
  },
  cancelledAt: {
    type: Sequelize.DATE
  },
  cancellationReason: {
    type: Sequelize.STRING
  },
  rating: {
    type: Sequelize.INTEGER,
    validate: {
      min: 1,
      max: 5
    }
  },
  review: {
    type: Sequelize.TEXT
  },
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  },
  updatedAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  }
});
await queryInterface.addIndex('trips', ['riderId']);
await queryInterface.addIndex('trips', ['driverId']);
await queryInterface.addIndex('trips', ['status']);
console.log('✅ All tables created successfully');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ratings');
    await queryInterface.dropTable('vehicles');
        await queryInterface.dropTable('trips');
    await queryInterface.dropTable('refresh_tokens');
    await queryInterface.dropTable('drivers');
    await queryInterface.dropTable('riders');
    await queryInterface.dropTable('users');
  }
};