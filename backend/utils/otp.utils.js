/**
 * Gets common OTP generation parameters and validates input
 * @private
 * @param {Object} options - Configuration options
 * @returns {{length: number, chars: string}} Prepared OTP parameters
 */
function getOTPParameters(options) {
    const {
        length = 6,
        charType = 'digits',
        caseSensitive = false
    } = options;

    // Validate input
    if (!Number.isInteger(length) || length <= 0) {
        throw new Error('Length must be a positive integer');
    }

    // Character sets
    const digits = '0123456789';
    const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
    const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    let chars = '';
    switch (charType) {
        case 'digits':
            chars = digits;
            break;
        case 'alpha':
            chars = caseSensitive ? lowerCase + upperCase : lowerCase;
            break;
        case 'alphanumeric':
            chars = digits + (caseSensitive ? lowerCase + upperCase : lowerCase);
            break;
        default:
            throw new Error('Invalid character type specified. Use "digits", "alpha", or "alphanumeric"');
    }

    return {length, chars};
}

/**
 * Generates a One-Time Password (OTP) with customizable options
 * @param {Object} [options] - Configuration options
 * @returns {string} Generated OTP
 */
function generateOTP(options = {}) {
    const {length, chars} = getOTPParameters(options);

    let otp = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        otp += chars[randomIndex];
    }
    return otp;
}

/**
 * Generates a cryptographically secure OTP using Web Crypto API
 * @param {Object} [options] - Configuration options
 * @returns {string} Generated secure OTP
 */
function generateSecureOTP(options = {}) {
    const {length, chars} = getOTPParameters(options);

    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);

    return Array.from(randomValues)
        .map(value => chars[value % chars.length])
        .join('');
}

module.exports = {
    generateOTP,
    generateSecureOTP
};