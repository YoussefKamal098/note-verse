const statusMessages = require('../constants/statusMessages');
const jwt = require('jsonwebtoken');

class JwtProviderService {
    /**
     * Generates a JWT token with the given payload, secret, and expiry.
     *
     * @param {object} payload - The payload to include in the token.
     * @param {string} secret - The secret key used for signing the token.
     * @param {string} expiry - The expiration time (e.g., "1h", "1d" ...).
     * @returns {Promise<string>} The generated JWT token.
     * @throws {AppError} If token generation fails.
     */
    async generateToken(payload, secret, expiry) {
        return new Promise((resolve, reject) => {
            jwt.sign(payload, secret, {expiresIn: expiry}, (err, token) => {
                if (err || !token) {
                    return reject(new Error(`Token generation failed: ${err}`));
                }
                resolve(token);
            });
        });
    }

    /**
     * Verifies a JWT token using the given secret.
     *
     * @param {string} token - The JWT token.
     * @param {string} secret - The secret key.
     * @returns {Promise<object>} The decoded token payload.
     * @throws {AppError} If token verification fails.
     */
    async verifyToken(token, secret) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, secret, (err, decoded) => {
                if (err) {
                    return reject(new Error(`Token verification failed: ${err}`));
                }
                resolve(decoded);
            });
        });
    }

    /**
     * Detects if an error occurred during token verification and whether the error is due to expiration.
     *
     * @param {string} token - The JWT token.
     * @param {string} secret - The secret key.
     * @returns {Promise<{ expired: boolean, error: Error|null }>}
     * An object containing:
     *   - expired: true if the token is expired, false otherwise.
     *   - error: the error object if an error occurred, or null.
     */
    async detectTokenError(token, secret) {
        return new Promise((resolve) => {
            jwt.verify(token, secret, (err) => {
                if (err) {
                    if (err.name === 'TokenExpiredError') {
                        return resolve({expired: true, error: err});
                    }
                    return resolve({expired: false, error: err});
                }
                return resolve({expired: false, error: null});
            });
        });
    }

    /**
     * Decodes an expired token without verifying its signature.
     * If the token is not expired, it throws an error.
     *
     * @param {string} token - The JWT token.
     * @param {string} secret - The secret key used for verification.
     * @returns {Promise<object>} The decoded token payload.
     * @throws {AppError} If the token is not expired.
     */
    async decodeExpiredToken(token, secret) {
        const {expired} = await this.detectTokenError(token, secret);
        if (expired) {
            // jwt.decode returns the payload without verifying the signature.
            return jwt.decode(token);
        }
        throw new Error(statusMessages.INVALID_TOKEN);
    }
}

module.exports = JwtProviderService;
