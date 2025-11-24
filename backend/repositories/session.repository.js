const {deepFreeze} = require('shared-utils/obj.utils');
const {
    isValidObjectId,
    convertToObjectId,
    sanitizeMongoObject,
} = require('../utils/obj.utils');

/**
 * Repository for CRUD operations on the Session collection.
 * This class encapsulates all database operations for sessions,
 * including creating, reading, updating, and finding sessions
 * by various domain-specific keys.
 * It also provides a helper method
 * for running operations inside a MongoDB transaction.
 */
class SessionRepository {
    /**
     * @private
     * @type {import('mongoose').Model}
     * @description The Mongoose model used for session operations.
     */
    #model;

    /**
     * Constructs a new SessionRepository.
     *
     * @param {import('mongoose').Model} model - The Mongoose model for sessions.
     */
    constructor(model) {
        this.#model = model;
    }

    /**
     * Creates a new session document in the database.
     *
     * @param {Object} sessionData - The data for the session to be created.
     * @param {string} sessionData.userId - The identifier of the user associated with the session.
     * @param {string} sessionData.ip - The IP address from which the session originates.
     * @param {string} sessionData.userAgent - The raw User-Agent string from the client.
     * @param {string} [sessionData.browserName] - The browser name (optional).
     * @param {string} [sessionData.osName] - The operating system name (optional).
     * @param {string} [sessionData.deviceModel] - The device model information (optional).
     * @param {string} [sessionData.deviceType] - The type of device (e.g., "Desktop" or "Mobile") (optional).
     * @param {Date} [sessionData.expiredAt] - The expiration timestamp for the session.
     * @param {Date} [sessionData.lastAccessedAt] - The last access time for the session (optional).
     * @returns {Promise<Object>} The created session document, deep-frozen to prevent further modifications.
     * @throws {Error} If an error occurs during session creation.
     */
    async create(sessionData = {}) {
        try {
            const session = await this.#model.findOneAndUpdate(
                // Use unique keys that identify the session
                {
                    userId: sessionData.userId,
                    ip: sessionData.ip,
                    browserName: sessionData.browserName,
                    osName: sessionData.osName,
                    deviceType: sessionData.deviceType
                },
                // Only set the data if the document does not exist
                {$setOnInsert: sessionData},
                {new: true, upsert: true}
            ).lean();
            return deepFreeze(sanitizeMongoObject(session));
        } catch (error) {
            console.error('Error creating or retrieving session:', error);
            throw new Error('Unable to create or retrieve session');
        }
    }

    /**
     * Finds a session document by its unique identifier.
     *
     * @param {string} sessionId - The unique identifier of the session to retrieve.
     * @param {Object} [options]
     * @param {Object|string} [options.projection]
     * @param {import('mongoose').ClientSession} [options.session]
     * @returns {Promise<Object|null>} The session document if found; otherwise, null.
     * @throws {Error} If an error occurs during the query.
     */
    async findById(sessionId, {session = null, projection = {}} = {}) {
        if (!isValidObjectId(sessionId)) return null;

        try {
            const query = this.#model.findById(convertToObjectId(sessionId));
            if (projection) query.select(projection);
            if (session) query.session(session);

            const sessionDoc = await query.lean();
            return sessionDoc ? deepFreeze(sanitizeMongoObject(sessionDoc)) : null;
        } catch (error) {
            console.error('Error finding session by ID:', error);
            throw new Error('Error finding session by ID');
        }
    }

    /**
     * Finds multiple sessions by an array of IDs.
     *
     * @param {string[]} ids - Array of session IDs
     * @param {Object} [options]
     * @param {Object|string} [options.projection]
     * @param {import('mongoose').ClientSession} [options.session]
     * @returns {Promise<Readonly<Array<OutputSession>>>}
     */
    async findByIds(ids = [], {projection = null, session = null} = {}) {
        try {
            const objectIds = ids.filter(isValidObjectId).map(convertToObjectId);
            const sessions = await this.#model.find({_id: {$in: objectIds}}, projection)
                .session(session).lean();

            return deepFreeze(sessions.map(sanitizeMongoObject));
        } catch (error) {
            console.error('Error finding sessions by IDs:', error);
            throw new Error('Failed to find sessions');
        }
    }


    /**
     * Finds a session document by its domain-specific keys.
     * The domain keys include user identifier, IP address, normalized browser,
     * normalized operating system, and device type.
     *
     * @param {Object} keys - An object containing the session key parameters:
     * @param {string} keys.userId - The identifier of the user associated with the session.
     * @param {string} keys.ip - The IP address from which the session originates.
     * @param {string} keys.browserName - The browser name associated with the session.
     * @param {string} keys.osName - The operating system name associated with the session.
     * @param {string} keys.deviceType - The type of device (e.g., "Desktop" or "Mobile") used in the session.
     * @returns {Promise<Object|null>} The session document if found; otherwise, null.
     * @throws {Error} If an error occurs during the query.
     */
    async findSessionByKeys({userId, ip, browserName, osName, deviceType} = {}) {
        const query = {userId, ip, browserName, osName, deviceType};
        try {
            const sessionDoc = await this.#model.findOne(query).lean();
            return sessionDoc ? deepFreeze(sanitizeMongoObject(sessionDoc)) : null;
        } catch (error) {
            console.error('Error finding session:', error);
            throw new Error('Error finding session');
        }
    }

    /**
     * Updates a session document by its unique identifier.
     *
     * @param {string} sessionId - The unique identifier of the session to update.
     * @param {Object} updates - An object containing the fields to update.
     * @returns {Promise<Object|null>} The updated session document if the update was successful; otherwise, null.
     * @throws {Error} If an error occurs during the update.
     */
    async updateSessionById(sessionId, updates = {}) {
        if (!isValidObjectId(sessionId)) return null;
        try {
            const updatedSession = await this.#model
                .findByIdAndUpdate(
                    convertToObjectId(sessionId),
                    {$set: updates},
                    {new: true, runValidators: true}
                ).lean();
            return updatedSession ? deepFreeze(sanitizeMongoObject(updatedSession)) : null;
        } catch (error) {
            console.error('Error updating session:', error);
            throw new Error('Error updating session');
        }
    }

    /**
     * Finds all session documents associated with a userId.
     *
     * @param {string} userId - The ID of the user whose sessions should be retrieved.
     * @returns {Promise<Readonly<Readonly<Object>>>} An array of session documents for the user.
     * @throws {Error} If a database error occurs during the query.
     */
    async findSessionsByUserId(userId) {
        try {
            const sessions = await this.#model
                .find({userId})
                .select('_id ip userAgent lastAccessedAt createdAt reusedAt expiredAt')
                .sort({lastAccessedAt: -1}).lean();

            return deepFreeze(sessions.map(sanitizeMongoObject));
        } catch (error) {
            console.error('Error retrieving sessions by userId:', error);
            throw new Error('Error retrieving sessions by userId');
        }
    }
}

module.exports = SessionRepository;
