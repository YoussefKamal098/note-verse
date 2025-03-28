const {parseString, parseNumber} = require('shared-utils/env.utils');
const {timeUnit, time, timeFromNow} = require('shared-utils/date.utils');
const config = require('./config');
const {deepFreeze} = require("shared-utils/obj.utils");
require('dotenv').config();

const authConfig = {
    accessTokenSecret: parseString(process.env.ACCESS_TOKEN_SECRET, 'your-access-token-secret'),
    accessTokenExpiry: parseString(process.env.ACCESS_TOKEN_EXPIRY, '1h'), // one hour
    refreshTokenSecret: parseString(process.env.REFRESH_TOKEN_SECRET, 'your-refresh-token-secret'),
    refreshTokenExpiry: parseString(process.env.REFRESH_TOKEN_EXPIRY, '7d'), // one week
    cookiesName: parseString(process.env.REFRESH_TOKEN_COOKIE_NAME, 'refresh_token'),
    cookiesMaxAge: parseNumber(process.env.REFRESH_TOKEN_COOKIE_MAX_AGE, time({[timeUnit.DAY]: 7})),
    getCookieOptions() {
        const maxAge = time({[timeUnit.SECOND]: this.cookiesMaxAge}, timeUnit.MILLISECOND);
        const expires = timeFromNow({[timeUnit.SECOND]: this.cookiesMaxAge});

        return {
            httpOnly: true,
            sameSite: 'strict',
            secure: config.env === 'production',
            maxAge,
            expires,
        };
    },
    getClearCookieOptions() {
        return {
            httpOnly: true,
            sameSite: 'strict',
            secure: config.env === 'production',
        };
    },
};


/**
 * @type {AuthConfig}
 */
module.exports = deepFreeze(authConfig);
