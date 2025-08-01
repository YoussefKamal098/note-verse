const {SOCKET_EVENTS, getNoteRoom} = require('@/constants/socket.constants');

/**
 * @implements {ISocketModule}
 * @class NoteRoomSocket
 * @description Composes NoteViewerService and NoteRoomEmitter for integration with socket.io server.
 */
class NoteRoomSocket {
    /**
     * @private
     * @type {OnlineNoteUserService}
     */
    #onlineNoteService

    /**
     * @param {Object} dependencies
     * @param {OnlineNoteUserService} dependencies.onlineNoteService
     */
    constructor({onlineNoteService}) {
        this.#onlineNoteService = onlineNoteService
    }

    /**
     * Registers listeners for a connected socket.
     * @param {import('socket.io').Socket & {userId: string}} socket
     */
    registerSocket(socket) {
        /** @type {Set<string>} */
        const joinedNotes = new Set();

        // TODO: validate a note view permission for a user before join a note room using validateNoteViewUseCase

        socket.on(SOCKET_EVENTS.NOTE.JOIN, async ({noteId}) => {
            if (!noteId || !socket.userId) return;
            await this.#onlineNoteService.addViewer(noteId, socket.userId, socket.id);
            joinedNotes.add(noteId);
            socket.join(getNoteRoom(noteId));
        });

        socket.on(SOCKET_EVENTS.NOTE.LEAVE, async ({noteId}) => {
            if (!noteId || !socket.userId) return;
            await this.#onlineNoteService.removeViewer(noteId, socket.userId, socket.id);
            joinedNotes.delete(noteId);
            socket.leave(getNoteRoom(noteId));
        });

        socket.on(SOCKET_EVENTS.DISCONNECT, async () => {
            for (const noteId of joinedNotes) {
                await this.#onlineNoteService.removeViewer(noteId, socket.userId, socket.id);
                socket.leave(getNoteRoom(noteId));
            }
            joinedNotes.clear();
        });
    }
}

module.exports = NoteRoomSocket;
