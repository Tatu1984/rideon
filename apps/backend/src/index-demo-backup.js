const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// In-memory data storage for demo
const users = [];
const trips = [];
const vehicleTypes = [];
const pricingRules = [];
const geofenceZones = [];
const drivers = [];
let userIdCounter = 1;
let tripIdCounter = 1;
let vehicleTypeIdCounter = 1;
let pricingRuleIdCounter = 1;
let zoneIdCounter = 1;
let driverId = 1;

// Initialize default vehicle types
vehicleTypes.push(
  {
    id: vehicleTypeIdCounter++,
    name: 'Economy',
    description: 'Affordable rides for everyday travel',
    baseFare: 2.50,
    perKmRate: 1.20,
    perMinuteRate: 0.25,
    capacity: 4,
    features: ['Air Conditioning', 'Music'],
    image: 'economy.png',
    active: true,
    createdAt: new Date()
  },
  {
    id: vehicleTypeIdCounter++,
    name: 'Premium',
    description: 'Comfortable rides with experienced drivers',
    baseFare: 3.50,
    perKmRate: 1.80,
    perMinuteRate: 0.35,
    capacity: 4,
    features: ['Air Conditioning', 'Music', 'WiFi', 'Phone Charger'],
    image: 'premium.png',
    active: true,
    createdAt: new Date()
  },
  {
    id: vehicleTypeIdCounter++,
    name: 'SUV',
    description: 'Spacious rides for groups and luggage',
    baseFare: 4.50,
    perKmRate: 2.20,
    perMinuteRate: 0.45,
    capacity: 6,
    features: ['Air Conditioning', 'Music', 'WiFi', 'Extra Space'],
    image: 'suv.png',
    active: true,
    createdAt: new Date()
  },
  {
    id: vehicleTypeIdCounter++,
    name: 'Luxury',
    description: 'Premium experience with high-end vehicles',
    baseFare: 6.00,
    perKmRate: 3.00,
    perMinuteRate: 0.60,
    capacity: 4,
    features: ['Air Conditioning', 'Music', 'WiFi', 'Phone Charger', 'Premium Interior', 'Complimentary Water'],
    image: 'luxury.png',
    active: true,
    createdAt: new Date()
  }
);

// Initialize default pricing rules
pricingRules.push(
  {
    id: pricingRuleIdCounter++,
    name: 'Standard Pricing',
    type: 'base',
    vehicleTypeId: null, // applies to all
    baseFare: 2.50,
    bookingFee: 1.00,
    perKmRate: 1.50,
    perMinuteRate: 0.30,
    minimumFare: 5.00,
    surgeMultiplier: 1.0,
    active: true,
    createdAt: new Date()
  },
  {
    id: pricingRuleIdCounter++,
    name: 'Peak Hours',
    type: 'time_based',
    vehicleTypeId: null,
    startTime: '07:00',
    endTime: '10:00',
    daysOfWeek: [1, 2, 3, 4, 5],
    surgeMultiplier: 1.5,
    active: true,
    createdAt: new Date()
  },
  {
    id: pricingRuleIdCounter++,
    name: 'Evening Surge',
    type: 'time_based',
    vehicleTypeId: null,
    startTime: '17:00',
    endTime: '20:00',
    daysOfWeek: [1, 2, 3, 4, 5],
    surgeMultiplier: 1.3,
    active: true,
    createdAt: new Date()
  }
);

// Initialize sample zones
geofenceZones.push(
  {
    id: zoneIdCounter++,
    name: 'Downtown',
    type: 'service_area',
    coordinates: [
      { lat: 40.7580, lng: -73.9855 },
      { lat: 40.7614, lng: -73.9776 },
      { lat: 40.7489, lng: -73.9680 },
      { lat: 40.7455, lng: -73.9759 }
    ],
    pricingMultiplier: 1.2,
    active: true,
    createdAt: new Date()
  },
  {
    id: zoneIdCounter++,
    name: 'Airport',
    type: 'premium_area',
    coordinates: [
      { lat: 40.6413, lng: -73.7781 },
      { lat: 40.6501, lng: -73.7900 },
      { lat: 40.6352, lng: -73.7950 },
      { lat: 40.6264, lng: -73.7831 }
    ],
    pricingMultiplier: 1.5,
    airportFee: 5.00,
    active: true,
    createdAt: new Date()
  }
);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'RideOn Demo API is running!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Demo endpoint - Register
app.post('/api/auth/register', (req, res) => {
  const { email, password, firstName, lastName, role } = req.body;

  // Check if user exists
  if (users.find(u => u.email === email)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'DUPLICATE_EMAIL',
        message: 'Email already registered'
      }
    });
  }

  // Create user
  const user = {
    id: userIdCounter++,
    email,
    firstName,
    lastName,
    role: role || 'rider',
    createdAt: new Date()
  };

  users.push(user);

  // Generate fake token
  const token = `demo_token_${user.id}_${Date.now()}`;

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      accessToken: token
    },
    message: '✅ User registered successfully! (Demo mode - no real auth)'
  });
});

// Demo endpoint - Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      }
    });
  }

  const token = `demo_token_${user.id}_${Date.now()}`;

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      accessToken: token
    },
    message: '✅ Login successful! (Demo mode)'
  });
});

// Demo endpoint - Fare Estimation
app.post('/api/rider/trips/estimate', (req, res) => {
  const { pickupLocation, dropoffLocation } = req.body;

  if (!pickupLocation || !dropoffLocation) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Pickup and dropoff locations are required'
      }
    });
  }

  // Calculate distance (simplified Haversine)
  const lat1 = pickupLocation.lat;
  const lon1 = pickupLocation.lng;
  const lat2 = dropoffLocation.lat;
  const lon2 = dropoffLocation.lng;

  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  // Calculate fare
  const baseFare = 2.50;
  const bookingFee = 1.00;
  const perKmRate = 1.50;
  const perMinuteRate = 0.30;
  const estimatedDuration = Math.ceil((distance / 30) * 60); // 30 km/h avg speed

  const distanceFare = distance * perKmRate;
  const timeFare = estimatedDuration * perMinuteRate;
  const subtotal = baseFare + bookingFee + distanceFare + timeFare;
  const estimatedFare = Math.max(subtotal, 5.00); // Minimum $5

  res.json({
    success: true,
    data: {
      estimatedFare: Math.round(estimatedFare * 100) / 100,
      breakdown: {
        baseFare,
        bookingFee,
        distanceFare: Math.round(distanceFare * 100) / 100,
        timeFare: Math.round(timeFare * 100) / 100
      },
      distance: Math.round(distance * 10) / 10,
      estimatedDuration,
      surgeMultiplier: 1.0,
      currency: 'USD'
    },
    message: '✅ Fare estimated! (Demo calculation)'
  });
});

// Demo endpoint - Create Trip
app.post('/api/rider/trips', (req, res) => {
  const { pickupLocation, dropoffLocation } = req.body;

  const trip = {
    id: tripIdCounter++,
    riderId: 1, // Demo user
    pickupLocation,
    dropoffLocation,
    status: 'requested',
    estimatedFare: 18.50,
    requestedAt: new Date()
  };

  trips.push(trip);

  res.status(201).json({
    success: true,
    data: {
      tripId: trip.id,
      status: trip.status,
      estimatedFare: trip.estimatedFare,
      pickupLocation: trip.pickupLocation,
      dropoffLocation: trip.dropoffLocation,
      requestedAt: trip.requestedAt
    },
    message: '✅ Trip created! (Demo mode - no real driver matching)'
  });
});

// Demo endpoint - List Users
app.get('/api/admin/users', (req, res) => {
  res.json({
    success: true,
    data: {
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        createdAt: u.createdAt
      })),
      total: users.length
    },
    message: '✅ Users retrieved! (Demo mode)'
  });
});

// Demo endpoint - List Trips
app.get('/api/admin/trips', (req, res) => {
  res.json({
    success: true,
    data: {
      trips: trips,
      total: trips.length
    },
    message: '✅ Trips retrieved! (Demo mode)'
  });
});

// ==================== VEHICLE TYPES ENDPOINTS ====================

// Get all vehicle types
app.get('/api/admin/vehicle-types', (req, res) => {
  res.json({
    success: true,
    data: {
      vehicleTypes: vehicleTypes,
      total: vehicleTypes.length
    }
  });
});

// Get single vehicle type
app.get('/api/admin/vehicle-types/:id', (req, res) => {
  const vehicleType = vehicleTypes.find(v => v.id === parseInt(req.params.id));
  if (!vehicleType) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Vehicle type not found' }
    });
  }
  res.json({ success: true, data: vehicleType });
});

// Create vehicle type
app.post('/api/admin/vehicle-types', (req, res) => {
  const { name, description, baseFare, perKmRate, perMinuteRate, capacity, features } = req.body;

  const vehicleType = {
    id: vehicleTypeIdCounter++,
    name,
    description,
    baseFare: parseFloat(baseFare),
    perKmRate: parseFloat(perKmRate),
    perMinuteRate: parseFloat(perMinuteRate),
    capacity: parseInt(capacity),
    features: features || [],
    image: `${name.toLowerCase()}.png`,
    active: true,
    createdAt: new Date()
  };

  vehicleTypes.push(vehicleType);

  res.status(201).json({
    success: true,
    data: vehicleType,
    message: 'Vehicle type created successfully'
  });
});

// Update vehicle type
app.put('/api/admin/vehicle-types/:id', (req, res) => {
  const index = vehicleTypes.findIndex(v => v.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Vehicle type not found' }
    });
  }

  const { name, description, baseFare, perKmRate, perMinuteRate, capacity, features, active } = req.body;

  vehicleTypes[index] = {
    ...vehicleTypes[index],
    name: name || vehicleTypes[index].name,
    description: description || vehicleTypes[index].description,
    baseFare: baseFare !== undefined ? parseFloat(baseFare) : vehicleTypes[index].baseFare,
    perKmRate: perKmRate !== undefined ? parseFloat(perKmRate) : vehicleTypes[index].perKmRate,
    perMinuteRate: perMinuteRate !== undefined ? parseFloat(perMinuteRate) : vehicleTypes[index].perMinuteRate,
    capacity: capacity !== undefined ? parseInt(capacity) : vehicleTypes[index].capacity,
    features: features || vehicleTypes[index].features,
    active: active !== undefined ? active : vehicleTypes[index].active,
    updatedAt: new Date()
  };

  res.json({
    success: true,
    data: vehicleTypes[index],
    message: 'Vehicle type updated successfully'
  });
});

// Delete vehicle type
app.delete('/api/admin/vehicle-types/:id', (req, res) => {
  const index = vehicleTypes.findIndex(v => v.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Vehicle type not found' }
    });
  }

  vehicleTypes.splice(index, 1);

  res.json({
    success: true,
    message: 'Vehicle type deleted successfully'
  });
});

// ==================== PRICING RULES ENDPOINTS ====================

// Get all pricing rules
app.get('/api/admin/pricing', (req, res) => {
  res.json({
    success: true,
    data: {
      pricingRules: pricingRules,
      total: pricingRules.length
    }
  });
});

// Create pricing rule
app.post('/api/admin/pricing', (req, res) => {
  const pricingRule = {
    id: pricingRuleIdCounter++,
    ...req.body,
    createdAt: new Date()
  };

  pricingRules.push(pricingRule);

  res.status(201).json({
    success: true,
    data: pricingRule,
    message: 'Pricing rule created successfully'
  });
});

// Update pricing rule
app.put('/api/admin/pricing/:id', (req, res) => {
  const index = pricingRules.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Pricing rule not found' }
    });
  }

  pricingRules[index] = {
    ...pricingRules[index],
    ...req.body,
    id: pricingRules[index].id,
    updatedAt: new Date()
  };

  res.json({
    success: true,
    data: pricingRules[index],
    message: 'Pricing rule updated successfully'
  });
});

// Delete pricing rule
app.delete('/api/admin/pricing/:id', (req, res) => {
  const index = pricingRules.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Pricing rule not found' }
    });
  }

  pricingRules.splice(index, 1);

  res.json({
    success: true,
    message: 'Pricing rule deleted successfully'
  });
});

// ==================== GEOFENCE ZONES ENDPOINTS ====================

// Get all zones
app.get('/api/admin/zones', (req, res) => {
  res.json({
    success: true,
    data: {
      zones: geofenceZones,
      total: geofenceZones.length
    }
  });
});

// Create zone
app.post('/api/admin/zones', (req, res) => {
  const zone = {
    id: zoneIdCounter++,
    ...req.body,
    createdAt: new Date()
  };

  geofenceZones.push(zone);

  res.status(201).json({
    success: true,
    data: zone,
    message: 'Zone created successfully'
  });
});

// Update zone
app.put('/api/admin/zones/:id', (req, res) => {
  const index = geofenceZones.findIndex(z => z.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Zone not found' }
    });
  }

  geofenceZones[index] = {
    ...geofenceZones[index],
    ...req.body,
    id: geofenceZones[index].id,
    updatedAt: new Date()
  };

  res.json({
    success: true,
    data: geofenceZones[index],
    message: 'Zone updated successfully'
  });
});

// Delete zone
app.delete('/api/admin/zones/:id', (req, res) => {
  const index = geofenceZones.findIndex(z => z.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Zone not found' }
    });
  }

  geofenceZones.splice(index, 1);

  res.json({
    success: true,
    message: 'Zone deleted successfully'
  });
});

// ==================== USER CRUD ENDPOINTS ====================

// Update user
app.put('/api/admin/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'User not found' }
    });
  }

  const { firstName, lastName, email, role } = req.body;

  users[index] = {
    ...users[index],
    firstName: firstName || users[index].firstName,
    lastName: lastName || users[index].lastName,
    email: email || users[index].email,
    role: role || users[index].role,
    updatedAt: new Date()
  };

  res.json({
    success: true,
    data: users[index],
    message: 'User updated successfully'
  });
});

// Delete user
app.delete('/api/admin/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'User not found' }
    });
  }

  users.splice(index, 1);

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// ==================== TRIP CRUD ENDPOINTS ====================

// Update trip
app.put('/api/admin/trips/:id', (req, res) => {
  const index = trips.findIndex(t => t.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Trip not found' }
    });
  }

  trips[index] = {
    ...trips[index],
    ...req.body,
    id: trips[index].id,
    updatedAt: new Date()
  };

  res.json({
    success: true,
    data: trips[index],
    message: 'Trip updated successfully'
  });
});

// Delete trip
app.delete('/api/admin/trips/:id', (req, res) => {
  const index = trips.findIndex(t => t.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Trip not found' }
    });
  }

  trips.splice(index, 1);

  res.json({
    success: true,
    message: 'Trip deleted successfully'
  });
});

// ==================== DRIVERS ENDPOINTS ====================

// Get all drivers
app.get('/api/admin/drivers', (req, res) => {
  const driverUsers = users.filter(u => u.role === 'driver');
  res.json({
    success: true,
    data: {
      drivers: driverUsers.map(d => ({
        ...d,
        status: 'active',
        vehicleType: 'Economy',
        rating: (4.5 + Math.random() * 0.5).toFixed(1),
        totalTrips: Math.floor(Math.random() * 500) + 50
      })),
      total: driverUsers.length
    }
  });
});

// Approve driver
app.post('/api/admin/drivers/:id/approve', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user || user.role !== 'driver') {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Driver not found' }
    });
  }

  res.json({
    success: true,
    message: 'Driver approved successfully'
  });
});

// Welcome page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>RideOn Demo API</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
          background: #f5f5f5;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #4285F4; }
        .endpoint {
          background: #f8f9fa;
          padding: 15px;
          margin: 10px 0;
          border-left: 4px solid #4285F4;
          border-radius: 4px;
        }
        code {
          background: #e8e8e8;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 14px;
        }
        .status {
          display: inline-block;
          background: #34a853;
          color: white;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚗 RideOn Demo API</h1>
        <p><span class="status">✅ Running</span></p>

        <h2>Available Endpoints:</h2>

        <div class="endpoint">
          <strong>GET /health</strong><br>
          Health check endpoint
        </div>

        <div class="endpoint">
          <strong>POST /api/auth/register</strong><br>
          Register a new user<br>
          <code>{ "email": "user@test.com", "password": "pass123", "firstName": "John", "lastName": "Doe", "role": "rider" }</code>
        </div>

        <div class="endpoint">
          <strong>POST /api/auth/login</strong><br>
          Login user<br>
          <code>{ "email": "user@test.com", "password": "pass123" }</code>
        </div>

        <div class="endpoint">
          <strong>POST /api/rider/trips/estimate</strong><br>
          Estimate trip fare<br>
          <code>{ "pickupLocation": { "lat": 40.7128, "lng": -74.0060 }, "dropoffLocation": { "lat": 40.7580, "lng": -73.9855 } }</code>
        </div>

        <div class="endpoint">
          <strong>POST /api/rider/trips</strong><br>
          Create a trip<br>
          <code>{ "pickupLocation": {...}, "dropoffLocation": {...} }</code>
        </div>

        <div class="endpoint">
          <strong>GET /api/admin/users</strong><br>
          List all users (demo)
        </div>

        <div class="endpoint">
          <strong>GET /api/admin/trips</strong><br>
          List all trips (demo)
        </div>

        <h2>Test with curl:</h2>
        <div class="endpoint">
          <code>curl http://localhost:3001/health</code>
        </div>

        <h2>Note:</h2>
        <p>⚠️ This is a DEMO mode running without database. Data is stored in memory and will be lost when the server restarts.</p>
        <p>📚 For full setup with PostgreSQL and Redis, see <code>docs/SETUP.md</code></p>
      </div>
    </body>
    </html>
  `);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message: err.message
    }
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('\n🚀 RideOn Demo API is running!');
  console.log(`\n📍 Server: http://localhost:${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/health`);
  console.log(`\n⚠️  DEMO MODE: Running without database (data stored in memory)`);
  console.log(`📚 For full setup, see docs/SETUP.md\n`);
});
