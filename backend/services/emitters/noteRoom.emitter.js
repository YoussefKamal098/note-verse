const {REDIS, SOCKET_EVENTS, getNoteRoom} = require('@/constants/socket.constants');

/**
 * @class NoteRoomEmitter
 * @description Publishes note events to Redis to notify connected viewers
 */
class NoteRoomEmitter {
    /**
     * @private
     * @type {import('ioredis').Redis}
     */
    #publisher;

    /**
     * @private
     * @type {OnlineNoteUserService}
     */
    #onlineNoteService;

    /**
     * @param {Object} deps
     * @param {import('ioredis').Redis} deps.redisClient
     * @param {OnlineNoteUserService} deps.onlineNoteService
     */
    constructor({redisClient, onlineNoteService}) {
        this.#publisher = redisClient.duplicate();
        this.#onlineNoteService = onlineNoteService;
    }

    /**
     * Emits note update to users currently viewing the note
     * @param {string} noteId
     * @param {Object} data
     * @param {string} data.versionId
     */
    async emitNoteUpdate(noteId, data = {}) {
        const viewers = await this.#onlineNoteService.getViewers(noteId);
        if (viewers.length === 0) {
            console.log(`[NoteRoomEmitter](emitNoteUpdate) There is no viewer for the note ${noteId}`);
            return;
        }

        await this.#publisher.publish(
            REDIS.CHANNELS.SOCKET_EVENTS,
            JSON.stringify({
                type: REDIS.EVENT_TYPES.NOTE,
                event: SOCKET_EVENTS.NOTE.UPDATE,
                room: getNoteRoom(noteId),
                data: {versionId: data.versionId}
            })
        );

        console.log(`[NoteRoomEmitter](emitNoteUpdate) Emitted NOTE_UPDATE to note ${noteId}`);
    }
}

module.exports = NoteRoomEmitter;
