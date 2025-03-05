const {normalizeUrl} = require('shared-utils/url.utils');
const httpHeaders = require("../constants/httpHeaders");

const cacheKeys = Object.freeze({
    getUserCacheKey: (req) => {
        const userId = req.params.userId;
        return `cache:user:${userId}`;
    },

    getUserNotesCacheKey: (req) => {
        const userId = req.params.userId;
        // Construct a base URL from the request.
        const baseUrl = `${req.protocol}://${req.get(httpHeaders.HOST)}`;
        // Normalize the original URL using the dynamic base.
        const normalizedUrl = normalizeUrl(req.originalUrl, baseUrl);
        return `cache:user:${userId}:notes:${normalizedUrl}`;
    },

    getNoteCacheKey: (req) => {
        const noteId = req.params.noteId;
        return `cache:note:${noteId}`;
    },

    getUserNotesCachePattern: (req) => {
        const userId = req.params.userId;
        return `cache:user:${userId}:notes:*`;
    },
});

module.exports = cacheKeys;
