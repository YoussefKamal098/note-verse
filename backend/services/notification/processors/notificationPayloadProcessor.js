/**
 * Abstract base class for notification payload processors
 * @abstract
 */
class NotificationPayloadProcessor {
    /**
     * Processes notification payload before sending
     * @abstract
     * @param {NotificationPayload} payload - Raw notification payload
     * @returns {Promise<EnhancedNotificationPayload>} Processed payload
     */
    async process(payload) {
        throw new Error('Not implemented');
    }
}

module.exports = NotificationPayloadProcessor;
