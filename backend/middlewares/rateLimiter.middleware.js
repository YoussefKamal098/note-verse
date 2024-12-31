const { RateLimiterService, BlockerService } = require("../services/rateLimiter.service");
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

const generalRateLimiterMiddleware = rateLimiterMiddleware(new RateLimiterService(cacheService, new BlockerService(cacheService)));
module.exports = {rateLimiterMiddleware, generalRateLimiterMiddleware};
