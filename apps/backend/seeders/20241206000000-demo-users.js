const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const now = new Date();

    // Create users
    const users = [
      {
        id: uuidv4(),
        email: 'admin@rideon.com',
        password: await bcrypt.hash('admin123', 10),
        first_name: 'Admin',
        last_name: 'User',
        phone: '+1234567890',
        role: 'admin',
        is_verified: true,
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        email: 'rider@test.com',
        password: hashedPassword,
        first_name: 'Test',
        last_name: 'Rider',
        phone: '+1234567891',
        role: 'rider',
        is_verified: true,
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        email: 'driver@test.com',
        password: hashedPassword,
        first_name: 'Test',
        last_name: 'Driver',
        phone: '+1234567892',
        role: 'driver',
        is_verified: true,
        is_active: true,
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('users', users);

    // Create rider profile
    const riderUser = users.find(u => u.role === 'rider');
    await queryInterface.bulkInsert('riders', [
      {
        id: uuidv4(),
        user_id: riderUser.id,
        average_rating: 0,
        total_trips: 0,
        created_at: now,
        updated_at: now
      }
    ]);

    // Create driver profile
    const driverUser = users.find(u => u.role === 'driver');
    await queryInterface.bulkInsert('drivers', [
      {
        id: uuidv4(),
        user_id: driverUser.id,
        status: 'offline',
        is_verified: true,
        total_trips: 0,
        total_earnings: 0,
        average_rating: 0,
        completion_rate: 0,
        acceptance_rate: 0,
        available_balance: 0,
        created_at: now,
        updated_at: now
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('drivers', null, {});
    await queryInterface.bulkDelete('riders', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
