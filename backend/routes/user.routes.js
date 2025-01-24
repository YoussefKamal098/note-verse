const express = require('express');
const userController = require('../controllers/user.controller');
const cacheKeys = require('../utils/cacheKeys');
const {createCacheMiddleware} = require('../middlewares/cache.middleware');
const asyncRequestHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/me',
    asyncRequestHandler(createCacheMiddleware({generateCacheKey: cacheKeys.getMeCacheKey})),
    asyncRequestHandler(userController.getMe.bind(userController))
);

module.exports = router;
