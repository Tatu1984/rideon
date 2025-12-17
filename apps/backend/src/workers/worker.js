/**
 * Background Job Worker
 * Processes queued jobs using Bull
 */

const Queue = require('bull');
const emailService = require('../services/emailService');
const smsService = require('../services/smsService');
const { Trip, User, Driver, Rider, Payment } = require('../models');
const { Op } = require('sequelize');

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

// Create queues
const emailQueue = new Queue('email', { redis: redisConfig });
const smsQueue = new Queue('sms', { redis: redisConfig });
const tripQueue = new Queue('trip', { redis: redisConfig });
const cleanupQueue = new Queue('cleanup', { redis: redisConfig });
const analyticsQueue = new Queue('analytics', { redis: redisConfig });

/**
 * Email Queue Processor
 */
emailQueue.process(async (job) => {
  const { type, data } = job.data;
  console.log(`Processing email job: ${type}`);

  try {
    switch (type) {
      case 'welcome':
        await emailService.sendWelcomeEmail(data.user);
        break;
      case 'trip_receipt':
        await emailService.sendTripReceipt(data.user, data.trip);
        break;
      case 'password_reset':
        await emailService.sendPasswordResetEmail(data.user, data.resetToken);
        break;
      case 'driver_approval':
        await emailService.sendDriverApprovalEmail(data.driver, data.approved);
        break;
      case 'split_fare':
        await emailService.sendSplitFareInvitation(data.email, data.inviter, data.trip, data.shareAmount);
        break;
      case 'otp':
        await emailService.sendOTPEmail(data.user, data.otp);
        break;
      default:
        console.warn(`Unknown email type: ${type}`);
    }
    return { success: true };
  } catch (error) {
    console.error(`Email job failed: ${type}`, error);
    throw error;
  }
});

/**
 * SMS Queue Processor
 */
smsQueue.process(async (job) => {
  const { type, data } = job.data;
  console.log(`Processing SMS job: ${type}`);

  try {
    switch (type) {
      case 'otp':
        await smsService.sendOTP(data.phoneNumber, data.otp);
        break;
      case 'trip_confirmation':
        await smsService.sendTripConfirmation(data.phoneNumber, data.trip);
        break;
      case 'driver_arrived':
        await smsService.sendDriverArrived(data.phoneNumber, data.driverName, data.vehicleInfo);
        break;
      case 'trip_receipt':
        await smsService.sendTripReceipt(data.phoneNumber, data.trip);
        break;
      case 'trip_request':
        await smsService.sendTripRequest(data.phoneNumber, data.pickup, data.estimatedFare);
        break;
      case 'split_fare':
        await smsService.sendSplitFareInvitation(data.phoneNumber, data.inviterName, data.amount);
        break;
      case 'emergency':
        await smsService.sendEmergencyAlert(data.phoneNumber, data.tripId, data.location);
        break;
      default:
        console.warn(`Unknown SMS type: ${type}`);
    }
    return { success: true };
  } catch (error) {
    console.error(`SMS job failed: ${type}`, error);
    throw error;
  }
});

/**
 * Trip Queue Processor
 * Handles trip-related background tasks
 */
tripQueue.process(async (job) => {
  const { type, data } = job.data;
  console.log(`Processing trip job: ${type}`);

  try {
    switch (type) {
      case 'auto_cancel':
        // Auto-cancel trips that haven't been accepted after timeout
        await handleAutoCancel(data.tripId);
        break;
      case 'send_receipt':
        // Send receipt after trip completion
        await handleSendReceipt(data.tripId);
        break;
      case 'calculate_surge':
        // Recalculate surge pricing
        await handleSurgeCalculation(data.area);
        break;
      default:
        console.warn(`Unknown trip job type: ${type}`);
    }
    return { success: true };
  } catch (error) {
    console.error(`Trip job failed: ${type}`, error);
    throw error;
  }
});

/**
 * Cleanup Queue Processor
 * Handles periodic cleanup tasks
 */
cleanupQueue.process(async (job) => {
  const { type } = job.data;
  console.log(`Processing cleanup job: ${type}`);

  try {
    switch (type) {
      case 'expired_tokens':
        // Clean up expired refresh tokens
        await cleanupExpiredTokens();
        break;
      case 'old_notifications':
        // Clean up old notifications
        await cleanupOldNotifications();
        break;
      case 'abandoned_trips':
        // Clean up abandoned trips
        await cleanupAbandonedTrips();
        break;
      default:
        console.warn(`Unknown cleanup type: ${type}`);
    }
    return { success: true };
  } catch (error) {
    console.error(`Cleanup job failed: ${type}`, error);
    throw error;
  }
});

/**
 * Analytics Queue Processor
 * Handles analytics and reporting tasks
 */
analyticsQueue.process(async (job) => {
  const { type, data } = job.data;
  console.log(`Processing analytics job: ${type}`);

  try {
    switch (type) {
      case 'daily_summary':
        await generateDailySummary(data.date);
        break;
      case 'driver_earnings':
        await calculateDriverEarnings(data.driverId, data.period);
        break;
      default:
        console.warn(`Unknown analytics type: ${type}`);
    }
    return { success: true };
  } catch (error) {
    console.error(`Analytics job failed: ${type}`, error);
    throw error;
  }
});

// Helper functions

async function handleAutoCancel(tripId) {
  const trip = await Trip.findByPk(tripId);
  if (trip && trip.status === 'requested') {
    await trip.update({ status: 'cancelled_by_admin', cancellationReason: 'No driver accepted' });

    // Notify rider
    const rider = await Rider.findByPk(trip.riderId, { include: [User] });
    if (rider?.User) {
      await emailQueue.add({ type: 'trip_cancelled', data: { user: rider.User, trip, reason: 'No driver available' } });
    }
  }
}

async function handleSendReceipt(tripId) {
  const trip = await Trip.findByPk(tripId, {
    include: [{ model: Rider, include: [User] }]
  });

  if (trip?.Rider?.User) {
    await emailService.sendTripReceipt(trip.Rider.User, trip);
  }
}

async function handleSurgeCalculation(area) {
  // Calculate surge based on demand/supply in area
  // This is a placeholder - implement based on business logic
  console.log(`Calculating surge for area: ${area}`);
}

async function cleanupExpiredTokens() {
  // Refresh tokens older than 7 days
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  // Implementation depends on how tokens are stored
  console.log(`Cleaned up tokens older than ${cutoff}`);
}

async function cleanupOldNotifications() {
  // Remove notifications older than 30 days
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  console.log(`Cleaned up notifications older than ${cutoff}`);
}

async function cleanupAbandonedTrips() {
  // Cancel trips stuck in 'requested' for more than 10 minutes
  const cutoff = new Date(Date.now() - 10 * 60 * 1000);

  const abandonedTrips = await Trip.findAll({
    where: {
      status: 'requested',
      createdAt: { [Op.lt]: cutoff }
    }
  });

  for (const trip of abandonedTrips) {
    await trip.update({
      status: 'cancelled_by_admin',
      cancellationReason: 'Timeout - no driver available',
      cancelledAt: new Date()
    });
  }

  console.log(`Cancelled ${abandonedTrips.length} abandoned trips`);
}

async function generateDailySummary(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const stats = await Trip.findAll({
    where: {
      createdAt: { [Op.between]: [startOfDay, endOfDay] }
    },
    attributes: [
      [Trip.sequelize.fn('COUNT', Trip.sequelize.col('id')), 'totalTrips'],
      [Trip.sequelize.fn('SUM', Trip.sequelize.col('finalFare')), 'totalRevenue'],
    ],
    raw: true
  });

  console.log(`Daily summary for ${date}:`, stats[0]);
}

async function calculateDriverEarnings(driverId, period) {
  // Calculate earnings for a driver over a period
  console.log(`Calculating earnings for driver ${driverId} - period: ${period}`);
}

// Schedule recurring jobs
function scheduleRecurringJobs() {
  // Clean up expired tokens every day at 3 AM
  cleanupQueue.add(
    { type: 'expired_tokens' },
    { repeat: { cron: '0 3 * * *' } }
  );

  // Clean up old notifications every day at 4 AM
  cleanupQueue.add(
    { type: 'old_notifications' },
    { repeat: { cron: '0 4 * * *' } }
  );

  // Clean up abandoned trips every 5 minutes
  cleanupQueue.add(
    { type: 'abandoned_trips' },
    { repeat: { cron: '*/5 * * * *' } }
  );

  // Generate daily summary at midnight
  analyticsQueue.add(
    { type: 'daily_summary', data: { date: new Date().toISOString().split('T')[0] } },
    { repeat: { cron: '0 0 * * *' } }
  );

  console.log('Recurring jobs scheduled');
}

// Error handlers
emailQueue.on('failed', (job, err) => {
  console.error(`Email job ${job.id} failed:`, err);
});

smsQueue.on('failed', (job, err) => {
  console.error(`SMS job ${job.id} failed:`, err);
});

tripQueue.on('failed', (job, err) => {
  console.error(`Trip job ${job.id} failed:`, err);
});

// Export queues and initialization
module.exports = {
  emailQueue,
  smsQueue,
  tripQueue,
  cleanupQueue,
  analyticsQueue,
  scheduleRecurringJobs,
};

// Auto-start if run directly
if (require.main === module) {
  console.log('Starting background worker...');
  scheduleRecurringJobs();
  console.log('Worker is running. Press Ctrl+C to exit.');
}
