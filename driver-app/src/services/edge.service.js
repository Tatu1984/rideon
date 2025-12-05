/**
 * Edge Computing Service - Driver App
 *
 * Implements edge-based processing for:
 * - Trip matching algorithm
 * - Earnings calculations
 * - Route optimization
 * - Offline-first operations
 * - Local safety checks
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

class EdgeComputingService {
  constructor() {
    this.offlineQueue = [];
    this.localCache = {};
  }

  /**
   * EDGE COMPUTING: Trip Matching Algorithm
   * Match incoming trip requests locally based on proximity and driver status
   */
  matchTripLocally(tripRequest, driverLocation, driverStatus, driverStats) {
    // Don't match if driver is not available
    if (driverStatus !== 'online') {
      return { shouldAccept: false, reason: 'Driver not online' };
    }

    // Calculate distance to pickup
    const distanceToPickup = this.calculateDistance(
      driverLocation,
      tripRequest.pickupLocation
    );

    // Don't accept if too far
    if (distanceToPickup > 5) {
      return { shouldAccept: false, reason: 'Pickup too far' };
    }

    // Calculate potential earnings
    const earnings = this.calculateEarningsLocally(tripRequest);

    // Calculate score based on multiple factors
    const score = this.calculateMatchScore({
      distanceToPickup,
      tripDistance: tripRequest.distance,
      earnings: earnings.driverEarnings,
      driverRating: driverStats.rating,
      acceptanceRate: driverStats.acceptanceRate,
    });

    console.log('🔷 EDGE: Trip matched locally, score:', score);

    return {
      shouldAccept: score > 0.6,
      score,
      distanceToPickup: parseFloat(distanceToPickup.toFixed(2)),
      estimatedEarnings: earnings.driverEarnings,
      estimatedPickupTime: Math.ceil((distanceToPickup / 30) * 60), // Minutes
      calculatedAt: 'edge',
    };
  }

  calculateMatchScore(factors) {
    let score = 1.0;

    // Penalty for distance to pickup (prefer closer)
    score -= factors.distanceToPickup * 0.05;

    // Bonus for earnings (prefer higher earnings)
    score += (factors.earnings / 20) * 0.1;

    // Bonus for high acceptance rate
    score += factors.acceptanceRate * 0.1;

    // Keep between 0 and 1
    return Math.max(0, Math.min(1, score));
  }

  /**
   * EDGE COMPUTING: Earnings Calculation
   * Calculate driver earnings locally
   */
  calculateEarningsLocally(tripData) {
    const { fare, distance, duration, vehicleType } = tripData;

    // Commission split (75% driver, 25% platform)
    const platformCommission = 0.25;
    const driverShare = 1 - platformCommission;

    const totalFare = fare || this.estimateFare(distance, duration, vehicleType);
    const driverEarnings = totalFare * driverShare;
    const platformFee = totalFare * platformCommission;

    console.log('🔷 EDGE: Earnings calculated locally');

    return {
      totalFare: parseFloat(totalFare.toFixed(2)),
      driverEarnings: parseFloat(driverEarnings.toFixed(2)),
      platformFee: parseFloat(platformFee.toFixed(2)),
      calculatedAt: 'edge',
    };
  }

  estimateFare(distance, duration, vehicleType = 1) {
    const pricing = {
      1: { base: 2.50, perKm: 1.20, perMin: 0.30 },
      2: { base: 3.50, perKm: 1.80, perMin: 0.45 },
      3: { base: 4.50, perKm: 2.20, perMin: 0.55 },
      4: { base: 6.00, perKm: 3.00, perMin: 0.75 },
    };

    const rates = pricing[vehicleType] || pricing[1];
    return rates.base + (distance * rates.perKm) + (duration * rates.perMin);
  }

  /**
   * EDGE COMPUTING: Route Optimization
   * Find optimal route to pickup/destination
   */
  calculateOptimalRoute(currentLocation, destination) {
    const distance = this.calculateDistance(currentLocation, destination);

    // Simplified route optimization
    // In production, use locally cached map data

    const hour = new Date().getHours();
    let trafficFactor = 1.0;

    // Adjust for peak hours
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      trafficFactor = 1.5;
    }

    const estimatedTime = (distance / 30) * 60 * trafficFactor; // Minutes

    console.log('🔷 EDGE: Route optimized locally');

    return {
      distance: parseFloat(distance.toFixed(2)),
      estimatedTime: Math.ceil(estimatedTime),
      trafficLevel: trafficFactor > 1.2 ? 'heavy' : 'light',
      calculatedAt: 'edge',
    };
  }

  calculateDistance(point1, point2) {
    const R = 6371; // Earth radius in km
    const dLat = this.toRad(point2.lat - point1.lat);
    const dLng = this.toRad(point2.lng - point1.lng);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(point1.lat)) * Math.cos(this.toRad(point2.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * EDGE COMPUTING: Safety Alerts
   * Process safety alerts locally
   */
  processSafetyAlertLocally(alertType, location, tripData) {
    const alert = {
      type: alertType,
      location,
      timestamp: Date.now(),
      tripId: tripData.tripId,
      severity: 'high',
      processedAt: 'edge',
    };

    // Immediately save to local storage
    this.saveSafetyAlert(alert);

    // Queue for server sync
    this.queueOfflineOperation({
      type: 'safety_alert',
      data: alert,
    });

    console.log('🔷 EDGE: Safety alert processed locally');

    return alert;
  }

  async saveSafetyAlert(alert) {
    const alerts = JSON.parse(await AsyncStorage.getItem('safety_alerts') || '[]');
    alerts.push(alert);
    await AsyncStorage.setItem('safety_alerts', JSON.stringify(alerts));
  }

  /**
   * EDGE COMPUTING: Offline Queue Management
   */
  async queueOfflineOperation(operation) {
    this.offlineQueue.push({
      ...operation,
      timestamp: Date.now(),
      id: `offline_${Date.now()}_${Math.random()}`,
    });

    await AsyncStorage.setItem('offline_queue', JSON.stringify(this.offlineQueue));

    console.log('🔷 EDGE: Operation queued offline');
  }

  /**
   * EDGE COMPUTING: Trip Statistics
   * Calculate daily/weekly statistics locally
   */
  calculateStatsLocally(trips) {
    const today = new Date().setHours(0, 0, 0, 0);
    const todayTrips = trips.filter(t => new Date(t.completedAt).getTime() >= today);

    const stats = {
      todayTrips: todayTrips.length,
      todayEarnings: todayTrips.reduce((sum, t) => sum + (t.earnings || 0), 0),
      totalDistance: trips.reduce((sum, t) => sum + (t.distance || 0), 0),
      averageRating: trips.reduce((sum, t) => sum + (t.rating || 0), 0) / trips.length,
      calculatedAt: 'edge',
    };

    console.log('🔷 EDGE: Stats calculated locally');

    return stats;
  }

  /**
   * EDGE COMPUTING: Acceptance Rate Optimization
   * Suggest optimal acceptance strategy
   */
  suggestAcceptanceStrategy(driverStats, currentHour) {
    const { acceptanceRate, rating, totalEarnings } = driverStats;

    let strategy = {
      shouldAcceptLowFare: false,
      minFareThreshold: 5.00,
      maxPickupDistance: 3,
      reason: '',
    };

    // Peak hours - accept more trips
    if ((currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 19)) {
      strategy.shouldAcceptLowFare = true;
      strategy.maxPickupDistance = 5;
      strategy.reason = 'Peak hours - high demand';
    }

    // Low acceptance rate - need to improve
    if (acceptanceRate < 0.7) {
      strategy.shouldAcceptLowFare = true;
      strategy.minFareThreshold = 3.00;
      strategy.reason = 'Improve acceptance rate';
    }

    // High rating - can be selective
    if (rating > 4.7) {
      strategy.minFareThreshold = 7.00;
      strategy.maxPickupDistance = 2;
      strategy.reason = 'High rating - optimize earnings';
    }

    console.log('🔷 EDGE: Acceptance strategy calculated');

    return strategy;
  }

  /**
   * EDGE COMPUTING: Offline-First Location Updates
   */
  async updateLocationLocally(location) {
    // Save to local cache
    await AsyncStorage.setItem('last_location', JSON.stringify({
      ...location,
      timestamp: Date.now(),
    }));

    // Queue for server sync
    this.queueOfflineOperation({
      type: 'location_update',
      data: location,
    });

    console.log('🔷 EDGE: Location updated locally');
  }

  /**
   * EDGE COMPUTING: Sync Offline Queue
   */
  async syncOfflineQueue(apiService) {
    const queue = JSON.parse(await AsyncStorage.getItem('offline_queue') || '[]');

    if (queue.length === 0) return;

    console.log(`🔷 EDGE: Syncing ${queue.length} offline operations...`);

    for (const operation of queue) {
      try {
        await this.executeQueuedOperation(operation, apiService);
        this.offlineQueue = this.offlineQueue.filter(op => op.id !== operation.id);
      } catch (error) {
        console.error('Failed to sync operation:', error);
      }
    }

    await AsyncStorage.setItem('offline_queue', JSON.stringify(this.offlineQueue));
  }

  async executeQueuedOperation(operation, apiService) {
    switch (operation.type) {
      case 'location_update':
        return await apiService.updateLocation(operation.data);
      case 'trip_status_update':
        return await apiService.updateTripStatus(operation.data);
      case 'safety_alert':
        return await apiService.sendSafetyAlert(operation.data);
      default:
        console.warn('Unknown operation type:', operation.type);
    }
  }
}

export default new EdgeComputingService();
