const express = require('express');
const authenticate = require('../middlewares/auth.middleware');
const {generalRateLimiterMiddleware} = require('../middlewares/rateLimiter.middleware');
const authenticatedUserNotesRoutes = require('./note.routes');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');

const router = express.Router();

// routes
router.use('/auth', authRoutes);
router.use('/users', [authenticate, generalRateLimiterMiddleware, userRoutes]);
router.use('/notes', [authenticate, generalRateLimiterMiddleware, authenticatedUserNotesRoutes]);

module.exports = router;