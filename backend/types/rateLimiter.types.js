/**
 * @typedef {Object} RateLimiterRequestObject
 * @property {string} ip - Client's IP address from the connection
 * @property {Object} headers - HTTP request headers
 * @property {string} headers.user-agent - User agent string from headers
 * @property {string} originalUrl - Original request URL path
 * @property {string} [userId] - Authenticated user ID (default: 'anonymous')
 * @property {string} protocol - Request protocol ('http' or 'https')
 * @property {function(string): string} get - Method to get headers by name
 */

/**
 * @typedef {Object} RateLimiterOptions
 * @property {number} [windowSize=60] - Rate limiting window in seconds
 * @property {number} [maxRequests=60] - Maximum allowed requests per window
 * @property {function(RateLimiterRequestObject): string} [generateLimitKey] - Custom limit key generator
 * @property {function(RateLimiterRequestObject): string} [generateBlockKey] - Custom block key generator
 * @property {Object} [message] - Default error message for rate limiting.
 * @property {string} message.text - Default error message text.
 * @property {number} message.code - Default error code.
 * @property {string} message.name - Default error name.
 */
