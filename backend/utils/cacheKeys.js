const cacheKeys = Object.freeze({
    getMeCacheKey: (req) => {
        const userId = req?.user?.id;
        return `cache:user:${userId}`;
    },

    getMyNotesCacheKey: (req) => {
        const userId = req?.user?.id;
        return `cache:user:${userId}:my_notes:${req.originalUrl}`;
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