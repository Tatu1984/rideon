module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create users table first (no foreign key dependencies)
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

    // Create riders table (depends on users)
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
    await queryInterface.addIndex('riders', ['user_id']);

    // Create drivers table (depends on users)
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
    await queryInterface.addIndex('drivers', ['user_id']);
    await queryInterface.addIndex('drivers', ['status']);

    // Create vehicles table (depends on drivers)
    await queryInterface.createTable('vehicles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      driver_id: {
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
      license_plate: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      vehicle_type: {
        type: Sequelize.ENUM('economy', 'comfort', 'premium', 'suv', 'xl'),
        allowNull: false,
        defaultValue: 'economy'
      },
      seating_capacity: {
        type: Sequelize.INTEGER,
        defaultValue: 4
      },
      registration_number: {
        type: Sequelize.STRING,
        unique: true
      },
      registration_expiry: {
        type: Sequelize.DATE
      },
      insurance_number: {
        type: Sequelize.STRING
      },
      insurance_expiry: {
        type: Sequelize.DATE
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      photos: {
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
    await queryInterface.addIndex('vehicles', ['driver_id']);

    // Create zones table
    await queryInterface.createTable('zones', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      code: {
        type: Sequelize.STRING,
        unique: true
      },
      boundary: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      surge_multiplier: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 1.00
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

    // Create pricing_rules table (depends on zones)
    await queryInterface.createTable('pricing_rules', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      zone_id: {
        type: Sequelize.UUID,
        references: {
          model: 'zones',
          key: 'id'
        }
      },
      vehicle_type: {
        type: Sequelize.ENUM('economy', 'comfort', 'premium', 'suv', 'xl'),
        allowNull: false
      },
      base_fare: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      per_km_rate: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      per_minute_rate: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      minimum_fare: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      booking_fee: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      cancellation_fee: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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
    await queryInterface.addIndex('pricing_rules', ['zone_id', 'vehicle_type']);

    // Create promo_codes table
    await queryInterface.createTable('promo_codes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT
      },
      discount_type: {
        type: Sequelize.ENUM('percentage', 'fixed'),
        allowNull: false
      },
      discount_value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      max_discount: {
        type: Sequelize.DECIMAL(10, 2)
      },
      minimum_fare: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      usage_limit: {
        type: Sequelize.INTEGER
      },
      usage_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      per_user_limit: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      valid_from: {
        type: Sequelize.DATE,
        allowNull: false
      },
      valid_until: {
        type: Sequelize.DATE,
        allowNull: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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

    // Create trips table (depends on riders, drivers, vehicles, zones, promo_codes)
    await queryInterface.createTable('trips', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      rider_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'riders',
          key: 'id'
        }
      },
      driver_id: {
        type: Sequelize.UUID,
        references: {
          model: 'drivers',
          key: 'id'
        }
      },
      vehicle_id: {
        type: Sequelize.UUID,
        references: {
          model: 'vehicles',
          key: 'id'
        }
      },
      zone_id: {
        type: Sequelize.UUID,
        references: {
          model: 'zones',
          key: 'id'
        }
      },
      promo_code_id: {
        type: Sequelize.UUID,
        references: {
          model: 'promo_codes',
          key: 'id'
        }
      },
      pickup_address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      pickup_latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: false
      },
      pickup_longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: false
      },
      dropoff_address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      dropoff_latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: false
      },
      dropoff_longitude: {
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
      vehicle_type: {
        type: Sequelize.ENUM('economy', 'comfort', 'premium', 'suv', 'xl'),
        defaultValue: 'economy'
      },
      estimated_fare: {
        type: Sequelize.DECIMAL(10, 2)
      },
      actual_fare: {
        type: Sequelize.DECIMAL(10, 2)
      },
      discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      surge_multiplier: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 1.00
      },
      distance_km: {
        type: Sequelize.DECIMAL(10, 2)
      },
      duration_minutes: {
        type: Sequelize.INTEGER
      },
      payment_method: {
        type: Sequelize.ENUM('cash', 'card', 'wallet'),
        defaultValue: 'cash'
      },
      payment_status: {
        type: Sequelize.ENUM('pending', 'completed', 'failed', 'refunded'),
        defaultValue: 'pending'
      },
      scheduled_at: {
        type: Sequelize.DATE
      },
      accepted_at: {
        type: Sequelize.DATE
      },
      arrived_at: {
        type: Sequelize.DATE
      },
      started_at: {
        type: Sequelize.DATE
      },
      completed_at: {
        type: Sequelize.DATE
      },
      cancelled_at: {
        type: Sequelize.DATE
      },
      cancelled_by: {
        type: Sequelize.ENUM('rider', 'driver', 'system')
      },
      cancellation_reason: {
        type: Sequelize.STRING
      },
      notes: {
        type: Sequelize.TEXT
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
    await queryInterface.addIndex('trips', ['rider_id']);
    await queryInterface.addIndex('trips', ['driver_id']);
    await queryInterface.addIndex('trips', ['status']);
    await queryInterface.addIndex('trips', ['scheduled_at']);
    await queryInterface.addIndex('trips', ['created_at']);

    // Create ratings table (depends on trips, riders, drivers)
    await queryInterface.createTable('ratings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      trip_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'trips',
          key: 'id'
        }
      },
      rider_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'riders',
          key: 'id'
        }
      },
      driver_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'drivers',
          key: 'id'
        }
      },
      rider_rating: {
        type: Sequelize.INTEGER
      },
      driver_rating: {
        type: Sequelize.INTEGER
      },
      rider_comment: {
        type: Sequelize.TEXT
      },
      driver_comment: {
        type: Sequelize.TEXT
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
    await queryInterface.addIndex('ratings', ['trip_id']);
    await queryInterface.addIndex('ratings', ['rider_id']);
    await queryInterface.addIndex('ratings', ['driver_id']);

    // Create payments table (depends on trips, riders)
    await queryInterface.createTable('payments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      trip_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'trips',
          key: 'id'
        }
      },
      rider_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'riders',
          key: 'id'
        }
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      method: {
        type: Sequelize.ENUM('cash', 'card', 'wallet'),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'completed', 'failed', 'refunded'),
        defaultValue: 'pending'
      },
      transaction_id: {
        type: Sequelize.STRING
      },
      stripe_payment_intent_id: {
        type: Sequelize.STRING
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
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
    await queryInterface.addIndex('payments', ['trip_id']);
    await queryInterface.addIndex('payments', ['rider_id']);
    await queryInterface.addIndex('payments', ['status']);

    // Create trip_status_history table (depends on trips)
    await queryInterface.createTable('trip_status_history', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      trip_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'trips',
          key: 'id'
        }
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8)
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8)
      },
      notes: {
        type: Sequelize.TEXT
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
    await queryInterface.addIndex('trip_status_history', ['trip_id']);

    // Create driver_documents table (depends on drivers)
    await queryInterface.createTable('driver_documents', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      driver_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'drivers',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      document_type: {
        type: Sequelize.ENUM('license', 'insurance', 'registration', 'background_check', 'profile_photo', 'vehicle_photo'),
        allowNull: false
      },
      file_url: {
        type: Sequelize.STRING,
        allowNull: false
      },
      file_name: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
      },
      rejection_reason: {
        type: Sequelize.TEXT
      },
      expires_at: {
        type: Sequelize.DATE
      },
      verified_at: {
        type: Sequelize.DATE
      },
      verified_by: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        }
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
    await queryInterface.addIndex('driver_documents', ['driver_id']);
    await queryInterface.addIndex('driver_documents', ['status']);

    // Create driver_locations table (depends on drivers)
    await queryInterface.createTable('driver_locations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      driver_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'drivers',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: false
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: false
      },
      heading: {
        type: Sequelize.DECIMAL(5, 2)
      },
      speed: {
        type: Sequelize.DECIMAL(5, 2)
      },
      accuracy: {
        type: Sequelize.DECIMAL(10, 2)
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
    await queryInterface.addIndex('driver_locations', ['driver_id']);
    await queryInterface.addIndex('driver_locations', ['created_at']);

    // Create driver_payouts table (depends on drivers)
    await queryInterface.createTable('driver_payouts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      driver_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'drivers',
          key: 'id'
        }
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed'),
        defaultValue: 'pending'
      },
      method: {
        type: Sequelize.ENUM('bank_transfer', 'mobile_money'),
        allowNull: false
      },
      reference: {
        type: Sequelize.STRING
      },
      notes: {
        type: Sequelize.TEXT
      },
      processed_at: {
        type: Sequelize.DATE
      },
      processed_by: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        }
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
    await queryInterface.addIndex('driver_payouts', ['driver_id']);
    await queryInterface.addIndex('driver_payouts', ['status']);

    // Create promo_code_usages table (depends on promo_codes, riders, trips)
    await queryInterface.createTable('promo_code_usages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      promo_code_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'promo_codes',
          key: 'id'
        }
      },
      rider_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'riders',
          key: 'id'
        }
      },
      trip_id: {
        type: Sequelize.UUID,
        references: {
          model: 'trips',
          key: 'id'
        }
      },
      discount_applied: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
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
    await queryInterface.addIndex('promo_code_usages', ['promo_code_id', 'rider_id']);

    // Create support_tickets table (depends on users, trips)
    await queryInterface.createTable('support_tickets', {
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
        }
      },
      trip_id: {
        type: Sequelize.UUID,
        references: {
          model: 'trips',
          key: 'id'
        }
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      category: {
        type: Sequelize.ENUM('payment', 'trip', 'driver', 'app', 'other'),
        defaultValue: 'other'
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium'
      },
      status: {
        type: Sequelize.ENUM('open', 'in_progress', 'resolved', 'closed'),
        defaultValue: 'open'
      },
      assigned_to: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      resolution: {
        type: Sequelize.TEXT
      },
      resolved_at: {
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
    await queryInterface.addIndex('support_tickets', ['user_id']);
    await queryInterface.addIndex('support_tickets', ['status']);
    await queryInterface.addIndex('support_tickets', ['priority']);

    // Create notifications table (depends on users)
    await queryInterface.createTable('notifications', {
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
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('trip', 'payment', 'promo', 'system', 'support'),
        defaultValue: 'system'
      },
      data: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      read_at: {
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
    await queryInterface.addIndex('notifications', ['user_id']);
    await queryInterface.addIndex('notifications', ['is_read']);

    // Create refresh_tokens table (depends on users)
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
        type: Sequelize.STRING(500),
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
    await queryInterface.addIndex('refresh_tokens', ['user_id']);
    await queryInterface.addIndex('refresh_tokens', ['token']);

    // Create split_fares table (depends on trips, riders)
    await queryInterface.createTable('split_fares', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      trip_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'trips',
          key: 'id'
        }
      },
      initiator_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'riders',
          key: 'id'
        }
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'partial', 'completed', 'cancelled'),
        defaultValue: 'pending'
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
    await queryInterface.addIndex('split_fares', ['trip_id']);

    // Create split_fare_participants table (depends on split_fares, riders)
    await queryInterface.createTable('split_fare_participants', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      split_fare_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'split_fares',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      rider_id: {
        type: Sequelize.UUID,
        references: {
          model: 'riders',
          key: 'id'
        }
      },
      email: {
        type: Sequelize.STRING
      },
      phone: {
        type: Sequelize.STRING
      },
      share_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'declined', 'paid'),
        defaultValue: 'pending'
      },
      paid_at: {
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
    await queryInterface.addIndex('split_fare_participants', ['split_fare_id']);
    await queryInterface.addIndex('split_fare_participants', ['rider_id']);

    console.log('All tables created successfully');
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order of creation
    await queryInterface.dropTable('split_fare_participants');
    await queryInterface.dropTable('split_fares');
    await queryInterface.dropTable('refresh_tokens');
    await queryInterface.dropTable('notifications');
    await queryInterface.dropTable('support_tickets');
    await queryInterface.dropTable('promo_code_usages');
    await queryInterface.dropTable('driver_payouts');
    await queryInterface.dropTable('driver_locations');
    await queryInterface.dropTable('driver_documents');
    await queryInterface.dropTable('trip_status_history');
    await queryInterface.dropTable('payments');
    await queryInterface.dropTable('ratings');
    await queryInterface.dropTable('trips');
    await queryInterface.dropTable('promo_codes');
    await queryInterface.dropTable('pricing_rules');
    await queryInterface.dropTable('zones');
    await queryInterface.dropTable('vehicles');
    await queryInterface.dropTable('refresh_tokens');
    await queryInterface.dropTable('drivers');
    await queryInterface.dropTable('riders');
    await queryInterface.dropTable('users');

    // Drop ENUM types
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role" CASCADE');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_drivers_status" CASCADE');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_vehicles_vehicle_type" CASCADE');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_trips_status" CASCADE');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_trips_vehicle_type" CASCADE');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_trips_payment_method" CASCADE');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_trips_payment_status" CASCADE');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_trips_cancelled_by" CASCADE');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_payments_method" CASCADE');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_payments_status" CASCADE');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_promo_codes_discount_type" CASCADE');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_pricing_rules_vehicle_type" CASCADE');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_driver_documents_document_type" CASCADE');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_driver_documents_status" CASCADE');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_driver_payouts_status" CASCADE');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_driver_payouts_method" CASCADE');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_support_tickets_category" CASCADE');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_support_tickets_priority" CASCADE');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_support_tickets_status" CASCADE');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_notifications_type" CASCADE');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_split_fares_status" CASCADE');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_split_fare_participants_status" CASCADE');
  }
};
