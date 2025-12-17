// Endpoint to create or reset admin user
require('pg');
const path = require('path');

module.exports = async (req, res) => {
  // Set CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const backendDir = path.join(__dirname, '..');
    const bcrypt = require('bcrypt');
    const { User } = require(path.join(backendDir, 'src/models'));

    const results = {
      version: 'v1-create-admin',
      action: req.method === 'POST' ? 'create' : 'check'
    };

    // Check if admin exists
    const existingAdmin = await User.findOne({ where: { email: 'admin@rideon.com' } });
    results.adminExists = !!existingAdmin;

    if (existingAdmin) {
      results.existingAdmin = {
        id: existingAdmin.id,
        email: existingAdmin.email,
        role: existingAdmin.role,
        isActive: existingAdmin.isActive
      };
    }

    // On POST, create or update admin
    if (req.method === 'POST') {
      const hashedPassword = await bcrypt.hash('password123', 10);

      if (existingAdmin) {
        // Update password
        await existingAdmin.update({
          password: hashedPassword,
          isActive: true,
          isVerified: true
        });
        results.action = 'updated';
        results.message = 'Admin password reset to password123';
      } else {
        // Create new admin
        const { v4: uuidv4 } = require('uuid');
        const newAdmin = await User.create({
          id: uuidv4(),
          email: 'admin@rideon.com',
          password: hashedPassword,
          firstName: 'Super',
          lastName: 'Admin',
          phone: '+1-555-000-0001',
          role: 'admin',
          isVerified: true,
          isActive: true
        });
        results.action = 'created';
        results.newAdmin = {
          id: newAdmin.id,
          email: newAdmin.email,
          role: newAdmin.role
        };
        results.message = 'Admin created with password123';
      }
    }

    res.json(results);
  } catch (e) {
    res.status(500).json({
      error: e.message,
      stack: e.stack ? e.stack.split('\n').slice(0, 5) : null
    });
  }
};
