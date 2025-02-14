const {parseString, parseNumber} = require('shared-utils/env.utils');
const {timeUnit, time, timeFromNow} = require('shared-utils/date.utils');
const config = require('./config');
require('dotenv').config();

const authConfig = Object.freeze({
    accessTokenSecret: parseString(process.env.ACCESS_TOKEN_SECRET, 'your-access-token-secret'),
    accessTokenExpiry: parseString(process.env.ACCESS_TOKEN_EXPIRY, '1h'),
    refreshTokenSecret: parseString(process.env.REFRESH_TOKEN_SECRET, 'your-refresh-token-secret'),
    refreshTokenExpiry: parseString(process.env.REFRESH_TOKEN_EXPIRY, '7d'),
    cookiesName: parseString(process.env.REFRESH_TOKEN_COOKIES_NAME, 'jwt'),
    cookiesMaxAge: parseNumber(process.env.COOKIES_MAX_AGE, time({[timeUnit.DAY]: 7}, timeUnit.SECOND)),
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
});

module.exports = authConfig;
