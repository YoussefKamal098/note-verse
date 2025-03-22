const express = require('express');
const authenticate = require('../middlewares/auth.middleware');
const {defaultRateLimiterMiddleware} = require('../middlewares/rateLimiter.middleware');
const noteRoutes = require('./note.routes');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const csrfRoutes = require('./csrf.routes');
const fileRoutes = require('./file.routes');

const router = express.Router();

// routes
router.use('/auth', authRoutes);
router.use('/csrf-tokens', [defaultRateLimiterMiddleware, csrfRoutes]);
router.use('/files', [defaultRateLimiterMiddleware, fileRoutes]);
router.use('/users/:userId/notes', [authenticate, defaultRateLimiterMiddleware, noteRoutes]);
router.use('/users', [authenticate, defaultRateLimiterMiddleware, userRoutes]);

module.exports = router;
