const express = require('express');
const userController = require('../controllers/user.controller');
const cacheKeys = require('../utils/cacheKeys');
const {createCacheMiddleware} = require('../middlewares/cache.middleware');
const asyncRequestHandler = require('../utils/asyncHandler');
const verifyAuthUserOwnershipMiddleware = require('../middlewares/verifyAuthUserOwnership.middleware');

const router = express.Router();

router.get('/:userId',
    asyncRequestHandler(verifyAuthUserOwnershipMiddleware),
    asyncRequestHandler(createCacheMiddleware({generateCacheKey: cacheKeys.getUserCacheKey})),
    asyncRequestHandler(userController.getUser.bind(userController))
);

module.exports = router;
