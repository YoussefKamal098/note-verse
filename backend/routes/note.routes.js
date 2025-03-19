const express = require('express');
const notesController = require('../controllers/note.controller');
const asyncRequestHandler = require('../utils/asyncHandler');
const cacheKeys = require('../utils/cacheKeys');
const {createCacheMiddleware, clearCache, clearCachePattern} = require('../middlewares/cache.middleware');
const verifyAuthUserOwnershipMiddleware = require('../middlewares/verifyAuthUserOwnership.middleware');
const router = express.Router({mergeParams: true});

// Middleware to clear caches for the notes.
async function clearNotesCaches(req, res, next) {
    await clearCache(cacheKeys.getNoteCacheKey(req));
    await clearCachePattern(cacheKeys.getUserNotesCachePattern(req));
    next();
}

// Create caching middleware instances.
const notesCacheMiddleware = createCacheMiddleware({
    generateCacheKey: cacheKeys.getUserNotesCacheKey
});

const noteCacheMiddleware = createCacheMiddleware({
    generateCacheKey: cacheKeys.getNoteCacheKey
});

// Routes
router.post("/",
    asyncRequestHandler(verifyAuthUserOwnershipMiddleware),
    asyncRequestHandler(async (req, res) => {
        await clearCachePattern(cacheKeys.getUserNotesCachePattern(req));
        await notesController.create(req, res);
    }));

router.get("/",
    asyncRequestHandler(verifyAuthUserOwnershipMiddleware),
    asyncRequestHandler(notesCacheMiddleware),
    asyncRequestHandler(notesController.findPaginatedUserNotes.bind(notesController))
);

router.get("/:noteId",
    asyncRequestHandler(verifyAuthUserOwnershipMiddleware),
    asyncRequestHandler(noteCacheMiddleware),
    asyncRequestHandler(notesController.findUserNoteById.bind(notesController))
);

router.put("/:noteId",
    asyncRequestHandler(verifyAuthUserOwnershipMiddleware),
    asyncRequestHandler(clearNotesCaches),
    asyncRequestHandler(notesController.updateUserNoteById.bind(notesController))
);

router.delete("/:noteId",
    asyncRequestHandler(verifyAuthUserOwnershipMiddleware),
    asyncRequestHandler(clearNotesCaches),
    asyncRequestHandler(notesController.deleteUserNoteById.bind(notesController))
);

module.exports = router;
