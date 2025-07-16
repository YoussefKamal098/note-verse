const {CHANNELS, EVENT_TYPES} = require('./redis.constants');

/** @readonly */
const SOCKET_EVENTS = Object.freeze({
    NEW_NOTIFICATION: 'new_notification',
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

module.exports = {
    SOCKET_EVENTS,
    REDIS,
    getUserRoom
};
