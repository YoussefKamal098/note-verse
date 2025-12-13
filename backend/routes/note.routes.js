const express = require('express');
const {makeClassInvoker} = require('awilix-express');
const NotesController = require('../controllers/note.controller');
const asyncRequestHandler = require('../utils/asyncHandler');
const cacheKeys = require('../utils/cacheKeys');
const {createCacheMiddleware, clearCache, clearCachePattern} = require('../middlewares/cache.middleware');
const validateRequestMiddlewares = require('../middlewares/validateRequest.middleware');
const paginationQuerySchema = require("../schemas/paginationQuery.schema");
const noteCreationSchema = require("../schemas/noteCreation.schema");
const notesQuerySchema = require("../schemas/notesQuery.schema");
const grantPermissionsSchema = require('../schemas/grantPermissions.schema');
const grantedPermissionsQuerySchema = require('../schemas/grantedPermissionsQuery.schema');
const reactionTypeSchema = require('../schemas/reactionType.schema');
const container = require('../container');
const {
    validateNoteViewPermission,
    validateNoteOwnership
} = require('../middlewares/note.permissionValidation.middleware');

const router = express.Router({mergeParams: true});
const validateNoteViewPermissionMiddleware = container.build(validateNoteViewPermission)();
const validateNoteOwnershipMiddleware = container.build(validateNoteOwnership)({
    noteIdName: 'noteId',
    locations: ['params']
});
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
    asyncRequestHandler(clearNotesCaches),
    asyncRequestHandler(api('create'))
);

// Get paginated notes for an authenticated user
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
router.patch(
    '/:noteId',
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

router.get(
    '/:noteId/permissions',
    asyncRequestHandler(validateNoteOwnershipMiddleware),
    validateRequestMiddlewares(grantedPermissionsQuerySchema, {isQuery: true}),
    asyncRequestHandler(api('getNotePermissions'))
);

// Get commit history for a note
router.get(
    '/:noteId/history',
    asyncRequestHandler(validateNoteViewPermissionMiddleware),
    asyncRequestHandler(validateRequestMiddlewares(paginationQuerySchema, {isQuery: true})),
    asyncRequestHandler(api('getCommitHistory'))
);

// Get contributors for a note
router.get(
    '/:noteId/contributors',
    asyncRequestHandler(validateNoteViewPermissionMiddleware),
    asyncRequestHandler(validateRequestMiddlewares(paginationQuerySchema, {isQuery: true})),
    asyncRequestHandler(api('getContributors'))
);

router.post(
    '/:noteId/reactions',
    asyncRequestHandler(validateNoteViewPermissionMiddleware),
    asyncRequestHandler(validateRequestMiddlewares(reactionTypeSchema)),
    asyncRequestHandler(clearNotesCaches),
    asyncRequestHandler(api('reaction'))
);

module.exports = router;
