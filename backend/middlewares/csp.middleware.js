const helmet = require('helmet');

const cspMiddleware = (req, res, next) => {
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"], // Only allow content from the same origin
            scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts for backwards compatibility
            styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for backwards compatibility
            imgSrc: ["'self'", "data:", "https://trusted-image-source.com"], // Allow images from trusted sources
            connectSrc: ["'self'", "https://trusted-api-source.com"], // Allow API requests to trusted servers
            fontSrc: ["'self'", "https://fonts.gstatic.com"], // Allow fonts from Google's font CDN
            objectSrc: ["'none'"], // Disable Flash and other objects
            frameSrc: ["'none'"], // Disable embedding in iframes
            baseUri: ["'self'"], // Only allow base URI from the same origin
            formAction: ["'self'"], // Only allow form submissions to the same origin
            upgradeInsecureRequests: [], // Automatically upgrade HTTP requests to HTTPS
        },
    })(req, res, next);
};

module.exports = cspMiddleware;
