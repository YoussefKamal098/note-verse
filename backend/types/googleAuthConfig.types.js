/**
 * @typedef {Object} GoogleAuthConfig
 * @property {string} clientId - Google OAuth client ID parsed from environment variables
 * @property {string} clientSecret - Google OAuth client secret parsed from environment variables
 * @property {string} redirectUri - Authorized redirect URI for OAuth flow
 * @property {string} stateTokenSecret - Secret key for state token generation with fallback
 * @property {string} stateTokenExpiry - State token expiration time (e.g., '5m' = 5 minutes)
 * @property {string} cookiesName - Name for state token cookies
 * @property {number} cookiesMaxAge - Maximum cookie age in milliseconds (default: 5 minutes)
 *
 * @property {Function} getCookieOptions - Gets configured cookie options
 * @method {Function} getCookieOptions
 * @returns {{
 *   httpOnly: boolean,
 *   sameSite: 'strict'|'lax'|'none',
 *   secure: boolean,
 *   maxAge: number,
 *   expires: Date
 * }} Cookie configuration object with security settings
 *
 * @property {Function} getClearCookieOptions - Gets cookie options for clearing
 * @method {Function} getClearCookieOptions
 * @returns {{
 *   httpOnly: boolean,
 *   sameSite: 'strict'|'lax'|'none',
 *   secure: boolean
 * }} Minimal cookie configuration for cookie removal
 *
 * @description
 * Immutable configuration object for Google OAuth 2.0 authentication flow.
 * All values are parsed from environment variables with fallback defaults.
 * The Object is frozen to prevent accidental modification.
 *
 * @example
 * // Accessing configuration values
 * console.log(googleAuthConfig.clientId);
 * console.log(googleAuthConfig.getCookieOptions());
 *
 * @see {@link https://developers.google.com/identity/protocols/oauth2/web-server|Google OAuth Documentation}
 */
