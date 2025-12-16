/**
 * RideOn Validation Package
 * Shared validation schemas and utilities across all applications
 */

// ============================================================================
// VALIDATION RULES
// ============================================================================

/**
 * Password validation rules
 */
const PASSWORD_RULES = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

/**
 * Phone validation patterns by country
 */
const PHONE_PATTERNS = {
  US: /^\+1[2-9]\d{9}$/,
  IN: /^\+91[6-9]\d{9}$/,
  UK: /^\+44[1-9]\d{9,10}$/,
  GENERIC: /^\+?[\d\s-]{10,15}$/
};

/**
 * Coordinates validation ranges
 */
const COORDINATE_RANGES = {
  latitude: { min: -90, max: 90 },
  longitude: { min: -180, max: 180 }
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {object} Validation result { valid, error }
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  const trimmed = email.trim().toLowerCase();

  if (trimmed.length > 255) {
    return { valid: false, error: 'Email must not exceed 255 characters' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true, value: trimmed };
}

/**
 * Validate password
 * @param {string} password - Password to validate
 * @returns {object} Validation result { valid, errors }
 */
function validatePassword(password) {
  const errors = [];

  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['Password is required'] };
  }

  if (password.length < PASSWORD_RULES.minLength) {
    errors.push(`Password must be at least ${PASSWORD_RULES.minLength} characters`);
  }

  if (password.length > PASSWORD_RULES.maxLength) {
    errors.push(`Password must not exceed ${PASSWORD_RULES.maxLength} characters`);
  }

  if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (PASSWORD_RULES.requireNumber && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (PASSWORD_RULES.requireSpecialChar) {
    const specialCharRegex = new RegExp(`[${PASSWORD_RULES.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`);
    if (!specialCharRegex.test(password)) {
      errors.push('Password must contain at least one special character');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @param {string} country - Country code (optional)
 * @returns {object} Validation result { valid, error, formatted }
 */
function validatePhone(phone, country = 'GENERIC') {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required' };
  }

  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '');

  const pattern = PHONE_PATTERNS[country] || PHONE_PATTERNS.GENERIC;

  if (!pattern.test(cleaned)) {
    return { valid: false, error: 'Invalid phone number format' };
  }

  return { valid: true, formatted: cleaned };
}

/**
 * Validate coordinates
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {object} Validation result { valid, errors }
 */
function validateCoordinates(latitude, longitude) {
  const errors = [];

  if (latitude === undefined || latitude === null) {
    errors.push('Latitude is required');
  } else {
    const lat = parseFloat(latitude);
    if (isNaN(lat)) {
      errors.push('Latitude must be a number');
    } else if (lat < COORDINATE_RANGES.latitude.min || lat > COORDINATE_RANGES.latitude.max) {
      errors.push(`Latitude must be between ${COORDINATE_RANGES.latitude.min} and ${COORDINATE_RANGES.latitude.max}`);
    }
  }

  if (longitude === undefined || longitude === null) {
    errors.push('Longitude is required');
  } else {
    const lng = parseFloat(longitude);
    if (isNaN(lng)) {
      errors.push('Longitude must be a number');
    } else if (lng < COORDINATE_RANGES.longitude.min || lng > COORDINATE_RANGES.longitude.max) {
      errors.push(`Longitude must be between ${COORDINATE_RANGES.longitude.min} and ${COORDINATE_RANGES.longitude.max}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate vehicle type
 * @param {string} type - Vehicle type
 * @returns {object} Validation result { valid, error }
 */
function validateVehicleType(type) {
  const validTypes = ['economy', 'comfort', 'premium', 'suv', 'xl'];

  if (!type || typeof type !== 'string') {
    return { valid: false, error: 'Vehicle type is required' };
  }

  if (!validTypes.includes(type.toLowerCase())) {
    return { valid: false, error: `Vehicle type must be one of: ${validTypes.join(', ')}` };
  }

  return { valid: true, value: type.toLowerCase() };
}

/**
 * Validate payment method
 * @param {string} method - Payment method
 * @returns {object} Validation result { valid, error }
 */
function validatePaymentMethod(method) {
  const validMethods = ['cash', 'card', 'wallet', 'upi'];

  if (!method || typeof method !== 'string') {
    return { valid: false, error: 'Payment method is required' };
  }

  if (!validMethods.includes(method.toLowerCase())) {
    return { valid: false, error: `Payment method must be one of: ${validMethods.join(', ')}` };
  }

  return { valid: true, value: method.toLowerCase() };
}

/**
 * Validate rating
 * @param {number} rating - Rating value
 * @returns {object} Validation result { valid, error }
 */
function validateRating(rating) {
  if (rating === undefined || rating === null) {
    return { valid: false, error: 'Rating is required' };
  }

  const numRating = parseFloat(rating);

  if (isNaN(numRating)) {
    return { valid: false, error: 'Rating must be a number' };
  }

  if (numRating < 1 || numRating > 5) {
    return { valid: false, error: 'Rating must be between 1 and 5' };
  }

  return { valid: true, value: Math.round(numRating * 10) / 10 };
}

/**
 * Validate promo code format
 * @param {string} code - Promo code
 * @returns {object} Validation result { valid, error }
 */
function validatePromoCode(code) {
  if (!code || typeof code !== 'string') {
    return { valid: false, error: 'Promo code is required' };
  }

  const trimmed = code.trim().toUpperCase();

  if (trimmed.length < 3 || trimmed.length > 20) {
    return { valid: false, error: 'Promo code must be between 3 and 20 characters' };
  }

  if (!/^[A-Z0-9]+$/.test(trimmed)) {
    return { valid: false, error: 'Promo code must contain only letters and numbers' };
  }

  return { valid: true, value: trimmed };
}

/**
 * Validate date is in the future
 * @param {string|Date} date - Date to validate
 * @param {number} minMinutesAhead - Minimum minutes in the future (default: 0)
 * @returns {object} Validation result { valid, error }
 */
function validateFutureDate(date, minMinutesAhead = 0) {
  if (!date) {
    return { valid: false, error: 'Date is required' };
  }

  const dateObj = new Date(date);

  if (isNaN(dateObj.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }

  const minTime = new Date(Date.now() + minMinutesAhead * 60 * 1000);

  if (dateObj < minTime) {
    if (minMinutesAhead > 0) {
      return { valid: false, error: `Date must be at least ${minMinutesAhead} minutes in the future` };
    }
    return { valid: false, error: 'Date must be in the future' };
  }

  return { valid: true, value: dateObj };
}

/**
 * Validate UUID format
 * @param {string} uuid - UUID to validate
 * @returns {object} Validation result { valid, error }
 */
function validateUUID(uuid) {
  if (!uuid || typeof uuid !== 'string') {
    return { valid: false, error: 'ID is required' };
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(uuid)) {
    return { valid: false, error: 'Invalid ID format' };
  }

  return { valid: true, value: uuid.toLowerCase() };
}

/**
 * Validate string length
 * @param {string} str - String to validate
 * @param {object} options - { minLength, maxLength, fieldName }
 * @returns {object} Validation result { valid, error }
 */
function validateStringLength(str, { minLength = 0, maxLength = 255, fieldName = 'Field' } = {}) {
  if (str === undefined || str === null) {
    if (minLength > 0) {
      return { valid: false, error: `${fieldName} is required` };
    }
    return { valid: true, value: '' };
  }

  if (typeof str !== 'string') {
    return { valid: false, error: `${fieldName} must be a string` };
  }

  const trimmed = str.trim();

  if (trimmed.length < minLength) {
    return { valid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }

  if (trimmed.length > maxLength) {
    return { valid: false, error: `${fieldName} must not exceed ${maxLength} characters` };
  }

  return { valid: true, value: trimmed };
}

/**
 * Validate numeric value
 * @param {number} value - Value to validate
 * @param {object} options - { min, max, fieldName }
 * @returns {object} Validation result { valid, error }
 */
function validateNumber(value, { min, max, fieldName = 'Value' } = {}) {
  if (value === undefined || value === null) {
    return { valid: false, error: `${fieldName} is required` };
  }

  const num = parseFloat(value);

  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} must be a number` };
  }

  if (min !== undefined && num < min) {
    return { valid: false, error: `${fieldName} must be at least ${min}` };
  }

  if (max !== undefined && num > max) {
    return { valid: false, error: `${fieldName} must not exceed ${max}` };
  }

  return { valid: true, value: num };
}

// ============================================================================
// SCHEMA DEFINITIONS
// ============================================================================

/**
 * User registration schema
 */
const userRegistrationSchema = {
  email: { required: true, validate: validateEmail },
  password: { required: true, validate: validatePassword },
  firstName: { required: true, validate: (v) => validateStringLength(v, { minLength: 1, maxLength: 100, fieldName: 'First name' }) },
  lastName: { required: true, validate: (v) => validateStringLength(v, { minLength: 1, maxLength: 100, fieldName: 'Last name' }) },
  phone: { required: true, validate: validatePhone },
  role: { required: true, validate: (v) => {
    const validRoles = ['rider', 'driver'];
    if (!validRoles.includes(v)) {
      return { valid: false, error: `Role must be one of: ${validRoles.join(', ')}` };
    }
    return { valid: true, value: v };
  }}
};

/**
 * Trip request schema
 */
const tripRequestSchema = {
  pickupAddress: { required: true, validate: (v) => validateStringLength(v, { minLength: 1, maxLength: 500, fieldName: 'Pickup address' }) },
  pickupLatitude: { required: true, validate: (v) => validateNumber(v, { min: -90, max: 90, fieldName: 'Pickup latitude' }) },
  pickupLongitude: { required: true, validate: (v) => validateNumber(v, { min: -180, max: 180, fieldName: 'Pickup longitude' }) },
  dropoffAddress: { required: true, validate: (v) => validateStringLength(v, { minLength: 1, maxLength: 500, fieldName: 'Dropoff address' }) },
  dropoffLatitude: { required: true, validate: (v) => validateNumber(v, { min: -90, max: 90, fieldName: 'Dropoff latitude' }) },
  dropoffLongitude: { required: true, validate: (v) => validateNumber(v, { min: -180, max: 180, fieldName: 'Dropoff longitude' }) },
  vehicleType: { required: true, validate: validateVehicleType },
  paymentMethod: { required: true, validate: validatePaymentMethod },
  promoCode: { required: false, validate: validatePromoCode },
  riderNotes: { required: false, validate: (v) => validateStringLength(v, { maxLength: 500, fieldName: 'Notes' }) }
};

/**
 * Validate data against schema
 * @param {object} data - Data to validate
 * @param {object} schema - Validation schema
 * @returns {object} { valid, errors, data }
 */
function validateSchema(data, schema) {
  const errors = {};
  const validatedData = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];

    if (rules.required && (value === undefined || value === null || value === '')) {
      errors[field] = `${field} is required`;
      continue;
    }

    if (value !== undefined && value !== null && value !== '' && rules.validate) {
      const result = rules.validate(value);
      if (!result.valid) {
        errors[field] = result.error || result.errors;
      } else {
        validatedData[field] = result.value !== undefined ? result.value : value;
      }
    } else if (!rules.required) {
      validatedData[field] = value;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: validatedData
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Rules
  PASSWORD_RULES,
  PHONE_PATTERNS,
  COORDINATE_RANGES,

  // Validation functions
  validateEmail,
  validatePassword,
  validatePhone,
  validateCoordinates,
  validateVehicleType,
  validatePaymentMethod,
  validateRating,
  validatePromoCode,
  validateFutureDate,
  validateUUID,
  validateStringLength,
  validateNumber,

  // Schemas
  userRegistrationSchema,
  tripRequestSchema,

  // Schema validation
  validateSchema
};
