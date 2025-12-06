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
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      average_rating: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0.00
      },
      total_trips: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      favorite_locations: {
        type: Sequelize.JSON
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

    console.log('✅ All tables created successfully');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('refresh_tokens');
    await queryInterface.dropTable('drivers');
    await queryInterface.dropTable('riders');
    await queryInterface.dropTable('users');
  }
};
