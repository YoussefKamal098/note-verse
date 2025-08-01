const NOTE_TYPING_USER_KEY = (noteId, userId) => `note:typing:${noteId}:${userId}`;
const NOTE_TYPING_KEY = (noteId) => `note:typing:${noteId}`;
const CLEAR_ALL_TYPING_NOTES_PATTERN = `note:typing:*`;

/**
 * @class OnlineNoteTypingService
 * @description Tracks users currently typing on specific notes using Redis sets.
 *
 * Each user-note combination is tracked by their socket IDs,
 * and note-level tracking is maintained to list currently typing users.
 */
class OnlineNoteTypingService {
    /**
     * @type {import('@/services/redis.service').RedisService}
     * @private
     * @description Redis service instance used to interact with Redis
     */
    #redis;

    /**
     * Creates an instance of OnlineNoteTypingService
     * @param {Object} dependencies
     * @param {import('@/services/redis.service').RedisService} dependencies.redisService - Redis service instance
     */
    constructor({redisService}) {
        this.#redis = redisService;
    }

    /**
     * Adds a socket ID to the typing set for a user on a specific note.
     * Also ensures the user is listed in the global typing set for that note.
     *
     * @param {string} noteId - The ID of the note
     * @param {string} userId - The ID of the user typing
     * @param {string} socketId - The socket ID used by the user
     * @returns {Promise<void>}
     */
    async addTyping(noteId, userId, socketId) {
        const userKey = NOTE_TYPING_USER_KEY(noteId, userId);
        await this.#redis.sadd(userKey, socketId);
        await this.#redis.sadd(NOTE_TYPING_KEY(noteId), userId);
    }

    /**
     * Removes a socket ID from the user's typing set.
     * If no sockets remain for the user, the user is removed from the note's global typing set.
     *
     * @param {string} noteId - The ID of the note
     * @param {string} userId - The ID of the user
     * @param {string} socketId - The socket ID to remove
     * @returns {Promise<void>}
     */
    async removeTyping(noteId, userId, socketId) {
        const userKey = NOTE_TYPING_USER_KEY(noteId, userId);
        await this.#redis.srem(userKey, socketId);

        const remainingSockets = await this.#redis.scard(userKey);
        if (remainingSockets === 0) {
            await this.#redis.del(userKey);
            await this.#redis.srem(NOTE_TYPING_KEY(noteId), userId);
        }
    }

    /**
     * Gets a list of user IDs currently typing in a note.
     *
     * @param {string} noteId - The ID of the note
     * @returns {Promise<string[]>} - Array of user IDs
     */
    async getTypingUsers(noteId) {
        return this.#redis.smembers(NOTE_TYPING_KEY(noteId));
    }

    /**
     * Clears all typing information related to a specific note,
     * removing all user and socket references.
     *
     * @param {string} noteId - The ID of the note
     * @returns {Promise<void>}
     */
    async clearNoteTyping(noteId) {
        const userIds = await this.getTypingUsers(noteId);
        for (const userId of userIds) {
            await this.#redis.del(NOTE_TYPING_USER_KEY(noteId, userId));
        }
        await this.#redis.del(NOTE_TYPING_KEY(noteId));
    }

    /**
     * Clears all typing-related keys from Redis.
     * Useful for full system resets or during service restarts.
     *
     * @returns {Promise<void>}
     */
    async clearAllTypingNotes() {
        const keys = await this.#redis.scanKeys(CLEAR_ALL_TYPING_NOTES_PATTERN);
        for (const key of keys) await this.#redis.del(key);
    }
}

module.exports = OnlineNoteTypingService;
