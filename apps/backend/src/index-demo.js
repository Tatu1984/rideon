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
const vehicles = []; // Individual fleet vehicles
const documents = []; // Driver documents for KYC
const supportTickets = []; // Support tickets
const promotions = []; // Promo codes and coupons
const walletTransactions = []; // Wallet transactions
const payouts = []; // Driver payouts
const referrals = []; // Referral tracking
const scheduledRides = []; // Future bookings
const emergencyAlerts = []; // SOS alerts
const cities = []; // Service areas
const notifications = []; // Push notifications
const teamMembers = []; // Internal team management
let userIdCounter = 1;
let teamMemberIdCounter = 1;
let tripIdCounter = 1;
let vehicleTypeIdCounter = 1;
let pricingRuleIdCounter = 1;
let zoneIdCounter = 1;
let driverId = 1;
let vehicleIdCounter = 1;
let documentIdCounter = 1;
let ticketIdCounter = 1;
let promotionIdCounter = 1;
let transactionIdCounter = 1;
let payoutIdCounter = 1;
let referralIdCounter = 1;
let scheduledRideIdCounter = 1;
let emergencyAlertIdCounter = 1;
let cityIdCounter = 1;
let notificationIdCounter = 1;

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

// ==================== DRIVER AUTH ENDPOINTS ====================

// Driver Registration
app.post('/api/auth/driver/register', (req, res) => {
  const { email, password, firstName, lastName, phone, vehicleType, vehicleNumber, licenseNumber } = req.body;

  // Check if driver exists
  if (drivers.find(d => d.email === email)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'DUPLICATE_EMAIL',
        message: 'Email already registered'
      }
    });
  }

  // Create driver
  const driver = {
    id: driverId++,
    email,
    firstName,
    lastName,
    phone: phone || '+1234567890',
    vehicleType: vehicleType || 'Economy',
    vehicleNumber: vehicleNumber || 'ABC-1234',
    licenseNumber: licenseNumber || 'DL123456',
    status: 'offline',
    isVerified: true,
    rating: 4.8,
    totalTrips: 0,
    earnings: 0,
    walletBalance: 0,
    location: {
      lat: 37.7749,
      lng: -122.4194
    },
    createdAt: new Date()
  };

  drivers.push(driver);

  // Generate fake token
  const token = `driver_token_${driver.id}_${Date.now()}`;

  res.status(201).json({
    success: true,
    data: {
      driver: {
        id: driver.id,
        email: driver.email,
        firstName: driver.firstName,
        lastName: driver.lastName,
        phone: driver.phone,
        vehicleType: driver.vehicleType,
        vehicleNumber: driver.vehicleNumber,
        status: driver.status,
        rating: driver.rating,
        totalTrips: driver.totalTrips
      },
      token
    },
    message: '✅ Driver registered successfully! (Demo mode)'
  });
});

// Driver Login
app.post('/api/auth/driver/login', (req, res) => {
  const { email, password } = req.body;

  let driver = drivers.find(d => d.email === email);

  // If driver doesn't exist, create demo driver automatically
  if (!driver) {
    driver = {
      id: driverId++,
      email,
      firstName: 'Demo',
      lastName: 'Driver',
      phone: '+1234567890',
      vehicleType: 'Economy',
      vehicleNumber: 'ABC-1234',
      licenseNumber: 'DL123456',
      status: 'offline',
      isVerified: true,
      rating: 4.8,
      totalTrips: 0,
      earnings: 0,
      walletBalance: 0,
      location: {
        lat: 37.7749,
        lng: -122.4194
      },
      createdAt: new Date()
    };
    drivers.push(driver);
  }

  const token = `driver_token_${driver.id}_${Date.now()}`;

  res.json({
    success: true,
    data: {
      driver: {
        id: driver.id,
        email: driver.email,
        firstName: driver.firstName,
        lastName: driver.lastName,
        phone: driver.phone,
        vehicleType: driver.vehicleType,
        vehicleNumber: driver.vehicleNumber,
        status: driver.status,
        rating: driver.rating,
        totalTrips: driver.totalTrips,
        earnings: driver.earnings,
        walletBalance: driver.walletBalance
      },
      token
    },
    message: '✅ Driver login successful! (Demo mode - Auto-created driver)'
  });
});

// Get Driver Profile
app.get('/api/driver/profile', (req, res) => {
  // In demo mode, return first driver or create one
  let driver = drivers[0];
  if (!driver) {
    driver = {
      id: driverId++,
      email: 'demo@driver.com',
      firstName: 'Demo',
      lastName: 'Driver',
      phone: '+1234567890',
      vehicleType: 'Economy',
      vehicleNumber: 'ABC-1234',
      licenseNumber: 'DL123456',
      status: 'offline',
      isVerified: true,
      rating: 4.8,
      totalTrips: 0,
      earnings: 0,
      walletBalance: 0,
      location: {
        lat: 37.7749,
        lng: -122.4194
      },
      createdAt: new Date()
    };
    drivers.push(driver);
  }

  res.json({
    success: true,
    data: driver
  });
});

// Update Driver Location
app.post('/api/driver/location', (req, res) => {
  const { latitude, longitude } = req.body;

  // Update first driver's location
  if (drivers[0]) {
    drivers[0].location = { lat: latitude, lng: longitude };
    drivers[0].lastLocationUpdate = new Date();
  }

  res.json({
    success: true,
    message: 'Location updated'
  });
});

// Update Driver Status
app.patch('/api/driver/status', (req, res) => {
  const { status } = req.body;

  // Update first driver's status
  if (drivers[0]) {
    drivers[0].status = status;
  }

  res.json({
    success: true,
    data: { status },
    message: 'Status updated'
  });
});

// Get Driver Earnings
app.get('/api/driver/earnings', (req, res) => {
  const { period } = req.query;

  // Demo earnings data
  const earningsData = {
    today: { amount: 125.50, trips: 8 },
    week: { amount: 850.75, trips: 52 },
    month: { amount: 3420.25, trips: 215 },
    total: { amount: 12500.00, trips: 850 }
  };

  res.json({
    success: true,
    data: earningsData[period] || earningsData.total
  });
});

// Get Trip History
app.get('/api/driver/trips', (req, res) => {
  // Demo trip history
  const demoTrips = [
    {
      id: 1,
      pickupAddress: '123 Main St, San Francisco',
      dropoffAddress: '456 Market St, San Francisco',
      distance: 5.2,
      duration: 15,
      fare: 18.50,
      status: 'completed',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 2,
      pickupAddress: '789 Pine St, San Francisco',
      dropoffAddress: '321 Oak Ave, San Francisco',
      distance: 3.8,
      duration: 12,
      fare: 14.25,
      status: 'completed',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  ];

  res.json({
    success: true,
    data: demoTrips
  });
});

// Get Active Trip
app.get('/api/driver/active-trip', (req, res) => {
  res.json({
    success: true,
    data: null
  });
});

// ==================== END DRIVER AUTH ENDPOINTS ====================

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
        phone: u.phone,
        role: u.role,
        createdAt: u.createdAt,
        approvalStatus: u.approvalStatus
      })),
      total: users.length
    },
    message: '✅ Users retrieved! (Demo mode)'
  });
});

// Create new user
app.post('/api/admin/users', (req, res) => {
  const newUser = {
    id: userIdCounter++,
    ...req.body,
    createdAt: new Date(),
    approvalStatus: req.body.approvalStatus || 'approved'
  };
  users.push(newUser);
  res.status(201).json({
    success: true,
    data: newUser,
    message: 'User created successfully'
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

// ==================== FLEET MANAGEMENT ENDPOINTS ====================

// Get all vehicles
app.get('/api/admin/fleet', (req, res) => {
  res.json({
    success: true,
    data: {
      vehicles: vehicles,
      total: vehicles.length
    }
  });
});

// Get single vehicle
app.get('/api/admin/fleet/:id', (req, res) => {
  const vehicle = vehicles.find(v => v.id === parseInt(req.params.id));
  if (!vehicle) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Vehicle not found' }
    });
  }
  res.json({ success: true, data: vehicle });
});

// Create vehicle
app.post('/api/admin/fleet', (req, res) => {
  const {
    vehicleTypeId,
    driverId,
    make,
    model,
    year,
    color,
    licensePlate,
    vin,
    registrationNumber,
    status,
    photos
  } = req.body;

  const vehicle = {
    id: vehicleIdCounter++,
    vehicleTypeId: vehicleTypeId ? parseInt(vehicleTypeId) : null,
    driverId: driverId ? parseInt(driverId) : null,
    make,
    model,
    year: parseInt(year),
    color,
    licensePlate,
    vin,
    registrationNumber,
    status: status || 'pending_approval',
    photos: photos || [],
    createdAt: new Date()
  };

  vehicles.push(vehicle);

  res.status(201).json({
    success: true,
    data: vehicle,
    message: 'Vehicle added successfully'
  });
});

// Update vehicle
app.put('/api/admin/fleet/:id', (req, res) => {
  const index = vehicles.findIndex(v => v.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Vehicle not found' }
    });
  }

  vehicles[index] = {
    ...vehicles[index],
    ...req.body,
    id: vehicles[index].id,
    updatedAt: new Date()
  };

  res.json({
    success: true,
    data: vehicles[index],
    message: 'Vehicle updated successfully'
  });
});

// Delete vehicle
app.delete('/api/admin/fleet/:id', (req, res) => {
  const index = vehicles.findIndex(v => v.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Vehicle not found' }
    });
  }

  vehicles.splice(index, 1);

  res.json({
    success: true,
    message: 'Vehicle deleted successfully'
  });
});

// ==================== DRIVER DOCUMENTS / KYC ENDPOINTS ====================

// Get all documents for a driver
app.get('/api/admin/drivers/:id/documents', (req, res) => {
  const driverId = parseInt(req.params.id);
  const driverDocs = documents.filter(d => d.driverId === driverId);

  res.json({
    success: true,
    data: {
      documents: driverDocs,
      total: driverDocs.length
    }
  });
});

// Upload/Add document for driver
app.post('/api/admin/drivers/:id/documents', (req, res) => {
  const driverId = parseInt(req.params.id);
  const { type, documentNumber, expiryDate, fileUrl, notes } = req.body;

  const document = {
    id: documentIdCounter++,
    driverId,
    type,
    documentNumber,
    expiryDate,
    fileUrl: fileUrl || `https://demo-storage.rideon.com/docs/${documentIdCounter}.pdf`,
    notes: notes || '',
    status: 'pending',
    uploadedAt: new Date(),
    verifiedAt: null,
    verifiedBy: null
  };

  documents.push(document);

  res.status(201).json({
    success: true,
    data: document,
    message: 'Document uploaded successfully'
  });
});

// Update document (verify/reject)
app.put('/api/admin/documents/:id/verify', (req, res) => {
  const index = documents.findIndex(d => d.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Document not found' }
    });
  }

  const { status, notes } = req.body;

  documents[index] = {
    ...documents[index],
    status: status || documents[index].status,
    notes: notes || documents[index].notes,
    verifiedAt: status === 'approved' || status === 'rejected' ? new Date() : documents[index].verifiedAt,
    verifiedBy: status === 'approved' || status === 'rejected' ? 'admin@rideon.com' : documents[index].verifiedBy
  };

  res.json({
    success: true,
    data: documents[index],
    message: `Document ${status} successfully`
  });
});

// Delete document
app.delete('/api/admin/documents/:id', (req, res) => {
  const index = documents.findIndex(d => d.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Document not found' }
    });
  }

  documents.splice(index, 1);

  res.json({
    success: true,
    message: 'Document deleted successfully'
  });
});

// Get all pending driver applications (drivers with pending documents)
app.get('/api/admin/drivers/pending-approval', (req, res) => {
  const driverUsers = users.filter(u => u.role === 'driver');
  const pendingDrivers = driverUsers.map(driver => {
    const driverDocs = documents.filter(d => d.driverId === driver.id);
    const hasPendingDocs = driverDocs.some(d => d.status === 'pending');
    const hasRejectedDocs = driverDocs.some(d => d.status === 'rejected');

    return {
      ...driver,
      documents: driverDocs,
      documentCount: driverDocs.length,
      hasPendingDocs,
      hasRejectedDocs,
      kycStatus: hasRejectedDocs ? 'rejected' : hasPendingDocs ? 'pending' : driverDocs.length > 0 ? 'approved' : 'incomplete'
    };
  }).filter(d => d.kycStatus !== 'approved');

  res.json({
    success: true,
    data: {
      drivers: pendingDrivers,
      total: pendingDrivers.length
    }
  });
});

// ==================== SUPPORT TICKETS ENDPOINTS ====================

// Get all support tickets
app.get('/api/admin/tickets', (req, res) => {
  const { status, category } = req.query;

  let filtered = supportTickets;

  if (status) {
    filtered = filtered.filter(t => t.status === status);
  }

  if (category) {
    filtered = filtered.filter(t => t.category === category);
  }

  res.json({
    success: true,
    data: {
      tickets: filtered,
      total: filtered.length
    }
  });
});

// Get single ticket
app.get('/api/admin/tickets/:id', (req, res) => {
  const ticket = supportTickets.find(t => t.id === parseInt(req.params.id));
  if (!ticket) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Ticket not found' }
    });
  }
  res.json({ success: true, data: ticket });
});

// Create ticket
app.post('/api/admin/tickets', (req, res) => {
  const {
    userId,
    tripId,
    category,
    subject,
    description,
    priority
  } = req.body;

  const ticket = {
    id: ticketIdCounter++,
    userId: userId ? parseInt(userId) : null,
    tripId: tripId ? parseInt(tripId) : null,
    category,
    subject,
    description,
    priority: priority || 'medium',
    status: 'open',
    assignedTo: null,
    messages: [
      {
        id: 1,
        senderId: userId || 0,
        senderName: 'User',
        senderRole: 'user',
        message: description,
        timestamp: new Date()
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    resolvedAt: null
  };

  supportTickets.push(ticket);

  res.status(201).json({
    success: true,
    data: ticket,
    message: 'Support ticket created successfully'
  });
});

// Update ticket
app.put('/api/admin/tickets/:id', (req, res) => {
  const index = supportTickets.findIndex(t => t.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Ticket not found' }
    });
  }

  const { status, priority, assignedTo } = req.body;

  supportTickets[index] = {
    ...supportTickets[index],
    status: status || supportTickets[index].status,
    priority: priority || supportTickets[index].priority,
    assignedTo: assignedTo !== undefined ? assignedTo : supportTickets[index].assignedTo,
    resolvedAt: status === 'resolved' ? new Date() : supportTickets[index].resolvedAt,
    updatedAt: new Date()
  };

  res.json({
    success: true,
    data: supportTickets[index],
    message: 'Ticket updated successfully'
  });
});

// Add message to ticket
app.post('/api/admin/tickets/:id/messages', (req, res) => {
  const index = supportTickets.findIndex(t => t.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Ticket not found' }
    });
  }

  const { message, senderName } = req.body;

  const newMessage = {
    id: supportTickets[index].messages.length + 1,
    senderId: 0, // Admin
    senderName: senderName || 'Admin',
    senderRole: 'admin',
    message,
    timestamp: new Date()
  };

  supportTickets[index].messages.push(newMessage);
  supportTickets[index].updatedAt = new Date();

  res.status(201).json({
    success: true,
    data: newMessage,
    message: 'Message added successfully'
  });
});

// Delete ticket
app.delete('/api/admin/tickets/:id', (req, res) => {
  const index = supportTickets.findIndex(t => t.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Ticket not found' }
    });
  }

  supportTickets.splice(index, 1);

  res.json({
    success: true,
    message: 'Ticket deleted successfully'
  });
});

// ==================== PROMOTIONS ENDPOINTS ====================

app.get('/api/admin/promotions', (req, res) => {
  res.json({ success: true, data: { promotions, total: promotions.length } });
});

app.post('/api/admin/promotions', (req, res) => {
  const promo = {
    id: promotionIdCounter++,
    ...req.body,
    usageCount: 0,
    createdAt: new Date()
  };
  promotions.push(promo);
  res.status(201).json({ success: true, data: promo, message: 'Promotion created' });
});

app.put('/api/admin/promotions/:id', (req, res) => {
  const index = promotions.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, error: { message: 'Not found' } });
  promotions[index] = { ...promotions[index], ...req.body, updatedAt: new Date() };
  res.json({ success: true, data: promotions[index] });
});

app.delete('/api/admin/promotions/:id', (req, res) => {
  const index = promotions.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, error: { message: 'Not found' } });
  promotions.splice(index, 1);
  res.json({ success: true, message: 'Promotion deleted' });
});

// ==================== WALLET ENDPOINTS ====================

app.get('/api/admin/wallet/rider/:id', (req, res) => {
  const riderId = parseInt(req.params.id);
  const transactions = walletTransactions.filter(t => t.userId === riderId);
  const balance = transactions.reduce((sum, t) => sum + (t.type === 'credit' ? t.amount : -t.amount), 0);
  res.json({ success: true, data: { balance, transactions } });
});

app.post('/api/admin/wallet/rider/:id/credit', (req, res) => {
  const transaction = {
    id: transactionIdCounter++,
    userId: parseInt(req.params.id),
    type: 'credit',
    amount: parseFloat(req.body.amount),
    description: req.body.description,
    createdAt: new Date()
  };
  walletTransactions.push(transaction);
  res.status(201).json({ success: true, data: transaction });
});

app.post('/api/admin/wallet/rider/:id/debit', (req, res) => {
  const transaction = {
    id: transactionIdCounter++,
    userId: parseInt(req.params.id),
    type: 'debit',
    amount: parseFloat(req.body.amount),
    description: req.body.description,
    createdAt: new Date()
  };
  walletTransactions.push(transaction);
  res.status(201).json({ success: true, data: transaction });
});

app.get('/api/admin/wallet/driver/:id', (req, res) => {
  const driverId = parseInt(req.params.id);
  const transactions = walletTransactions.filter(t => t.driverId === driverId);
  const earnings = transactions.reduce((sum, t) => sum + (t.type === 'earning' ? t.amount : 0), 0);
  res.json({ success: true, data: { earnings, transactions } });
});

// ==================== PAYOUTS ENDPOINTS ====================

app.get('/api/admin/payouts', (req, res) => {
  res.json({ success: true, data: { payouts, total: payouts.length } });
});

app.post('/api/admin/payouts', (req, res) => {
  const payout = {
    id: payoutIdCounter++,
    driverId: parseInt(req.body.driverId),
    amount: parseFloat(req.body.amount),
    status: 'pending',
    method: req.body.method || 'bank_transfer',
    createdAt: new Date()
  };
  payouts.push(payout);
  res.status(201).json({ success: true, data: payout });
});

app.put('/api/admin/payouts/:id/process', (req, res) => {
  const index = payouts.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, error: { message: 'Not found' } });
  payouts[index] = { ...payouts[index], status: 'processed', processedAt: new Date() };
  res.json({ success: true, data: payouts[index] });
});

// ==================== REFERRALS ENDPOINTS ====================

app.get('/api/admin/referrals', (req, res) => {
  res.json({ success: true, data: { referrals, total: referrals.length } });
});

app.post('/api/admin/referrals', (req, res) => {
  const referral = {
    id: referralIdCounter++,
    referrerId: parseInt(req.body.referrerId),
    referredId: parseInt(req.body.referredId),
    code: req.body.code,
    reward: parseFloat(req.body.reward),
    status: 'pending',
    createdAt: new Date()
  };
  referrals.push(referral);
  res.status(201).json({ success: true, data: referral });
});

// ==================== SCHEDULED RIDES ENDPOINTS ====================

app.get('/api/admin/scheduled-rides', (req, res) => {
  res.json({ success: true, data: { rides: scheduledRides, total: scheduledRides.length } });
});

app.post('/api/admin/scheduled-rides', (req, res) => {
  const ride = {
    id: scheduledRideIdCounter++,
    ...req.body,
    status: 'scheduled',
    createdAt: new Date()
  };
  scheduledRides.push(ride);
  res.status(201).json({ success: true, data: ride });
});

app.put('/api/admin/scheduled-rides/:id', (req, res) => {
  const index = scheduledRides.findIndex(r => r.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, error: { message: 'Not found' } });
  scheduledRides[index] = { ...scheduledRides[index], ...req.body };
  res.json({ success: true, data: scheduledRides[index] });
});

app.delete('/api/admin/scheduled-rides/:id', (req, res) => {
  const index = scheduledRides.findIndex(r => r.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, error: { message: 'Not found' } });
  scheduledRides.splice(index, 1);
  res.json({ success: true, message: 'Scheduled ride cancelled' });
});

// ==================== EMERGENCY/SOS ENDPOINTS ====================

app.get('/api/admin/emergency-alerts', (req, res) => {
  res.json({ success: true, data: { alerts: emergencyAlerts, total: emergencyAlerts.length } });
});

app.get('/api/admin/emergency-alerts/:id', (req, res) => {
  const alert = emergencyAlerts.find(a => a.id === parseInt(req.params.id));
  if (!alert) return res.status(404).json({ success: false, error: { message: 'Not found' } });
  res.json({ success: true, data: alert });
});

app.put('/api/admin/emergency-alerts/:id', (req, res) => {
  const index = emergencyAlerts.findIndex(a => a.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, error: { message: 'Not found' } });
  emergencyAlerts[index] = { ...emergencyAlerts[index], ...req.body, updatedAt: new Date() };
  res.json({ success: true, data: emergencyAlerts[index] });
});

// ==================== CITIES ENDPOINTS ====================

app.get('/api/admin/cities', (req, res) => {
  res.json({ success: true, data: { cities, total: cities.length } });
});

app.post('/api/admin/cities', (req, res) => {
  const city = {
    id: cityIdCounter++,
    ...req.body,
    active: true,
    createdAt: new Date()
  };
  cities.push(city);
  res.status(201).json({ success: true, data: city });
});

app.put('/api/admin/cities/:id', (req, res) => {
  const index = cities.findIndex(c => c.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, error: { message: 'Not found' } });
  cities[index] = { ...cities[index], ...req.body, updatedAt: new Date() };
  res.json({ success: true, data: cities[index] });
});

app.delete('/api/admin/cities/:id', (req, res) => {
  const index = cities.findIndex(c => c.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, error: { message: 'Not found' } });
  cities.splice(index, 1);
  res.json({ success: true, message: 'City deleted' });
});

// ==================== NOTIFICATIONS ENDPOINTS ====================

app.get('/api/admin/notifications', (req, res) => {
  res.json({ success: true, data: { notifications, total: notifications.length } });
});

app.post('/api/admin/notifications', (req, res) => {
  const notification = {
    id: notificationIdCounter++,
    ...req.body,
    status: 'sent',
    sentAt: new Date()
  };
  notifications.push(notification);
  res.status(201).json({ success: true, data: notification });
});

// ==================== ANALYTICS ENDPOINTS ====================

app.get('/api/admin/analytics/overview', (req, res) => {
  res.json({
    success: true,
    data: {
      totalRevenue: trips.reduce((sum, t) => sum + (t.estimatedFare || 0), 0),
      totalTrips: trips.length,
      totalUsers: users.length,
      totalDrivers: users.filter(u => u.role === 'driver').length,
      averageRating: 4.7,
      completionRate: 92
    }
  });
});

app.get('/api/admin/analytics/revenue', (req, res) => {
  const revenueData = [
    { date: '2024-01-01', revenue: 1250, trips: 45 },
    { date: '2024-01-02', revenue: 1520, trips: 52 },
    { date: '2024-01-03', revenue: 1780, trips: 61 },
    { date: '2024-01-04', revenue: 2100, trips: 73 },
    { date: '2024-01-05', revenue: 2450, trips: 82 },
    { date: '2024-01-06', revenue: 2890, trips: 95 },
    { date: '2024-01-07', revenue: 2650, trips: 88 }
  ];
  res.json({ success: true, data: revenueData });
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

// ========================================
// TEAM MANAGEMENT ENDPOINTS
// ========================================

// Get all team members
app.get('/api/admin/team', (req, res) => {
  res.json({ success: true, data: { team: teamMembers, total: teamMembers.length } });
});

// Get team member by ID
app.get('/api/admin/team/:id', (req, res) => {
  const member = teamMembers.find(m => m.id === parseInt(req.params.id));
  if (!member) return res.status(404).json({ success: false, message: 'Team member not found' });
  res.json({ success: true, data: member });
});

// Add team member
app.post('/api/admin/team', (req, res) => {
  const member = {
    id: teamMemberIdCounter++,
    ...req.body,
    createdAt: new Date(),
    lastLogin: null
  };
  teamMembers.push(member);
  res.status(201).json({ success: true, data: member, message: 'Team member added' });
});

// Update team member
app.put('/api/admin/team/:id', (req, res) => {
  const index = teamMembers.findIndex(m => m.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, message: 'Team member not found' });

  teamMembers[index] = { ...teamMembers[index], ...req.body, updatedAt: new Date() };
  res.json({ success: true, data: teamMembers[index], message: 'Team member updated' });
});

// Delete team member
app.delete('/api/admin/team/:id', (req, res) => {
  const index = teamMembers.findIndex(m => m.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, message: 'Team member not found' });

  teamMembers.splice(index, 1);
  res.json({ success: true, message: 'Team member removed' });
});

// ========================================
// APPROVAL ENDPOINTS
// ========================================

// Get pending user approvals
app.get('/api/admin/users/pending-approval', (req, res) => {
  const pending = users.filter(u => u.approvalStatus === 'pending');
  res.json({ success: true, data: { users: pending, total: pending.length } });
});

// Approve user
app.put('/api/admin/users/:id/approve', (req, res) => {
  const index = users.findIndex(u => u.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, message: 'User not found' });

  users[index] = {
    ...users[index],
    approvalStatus: 'approved',
    approved: true,
    approvedAt: req.body.approvedAt || new Date(),
    approvedBy: req.body.approvedBy || 'admin'
  };
  res.json({ success: true, data: users[index], message: 'User approved' });
});

// Reject user
app.put('/api/admin/users/:id/reject', (req, res) => {
  const index = users.findIndex(u => u.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, message: 'User not found' });

  users[index] = {
    ...users[index],
    approvalStatus: 'rejected',
    rejected: true,
    rejectedAt: req.body.rejectedAt || new Date(),
    rejectionReason: req.body.rejectionReason || '',
    rejectedBy: req.body.rejectedBy || 'admin'
  };
  res.json({ success: true, data: users[index], message: 'User rejected' });
});

// Approve driver
app.put('/api/admin/drivers/:id/approve', (req, res) => {
  const index = users.findIndex(u => u.id === parseInt(req.params.id) && u.role === 'driver');
  if (index === -1) return res.status(404).json({ success: false, message: 'Driver not found' });

  users[index] = {
    ...users[index],
    approvalStatus: 'approved',
    approved: true,
    approvedAt: req.body.approvedAt || new Date(),
    approvedBy: req.body.approvedBy || 'admin',
    verificationStatus: 'verified'
  };
  res.json({ success: true, data: users[index], message: 'Driver approved' });
});

// Reject driver
app.put('/api/admin/drivers/:id/reject', (req, res) => {
  const index = users.findIndex(u => u.id === parseInt(req.params.id) && u.role === 'driver');
  if (index === -1) return res.status(404).json({ success: false, message: 'Driver not found' });

  users[index] = {
    ...users[index],
    approvalStatus: 'rejected',
    rejected: true,
    rejectedAt: req.body.rejectedAt || new Date(),
    rejectionReason: req.body.rejectionReason || '',
    rejectedBy: req.body.rejectedBy || 'admin',
    verificationStatus: 'rejected'
  };
  res.json({ success: true, data: users[index], message: 'Driver rejected' });
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
