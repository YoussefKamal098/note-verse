const NotificationPayloadProcessor = require('./notificationPayloadProcessor');

/**
 * Processor for login notifications that enhances session data.
 *
 * This class extends the NotificationPayloadProcessor and enriches
 * login notification payloads by combining them with session metadata
 * (such as IP address and user agent) using a provided sessionCombiner.
 *
 * @class
 * @extends NotificationPayloadProcessor
 */
class LoginNotificationProcessor extends NotificationPayloadProcessor {
    /**
     * @private
     * @type {ResourceSessionCombiner}
     */
    #sessionCombiner;

    /**
     * Creates a new instance of LoginNotificationProcessor.
     *
     * @param {Object} dependencies - Dependencies object
     * @param {ResourceSessionCombiner} dependencies.sessionCombiner - Combiner to fetch and attach session data
     */
    constructor({sessionCombiner}) {
        super();
        this.#sessionCombiner = sessionCombiner;
    }

    /**
     * Enhances login notification payload with session details.
     *
     * @param {LoginPayload} payload - Login notification payload
     * @returns {Promise<EnhancedLoginPayload>} Enhanced payload containing session metadata
     */
    async process(payload) {
        const combined = await this.#sessionCombiner.combineWithSingleSession(
            {sessionId: payload.sessionId},
            {sessionIdField: 'sessionId', projection: {ip: 1, userAgent: 1}}
        );
        return {
            session: combined?.session || null
        };
    }
}

module.exports = LoginNotificationProcessor;
