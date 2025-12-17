// Test endpoint to debug login flow
require('pg');

const path = require('path');
const backendDir = path.join(__dirname, '..');

module.exports = async (req, res) => {
  const results = {
    version: 'v1-login-test',
    method: req.method,
    url: req.url,
    contentType: req.headers['content-type'],
    body: {
      exists: !!req.body,
      type: typeof req.body,
      value: req.body
    }
  };

  // Set CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.json({ ...results, error: 'Use POST method' });
  }

  try {
    // Try to load models
    const { User } = require(path.join(backendDir, 'src/models'));
    results.modelsLoaded = true;

    const { email, password } = req.body || {};
    results.receivedEmail = email;
    results.receivedPassword = password ? '***' : 'undefined';

    if (!email || !password) {
      return res.status(400).json({
        ...results,
        error: 'Missing email or password'
      });
    }

    // Try to find user
    const user = await User.findOne({ where: { email } });
    results.userFound = !!user;

    if (!user) {
      return res.status(401).json({
        ...results,
        error: 'User not found'
      });
    }

    // Verify password
    const bcrypt = require('bcrypt');
    const isValid = await bcrypt.compare(password, user.password);
    results.passwordValid = isValid;

    if (!isValid) {
      return res.status(401).json({
        ...results,
        error: 'Invalid password'
      });
    }

    // Generate token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '24h' }
    );

    res.json({
      ...results,
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName
      },
      accessToken: token
    });
  } catch (e) {
    results.error = e.message;
    results.stack = e.stack;
    res.status(500).json(results);
  }
};
