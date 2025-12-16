/**
 * RideOn Shared Package
 * Common utilities, constants, and helpers shared across all applications
 */

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * User roles
 */
const USER_ROLES = {
  ADMIN: 'admin',
  RIDER: 'rider',
  DRIVER: 'driver'
};

/**
 * Trip statuses
 */
const TRIP_STATUS = {
  REQUESTED: 'requested',
  ACCEPTED: 'accepted',
  DRIVER_ARRIVED: 'driver_arrived',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED_BY_RIDER: 'cancelled_by_rider',
  CANCELLED_BY_DRIVER: 'cancelled_by_driver',
  CANCELLED_BY_ADMIN: 'cancelled_by_admin'
};

/**
 * Driver statuses
 */
const DRIVER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
  ONLINE: 'online',
  OFFLINE: 'offline',
  BUSY: 'busy'
};

/**
 * Vehicle types
 */
const VEHICLE_TYPES = {
  ECONOMY: 'economy',
  COMFORT: 'comfort',
  PREMIUM: 'premium',
  SUV: 'suv',
  XL: 'xl'
};

/**
 * Payment methods
 */
const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  WALLET: 'wallet',
  UPI: 'upi'
};

/**
 * Payment statuses
 */
const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

/**
 * Document types
 */
const DOCUMENT_TYPES = {
  LICENSE: 'license',
  VEHICLE_REGISTRATION: 'vehicle_registration',
  INSURANCE: 'insurance',
  IDENTITY_PROOF: 'identity_proof',
  ADDRESS_PROOF: 'address_proof',
  BACKGROUND_CHECK: 'background_check',
  VEHICLE_INSPECTION: 'vehicle_inspection',
  OTHER: 'other'
};

/**
 * Support ticket categories
 */
const TICKET_CATEGORIES = {
  TRIP_ISSUE: 'trip_issue',
  PAYMENT_ISSUE: 'payment_issue',
  DRIVER_BEHAVIOR: 'driver_behavior',
  SAFETY_CONCERN: 'safety_concern',
  APP_ISSUE: 'app_issue',
  ACCOUNT_ISSUE: 'account_issue',
  LOST_ITEM: 'lost_item',
  OTHER: 'other'
};

/**
 * Notification types
 */
const NOTIFICATION_TYPES = {
  TRIP_REQUEST: 'trip_request',
  TRIP_ACCEPTED: 'trip_accepted',
  TRIP_STARTED: 'trip_started',
  TRIP_COMPLETED: 'trip_completed',
  TRIP_CANCELLED: 'trip_cancelled',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  DRIVER_ARRIVED: 'driver_arrived',
  PROMO_CODE: 'promo_code',
  RATING_REMINDER: 'rating_reminder',
  DOCUMENT_VERIFICATION: 'document_verification',
  PAYOUT: 'payout',
  GENERAL: 'general'
};

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
}

/**
 * Format date to human-readable string
 * @param {Date|string} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(new Date(date));
}

/**
 * Format duration in minutes to human-readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration string
 */
function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Format distance in kilometers
 * @param {number} km - Distance in kilometers
 * @returns {string} Formatted distance string
 */
function formatDistance(km) {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Generate a random alphanumeric string
 * @param {number} length - Length of string to generate
 * @returns {string} Random string
 */
function generateRandomString(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Whether phone number is valid
 */
function isValidPhone(phone) {
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  return phoneRegex.test(phone);
}

/**
 * Mask sensitive data (e.g., card numbers, phone)
 * @param {string} str - String to mask
 * @param {number} visibleChars - Number of characters to leave visible at the end
 * @returns {string} Masked string
 */
function maskSensitive(str, visibleChars = 4) {
  if (!str || str.length <= visibleChars) return str;
  const masked = '*'.repeat(str.length - visibleChars);
  return masked + str.slice(-visibleChars);
}

/**
 * Calculate estimated trip duration based on distance
 * Assumes average speed of 30 km/h in urban areas
 * @param {number} distanceKm - Distance in kilometers
 * @returns {number} Estimated duration in minutes
 */
function estimateTripDuration(distanceKm) {
  const avgSpeedKmH = 30;
  return Math.ceil((distanceKm / avgSpeedKmH) * 60);
}

/**
 * Check if a trip status is terminal (cannot be changed)
 * @param {string} status - Trip status
 * @returns {boolean} Whether status is terminal
 */
function isTripTerminal(status) {
  return [
    TRIP_STATUS.COMPLETED,
    TRIP_STATUS.CANCELLED_BY_RIDER,
    TRIP_STATUS.CANCELLED_BY_DRIVER,
    TRIP_STATUS.CANCELLED_BY_ADMIN
  ].includes(status);
}

/**
 * Check if a trip is active
 * @param {string} status - Trip status
 * @returns {boolean} Whether trip is active
 */
function isTripActive(status) {
  return [
    TRIP_STATUS.REQUESTED,
    TRIP_STATUS.ACCEPTED,
    TRIP_STATUS.DRIVER_ARRIVED,
    TRIP_STATUS.IN_PROGRESS
  ].includes(status);
}

/**
 * Get user-friendly trip status label
 * @param {string} status - Trip status
 * @returns {string} Human-readable status
 */
function getTripStatusLabel(status) {
  const labels = {
    [TRIP_STATUS.REQUESTED]: 'Searching for driver',
    [TRIP_STATUS.ACCEPTED]: 'Driver on the way',
    [TRIP_STATUS.DRIVER_ARRIVED]: 'Driver arrived',
    [TRIP_STATUS.IN_PROGRESS]: 'Trip in progress',
    [TRIP_STATUS.COMPLETED]: 'Trip completed',
    [TRIP_STATUS.CANCELLED_BY_RIDER]: 'Cancelled',
    [TRIP_STATUS.CANCELLED_BY_DRIVER]: 'Cancelled by driver',
    [TRIP_STATUS.CANCELLED_BY_ADMIN]: 'Cancelled'
  };
  return labels[status] || status;
}

/**
 * Get vehicle type display info
 * @param {string} type - Vehicle type
 * @returns {object} Vehicle type info
 */
function getVehicleTypeInfo(type) {
  const info = {
    [VEHICLE_TYPES.ECONOMY]: {
      name: 'Economy',
      description: 'Affordable rides for everyday trips',
      capacity: 4,
      icon: 'car'
    },
    [VEHICLE_TYPES.COMFORT]: {
      name: 'Comfort',
      description: 'Newer cars with extra legroom',
      capacity: 4,
      icon: 'car-side'
    },
    [VEHICLE_TYPES.PREMIUM]: {
      name: 'Premium',
      description: 'High-end cars with top-rated drivers',
      capacity: 4,
      icon: 'car-sports'
    },
    [VEHICLE_TYPES.SUV]: {
      name: 'SUV',
      description: 'Spacious SUVs for groups',
      capacity: 6,
      icon: 'car-suv'
    },
    [VEHICLE_TYPES.XL]: {
      name: 'XL',
      description: 'Large vehicles for bigger groups',
      capacity: 7,
      icon: 'van'
    }
  };
  return info[type] || { name: type, description: '', capacity: 4, icon: 'car' };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Constants
  USER_ROLES,
  TRIP_STATUS,
  DRIVER_STATUS,
  VEHICLE_TYPES,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  DOCUMENT_TYPES,
  TICKET_CATEGORIES,
  NOTIFICATION_TYPES,

  // Utilities
  calculateDistance,
  formatCurrency,
  formatDate,
  formatDuration,
  formatDistance,
  generateRandomString,
  isValidEmail,
  isValidPhone,
  maskSensitive,
  estimateTripDuration,
  isTripTerminal,
  isTripActive,
  getTripStatusLabel,
  getVehicleTypeInfo
};
