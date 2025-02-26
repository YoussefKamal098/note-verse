/**
 * @typedef {Object} AuthConfig
 * @property {string} accessTokenSecret - The secret used to sign access tokens.
 * @property {string} accessTokenExpiry - The expiration duration for access tokens (e.g., "1h").
 * @property {string} refreshTokenSecret - The secret used to sign refresh tokens.
 * @property {number} otpTokenExpiry - The expiration duration for OTP code tokens (e.g., 15 in minutes).
 * @property {string} refreshTokenExpiry - The expiration duration for refresh tokens (e.g., "7d").
 * @property {string} cookiesName - The name of the cookie that stores the refresh token.
 * @property {number} cookiesMaxAge - The maximum age for the cookie in seconds or milliseconds.
 * @property {function(): Object} getCookieOptions - A function that returns an object of cookie options.
 * @property {function(): Object} getClearCookieOptions - A function that returns an object of options for clearing the cookie.
 */