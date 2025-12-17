// Test endpoint to debug login flow
module.exports = async (req, res) => {
  // Set CORS immediately
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Wrap EVERYTHING in try/catch from the start
  try {
    // Access body FIRST, before any other requires that might interfere
    const body = req.body;
    const { email, password } = body || {};

    require('pg');

    const path = require('path');
    const backendDir = path.join(__dirname, '..');

    const results = {
      version: 'v3-login-test-body-first',
      method: req.method,
      url: req.url,
      contentType: req.headers['content-type'],
      body: {
        exists: !!body,
        type: typeof body,
        value: body
      }
    };

    if (req.method !== 'POST') {
      return res.json({ ...results, error: 'Use POST method' });
    }

    // Step 1: Test body access
    results.receivedEmail = email;
    results.receivedPassword = password ? '***' : 'undefined';
    results.step1 = 'Body accessed OK';

    if (!email || !password) {
      return res.status(400).json({
        ...results,
        error: 'Missing email or password'
      });
    }

    // Step 2: Try to load models
    results.step2 = 'Loading models...';
    const { User } = require(path.join(backendDir, 'src/models'));
    results.step2 = 'Models loaded OK';
    results.modelsLoaded = true;

    // Step 3: Try to find user
    results.step3 = 'Finding user...';
    const user = await User.findOne({ where: { email } });
    results.step3 = 'User query completed';
    results.userFound = !!user;

    if (!user) {
      return res.status(401).json({
        ...results,
        error: 'User not found'
      });
    }

    // Step 4: Verify password
    results.step4 = 'Verifying password...';
    const bcrypt = require('bcrypt');
    const isValid = await bcrypt.compare(password, user.password);
    results.step4 = 'Password verified';
    results.passwordValid = isValid;

    if (!isValid) {
      return res.status(401).json({
        ...results,
        error: 'Invalid password'
      });
    }

    // Step 5: Generate token
    results.step5 = 'Generating token...';
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '24h' }
    );
    results.step5 = 'Token generated';

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
    // Catch any error anywhere in the function
    res.status(500).json({
      version: 'v3-login-test-body-first',
      error: e.message,
      stack: e.stack ? e.stack.split('\n').slice(0, 5) : null,
      name: e.name
    });
  }
};
