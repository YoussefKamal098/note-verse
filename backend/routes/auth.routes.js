const express = require('express');
const {timeUnit, time} = require('../utils/date.utils');
const cacheService = require("../services/cache.service");
const authController = require('../controllers/auth.controller');
const {rateLimiterMiddleware, generalRateLimiterMiddleware} = require("../middlewares/rateLimiter.middleware");
const {RateLimiterService, BlockerService} = require("../services/rateLimiter.service");

const router = express.Router();

// Create a single BlockerService instance to be shared
const blockerService = new BlockerService(cacheService);

// Configure RateLimiterServices with specific maxRequests for each route
const loginLimiter = rateLimiterMiddleware(new RateLimiterService(cacheService, blockerService, {
    maxRequests: 5,
    windowMs: time({[timeUnit.MINUTE]: 1}, timeUnit.SECOND)
}));
const registerLimiter = rateLimiterMiddleware(new RateLimiterService(cacheService, blockerService, {
    maxRequests: 10,
    windowMs: time({[timeUnit.MINUTE]: 1}, timeUnit.SECOND)
}));

// Routes with appropriate rate-limiting applied
router.post('/register', registerLimiter, authController.register.bind(authController));
router.post('/login', loginLimiter, authController.login.bind(authController));
router.post('/logout', generalRateLimiterMiddleware, authController.logout.bind(authController));
router.post('/refresh', generalRateLimiterMiddleware, authController.refreshToken.bind(authController));

module.exports = router;
