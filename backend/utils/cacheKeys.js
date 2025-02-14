const {normalizeUrl} = require('shared-utils/url.utils');
const httpHeaders = require("../constants/httpHeaders");

const cacheKeys = Object.freeze({
    getMeCacheKey: (req) => {
        const userId = req?.user?.id;
        return `cache:user:${userId}`;
    },

    getMyNotesCacheKey: (req) => {
        const userId = req?.user?.id;
        // Construct a base URL from the request.
        const baseUrl = `${req.protocol}://${req.get(httpHeaders.HOST)}`;
        // Normalize the original URL using the dynamic base.
        const normalizedUrl = normalizeUrl(req.originalUrl, baseUrl);
        return `cache:user:${userId}:my_notes:${normalizedUrl}`;
    },

    getNoteCacheKey: (req) => {
        const noteId = req.params.noteId;
        return `cache:note:${noteId}`;
    },

    getMyNotesCachePattern: (req) => {
        const userId = req?.user?.id;
        return `cache:user:${userId}:my_notes:*`;
    },
});

module.exports = cacheKeys;
