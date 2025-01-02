const helmet = require('helmet');

const cspMiddleware = (req, res, next) => {
    // Apply Content Security Policy (CSP)
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"], // Only allow content from the same origin
            scriptSrc: ["'self'"], // Remove 'unsafe-inline' to block inline scripts (use external scripts instead)
            styleSrc: ["'self'"], // Remove 'unsafe-inline' to block inline styles (use external styles instead)
            imgSrc: ["'self'", "data:", "https://trusted-image-source.com"], // Allow images from trusted sources
            connectSrc: ["'self'", "https://trusted-api-source.com"], // Allow API requests to trusted servers
            fontSrc: ["'self'", "https://fonts.gstatic.com"], // Allow fonts from Google's font CDN
            objectSrc: ["'none'"], // Disable Flash and other objects
            frameSrc: ["'none'"], // Disable embedding in iframes
            baseUri: ["'self'"], // Only allow base URI from the same origin
            formAction: ["'self'"], // Only allow form submissions to the same origin
            upgradeInsecureRequests: [], // Automatically upgrade HTTP requests to HTTPS
        },
    })(req, res, () => {
        // Apply XSS protection after CSP middleware
        helmet.xssFilter()(req, res, () => {
            // Set the X-XSS-Protection header for additional protection
            res.setHeader('X-XSS-Protection', '1; mode=block');
            next(); // Proceed to the next middleware
        });
    });
};

module.exports = cspMiddleware;
