const express = require('express');
const {makeClassInvoker} = require("awilix-express");
const container = require('../container');
const cacheKeys = require('../utils/cacheKeys');
const {createCacheMiddleware, clearCache} = require('../middlewares/cache.middleware');
const asyncRequestHandler = require('../utils/asyncHandler');
const resolveMeIdentifier = require('../middlewares/resolveMeIdentifier.middleware');
const {createUploadMiddleware} = require('../middlewares/fileUpload.middleware');
const getUserQuerySchema = require('../schemas/getUserQuery.schema');
const validateRequestMiddlewares = require('../middlewares/validateRequest.middleware');
const verifyAuthUserOwnershipMiddleware = require('../middlewares/verifyAuthUserOwnership.middleware');
const UserController = require('../controllers/user.controller');
const grantedPermissionsQuerySchema = require("../schemas/grantedPermissionsQuery.schema");

const router = express.Router();
const api = makeClassInvoker(UserController);

const uploadUserImageMiddleWare = createUploadMiddleware(
    container.resolve('fileStorageService'),
    {allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']}
);

const userCacheMiddleware = createCacheMiddleware({
    generateCacheKey: (req) => {
        const {id, email} = req.query;
        return id ? cacheKeys.userProfileById(id) : cacheKeys.userProfileByEmail(email);
    }
});

const clearUserCaches = async (req, res, next) => {
    res.on('finish', async () => {
        try {
            const userService = container.resolve('userService');
            const user = await userService.findById(req.params.userId);
            await Promise.all([
                clearCache(cacheKeys.userProfileById(user.id)),
                clearCache(cacheKeys.userProfileByEmail(user.email))
            ]);
        } catch (error) {
            console.error("Post-response cache clear failed", error);
        }
    });
    next();
};

router.get('/',
    asyncRequestHandler(validateRequestMiddlewares(getUserQuerySchema, {isQuery: true})),
    asyncRequestHandler(resolveMeIdentifier()),
    asyncRequestHandler(userCacheMiddleware),
    asyncRequestHandler(api('getUser'))
);

router.post('/:userId/avatar',
    asyncRequestHandler(verifyAuthUserOwnershipMiddleware()),
    asyncRequestHandler(uploadUserImageMiddleWare),
    asyncRequestHandler(clearUserCaches),
    asyncRequestHandler(api('uploadUserAvatar'))
);

router.get(
    '/:userId/granted-permissions',
    validateRequestMiddlewares(grantedPermissionsQuerySchema, {isQuery: true}),
    asyncRequestHandler(api('getPermissionsGrantedByUser'))
);

module.exports = router;
