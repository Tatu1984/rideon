// Force bundler to include pg for Sequelize postgres dialect
require('pg');

// Set up module paths for when running from repo root
const path = require('path');
const backendDir = path.join(__dirname, '..');

// Modify require to use backend directory
const app = require(path.join(backendDir, 'src/index'));

// Wrapper to handle CORS for Vercel serverless
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Pass to Express app
  return app(req, res);
};
