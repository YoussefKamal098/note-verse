const {CHANNELS, EVENT_TYPES} = require('./redis.constants');

/** @readonly */
const SOCKET_EVENTS = Object.freeze({
    NEW_NOTIFICATION: 'new_notification',
    NOTE: Object.freeze({
        JOIN: 'note_join',
        LEAVE: 'note_leave',
        UPDATE: 'note_update',
    }),
    NOTE_TYPING: Object.freeze({
        START: 'note_typing:start',
        STOP: 'note_typing:stop',
        UPDATE: 'note_typing:update',
        GET: "note_typing:get"
    }),
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect'
});

/** @readonly */
const REDIS = Object.freeze({
    CHANNELS,
    EVENT_TYPES
})

/**
 * Generates the socket room name for a specific user
 * @param {string} userId
 * @returns {string}
 */
const getUserRoom = (userId) => `user_${userId}`;
const getNoteRoom = (noteId) => `note:${noteId}`;

module.exports = {
    SOCKET_EVENTS,
    REDIS,
    getUserRoom,
    getNoteRoom
};
