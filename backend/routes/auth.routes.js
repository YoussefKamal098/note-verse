const express = require('express');
const {timeUnit, time} = require('shared-utils/date.utils');
const authController = require('../controllers/auth.controller');
const {createRateLimiterMiddleware, defaultRateLimiterMiddleware} = require("../middlewares/rateLimiter.middleware");
const asyncRequestHandler = require('../utils/asyncHandler');

const router = express.Router();

// Configure RateLimiterServices with specific maxRequests for each route
const loginLimiterMiddleware = createRateLimiterMiddleware({
    maxRequests: 5,
    windowMs: time({[timeUnit.MINUTE]: 1})
});
const registerLimiterMiddleware = createRateLimiterMiddleware({
    maxRequests: 10,
    windowMs: time({[timeUnit.MINUTE]: 1})
});

// Routes with appropriate rate-limiting applied
router.post('/register', registerLimiterMiddleware, asyncRequestHandler(authController.register.bind(authController)));
router.post('/login', loginLimiterMiddleware, asyncRequestHandler(authController.login.bind(authController)));
router.post('/logout', defaultRateLimiterMiddleware, asyncRequestHandler(authController.logout.bind(authController)));
router.post('/refresh', defaultRateLimiterMiddleware, asyncRequestHandler(authController.refreshToken.bind(authController)));

module.exports = router;
