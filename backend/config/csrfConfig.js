const {parseString} = require('shared-utils/env.utils');
const httpHeaders = require('../constants/httpHeaders');
const config = require('./config');
const {deepFreeze} = require('shared-utils/obj.utils');
require('dotenv').config();

const csrfConfig = {
    secret: parseString(process.env.CSRF_TOKEN_SECRET, "CSRF_TOKEN_SECRET"),
    cookieName: parseString(process.env.CSRF_TOKEN_COOKIES_NAME, "csrf-token"),
    cookieOptions: {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'strict',
        path: '/',
    },
    saltLength: 64, // Length of the salt used in token generation, measured in bytes
    ignoredMethods: ["GET", "HEAD", "OPTIONS"], // HTTP methods to ignore
    getTokenFromRequest: (req) => req.headers[httpHeaders.X_CSRF_TOKEN] // Token extraction
};

/**
 * @type {CsrfConfig}
 */
module.exports = deepFreeze(csrfConfig);
