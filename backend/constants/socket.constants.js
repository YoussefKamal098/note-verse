const {CHANNELS, EVENT_TYPES} = require('./redis.constants');

/** @readonly */
const SOCKET_EVENTS = Object.freeze({
    NEW_NOTIFICATION: 'new_notification',
    USER: {
        WATCH: 'user:watch',
        UNWATCH: 'user:unwatch',
        STATUS: 'user_status',
        ONLINE: 'user_online',
        OFFLINE: 'user_offline'
    },
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
 * Returns the Socket.IO room name used to deliver direct notifications to the user.
 * Used for user-specific events like notifications or messages.
 * @param {string} userId
 * @returns {string}
 */
const getUserRoom = (userId) => `user:${userId}`;
/**
 * Returns the Socket.IO room name used for presence tracking (e.g., user:123).
 * Used when other users "watch" this user's online/offline status.
 * @param {string} userId
 * @returns {string}
 */
const getUserPresenceRoom = (userId) => `presence:user:${userId}`;

/**
 * Generates a Socket.IO room name for a specific note.
 *
 * This room is used to group clients interested in real-time updates
 * related to a particular note, such as edits, comments, or presence.
 *
 * @function
 * @param {string} noteId - The unique identifier of the note.
 * @returns {string} The room name formatted as `note:{noteId}`.
 */
const getNoteRoom = (noteId) => `note:${noteId}`;

module.exports = {
    SOCKET_EVENTS,
    REDIS,
    getUserRoom,
    getUserPresenceRoom,
    getNoteRoom
};
