const {parseString, parseNumber} = require('shared-utils/env.utils');
const {time, timeUnit, timeFromNow} = require("shared-utils/date.utils");
const config = require("./config");
require('dotenv').config();

const googleAuthConfig = Object.freeze({
    clientId: parseString(process.env.GOOGLE_CLIENT_ID),
    clientSecret: parseString(process.env.GOOGLE_CLIENT_SECRET),
    redirectUri: parseString(process.env.GOOGLE_REDIRECT_URI),
    stateTokenSecret: parseString(process.env.STATE_TOKEN_SECRET, 'STATE_TOKEN_SECRET'),
    stateTokenExpiry: parseString(process.env.STATE_TOKEN_EXPIRY, '5m'),
    cookiesName: parseString(process.env.STATE_TOKEN_COOKIE_NAME, 'oauth_state'),
    cookiesMaxAge: parseNumber(process.env.STATE_TOKEN_COOKIE_MAX_AGE, time({[timeUnit.MINUTE]: 5})),
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

/**
 * @type {GoogleAuthConfig}
 */
module.exports = googleAuthConfig;
