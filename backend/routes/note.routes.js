const express = require('express');
const notesController = require('../controllers/note.controller');
const asyncRequestHandler = require('../utils/asyncHandler');
const cacheKeys = require('../utils/cacheKeys');
const {createCacheMiddleware, clearCache, clearCachePattern} = require('../middlewares/cache.middleware');
const router = express.Router();

// Routes
router.post("/", asyncRequestHandler(async (req, res, next) => {
    await clearCachePattern(cacheKeys.getMyNotesCachePattern(req));
    await notesController.create(req, res, next);
}));

router.get("/my_notes",
    asyncRequestHandler(createCacheMiddleware({generateCacheKey: cacheKeys.getMyNotesCacheKey})),
    asyncRequestHandler(notesController.findMyNotes.bind(notesController))
);

router.get("/my_note/:noteId",
    asyncRequestHandler(createCacheMiddleware({generateCacheKey: cacheKeys.getNoteCacheKey})),
    asyncRequestHandler(notesController.findMyNoteById.bind(notesController))
);

router.put("/my_note/:noteId", asyncRequestHandler(async (req, res, next) => {
    await clearCache(cacheKeys.getNoteCacheKey(req));
    await clearCachePattern(cacheKeys.getMyNotesCachePattern(req));
    await notesController.updateMyNote(req, res, next);
}));

router.delete("/my_note/:noteId", asyncRequestHandler(async (req, res, next) => {
    await clearCache(cacheKeys.getNoteCacheKey(req));
    await clearCachePattern(cacheKeys.getMyNotesCachePattern(req));
    await notesController.deleteMyNoteById(req, res, next);
}));

module.exports = router;
