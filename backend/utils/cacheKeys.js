const {normalizeUrl} = require('shared-utils/url.utils');
const httpHeaders = require("../constants/httpHeaders");

const cacheKeys = Object.freeze({
    userProfileById: (id) => `cache:user:${id}:profile`,
    userProfileByEmail: (email) => `cache:user:${email}:profile`,

    getUserNotesCacheKey: (req) => {
        const authUserId = req.userId;
        // Construct a base URL from the request.
        const baseUrl = `${req.protocol}://${req.get(httpHeaders.HOST)}`;
        // Normalize the original URL using the dynamic base.
        const normalizedUrl = normalizeUrl(req.originalUrl, baseUrl);
        return `cache:user:${authUserId}:notes:${normalizedUrl}`;
    },

    getNoteCacheKey: (req) => {
        const noteId = req.params.noteId;
        return `cache:note:${noteId}`;
    },

    getUserNotesCachePattern: (req) => {
        const authUserId = req.userId;
        return `cache:user:${authUserId}:notes:*`;
    },
});

module.exports = cacheKeys;
