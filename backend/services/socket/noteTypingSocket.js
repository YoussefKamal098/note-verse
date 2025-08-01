const {SOCKET_EVENTS, getNoteRoom} = require('@/constants/socket.constants');

class NoteTypingSocket {
    /**
     * @private
     * Service for managing online typing state in Redis.
     * @type {import('@/services/online/noteTyping.online').OnlineNoteTypingService}
     */
    #onlineNoteTypingService;

    /**
     * @private
     * Service for fetching user data.
     * @type {import('@/services/user.service').UserService}
     */
    #userService;

    /**
     * @private
     * Emitter for broadcasting typing updates to socket rooms.
     * @type {import('@/services/emitters/noteTyping.emitter').NoteTypingEmitter}
     */
    #noteTypingEmitter;

    /**
     * Initializes the NoteTypingSocket with required services.
     * @param {{
     *   onlineNoteTypingService: import('@/services/online/noteTyping.online').OnlineNoteTypingService,
     *   userService: import('@/services/user.service').UserService,
     *   noteTypingEmitter: import('@/services/emitters/noteTyping.emitter').NoteTypingEmitter
     * }} dependencies - Dependencies required by the class
     */
    constructor({onlineNoteTypingService, userService, noteTypingEmitter}) {
        this.#onlineNoteTypingService = onlineNoteTypingService;
        this.#userService = userService;
        this.#noteTypingEmitter = noteTypingEmitter
    }

    /**
     * Registers socket event listeners for a connected user.
     * @param {import('socket.io').Socket & { userId: string }} socket - The connected socket instance
     */
    registerSocket(socket) {
        const joinedNotes = new Set();

        // TODO: validate a note edit permission for a user before start or stop typing using validateUserNoteUpdateUseCase
        // TODO: validate a note view permission for a user before get note typing users using validateNoteViewUseCase

        socket.on(SOCKET_EVENTS.NOTE_TYPING.START, async ({noteId}) => {
            if (!noteId || !socket.userId) return;

            // Set Redis Set entry
            await this.#onlineNoteTypingService.addTyping(noteId, socket.userId, socket.id);

            // timeoutMap.set(socket.id, timeout);
            if (!joinedNotes.has(noteId)) {
                joinedNotes.add(noteId);
                socket.join(getNoteRoom(noteId));
            }

            await this.#emitTypingUpdate(socket, noteId);
        });

        socket.on(SOCKET_EVENTS.NOTE_TYPING.STOP, async ({noteId}) => {
            if (!noteId || !socket.userId) return;
            await this.#removeTyping(socket, noteId, socket.userId, socket.id);
        });

        socket.on(SOCKET_EVENTS.NOTE_TYPING.GET, async ({noteId}) => {
            if (!noteId || !socket.userId) return;
            await this.#emitTypingUpdate(socket, noteId);
        });

        socket.on(SOCKET_EVENTS.DISCONNECT, async () => {
            for (const noteId of joinedNotes) {
                await this.#removeTyping(socket, noteId, socket.userId, socket.id);
            }
        });
    }

    /**
     * Removes a socket's typing entry from Redis and emits an update.
     * @private
     * @param {import('socket.io').Socket & { userId: string }} socket - The socket instance
     * @param {string} noteId - The ID of the note
     * @param {string} userId - The user's ID
     * @param {string} socketId - The socket's ID
     */
    async #removeTyping(socket, noteId, userId, socketId) {
        await this.#onlineNoteTypingService.removeTyping(noteId, userId, socketId);
        await this.#emitTypingUpdate(socket, noteId);
    }

    /**
     * Emits an updated list of typing users for a given note.
     * @private
     * @param {import('socket.io').Socket} socket - The socket instance
     * @param {string} noteId - The ID of the note
     */
    async #emitTypingUpdate(socket, noteId) {
        const userIds = await this.#onlineNoteTypingService.getTypingUsers(noteId);
        const users = await this.#resolveTypingUsers(userIds);
        await this.#noteTypingEmitter.emitTypingUpdate(noteId, users);
    }

    /**
     * Resolves user metadata (id, name, avatar) from user IDs.
     * @private
     * @param {Array<string>} userIds - Array of user IDs
     * @returns {Promise<Array<{id: string, firstname: string, lastname: string, avatarUrl: string}>>}
     */
    async #resolveTypingUsers(userIds) {
        if (!userIds.length) return [];
        const users = await this.#userService.findByIds(userIds);
        return users.map(({id, firstname, lastname, avatarUrl}) => ({
            id,
            firstname,
            lastname,
            avatarUrl,
        }));
    }
}

module.exports = NoteTypingSocket;
