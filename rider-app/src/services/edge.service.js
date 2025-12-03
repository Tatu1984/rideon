/**
 * Edge Computing Service - Rider App
 *
 * Implements edge-based processing for:
 * - Fare calculations
 * - Route optimization
 * - ETA predictions
 * - Offline-first operations
 * - Local matching logic
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

class EdgeComputingService {
  constructor() {
    this.offlineQueue = [];
    this.localCache = {};
  }

  /**
   * EDGE COMPUTING: Fare Calculation
   * Calculate fare locally without server call
   */
  calculateFareLocally(distance, duration, vehicleType, surgeMultiplier = 1.0) {
    // Base pricing per vehicle type (stored locally for offline operation)
    const pricing = {
      1: { base: 2.50, perKm: 1.20, perMin: 0.30, minFare: 5.00 }, // Economy
      2: { base: 3.50, perKm: 1.80, perMin: 0.45, minFare: 7.00 }, // Premium
      3: { base: 4.50, perKm: 2.20, perMin: 0.55, minFare: 9.00 }, // SUV
      4: { base: 6.00, perKm: 3.00, perMin: 0.75, minFare: 12.00 }, // Luxury
    };

    const rates = pricing[vehicleType] || pricing[1];

    // Edge calculation - no server needed
    let fare = rates.base;
    fare += distance * rates.perKm;
    fare += duration * rates.perMin;

    // Apply surge multiplier (from local surge detection)
    fare *= surgeMultiplier;

    // Apply minimum fare
    fare = Math.max(fare, rates.minFare);

    console.log('🔷 EDGE: Fare calculated locally:', fare);

    return {
      baseFare: rates.base,
      distanceFare: distance * rates.perKm,
      timeFare: duration * rates.perMin,
      surge: surgeMultiplier,
      total: parseFloat(fare.toFixed(2)),
      calculatedAt: 'edge', // Indicates edge computing
    };
  }

  /**
   * EDGE COMPUTING: Route Optimization
   * Calculate optimal route locally using stored map data
   */
  calculateRouteLocally(pickup, dropoff) {
    // Simplified route calculation
    // In production, this would use locally stored map tiles and routing algorithms

    const latDiff = Math.abs(pickup.lat - dropoff.lat);
    const lngDiff = Math.abs(pickup.lng - dropoff.lng);

    // Haversine distance approximation
    const R = 6371; // Earth radius in km
    const dLat = this.toRad(latDiff);
    const dLng = this.toRad(lngDiff);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(pickup.lat)) * Math.cos(this.toRad(dropoff.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km

    // Estimated time (assuming average city speed of 30 km/h)
    const estimatedTime = (distance / 30) * 60; // Minutes

    console.log('🔷 EDGE: Route calculated locally');

    return {
      distance: parseFloat(distance.toFixed(2)),
      duration: Math.ceil(estimatedTime),
      calculatedAt: 'edge',
    };
  }

  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * EDGE COMPUTING: ETA Prediction
   * Predict arrival time using local traffic patterns
   */
  predictETALocally(currentLocation, destination, historicalData = []) {
    const route = this.calculateRouteLocally(currentLocation, destination);

    // Apply local traffic factor based on time of day
    const hour = new Date().getHours();
    let trafficFactor = 1.0;

    // Peak hours
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      trafficFactor = 1.5; // 50% slower during rush hour
    } else if (hour >= 22 || hour <= 5) {
      trafficFactor = 0.8; // 20% faster late night
    }

    const adjustedDuration = route.duration * trafficFactor;

    console.log('🔷 EDGE: ETA predicted locally');

    return {
      eta: Math.ceil(adjustedDuration),
      distance: route.distance,
      trafficLevel: trafficFactor > 1.2 ? 'heavy' : trafficFactor < 0.9 ? 'light' : 'moderate',
      calculatedAt: 'edge',
    };
  }

  /**
   * EDGE COMPUTING: Surge Detection
   * Detect surge conditions locally based on nearby requests
   */
  detectSurgeLocally(location, recentRequests = []) {
    // Count requests in last 5 minutes within 2km radius
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

    const nearbyRequests = recentRequests.filter(req => {
      if (req.timestamp < fiveMinutesAgo) return false;

      const route = this.calculateRouteLocally(location, req.location);
      return route.distance <= 2; // Within 2km
    });

    // Surge logic
    let surgeMultiplier = 1.0;
    if (nearbyRequests.length > 10) {
      surgeMultiplier = 2.0; // High demand
    } else if (nearbyRequests.length > 5) {
      surgeMultiplier = 1.5; // Moderate demand
    }

    console.log('🔷 EDGE: Surge detected locally:', surgeMultiplier);

    return {
      multiplier: surgeMultiplier,
      nearbyRequests: nearbyRequests.length,
      reason: surgeMultiplier > 1 ? 'High demand in your area' : 'Normal',
      calculatedAt: 'edge',
    };
  }

  /**
   * EDGE COMPUTING: Offline Queue Management
   * Queue operations when offline, sync when online
   */
  async queueOfflineOperation(operation) {
    this.offlineQueue.push({
      ...operation,
      timestamp: Date.now(),
      id: `offline_${Date.now()}_${Math.random()}`,
    });

    await AsyncStorage.setItem('offline_queue', JSON.stringify(this.offlineQueue));

    console.log('🔷 EDGE: Operation queued for offline sync');
  }

  /**
   * EDGE COMPUTING: Sync Offline Queue
   * Sync all offline operations when connection restored
   */
  async syncOfflineQueue(apiService) {
    const queue = JSON.parse(await AsyncStorage.getItem('offline_queue') || '[]');

    if (queue.length === 0) return;

    console.log(`🔷 EDGE: Syncing ${queue.length} offline operations...`);

    for (const operation of queue) {
      try {
        // Execute queued operation
        await this.executeQueuedOperation(operation, apiService);

        // Remove from queue
        this.offlineQueue = this.offlineQueue.filter(op => op.id !== operation.id);
      } catch (error) {
        console.error('Failed to sync operation:', error);
      }
    }

    await AsyncStorage.setItem('offline_queue', JSON.stringify(this.offlineQueue));
  }

  async executeQueuedOperation(operation, apiService) {
    switch (operation.type) {
      case 'create_trip':
        return await apiService.createTrip(operation.data);
      case 'update_profile':
        return await apiService.updateProfile(operation.data);
      case 'submit_rating':
        return await apiService.submitRating(operation.data);
      default:
        console.warn('Unknown operation type:', operation.type);
    }
  }

  /**
   * EDGE COMPUTING: Local Caching
   * Cache frequently accessed data for offline use
   */
  async cacheData(key, data, ttl = 3600000) {
    // TTL in milliseconds (default 1 hour)
    const cacheEntry = {
      data,
      expiry: Date.now() + ttl,
      cachedAt: 'edge',
    };

    this.localCache[key] = cacheEntry;
    await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheEntry));

    console.log('🔷 EDGE: Data cached locally');
  }

  async getCachedData(key) {
    // Check memory cache first
    if (this.localCache[key] && this.localCache[key].expiry > Date.now()) {
      console.log('🔷 EDGE: Data retrieved from memory cache');
      return this.localCache[key].data;
    }

    // Check AsyncStorage cache
    const cached = await AsyncStorage.getItem(`cache_${key}`);
    if (cached) {
      const entry = JSON.parse(cached);
      if (entry.expiry > Date.now()) {
        this.localCache[key] = entry;
        console.log('🔷 EDGE: Data retrieved from storage cache');
        return entry.data;
      }
    }

    return null;
  }

  /**
   * EDGE COMPUTING: Fraud Detection
   * Basic fraud checks performed locally
   */
  detectFraudLocally(tripRequest, userHistory) {
    const flags = [];

    // Check for rapid repeated requests
    const recentTrips = userHistory.filter(t =>
      Date.now() - new Date(t.createdAt).getTime() < 60000 // Last minute
    );

    if (recentTrips.length > 3) {
      flags.push('rapid_requests');
    }

    // Check for unusual distances
    const route = this.calculateRouteLocally(tripRequest.pickup, tripRequest.dropoff);
    if (route.distance > 100) {
      flags.push('unusual_distance');
    }

    // Check for same location pickup/dropoff
    if (route.distance < 0.1) {
      flags.push('same_location');
    }

    console.log('🔷 EDGE: Fraud check completed locally');

    return {
      isSuspicious: flags.length > 0,
      flags,
      riskScore: flags.length * 0.3,
      checkedAt: 'edge',
    };
  }
}

export default new EdgeComputingService();
