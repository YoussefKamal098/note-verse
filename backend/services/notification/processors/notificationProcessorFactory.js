const LoginNotificationProcessor = require('./loginNotificationProcessor');
const NoteUpdateNotificationProcessor = require('./noteUpdateNotificationProcessor');
const NotificationType = require("@/enums/notifications.enum");

/**
 * Factory class that creates appropriate notification processors.
 *
 * Based on the provided notification type, this factory returns an instance
 * of a processor class capable of enriching the payload with related data.
 *
 * @class
 */
class NotificationProcessorFactory {
    /**
     * @private
     * @type {Map<NotificationType, NotificationPayloadProcessor>}
     */
    #processors;

    /**
     * Creates a new NotificationProcessorFactory instance.
     *
     * @param {Object} dependencies - Dependencies for all processors
     * @param {ResourceNoteCombiner} dependencies.noteCombiner - Combiner for notes
     * @param {ResourceVersionCombiner} dependencies.versionCombiner - Combiner for versions
     * @param {ResourceUserCombiner} dependencies.userCombiner - Combiner for users
     * @param {ResourceSessionCombiner} dependencies.sessionCombiner - Combiner for sessions
     */
    constructor({
                    noteCombiner,
                    versionCombiner,
                    userCombiner,
                    sessionCombiner
                }) {
        this.#processors = new Map([
            [NotificationType.LOGIN, new LoginNotificationProcessor({sessionCombiner})],
            [NotificationType.NOTE_UPDATE, new NoteUpdateNotificationProcessor({
                noteCombiner,
                versionCombiner,
                userCombiner
            })]
        ]);
    }

    /**
     * Gets the processor instance for the given notification type.
     *
     * @param {NotificationType} type - Notification type to retrieve processor for
     * @returns {NotificationPayloadProcessor | null} Processor instance or null if not found
     */
    getProcessor(type) {
        if (!this.#processors.has(type)) {
            return null;
        }
        return this.#processors.get(type);
    }
}

module.exports = NotificationProcessorFactory;
