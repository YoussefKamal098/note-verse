const express = require('express');
const {makeClassInvoker} = require('awilix-express');
const asyncRequestHandler = require('../utils/asyncHandler');
const container = require('../container');
const {getNoteCacheKey, getUserNotesCachePattern} = require("../utils/cacheKeys");
const {clearCache, clearCachePattern} = require("../middlewares/cache.middleware");
const {validateVersionAccessPermission} = require('../middlewares/version.permissionValidation.middleware');
const VersionController = require('../controllers/version.controller');

const router = express.Router({mergeParams: true});
const validateVersionAccessPermissionMiddleware = container.build(validateVersionAccessPermission);
const api = makeClassInvoker(VersionController);

// Middleware to clear caches for a single note and the user’s notes list after user restore a note
const clearNotesCaches = async (req, res, next) => {
    res.on('finish', async () => {
        try {
            if (req.updatedNote) {
                await Promise.all([
                    clearCache(getNoteCacheKey({params: {noteId: req.updatedNote.id}})),
                    clearCachePattern(getUserNotesCachePattern(req))
                ]);
            }
        } catch (error) {
            console.error("Post-response cache clear failed", error);
        }
    });
    next();
}

// Get version metadata
router.get(
    '/:versionId',
    asyncRequestHandler(validateVersionAccessPermissionMiddleware),
    asyncRequestHandler(api('getVersion'))
);

// Get version content
router.get(
    '/:versionId/content',
    asyncRequestHandler(validateVersionAccessPermissionMiddleware),
    asyncRequestHandler(api('getVersionContent'))
);

// Restore to a version
router.post(
    '/:versionId/restore',
    asyncRequestHandler(clearNotesCaches),
    asyncRequestHandler(api('restoreVersion'))
);

module.exports = router;
