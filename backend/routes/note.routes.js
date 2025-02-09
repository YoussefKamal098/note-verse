const express = require('express');
const notesController = require('../controllers/note.controller');
const asyncRequestHandler = require('../utils/asyncHandler');
const cacheKeys = require('../utils/cacheKeys');
const {createCacheMiddleware, clearCache, clearCachePattern} = require('../middlewares/cache.middleware');
const router = express.Router();

// Middleware to clear caches for the note.
async function clearNoteCaches(req, res, next) {
    await clearCache(cacheKeys.getNoteCacheKey(req));
    await clearCachePattern(cacheKeys.getMyNotesCachePattern(req));
    next();
}

// Create caching middleware instances.
const myNotesCacheMiddleware = createCacheMiddleware({
    generateCacheKey: cacheKeys.getMyNotesCacheKey
});

const noteCacheMiddleware = createCacheMiddleware({
    generateCacheKey: cacheKeys.getNoteCacheKey
});

// Routes
router.post("/", asyncRequestHandler(async (req, res, next) => {
    await clearCachePattern(cacheKeys.getMyNotesCachePattern(req));
    await notesController.create(req, res, next);
}));

router.get("/my_notes",
    asyncRequestHandler(myNotesCacheMiddleware),
    asyncRequestHandler(notesController.findMyNotes.bind(notesController))
);

router.get("/my_note/:noteId",
    asyncRequestHandler(noteCacheMiddleware),
    asyncRequestHandler(notesController.findMyNoteById.bind(notesController))
);

router.put("/my_note/:noteId",
    asyncRequestHandler(clearNoteCaches),
    asyncRequestHandler(noteCacheMiddleware),
    asyncRequestHandler(notesController.updateMyNote.bind(notesController))
);

router.delete("/my_note/:noteId",
    asyncRequestHandler(clearNoteCaches),
    asyncRequestHandler(notesController.deleteMyNoteById.bind(notesController))
);

module.exports = router;
