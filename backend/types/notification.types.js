/**
 * @typedef {Object} LoginPayload
 * @property {string} sessionId - Unique identifier for the login session
 */

/**
 * @typedef {Object} EnhancedLoginPayload
 * @property {Object|null} session - Combined session data
 * @property {string} session.ip - IP address of login
 * @property {string} session.userAgent - User agent string
 */

/**
 * @typedef {Object} NoteUpdatePayload
 * @property {string} noteId - ID of the updated note
 * @property {string} versionId - ID of the new version
 * @property {string} userId - ID of the user who made update
 */

/**
 * @typedef {Object} EnhancedNoteUpdatePayload
 * @property {Object|null} note - Combined note data
 * @property {string} note.id - Note ID
 * @property {string} note.title - Note title
 * @property {Object|null} version - Combined version data
 * @property {string} version.id - Version ID
 * @property {string} version.message - Version message
 * @property {Object|null} user - Combined user data
 * @property {string} user.id - User ID
 * @property {string} user.fistname - User firstname
 * @property {string} user.lastname - User lastname
 * @property {string} user.avatarUrl - User avatar URL
 * @property {string} user.email - User email
 */

/**
 * @typedef {LoginPayload|NoteUpdatePayload} NotificationPayload
 * @description Union of all possible notification payloads
 */

/**
 * @typedef {EnhancedLoginPayload|EnhancedNoteUpdatePayload} EnhancedNotificationPayload
 * @description Union of all enhanced notification payloads
 */

/**
 * @typedef {'login'|'note_update'} NotificationType
 * @description Supported notification types
 */

/**
 * @typedef {Object} NotificationInput
 * @property {string} recipient - Recipient user ID
 * @property {NotificationType} type - Notification type
 * @property {NotificationPayload} payload - Type-specific payload
 */

/**
 * @typedef {Object} NotificationOutput
 * @extends {@link NotificationInput}
 * @property {string} id - Auto-generated notification ID
 * @property {boolean} read - Whether notification has been read
 * @property {boolean} seen - Whether notification has been seen
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} EnhancedNotificationOutput
 * @extends {@link NotificationOutput}
 * @property {EnhancedNotificationPayload} payload - Enhanced payload data
 */

