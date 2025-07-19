const express = require('express');
const {makeClassInvoker} = require("awilix-express");
const container = require('../container');
const cacheKeys = require('../utils/cacheKeys');
const {createCacheMiddleware, clearCache} = require('../middlewares/cache.middleware');
const asyncRequestHandler = require('../utils/asyncHandler');
const resolveMeIdentifier = require('../middlewares/resolveMeIdentifier.middleware');
const {createUploadMiddleware} = require('../middlewares/fileUpload.middleware');
const getUserQuerySchema = require('../schemas/getUserQuery.schema');
const updatePermissionSchema = require('../schemas/updatePermission.schema');
const updateUserProfileSchema = require('../schemas/updateUserProfile.schema');
const userCommitsQuerySchema = require('../schemas/userCommitsQuery.schema');
const idSchema = require('../schemas/idObject.schema');
const validateRequestMiddlewares = require('../middlewares/validateRequest.middleware');
const verifyAuthUserOwnershipMiddleware = require('../middlewares/verifyAuthUserOwnership.middleware');
const {
    validateNoteOwnership,
    validateNoteViewPermission
} = require("../middlewares/note.permissionValidation.middleware");
const UserController = require('../controllers/user.controller');
const grantedPermissionsQuerySchema = require("../schemas/grantedPermissionsQuery.schema");

const router = express.Router();
const validateNoteOwnershipMiddleware = container.build(validateNoteOwnership)({
    noteIdName: 'noteId',
    locations: ['query']
});
const validateNoteViewPermissionMiddleware = container.build(validateNoteViewPermission)({
    noteIdField: 'noteId',
    noteIdLocation: 'query'
});
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
            if (req.updatedUser) {
                await Promise.all([
                    clearCache(cacheKeys.userProfileById(req.updatedUser.id)),
                    clearCache(cacheKeys.userProfileByEmail(req.updatedUser.email))
                ]);
            }
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

router.patch('/:userId/avatar',
    asyncRequestHandler(verifyAuthUserOwnershipMiddleware()),
    asyncRequestHandler(uploadUserImageMiddleWare),
    asyncRequestHandler(resolveMeIdentifier({fields: ["userId"]})),
    asyncRequestHandler(clearUserCaches),
    asyncRequestHandler(api('uploadUserAvatar'))
);

router.delete('/:userId/avatar',
    asyncRequestHandler(verifyAuthUserOwnershipMiddleware()),
    asyncRequestHandler(resolveMeIdentifier({fields: ["userId"]})),
    asyncRequestHandler(clearUserCaches),
    asyncRequestHandler(api('removeUserAvatar'))
);

// Update user profile (firstname/lastname)
router.patch('/:userId/profile',
    asyncRequestHandler(verifyAuthUserOwnershipMiddleware()),
    asyncRequestHandler(validateRequestMiddlewares(updateUserProfileSchema)),
    asyncRequestHandler(resolveMeIdentifier({fields: ["userId"]})),
    asyncRequestHandler(clearUserCaches),
    asyncRequestHandler(api('updateUserProfile'))
);

router.delete(
    '/:userId/permissions',
    validateRequestMiddlewares(idSchema({fieldName: "noteId"}), {isQuery: true}),
    asyncRequestHandler(validateNoteOwnershipMiddleware),
    asyncRequestHandler(api('revokePermission'))
);

router.patch(
    '/:userId/permissions',
    validateRequestMiddlewares(updatePermissionSchema),
    asyncRequestHandler(validateNoteOwnershipMiddleware),
    asyncRequestHandler(api('updatePermission'))
);

router.get(
    '/:userId/permissions',
    validateRequestMiddlewares(idSchema({fieldName: "noteId"}), {isQuery: true}),
    asyncRequestHandler(verifyAuthUserOwnershipMiddleware()),
    asyncRequestHandler(api('getUserPermission'))
);

router.get(
    '/:userId/granted-permissions',
    validateRequestMiddlewares(grantedPermissionsQuerySchema, {isQuery: true}),
    asyncRequestHandler(verifyAuthUserOwnershipMiddleware()),
    asyncRequestHandler(api('getPermissionsGrantedByUser'))
);

router.get(
    '/:userId/commits',
    asyncRequestHandler(validateRequestMiddlewares(userCommitsQuerySchema, {isQuery: true})),
    asyncRequestHandler(validateNoteViewPermissionMiddleware),
    asyncRequestHandler(api('getUserCommits'))
);

module.exports = router;
