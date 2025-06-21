const RateLimiterService = require("../services/rateLimiter.service");
const container = require("../container");

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
        new RateLimiterService(container.resolve('cacheService'), options)
    );
}

const defaultRateLimiterMiddleware = createRateLimiterMiddleware();
module.exports = {createRateLimiterMiddleware, defaultRateLimiterMiddleware};
