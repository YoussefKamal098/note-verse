const {SOCKET_EVENTS, REDIS, getNoteRoom} = require('@/constants/socket.constants');

/**
 * @class TypingEmitter
 * @description Emits note typing updates via Redis pub/sub to specific note rooms.
 */
class NoteTypingEmitter {
    /**
     * @private
     * @type {import('ioredis').Redis}
     * @description Redis publisher client
     */
    #publisher;

    /**
     * Creates a TypingEmitter instance
     * @param {Object} dependencies
     * @param {import('ioredis').Redis} dependencies.redisClient - Redis client
     */
    constructor({redisClient}) {
        this.#publisher = redisClient.duplicate();
    }

    /**
     * Emits a typing update event to a note room
     * @async
     * @param {string} noteId - Note ID
     * @param {Array<{id: string, firstname: string, lastname: string, avatarUrl: string}>} users - Users who are typing
     * @returns {Promise<void>}
     */
    async emitTypingUpdate(noteId, users) {
        const payload = {
            type: REDIS.EVENT_TYPES.NOTE,
            event: SOCKET_EVENTS.NOTE_TYPING.UPDATE,
            room: getNoteRoom(noteId),
            data: users
        };

        await this.#publisher.publish(
            REDIS.CHANNELS.SOCKET_EVENTS,
            JSON.stringify(payload)
        );

        console.log(`[TypingEmitter] Emitted typing update to note: ${noteId}, Users: ${users.length}`);
    }
}

module.exports = NoteTypingEmitter;
