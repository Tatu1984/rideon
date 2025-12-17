/**
 * Comprehensive Database Seeder for RideOn Platform
 *
 * Seeds the database with realistic demo data including:
 * - Admin users
 * - Riders
 * - Drivers with vehicles and documents
 * - Zones
 * - Pricing rules
 * - Promo codes
 * - Trips with various statuses
 * - Ratings
 * - Support tickets
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const db = require('../models');

// Utility to hash passwords
const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

// Random helper functions
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(2);
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// Sample data
const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];
const vehicleMakes = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes-Benz', 'Audi', 'Lexus', 'Hyundai'];
const vehicleModels = {
  'Toyota': ['Camry', 'Corolla', 'Highlander', 'RAV4'],
  'Honda': ['Accord', 'Civic', 'CR-V', 'Pilot'],
  'Ford': ['Fusion', 'Explorer', 'Escape', 'F-150'],
  'Chevrolet': ['Malibu', 'Equinox', 'Tahoe', 'Suburban'],
  'Nissan': ['Altima', 'Sentra', 'Rogue', 'Pathfinder'],
  'BMW': ['3 Series', '5 Series', 'X3', 'X5'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'GLC', 'GLE'],
  'Audi': ['A4', 'A6', 'Q5', 'Q7'],
  'Lexus': ['ES', 'IS', 'RX', 'NX'],
  'Hyundai': ['Sonata', 'Elantra', 'Tucson', 'Santa Fe']
};
const vehicleColors = ['Black', 'White', 'Silver', 'Gray', 'Blue', 'Red', 'Green', 'Brown'];
const vehicleTypes = ['economy', 'comfort', 'premium', 'suv', 'xl'];

// San Francisco Bay Area coordinates for realistic data
const sfLocations = [
  { name: 'San Francisco Airport (SFO)', lat: 37.6213, lng: -122.3790, address: 'San Francisco International Airport, San Francisco, CA 94128' },
  { name: 'Union Square', lat: 37.7879, lng: -122.4074, address: 'Union Square, San Francisco, CA 94108' },
  { name: 'Golden Gate Park', lat: 37.7694, lng: -122.4862, address: 'Golden Gate Park, San Francisco, CA 94117' },
  { name: 'Fisherman\'s Wharf', lat: 37.8080, lng: -122.4177, address: 'Fisherman\'s Wharf, San Francisco, CA 94133' },
  { name: 'Mission District', lat: 37.7599, lng: -122.4148, address: 'Mission District, San Francisco, CA 94110' },
  { name: 'Financial District', lat: 37.7946, lng: -122.3999, address: 'Financial District, San Francisco, CA 94111' },
  { name: 'SOMA', lat: 37.7785, lng: -122.4056, address: 'South of Market, San Francisco, CA 94103' },
  { name: 'Oakland Downtown', lat: 37.8044, lng: -122.2712, address: 'Downtown Oakland, Oakland, CA 94612' },
  { name: 'Berkeley', lat: 37.8716, lng: -122.2727, address: 'Downtown Berkeley, Berkeley, CA 94704' },
  { name: 'Palo Alto', lat: 37.4419, lng: -122.1430, address: 'Downtown Palo Alto, Palo Alto, CA 94301' }
];

async function seed() {
  console.log('Starting database seeding...\n');

  try {
    // Sync database
    await db.sequelize.sync({ force: true });
    console.log('Database synced (tables recreated)\n');

    // 1. Create Admin Users
    console.log('Creating admin users...');
    const hashedPassword = await hashPassword('password123');

    const adminUser = await db.User.create({
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
    console.log(`  Created admin: admin@rideon.com`);

    // 2. Create Riders
    console.log('\nCreating riders...');
    const riders = [];
    for (let i = 0; i < 20; i++) {
      const firstName = randomItem(firstNames);
      const lastName = randomItem(lastNames);
      const email = `rider${i + 1}@demo.com`;

      const user = await db.User.create({
        id: uuidv4(),
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: `+1-555-${String(100 + i).padStart(3, '0')}-${String(1000 + i).padStart(4, '0')}`,
        role: 'rider',
        isVerified: i < 15, // First 15 are verified
        isActive: true
      });

      const rider = await db.Rider.create({
        id: uuidv4(),
        userId: user.id,
        homeAddress: randomItem(sfLocations).address,
        workAddress: randomItem(sfLocations).address,
        walletBalance: randomFloat(0, 200),
        totalTrips: 0,
        totalSpent: 0,
        rating: randomFloat(4.0, 5.0)
      });

      riders.push({ user, rider });
      if (i < 3) console.log(`  Created rider: ${email}`);
    }
    console.log(`  ... and ${riders.length - 3} more riders`);

    // 3. Create Drivers with Vehicles
    console.log('\nCreating drivers with vehicles...');
    const drivers = [];
    for (let i = 0; i < 15; i++) {
      const firstName = randomItem(firstNames);
      const lastName = randomItem(lastNames);
      const email = `driver${i + 1}@demo.com`;

      const user = await db.User.create({
        id: uuidv4(),
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: `+1-555-${String(200 + i).padStart(3, '0')}-${String(2000 + i).padStart(4, '0')}`,
        role: 'driver',
        isVerified: i < 12, // First 12 are verified
        isActive: true
      });

      const vehicleMake = randomItem(vehicleMakes);
      const driver = await db.Driver.create({
        id: uuidv4(),
        userId: user.id,
        licenseNumber: `DL${String(i + 1).padStart(7, '0')}`,
        licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 2), // 2 years from now
        status: i < 10 ? randomItem(['online', 'offline', 'busy']) : 'offline',
        rating: randomFloat(4.0, 5.0),
        totalTrips: randomInt(10, 500),
        totalEarnings: randomFloat(500, 25000),
        acceptanceRate: randomFloat(85, 100),
        cancellationRate: randomFloat(0, 8),
        currentLocationLat: sfLocations[i % sfLocations.length].lat + (Math.random() * 0.02 - 0.01),
        currentLocationLng: sfLocations[i % sfLocations.length].lng + (Math.random() * 0.02 - 0.01),
        isOnline: i < 10,
        bankAccountNumber: `****${String(randomInt(1000, 9999))}`,
        bankRoutingNumber: `****${String(randomInt(100, 999))}`
      });

      const vehicle = await db.Vehicle.create({
        id: uuidv4(),
        driverId: driver.id,
        make: vehicleMake,
        model: randomItem(vehicleModels[vehicleMake]),
        year: randomInt(2018, 2024),
        color: randomItem(vehicleColors),
        licensePlate: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${randomInt(1000, 9999)}`,
        vehicleType: randomItem(vehicleTypes),
        capacity: randomInt(4, 7),
        isActive: true
      });

      // Create driver documents
      const documentTypes = ['license', 'insurance', 'registration', 'background_check'];
      for (const docType of documentTypes) {
        await db.DriverDocument.create({
          id: uuidv4(),
          driverId: driver.id,
          documentType: docType,
          documentUrl: `https://storage.rideon.com/documents/${driver.id}/${docType}.pdf`,
          status: i < 12 ? 'approved' : 'pending',
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
        });
      }

      drivers.push({ user, driver, vehicle });
      if (i < 3) console.log(`  Created driver: ${email} with ${vehicleMake} ${vehicle.model}`);
    }
    console.log(`  ... and ${drivers.length - 3} more drivers`);

    // 4. Create Zones
    console.log('\nCreating service zones...');
    const zones = [];
    const zoneData = [
      { name: 'San Francisco Downtown', type: 'surge', multiplier: 1.5, coordinates: { lat: 37.7879, lng: -122.4074 }, radius: 5 },
      { name: 'SFO Airport', type: 'premium', multiplier: 1.3, coordinates: { lat: 37.6213, lng: -122.3790 }, radius: 3 },
      { name: 'Oakland Downtown', type: 'standard', multiplier: 1.0, coordinates: { lat: 37.8044, lng: -122.2712 }, radius: 4 },
      { name: 'Berkeley Campus', type: 'standard', multiplier: 1.0, coordinates: { lat: 37.8716, lng: -122.2727 }, radius: 2 },
      { name: 'Silicon Valley - Palo Alto', type: 'surge', multiplier: 1.2, coordinates: { lat: 37.4419, lng: -122.1430 }, radius: 5 }
    ];

    for (const z of zoneData) {
      const zone = await db.Zone.create({
        id: uuidv4(),
        name: z.name,
        type: z.type,
        surgeMultiplier: z.multiplier,
        coordinates: JSON.stringify({ center: z.coordinates, radius: z.radius }),
        isActive: true
      });
      zones.push(zone);
      console.log(`  Created zone: ${z.name}`);
    }

    // 5. Create Pricing Rules
    console.log('\nCreating pricing rules...');
    const pricingRules = [
      { vehicleType: 'economy', baseFare: 2.50, perKm: 1.00, perMinute: 0.20, minimumFare: 5.00 },
      { vehicleType: 'comfort', baseFare: 4.00, perKm: 1.50, perMinute: 0.30, minimumFare: 8.00 },
      { vehicleType: 'premium', baseFare: 6.00, perKm: 2.00, perMinute: 0.40, minimumFare: 12.00 },
      { vehicleType: 'suv', baseFare: 5.00, perKm: 1.80, perMinute: 0.35, minimumFare: 10.00 },
      { vehicleType: 'xl', baseFare: 7.00, perKm: 2.20, perMinute: 0.45, minimumFare: 14.00 }
    ];

    for (const pr of pricingRules) {
      await db.PricingRule.create({
        id: uuidv4(),
        vehicleType: pr.vehicleType,
        baseFare: pr.baseFare,
        perKmRate: pr.perKm,
        perMinuteRate: pr.perMinute,
        minimumFare: pr.minimumFare,
        cancellationFee: 5.00,
        bookingFee: 1.50,
        isActive: true
      });
      console.log(`  Created pricing: ${pr.vehicleType}`);
    }

    // 6. Create Promo Codes
    console.log('\nCreating promo codes...');
    const promoCodes = [
      { code: 'WELCOME50', type: 'percentage', value: 50, maxDiscount: 15, minTrip: 10, maxUsage: 1, totalLimit: 1000 },
      { code: 'FLAT10', type: 'fixed', value: 10, maxDiscount: 10, minTrip: 20, maxUsage: 3, totalLimit: 500 },
      { code: 'RIDE20', type: 'percentage', value: 20, maxDiscount: 10, minTrip: 15, maxUsage: 2, totalLimit: null },
      { code: 'AIRPORT25', type: 'percentage', value: 25, maxDiscount: 20, minTrip: 30, maxUsage: 5, totalLimit: 200 },
      { code: 'VIP100', type: 'percentage', value: 100, maxDiscount: 50, minTrip: 0, maxUsage: 1, totalLimit: 50 }
    ];

    const createdPromoCodes = [];
    for (const pc of promoCodes) {
      const promo = await db.PromoCode.create({
        id: uuidv4(),
        code: pc.code,
        description: `${pc.type === 'percentage' ? pc.value + '% off' : '$' + pc.value + ' off'} on your ride`,
        discountType: pc.type,
        discountValue: pc.value,
        maxDiscountAmount: pc.maxDiscount,
        minTripAmount: pc.minTrip,
        maxUsagePerUser: pc.maxUsage,
        totalUsageLimit: pc.totalLimit,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        isActive: true
      });
      createdPromoCodes.push(promo);
      console.log(`  Created promo: ${pc.code}`);
    }

    // 7. Create Trips
    console.log('\nCreating trips...');
    const tripStatuses = ['completed', 'completed', 'completed', 'completed', 'completed', 'in_progress', 'accepted', 'requested', 'cancelled_by_rider'];
    const paymentMethods = ['card', 'card', 'card', 'cash', 'wallet'];
    let tripCount = 0;

    for (let i = 0; i < 50; i++) {
      const rider = randomItem(riders);
      const driver = randomItem(drivers);
      const pickup = randomItem(sfLocations);
      let dropoff = randomItem(sfLocations);
      while (dropoff.name === pickup.name) {
        dropoff = randomItem(sfLocations);
      }

      const status = randomItem(tripStatuses);
      const vehicleType = randomItem(vehicleTypes);
      const distance = randomFloat(2, 25);
      const duration = Math.floor(distance * 3) + randomInt(5, 20); // Approximate duration based on distance

      const baseFare = vehicleType === 'economy' ? 2.50 : vehicleType === 'comfort' ? 4.00 : vehicleType === 'premium' ? 6.00 : 5.00;
      const distanceFare = parseFloat(distance) * 1.50;
      const timeFare = duration * 0.25;
      const totalFare = (baseFare + distanceFare + timeFare).toFixed(2);

      const requestedAt = randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date());

      const trip = await db.Trip.create({
        id: uuidv4(),
        riderId: rider.rider.id,
        driverId: status !== 'requested' ? driver.driver.id : null,
        vehicleId: status !== 'requested' ? driver.vehicle.id : null,
        pickupAddress: pickup.address,
        pickupLatitude: pickup.lat,
        pickupLongitude: pickup.lng,
        dropoffAddress: dropoff.address,
        dropoffLatitude: dropoff.lat,
        dropoffLongitude: dropoff.lng,
        status,
        vehicleType,
        estimatedDistance: distance,
        estimatedDuration: duration,
        actualDistance: status === 'completed' ? distance : null,
        actualDuration: status === 'completed' ? duration + randomInt(-5, 10) : null,
        estimatedFare: totalFare,
        baseFare,
        distanceFare,
        timeFare,
        totalFare: status === 'completed' ? totalFare : null,
        platformFee: status === 'completed' ? (totalFare * 0.25).toFixed(2) : null,
        driverEarnings: status === 'completed' ? (totalFare * 0.75).toFixed(2) : null,
        paymentMethod: randomItem(paymentMethods),
        paymentStatus: status === 'completed' ? 'completed' : 'pending',
        requestedAt,
        acceptedAt: ['accepted', 'driver_arrived', 'in_progress', 'completed'].includes(status) ? new Date(requestedAt.getTime() + randomInt(60, 300) * 1000) : null,
        startedAt: ['in_progress', 'completed'].includes(status) ? new Date(requestedAt.getTime() + randomInt(300, 900) * 1000) : null,
        completedAt: status === 'completed' ? new Date(requestedAt.getTime() + (duration + randomInt(5, 20)) * 60 * 1000) : null
      });

      // Create rating for completed trips
      if (status === 'completed' && Math.random() > 0.2) {
        await db.Rating.create({
          id: uuidv4(),
          tripId: trip.id,
          riderId: rider.rider.id,
          driverId: driver.driver.id,
          riderRating: randomInt(3, 5),
          driverRating: randomInt(3, 5),
          riderReview: Math.random() > 0.5 ? randomItem(['Great ride!', 'Very smooth', 'Professional driver', 'On time pickup', 'Clean car']) : null,
          driverReview: Math.random() > 0.5 ? randomItem(['Polite rider', 'Good conversation', 'Easy trip', 'Pleasant passenger']) : null
        });
      }

      tripCount++;
    }
    console.log(`  Created ${tripCount} trips with ratings`);

    // 8. Create Support Tickets
    console.log('\nCreating support tickets...');
    const ticketSubjects = [
      'Lost item in car',
      'Driver was late',
      'Payment issue',
      'Route was wrong',
      'Driver cancellation',
      'App not working',
      'Overcharged for trip'
    ];
    const ticketStatuses = ['open', 'in_progress', 'resolved', 'closed'];

    for (let i = 0; i < 15; i++) {
      const rider = randomItem(riders);
      await db.SupportTicket.create({
        id: uuidv4(),
        userId: rider.user.id,
        subject: randomItem(ticketSubjects),
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        status: randomItem(ticketStatuses),
        priority: randomItem(['low', 'medium', 'high']),
        category: randomItem(['trip', 'payment', 'driver', 'app', 'other'])
      });
    }
    console.log(`  Created 15 support tickets`);

    // 9. Create System Settings
    console.log('\nCreating system settings...');
    const settings = [
      { key: 'platform_name', value: 'RideOn', description: 'Platform display name' },
      { key: 'platform_fee_percentage', value: '25', description: 'Platform fee percentage' },
      { key: 'max_search_radius_km', value: '10', description: 'Maximum driver search radius in km' },
      { key: 'driver_timeout_seconds', value: '30', description: 'Time for driver to accept request' },
      { key: 'cancellation_fee_minutes', value: '5', description: 'Minutes after which cancellation fee applies' },
      { key: 'referral_bonus_rider', value: '10', description: 'Referral bonus for riders ($)' },
      { key: 'referral_bonus_driver', value: '50', description: 'Referral bonus for drivers ($)' },
      { key: 'min_driver_rating', value: '4.0', description: 'Minimum driver rating to stay active' },
      { key: 'max_driver_cancellation_rate', value: '15', description: 'Max cancellation rate (%) before warning' },
      { key: 'sos_emergency_number', value: '911', description: 'Emergency number for SOS' }
    ];

    for (const s of settings) {
      await db.SystemSettings.create({
        id: uuidv4(),
        key: s.key,
        value: s.value,
        description: s.description
      });
    }
    console.log(`  Created ${settings.length} system settings`);

    // Summary
    console.log('\n========================================');
    console.log('Seeding completed successfully!');
    console.log('========================================');
    console.log('\nCreated:');
    console.log(`  - 1 Admin user (admin@rideon.com / password123)`);
    console.log(`  - ${riders.length} Riders (rider1@demo.com - rider${riders.length}@demo.com / password123)`);
    console.log(`  - ${drivers.length} Drivers (driver1@demo.com - driver${drivers.length}@demo.com / password123)`);
    console.log(`  - ${drivers.length} Vehicles`);
    console.log(`  - ${zones.length} Service zones`);
    console.log(`  - ${pricingRules.length} Pricing rules`);
    console.log(`  - ${createdPromoCodes.length} Promo codes`);
    console.log(`  - ${tripCount} Trips`);
    console.log(`  - 15 Support tickets`);
    console.log(`  - ${settings.length} System settings`);
    console.log('\n');

  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    await db.sequelize.close();
  }
}

// Run seeder
seed()
  .then(() => {
    console.log('Seeding process finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding process failed:', error);
    process.exit(1);
  });
