const RateLimiterService = require("../services/rateLimiter.service");
const cacheService = require("../services/cache.service");

const rateLimiterMiddleware = (rateLimiterService) => {
    return async (req, res, next) => {
        try {
            await rateLimiterService.limitOrThrow(req);
            next();
        } catch (error) {
            next(error);
        }
    };
};

const createRateLimiterMiddleware = (options = {}) => {
    return rateLimiterMiddleware(
        new RateLimiterService(
            cacheService,
            options
        )
    );
}

const defaultRateLimiterMiddleware = createRateLimiterMiddleware();
module.exports = {createRateLimiterMiddleware, defaultRateLimiterMiddleware};
