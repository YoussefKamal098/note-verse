const express = require('express');
const userController = require('../controllers/user.controller');
const cacheKeys = require('../utils/cacheKeys');
const {createCacheMiddleware, clearCache} = require('../middlewares/cache.middleware');
const asyncRequestHandler = require('../utils/asyncHandler');
const {createUploadMiddleware} = require('../middlewares/fileUpload.middleware');
const verifyAuthUserOwnershipMiddleware = require('../middlewares/verifyAuthUserOwnership.middleware');
const storageService = require('../services/fileStorage.service');

const router = express.Router();

// Middleware to clear caches for a user.
async function clearUserCaches(req, res, next) {
    await clearCache(cacheKeys.getUserCacheKey(req));
    next();
}

router.get('/:userId',
    asyncRequestHandler(verifyAuthUserOwnershipMiddleware),
    asyncRequestHandler(createCacheMiddleware({generateCacheKey: cacheKeys.getUserCacheKey})),
    asyncRequestHandler(userController.getUser.bind(userController))
);

router.post('/:userId/avatar',
    asyncRequestHandler(verifyAuthUserOwnershipMiddleware),
    createUploadMiddleware(storageService, {
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
    }),
    asyncRequestHandler(clearUserCaches),
    asyncRequestHandler(userController.uploadUserAvatar.bind(userController))
);

module.exports = router;
