const NotificationPayloadProcessor = require('./notificationPayloadProcessor');

/**
 * Processor for note update notifications that enhances note, version, and user data.
 *
 * This class enriches incoming note update notifications by fetching and attaching
 * related data (note, version, user) using their respective combiner services.
 *
 * @class
 * @extends NotificationPayloadProcessor
 */
class NoteUpdateNotificationProcessor extends NotificationPayloadProcessor {
    /**
     * @private
     * @type {ResourceNoteCombiner}
     */
    #noteCombiner;

    /**
     * @private
     * @type {ResourceVersionCombiner}
     */
    #versionCombiner;

    /**
     * @private
     * @type {ResourceUserCombiner}
     */
    #userCombiner;

    /**
     * Creates a new instance of NoteUpdateNotificationProcessor.
     *
     * @param {Object} dependencies - Dependencies object
     * @param {ResourceNoteCombiner} dependencies.noteCombiner - Combiner to fetch and attach note data
     * @param {ResourceVersionCombiner} dependencies.versionCombiner - Combiner to fetch and attach version data
     * @param {ResourceUserCombiner} dependencies.userCombiner - Combiner to fetch and attach user data
     */
    constructor({noteCombiner, versionCombiner, userCombiner}) {
        super();
        this.#noteCombiner = noteCombiner;
        this.#versionCombiner = versionCombiner;
        this.#userCombiner = userCombiner;
    }

    /**
     * Enhances note update notification with related note, version, and user data.
     *
     * @param {NoteUpdatePayload} payload - Note update payload
     * @returns {Promise<EnhancedNoteUpdatePayload>} Enhanced payload including note, version, and user
     */
    async process(payload) {
        const [note, version, user] = await Promise.all([
            this.#noteCombiner.combineWithSingleNote(
                {noteId: payload.noteId},
                {noteIdField: 'noteId', projection: {_id: 1, title: 1}}
            ),
            this.#versionCombiner.combineWithSingleVersion(
                {versionId: payload.versionId},
                {versionIdField: 'versionId', projection: {_id: 1, message: 1}}
            ),
            this.#userCombiner.combineWithSingleUser(
                {userId: payload.userId},
                {userIdField: 'userId', projection: {createdAt: 0, updatedAt: 0}}
            )
        ]);

        return {
            note: note?.note || null,
            version: version?.version || null,
            user: user?.user || null
        };
    }
}

module.exports = NoteUpdateNotificationProcessor;
