const helmet = require('helmet');
const config = require('../config/config');
const {generateTokenAsync} = require('../utils/crypto.utils');
const {timeUnit, time} = require('shared-utils/date.utils');

const securityHeadersMiddleware = async (req, res, next) => {
    const isDevelopment = config.env === 'development';

    // Generate cryptographic nonce for CSP and wait for its resolution
    const nonce = await generateTokenAsync({size: 16, encoding: 'base64'});
    res.locals.cspNonce = nonce;

    // Security configuration with the generated nonce
    const helmetConfig = {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'none'"],
                scriptSrc: [
                    "'strict-dynamic'",
                    `'nonce-${nonce}'`,
                    ...(isDevelopment ? ["'unsafe-eval'"] : []),
                    "https://apis.google.com",
                    "https://accounts.google.com",
                    "https://www.google.com",
                ],
                styleSrc: [
                    "'self'",
                    `'nonce-${nonce}'`,
                    "https://fonts.googleapis.com",
                    ...(isDevelopment ? ["'unsafe-inline'"] : []),
                ],
                imgSrc: [
                    "'self'",
                    "data:",
                    "https://lh3.googleusercontent.com",
                ],
                connectSrc: [
                    "'self'",
                    "https://www.googleapis.com",
                    "https://oauth2.googleapis.com",
                    ...(isDevelopment ? ["ws://localhost:*"] : []),
                ],
                fontSrc: [
                    "'self'",
                    "https://fonts.gstatic.com",
                ],
                frameSrc: [
                    "https://accounts.google.com",
                ],
                formAction: [
                    "'self'",
                    "https://accounts.google.com",
                ],
                baseUri: ["'self'"],
                objectSrc: ["'none'"],
                reportUri: isDevelopment
                    ? '/csp-violation-report'
                    : 'https://your-domain.com/csp-violation-report'
            },
            reportOnly: isDevelopment,
        },
        hsts: {
            maxAge: time({[timeUnit.YEAR]: 2}),
            includeSubDomains: true,
            preload: !isDevelopment,
        },
        frameguard: {
            action: 'deny',
        },
        crossOriginEmbedderPolicy: {policy: "require-corp"},
        crossOriginOpenerPolicy: {policy: "same-origin"},
        crossOriginResourcePolicy: {policy: "same-site"},
        hidePoweredBy: true,
        ieNoOpen: true,
        noSniff: true,
        referrerPolicy: {policy: "strict-origin-when-cross-origin"},
        permittedCrossDomainPolicies: {permittedPolicies: "none"},
    };

    // Apply security headers using helmet and wait until its job is complete
    await new Promise((resolve, reject) => {
        helmet(helmetConfig)(req, res, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });

    // Force HTTPS in production: only continue if the request is secure
    if (!isDevelopment) {
        req.app.enable('trust proxy');
        if (req.secure) {
            res.setHeader(
                'Strict-Transport-Security',
                `max-age=${helmetConfig.hsts.maxAge}; includeSubDomains; preload`
            );
        } else {
            return res.redirect(`https://${req.headers.host}${req.url}`);
        }
    }

    // Continue to the next middleware after all tasks are complete
    next();
};

module.exports = securityHeadersMiddleware;
