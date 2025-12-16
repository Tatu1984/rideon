/**
 * Trip API Integration Tests
 */

const request = require('supertest');
const { app } = require('../../src/index');
const { sequelize, User, Rider, Driver, Trip, Vehicle } = require('../../src/models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

describe('Trip API', () => {
  let riderToken;
  let driverToken;
  let rider;
  let driver;
  let riderUser;
  let driverUser;
  let vehicle;

  beforeAll(async () => {
    // Wait for database connection
    await sequelize.authenticate();

    // Create test users
    const hashedPassword = await bcrypt.hash('TestPass123!', 10);

    riderUser = await User.create({
      email: 'testrider@test.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'Rider',
      phone: '+1234567890',
      role: 'rider',
      isVerified: true,
      isActive: true
    });

    rider = await Rider.create({
      userId: riderUser.id,
      totalTrips: 0,
      totalSpent: 0,
      averageRating: 5.0
    });

    driverUser = await User.create({
      email: 'testdriver@test.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'Driver',
      phone: '+0987654321',
      role: 'driver',
      isVerified: true,
      isActive: true
    });

    driver = await Driver.create({
      userId: driverUser.id,
      licenseNumber: 'DL123456',
      status: 'online',
      isVerified: true,
      totalTrips: 100,
      totalEarnings: 5000,
      averageRating: 4.9
    });

    vehicle = await Vehicle.create({
      driverId: driver.id,
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      color: 'Black',
      licensePlate: 'TEST1234',
      vehicleType: 'economy',
      isActive: true,
      isVerified: true
    });

    // Generate tokens
    riderToken = jwt.sign(
      { id: riderUser.id, email: riderUser.email, role: 'rider' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '24h' }
    );

    driverToken = jwt.sign(
      { id: driverUser.id, email: driverUser.email, role: 'driver' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '24h' }
    );
  });

  afterAll(async () => {
    // Clean up test data
    await Trip.destroy({ where: { riderId: rider.id } });
    await Vehicle.destroy({ where: { id: vehicle.id } });
    await Rider.destroy({ where: { id: rider.id } });
    await Driver.destroy({ where: { id: driver.id } });
    await User.destroy({ where: { id: [riderUser.id, driverUser.id] } });
    await sequelize.close();
  });

  describe('POST /api/v1/trips', () => {
    it('should create a new trip request', async () => {
      const tripData = {
        pickupAddress: '123 Test St, Test City',
        pickupLatitude: 40.7128,
        pickupLongitude: -74.0060,
        dropoffAddress: '456 Test Ave, Test City',
        dropoffLatitude: 40.7580,
        dropoffLongitude: -73.9855,
        vehicleType: 'economy',
        paymentMethod: 'card'
      };

      const response = await request(app)
        .post('/api/v1/trips')
        .set('Authorization', `Bearer ${riderToken}`)
        .send(tripData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.status).toBe('requested');
      expect(response.body.data.pickupAddress).toBe(tripData.pickupAddress);
      expect(response.body.data.dropoffAddress).toBe(tripData.dropoffAddress);
    });

    it('should return 401 without authentication', async () => {
      const tripData = {
        pickupAddress: '123 Test St',
        pickupLatitude: 40.7128,
        pickupLongitude: -74.0060,
        dropoffAddress: '456 Test Ave',
        dropoffLatitude: 40.7580,
        dropoffLongitude: -73.9855,
        vehicleType: 'economy',
        paymentMethod: 'card'
      };

      const response = await request(app)
        .post('/api/v1/trips')
        .send(tripData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid vehicle type', async () => {
      const tripData = {
        pickupAddress: '123 Test St',
        pickupLatitude: 40.7128,
        pickupLongitude: -74.0060,
        dropoffAddress: '456 Test Ave',
        dropoffLatitude: 40.7580,
        dropoffLongitude: -73.9855,
        vehicleType: 'invalid_type',
        paymentMethod: 'card'
      };

      const response = await request(app)
        .post('/api/v1/trips')
        .set('Authorization', `Bearer ${riderToken}`)
        .send(tripData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/trips/:tripId', () => {
    let testTrip;

    beforeAll(async () => {
      testTrip = await Trip.create({
        riderId: rider.id,
        pickupAddress: '123 Test St',
        pickupLatitude: 40.7128,
        pickupLongitude: -74.0060,
        dropoffAddress: '456 Test Ave',
        dropoffLatitude: 40.7580,
        dropoffLongitude: -73.9855,
        vehicleType: 'economy',
        paymentMethod: 'card',
        estimatedDistance: 5.5,
        estimatedDuration: 15,
        baseFare: 50,
        distanceFare: 82.5,
        timeFare: 30,
        totalFare: 162.5,
        status: 'requested',
        requestedAt: new Date()
      });
    });

    afterAll(async () => {
      await Trip.destroy({ where: { id: testTrip.id } });
    });

    it('should return trip details for the rider', async () => {
      const response = await request(app)
        .get(`/api/v1/trips/${testTrip.id}`)
        .set('Authorization', `Bearer ${riderToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testTrip.id);
      expect(response.body.data.pickupAddress).toBe('123 Test St');
    });

    it('should return 404 for non-existent trip', async () => {
      const response = await request(app)
        .get('/api/v1/trips/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${riderToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('TRIP_NOT_FOUND');
    });
  });

  describe('POST /api/v1/trips/:tripId/accept', () => {
    let tripToAccept;

    beforeEach(async () => {
      tripToAccept = await Trip.create({
        riderId: rider.id,
        pickupAddress: '123 Test St',
        pickupLatitude: 40.7128,
        pickupLongitude: -74.0060,
        dropoffAddress: '456 Test Ave',
        dropoffLatitude: 40.7580,
        dropoffLongitude: -73.9855,
        vehicleType: 'economy',
        paymentMethod: 'card',
        estimatedDistance: 5.5,
        estimatedDuration: 15,
        baseFare: 50,
        distanceFare: 82.5,
        timeFare: 30,
        totalFare: 162.5,
        status: 'requested',
        requestedAt: new Date()
      });
    });

    afterEach(async () => {
      await Trip.destroy({ where: { id: tripToAccept.id } });
      // Reset driver status
      await driver.update({ status: 'online' });
    });

    it('should allow driver to accept a trip', async () => {
      const response = await request(app)
        .post(`/api/v1/trips/${tripToAccept.id}/accept`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ vehicleId: vehicle.id });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('accepted');
      expect(response.body.data.driverId).toBe(driver.id);
    });

    it('should not allow rider to accept a trip', async () => {
      const response = await request(app)
        .post(`/api/v1/trips/${tripToAccept.id}/accept`)
        .set('Authorization', `Bearer ${riderToken}`)
        .send({ vehicleId: vehicle.id });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/trips/:tripId/cancel', () => {
    let tripToCancel;

    beforeEach(async () => {
      tripToCancel = await Trip.create({
        riderId: rider.id,
        pickupAddress: '123 Test St',
        pickupLatitude: 40.7128,
        pickupLongitude: -74.0060,
        dropoffAddress: '456 Test Ave',
        dropoffLatitude: 40.7580,
        dropoffLongitude: -73.9855,
        vehicleType: 'economy',
        paymentMethod: 'card',
        estimatedDistance: 5.5,
        estimatedDuration: 15,
        baseFare: 50,
        distanceFare: 82.5,
        timeFare: 30,
        totalFare: 162.5,
        status: 'requested',
        requestedAt: new Date()
      });
    });

    afterEach(async () => {
      await Trip.destroy({ where: { id: tripToCancel.id } });
    });

    it('should allow rider to cancel their trip', async () => {
      const response = await request(app)
        .post(`/api/v1/trips/${tripToCancel.id}/cancel`)
        .set('Authorization', `Bearer ${riderToken}`)
        .send({ reason: 'Changed my mind' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('cancelled_by_rider');
      expect(response.body.data.cancellationReason).toBe('Changed my mind');
    });

    it('should not allow cancellation of completed trips', async () => {
      await tripToCancel.update({ status: 'completed' });

      const response = await request(app)
        .post(`/api/v1/trips/${tripToCancel.id}/cancel`)
        .set('Authorization', `Bearer ${riderToken}`)
        .send({ reason: 'Want to cancel' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('TRIP_CANNOT_BE_CANCELLED');
    });
  });

  describe('PUT /api/v1/trips/:tripId/status', () => {
    let activeTrip;

    beforeEach(async () => {
      activeTrip = await Trip.create({
        riderId: rider.id,
        driverId: driver.id,
        vehicleId: vehicle.id,
        pickupAddress: '123 Test St',
        pickupLatitude: 40.7128,
        pickupLongitude: -74.0060,
        dropoffAddress: '456 Test Ave',
        dropoffLatitude: 40.7580,
        dropoffLongitude: -73.9855,
        vehicleType: 'economy',
        paymentMethod: 'card',
        estimatedDistance: 5.5,
        estimatedDuration: 15,
        baseFare: 50,
        distanceFare: 82.5,
        timeFare: 30,
        totalFare: 162.5,
        status: 'accepted',
        requestedAt: new Date(),
        acceptedAt: new Date()
      });
    });

    afterEach(async () => {
      await Trip.destroy({ where: { id: activeTrip.id } });
      await driver.update({ status: 'online' });
    });

    it('should update trip status to driver_arrived', async () => {
      const response = await request(app)
        .put(`/api/v1/trips/${activeTrip.id}/status`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ status: 'driver_arrived' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('driver_arrived');
      expect(response.body.data.arrivedAt).toBeDefined();
    });

    it('should update trip status to in_progress', async () => {
      await activeTrip.update({ status: 'driver_arrived', arrivedAt: new Date() });

      const response = await request(app)
        .put(`/api/v1/trips/${activeTrip.id}/status`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ status: 'in_progress' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('in_progress');
      expect(response.body.data.startedAt).toBeDefined();
    });

    it('should update trip status to completed', async () => {
      await activeTrip.update({
        status: 'in_progress',
        arrivedAt: new Date(),
        startedAt: new Date(),
        driverEarnings: 130
      });

      const response = await request(app)
        .put(`/api/v1/trips/${activeTrip.id}/status`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ status: 'completed' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');
      expect(response.body.data.completedAt).toBeDefined();
    });

    it('should reject invalid status transitions', async () => {
      const response = await request(app)
        .put(`/api/v1/trips/${activeTrip.id}/status`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ status: 'invalid_status' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_STATUS');
    });
  });
});
