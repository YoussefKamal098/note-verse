/**
 * @typedef {Readonly<Object>} CsrfConfig
 * @property {string} secret - Secret key for CSRF token generation
 * @property {string} cookieName - Name for the CSRF cookie
 * @property {string} tokenName - The name of the token field used to extract the CSRF token from the request.
 * @property {string} defaultSource - The default source to extract the CSRF token from (e.g., 'header', 'body', or 'query').
 * @property {function(): Object} getCookieOptions - Function returning options for the CSRF cookie.
 * @property {boolean} getCookieOptions.httpOnly - Indicates that the cookie is HTTP-only and inaccessible to client-side scripts.
 * @property {boolean} getCookieOptions.secure - Secure cookie flag, ensuring the cookie is transmitted only over HTTPS.
 * @property {string} getCookieOptions.sameSite - SameSite attribute that restricts the cookie from being sent with cross-site requests.
 * @property {number} getCookieOptions.maxAge - The maximum age (in milliseconds) for which the cookie is valid.
 * @property {Date} getCookieOptions.expires - The exact date and time (in GMT or UTC format) when the cookie expires.
 * @property {string} getCookieOptions.path - The path for which the cookie is valid.
 * @property {Object} clearCookieOptions - Options for clearing the CSRF cookie.
 * @property {boolean} clearCookieOptions.httpOnly - Indicates whether the cookie is inaccessible to client-side scripts.
 * @property {string} clearCookieOptions.sameSite - SameSite attribute for the clear cookie.
 * @property {boolean} clearCookieOptions.secure - Determines if the cookie should be transmitted only over secure protocols (e.g., HTTPS).
 * @property {number} saltLength - Length of the salt used in token generation, measured in bytes (default: 64)
 * @property {string[]} ignoredMethods - HTTP methods to ignore CSRF protection
 * @property {function(import('express').Request, string): (string|undefined)}
 * getTokenFromRequest - Token extraction function.
 * Accepts an Express Request and a source string ('body', 'query', or 'header')
 * and returns the extracted CSRF token or undefined if not found.
 * Throws an error if the provided source is not one of the supported values.
 */
