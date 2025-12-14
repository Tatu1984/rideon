/**
 * Standardized API Response Utility
 * Ensures consistent response format across all endpoints
 */

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {string} message - Optional success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const success = (res, data = null, message = null, statusCode = 200) => {
  const response = {
    success: true,
    data
  };

  if (message) {
    response.message = message;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send a created response (201)
 * @param {Object} res - Express response object
 * @param {Object} data - Created resource data
 * @param {string} message - Optional success message
 */
const created = (res, data, message = 'Resource created successfully') => {
  return success(res, data, message, 201);
};

/**
 * Send a paginated response
 * @param {Object} res - Express response object
 * @param {Array} items - Array of items
 * @param {Object} pagination - Pagination info { total, page, limit }
 * @param {string} itemsKey - Key name for items array (default: 'items')
 */
const paginated = (res, items, pagination, itemsKey = 'items') => {
  const { total, page, limit } = pagination;
  const totalPages = Math.ceil(total / limit);

  return res.status(200).json({
    success: true,
    data: {
      [itemsKey]: items,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages
      }
    }
  });
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} code - Error code (e.g., 'VALIDATION_ERROR')
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 400)
 * @param {Array} details - Optional error details (for validation errors)
 */
const error = (res, code, message, statusCode = 400, details = null) => {
  const response = {
    success: false,
    error: {
      code,
      message
    }
  };

  if (details) {
    response.error.details = details;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send a 404 Not Found response
 * @param {Object} res - Express response object
 * @param {string} resource - Resource name (e.g., 'User', 'Trip')
 */
const notFound = (res, resource = 'Resource') => {
  return error(
    res,
    `${resource.toUpperCase().replace(/\s+/g, '_')}_NOT_FOUND`,
    `${resource} not found`,
    404
  );
};

/**
 * Send a 401 Unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const unauthorized = (res, message = 'Authentication required') => {
  return error(res, 'UNAUTHORIZED', message, 401);
};

/**
 * Send a 403 Forbidden response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const forbidden = (res, message = 'You do not have permission to perform this action') => {
  return error(res, 'FORBIDDEN', message, 403);
};

/**
 * Send a 400 Bad Request response
 * @param {Object} res - Express response object
 * @param {string} code - Error code
 * @param {string} message - Error message
 */
const badRequest = (res, code, message) => {
  return error(res, code, message, 400);
};

/**
 * Send a 500 Server Error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message (default: generic message)
 */
const serverError = (res, message = 'An unexpected error occurred') => {
  return error(res, 'SERVER_ERROR', message, 500);
};

/**
 * Send a validation error response
 * @param {Object} res - Express response object
 * @param {Array} errors - Array of validation errors
 */
const validationError = (res, errors) => {
  return error(
    res,
    'VALIDATION_ERROR',
    'Validation failed',
    400,
    errors
  );
};

/**
 * Send a rate limit exceeded response
 * @param {Object} res - Express response object
 */
const rateLimitExceeded = (res) => {
  return error(
    res,
    'RATE_LIMIT_EXCEEDED',
    'Too many requests. Please try again later.',
    429
  );
};

module.exports = {
  success,
  created,
  paginated,
  error,
  notFound,
  unauthorized,
  forbidden,
  badRequest,
  serverError,
  validationError,
  rateLimitExceeded
};
