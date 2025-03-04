const express = require('express');
const authenticate = require('../middlewares/auth.middleware');
const {defaultRateLimiterMiddleware} = require('../middlewares/rateLimiter.middleware');
const authenticatedUserNotesRoutes = require('./note.routes');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const csrfRoutes = require('./csrf.routes');

const router = express.Router();

// routes
router.use('/auth', authRoutes);
router.use('/csrf-tokens', [defaultRateLimiterMiddleware, csrfRoutes]);
router.use('/users', [authenticate, defaultRateLimiterMiddleware, userRoutes]);
router.use('/notes', [authenticate, defaultRateLimiterMiddleware, authenticatedUserNotesRoutes]);

module.exports = router;