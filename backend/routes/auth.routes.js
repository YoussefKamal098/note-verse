const express = require('express');
const {timeUnit, time} = require('shared-utils/date.utils');
const {createRateLimiterMiddleware, defaultRateLimiterMiddleware} = require("../middlewares/rateLimiter.middleware");
const asyncRequestHandler = require('../utils/asyncHandler');
const CsrfMiddleware = require('../middlewares/csrf.middleware');
const validateRequestMiddlewares = require('../middlewares/validateRequest.middleware');
const userCreationSchema = require('../schemas/userCreation.schema');
const {makeClassInvoker} = require("awilix-express");
const AuthController = require("../controllers/auth.controller");

const router = express.Router();
const api = makeClassInvoker(AuthController);

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
const googleAuthLimiter = createRateLimiterMiddleware({
    maxRequests: 5,
    windowMs: time({[timeUnit.MINUTE]: 1})
});

const googleCallbackLimiter = createRateLimiterMiddleware({
    maxRequests: 10,
    windowMs: time({[timeUnit.MINUTE]: 1})
});


// Routes with rate-limiting and CSRF validation middleware applied.
router.post('/register', registerLimiterMiddleware, validateRequestMiddlewares(userCreationSchema), csrf.validate(), asyncRequestHandler(api('register')));
router.post('/verify_email', verifyLimiterMiddleware, csrf.validate(), asyncRequestHandler(api('verifyEmail')));
router.post('/login', loginLimiterMiddleware, csrf.validate(), asyncRequestHandler(api('login')));
router.post('/logout', defaultRateLimiterMiddleware, csrf.validate(), asyncRequestHandler(api('logout')));
router.post('/refresh', defaultRateLimiterMiddleware, csrf.validate(), asyncRequestHandler(api('refreshToken')));

// Google OAuth 2.0 routes
router.post('/google', googleAuthLimiter, csrf.validate(), asyncRequestHandler(api('initiateGoogleAuth')));
router.post('/google/callback', googleCallbackLimiter, csrf.validate(), asyncRequestHandler(api('handleGoogleCallback')));

module.exports = router;
