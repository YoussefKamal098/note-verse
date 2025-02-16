const Session = require('../models/session.model');
const {deepFreeze} = require('shared-utils/obj.utils');
const {isValidObjectId, convertToObjectId, sanitizeMongoObject} = require('../utils/obj.utils');

/**
 * Repository for performing CRUD operations on the Session collection.
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
     * Creates a new session document.
     *
     * @param {Object} sessionData - Data for the new session.
     * @returns {Promise<Object>} The created session (deep-frozen).
     * @throws {Error} If session creation fails.
     */
    async create(sessionData) {
        try {
            const newSession = new this.#model(sessionData);
            await newSession.save();
            return deepFreeze(sanitizeMongoObject(newSession.toObject()));
        } catch (error) {
            console.error("Error creating session:", error);
            throw new Error("Unable to create session");
        }
    }

    /**
     * Finds a session by its ID.
     *
     * @param {string} sessionId - The session's ID.
     * @returns {Promise<Object|null>} The session if found (deep-frozen); otherwise, null.
     */
    async findById(sessionId) {
        if (!isValidObjectId(sessionId)) return null;
        try {
            const session = await this.#model.findById(convertToObjectId(sessionId)).lean();
            return session ? deepFreeze(sanitizeMongoObject(session)) : null;
        } catch (error) {
            console.error("Error finding session by ID:", error);
            throw new Error("Error finding session by ID");
        }
    }

    /**
     * Finds a session matching the given query.
     *
     * @param {Object} query - The query to match.
     * @returns {Promise<Object|null>} The session if found (deep-frozen); otherwise, null.
     */
    async findOne(query) {
        try {
            const session = await this.#model.findOne(query).lean();
            return session ? deepFreeze(sanitizeMongoObject(session)) : null;
        } catch (error) {
            console.error("Error finding session:", error);
            throw new Error("Error finding session");
        }
    }

    /**
     * Finds a session by its ID and updates it.
     *
     * @param {string} sessionId - The session's ID.
     * @param {Object} updates - The updates to apply.
     * @returns {Promise<Object|null>} The updated session if found (deep-frozen); otherwise, null.
     */
    async findByIdAndUpdate(sessionId, updates) {
        if (!isValidObjectId(sessionId)) return null;
        try {
            const updatedSession = await this.#model.findByIdAndUpdate(
                convertToObjectId(sessionId),
                updates,
                {new: true, runValidators: true}
            ).lean();
            return updatedSession ? deepFreeze(sanitizeMongoObject(updatedSession)) : null;
        } catch (error) {
            console.error("Error updating session:", error);
            throw new Error("Error updating session");
        }
    }
}

module.exports = new SessionRepository(Session);
