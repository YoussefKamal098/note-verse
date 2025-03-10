const {parseString, parseNumber} = require('shared-utils/env.utils');
const {deepFreeze} = require('shared-utils/obj.utils');
const {time, timeUnit, timeFromNow} = require("shared-utils/date.utils");
const httpHeaders = require('../constants/httpHeaders');
const config = require('./config');
require('dotenv').config();


/**
 * Extracts the CSRF token from the request based on the provided source.
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {string} source - The source from which to extract the token ('body', 'header', or 'query').
 * @param {string} tokenName - The token field name.
 * @returns {string|undefined} The extracted token, or undefined if not found.
 */
function extractTokenFromRequest(req, source, tokenName) {
    switch (source) {
        case 'body':
            return req.body[tokenName];
        case 'query':
            return req.query[tokenName];
        case 'header':
            return req.headers[httpHeaders.X_CSRF_TOKEN];
        default:
            throw new Error(`Invalid token source provided: ${source}`);
    }
}

const csrfConfig = {
    secret: parseString(process.env.CSRF_TOKEN_SECRET, "CSRF_TOKEN_SECRET"),
    cookieName: parseString(process.env.CSRF_TOKEN_COOKIE_NAME, "csrf-token"),
    cookiesMaxAge: parseNumber(process.env.CSRF_TOKEN_COOKIE_MAX_AGE, time({[timeUnit.MINUTE]: 60})),
    tokenName: "csrf-token",
    defaultSource: "header",
    /**
     * Returns the options for the CSRF cookie.
     *
     * @returns {Object} cookieOptions - Options for the CSRF cookie.
     * @property {boolean} cookieOptions.httpOnly - Indicates that the cookie is HTTP-only and cannot be accessed via client-side scripts.
     * @property {boolean} cookieOptions.secure - Secure cookie flag, ensuring the cookie is transmitted only over HTTPS.
     * @property {string} cookieOptions.sameSite - SameSite attribute that restricts the cookie from being sent with cross-site requests.
     * @property {number} cookieOptions.maxAge - The maximum age (in milliseconds) for which the cookie is valid.
     * @property {Date} cookieOptions.expires - The exact date and time (in GMT or UTC format) when the cookie expires.
     * @property {string} cookieOptions.path - The path for which the cookie is valid.
     */
    getCookieOptions() {
        const maxAge = time({[timeUnit.SECOND]: this.cookiesMaxAge}, timeUnit.MILLISECOND);
        const expires = timeFromNow({[timeUnit.SECOND]: this.cookiesMaxAge});

        return {
            httpOnly: true,
            secure: config.env === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge,
            expires
        }
    },
    clearCookieOptions: {
        httpOnly: true,
        sameSite: 'strict',
        secure: config.env === 'production',
    },
    saltLength: 64, // Length of the salt used in token generation, measured in bytes
    ignoredMethods: ["GET", "HEAD", "OPTIONS"], // HTTP methods to ignore
    /**
     * Extracts the CSRF token from the request based on the provided source.
     * Uses the tokenName property from this config object.
     *
     * @param {import('express').Request} req - The Express request object.
     * @param {string} source - The source to extract the token from ('body', 'header', 'query').
     * @returns {string|undefined} The extracted CSRF token.
     */
    getTokenFromRequest(req, source) {
        return extractTokenFromRequest(req, source, this.tokenName);
    }
};

/**
 * @type {CsrfConfig}
 */
module.exports = deepFreeze(csrfConfig);
