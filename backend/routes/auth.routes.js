const express = require('express');
const {timeUnit, time} = require('shared-utils/date.utils');
const authController = require('../controllers/auth.controller');
const {createRateLimiterMiddleware, defaultRateLimiterMiddleware} = require("../middlewares/rateLimiter.middleware");
const asyncRequestHandler = require('../utils/asyncHandler');
const CsrfMiddleware = require('../middlewares/csrf.middleware');

const router = express.Router();

// Create a CSRF middleware instance.
const csrf = CsrfMiddleware.create();

// Configure rate limiter middleware for each route.
const loginLimiterMiddleware = createRateLimiterMiddleware({
    maxRequests: 5,
    windowMs: time({[timeUnit.MINUTE]: 1})
});
const registerLimiterMiddleware = createRateLimiterMiddleware({
    maxRequests: 10,
    windowMs: time({[timeUnit.MINUTE]: 1})
});
const verifyLimiterMiddleware = createRateLimiterMiddleware({
    maxRequests: 10,
    windowMs: time({[timeUnit.MINUTE]: 1})
});

// Routes with rate-limiting and CSRF validation middleware applied.
router.post('/register', registerLimiterMiddleware, csrf.validate(), asyncRequestHandler(authController.register.bind(authController)));
router.post('/verify_email', verifyLimiterMiddleware, csrf.validate(), asyncRequestHandler(authController.verifyEmail.bind(authController)));
router.post('/login', loginLimiterMiddleware, csrf.validate(), asyncRequestHandler(authController.login.bind(authController)));
router.post('/logout', defaultRateLimiterMiddleware, csrf.validate(), asyncRequestHandler(authController.logout.bind(authController)));
router.post('/refresh', defaultRateLimiterMiddleware, csrf.validate(), asyncRequestHandler(authController.refreshToken.bind(authController)));

module.exports = router;
