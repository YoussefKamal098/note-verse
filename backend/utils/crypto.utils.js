const crypto = require('crypto');

/**
 * Generates a secure random token.
 *
 * @param {Object} [options={}] - Options for token generation.
 * @param {number} [options.size=16] - The number of random bytes to generate.
 * @param {string} [options.encoding='hex'] - The encoding of the token ('hex', 'base64', etc.).
 * @returns {string} The generated token.
 */
function generateToken(options = {}) {
    const {size = 16, encoding = 'hex'} = options;
    return crypto.randomBytes(size).toString(encoding);
}

/**
 * Asynchronously generates a secure random token.
 *
 * @param {Object} [options={}] - Options for token generation.
 * @param {number} [options.size=16] - The number of random bytes to generate.
 * @param {string} [options.encoding='hex'] - The encoding of the token ('hex', 'base64', etc.).
 * @returns {Promise<string>} A promise that resolves with the generated token.
 */
function generateTokenAsync(options = {}) {
    const {size = 16, encoding = 'hex'} = options;
    return new Promise((resolve, reject) => {
        crypto.randomBytes(size, (err, buffer) => {
            if (err) return reject(err);
            resolve(buffer.toString(encoding));
        });
    });
}

module.exports = {
    generateToken,
    generateTokenAsync,
};
