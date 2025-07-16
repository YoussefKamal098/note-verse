/**
 * @readonly
 * @enum {string}
 * @description Enum representing different types of notifications
 *
 * - `login`: Sent when a user logs in (contains IP, device info, etc.)
 * - `note_update`: Sent when a note is updated (contains note and user details)
 */
const NotificationType = {
    /** A user login event */
    LOGIN: 'login',

    /** A note has been updated */
    NOTE_UPDATE: 'note_update',
};

module.exports = NotificationType;
