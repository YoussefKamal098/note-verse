const NOTE_VIEWERS_KEY = (noteId) => `note:viewers:${noteId}:*`;
const NOTE_SOCKET_SET_KEY = (noteId, userId) => `note:viewers:${noteId}:${userId}`;
const NOTE_VIEWERS_SCAN_PATTERN = 'note:viewers:*';

class OnlineNoteUserService {
    /**
     * @private
     * @type {RedisService}
     * @description Redis Service instance
     */
    #redis;

    /**
     * Creates an OnlineNoteService instance
     * @param {Object} dependencies
     * @param {RedisService} dependencies.redisService - Redis Service instance
     */
    constructor({redisService}) {
        this.#redis = redisService;
    }

    /**
     * Add a user to a note's online viewer set
     * @param {string} noteId
     * @param {string} userId
     * @param {string} socketId
     * @returns {Promise<boolean>} true if first socket for this user on the note
     */
    async addViewer(noteId, userId, socketId) {
        const socketKey = NOTE_SOCKET_SET_KEY(noteId, userId);
        await this.#redis.sadd(socketKey, socketId);

        const count = await this.#redis.scard(socketKey);
        return count === 1;
    }

    /**
     * Remove a user from a note's online viewer set
     * @param {string} noteId
     * @param {string} userId
     * @param {string} socketId
     * @returns {Promise<boolean>} true if user has no more sockets for the note
     */
    async removeViewer(noteId, userId, socketId) {
        const socketKey = NOTE_SOCKET_SET_KEY(noteId, userId);
        await this.#redis.srem(socketKey, socketId);

        const count = await this.#redis.scard(socketKey);
        if (count === 0) {
            await this.#redis.del(socketKey);
            return true;
        }

        return false;
    }

    /**
     * Get all online viewers of a note
     * @param {string} noteId
     * @returns {Promise<string[]>} Array of userIds currently viewing the note
     */
    async getViewers(noteId) {
        const pattern = NOTE_VIEWERS_KEY(noteId);
        const keys = await this.#redis.scanKeys(pattern);

        const userIds = new Set();
        for (const key of keys) {
            const parts = key.split(':'); // ["note", "viewers", "{noteId}", "{userId}"]
            const userId = parts[3];
            if (userId) userIds.add(userId);
        }

        return Array.from(userIds);
    }

    /**
     * Check if a user is currently viewing the note
     * @param {string} noteId
     * @param {string} userId
     * @returns {Promise<boolean>}
     */
    async isViewer(noteId, userId) {
        const socketKey = NOTE_SOCKET_SET_KEY(noteId, userId);
        const count = await this.#redis.scard(socketKey);
        return count > 0;
    }

    /**
     * Clear all viewer socket sets for a given note
     * @param {string} noteId
     */
    async clearViewers(noteId) {
        const pattern = `note:viewers:${noteId}:*`;
        const keys = await this.#redis.scanKeys(pattern);
        if (keys.length === 0) return;
        const pipeline = this.#redis.pipeline();
        for (const key of keys) {
            pipeline.del(key);
        }
        await pipeline.exec();
    }

    /**
     * Flushes all note viewers from Redis
     * Should be called on app shutdown/restart
     * @returns {Promise<void>}
     */
    async clearAllOnlineNotes() {
        const keys = await this.#redis.scanKeys(NOTE_VIEWERS_SCAN_PATTERN);
        if (keys.length === 0) return;

        // Delete keys one by one (safe in cluster)
        for (const key of keys) {
            await this.#redis.del(key);
        }
    }
}

module.exports = OnlineNoteUserService;
