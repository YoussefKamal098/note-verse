/**
 * @typedef {Readonly<Object>} CsrfConfig
 * @property {string} secret - Secret key for CSRF token generation
 * @property {string} cookieName - Name for the CSRF cookie
 * @property {Object} cookieOptions - Options for the CSRF cookie
 * @property {boolean} cookieOptions.secure - Secure cookie flag
 * @property {string} cookieOptions.sameSite - SameSite attribute
 * @property {string} cookieOptions.path - Cookie path
 * @property {number} saltLength - Length of the salt used in token generation, measured in bytes (default: 64)
 * @property {string[]} ignoredMethods - HTTP methods to ignore CSRF protection
 * @property {function(Request): string} getTokenFromRequest - Token extraction function
 */
