// Force bundler to include pg for Sequelize postgres dialect
require('pg');

// Set up module paths for when running from repo root
const path = require('path');
const backendDir = path.join(__dirname, '..');

// Modify require to use backend directory
const app = require(path.join(backendDir, 'src/index'));

// Allowed origins for CORS
const allowedOrigins = [
  'https://rideon-admin.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001'
];

// Helper to collect raw body from stream
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
      // Body already parsed by Vercel
      resolve(null);
      return;
    }

    let data = '';
    req.on('data', chunk => {
      data += chunk.toString();
    });
    req.on('end', () => {
      resolve(data);
    });
    req.on('error', reject);
  });
}

// Wrapper to handle CORS and body parsing for Vercel serverless
module.exports = async (req, res) => {
  // Get origin from request
  const origin = req.headers.origin;

  // Set CORS headers - use specific origin instead of * when credentials are used
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // For mobile apps and other requests without origin, allow all
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle body parsing for POST/PUT/PATCH requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    try {
      // Check if Vercel already parsed the body
      if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
        // Body already parsed, nothing to do
      } else if (req.body && typeof req.body === 'string' && req.body.length > 0) {
        // Body is a string, parse it as JSON
        try {
          req.body = JSON.parse(req.body);
        } catch (e) {
          // Not valid JSON, leave as is for urlencoded
        }
      } else {
        // Try to read raw body from stream
        const rawBody = await getRawBody(req);
        if (rawBody && rawBody.length > 0) {
          const contentType = req.headers['content-type'] || '';
          if (contentType.includes('application/json')) {
            try {
              req.body = JSON.parse(rawBody);
            } catch (e) {
              return res.status(400).json({
                success: false,
                error: {
                  code: 'INVALID_JSON',
                  message: 'Invalid JSON in request body'
                }
              });
            }
          }
        }
      }
    } catch (e) {
      // Body parsing failed, continue anyway
      console.error('Body parsing error:', e);
    }
  }

  // Pass to Express app
  return app(req, res);
};
