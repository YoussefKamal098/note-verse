const express = require('express');
const {makeClassInvoker} = require('awilix-express');
const NotesController = require('../controllers/note.controller');
const asyncRequestHandler = require('../utils/asyncHandler');
const cacheKeys = require('../utils/cacheKeys');
const {createCacheMiddleware, clearCache, clearCachePattern} = require('../middlewares/cache.middleware');
const validateRequestMiddlewares = require('../middlewares/validateRequest.middleware');
const noteCreationSchema = require("../schemas/noteCreation.schema");
const notesQuerySchema = require("../schemas/notesQuery.schema");
const grantPermissionsSchema = require('../schemas/grantPermissions.schema');
const updatePermissionSchema = require('../schemas/updatePermission.schema');
const grantedPermissionsQuerySchema = require('../schemas/grantedPermissionsQuery.schema');
const container = require('../container');
const {
    validateNoteUpdatePermission,
    validateNoteViewPermission,
    validateNoteOwnership
} = require('../middlewares/note.permissionValidation.middleware');

const router = express.Router({mergeParams: true});
const validateNoteUpdatePermissionMiddleware = container.build(validateNoteUpdatePermission);
const validateNoteViewPermissionMiddleware = container.build(validateNoteViewPermission);
const validateNoteOwnershipMiddleware = container.build(validateNoteOwnership);
const api = makeClassInvoker(NotesController);

// Middleware to clear caches for a single note and the user’s notes list
const clearNotesCaches = async (req, res, next) => {
    await clearCache(cacheKeys.getNoteCacheKey(req));
    await clearCachePattern(cacheKeys.getUserNotesCachePattern(req));
    next();
}

// Caching middleware for GET routes
const notesCacheMiddleware = createCacheMiddleware({
    generateCacheKey: cacheKeys.getUserNotesCacheKey
});

const noteCacheMiddleware = createCacheMiddleware({
    generateCacheKey: cacheKeys.getNoteCacheKey
});

// Create a new note
router.post(
    '/',
    asyncRequestHandler(validateRequestMiddlewares(noteCreationSchema)),
    asyncRequestHandler(clearCachePattern.bind(null, cacheKeys.getUserNotesCachePattern)),
    asyncRequestHandler(api('create'))
);

// Get paginated notes for a user
router.get(
    '/',
    asyncRequestHandler(validateRequestMiddlewares(notesQuerySchema, {isQuery: true})),
    asyncRequestHandler(notesCacheMiddleware),
    asyncRequestHandler(api('findPaginatedUserNotes'))
);

// Get a single note by ID
router.get(
    '/:noteId',
    asyncRequestHandler(validateNoteViewPermissionMiddleware),
    asyncRequestHandler(noteCacheMiddleware),
    asyncRequestHandler(api('findNoteById'))
);

// Update a note by ID
router.put(
    '/:noteId',
    asyncRequestHandler(validateNoteUpdatePermissionMiddleware),
    asyncRequestHandler(clearNotesCaches),
    asyncRequestHandler(api('updateNoteById'))
);

// Delete a note by ID
router.delete(
    '/:noteId',
    asyncRequestHandler(validateNoteOwnershipMiddleware),
    asyncRequestHandler(clearNotesCaches),
    asyncRequestHandler(api('deleteNoteById'))
);

router.post(
    '/:noteId/permissions',
    asyncRequestHandler(validateNoteOwnershipMiddleware),
    validateRequestMiddlewares(grantPermissionsSchema),
    asyncRequestHandler(api('grantPermissions'))
);

router.delete(
    '/:noteId/permissions/:userId',
    asyncRequestHandler(validateNoteOwnershipMiddleware),
    asyncRequestHandler(api('revokePermission'))
);

router.patch(
    '/:noteId/permissions/:userId',
    asyncRequestHandler(validateNoteOwnershipMiddleware),
    validateRequestMiddlewares(updatePermissionSchema),
    asyncRequestHandler(api('updatePermission'))
);

router.get(
    '/:noteId/permissions/:userId',
    asyncRequestHandler(api('getUserPermission'))
);

router.get(
    '/:noteId/permissions',
    validateRequestMiddlewares(grantedPermissionsQuerySchema, {isQuery: true}),
    asyncRequestHandler(api('getNotePermissions'))
);

module.exports = router;
