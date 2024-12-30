const { RateLimiterService, BlockerService } = require("../services/rateLimiter.service");
const cacheService = require("../services/cache.service");

const rateLimiterMiddleware = (rateLimiterService) => {
    return async (req, res, next) => {
        try {
            const userId = req.user ? req.user.id: "";
            await rateLimiterService.limitOrThrow(req.ip, req.get('User-Agent'), userId,req.originalUrl);
            next();
        } catch (error) {
            next(error);
        }
    };
};

const generalRateLimiterMiddleware = rateLimiterMiddleware(new RateLimiterService(cacheService, new BlockerService(cacheService)));
module.exports = {rateLimiterMiddleware, generalRateLimiterMiddleware};
