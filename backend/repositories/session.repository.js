const Session = require('../models/session.model');
const {deepFreeze} = require('shared-utils/obj.utils');
const {
    isValidObjectId,
    convertToObjectId,
    sanitizeMongoObject,
} = require('../utils/obj.utils');

/**
 * Repository for CRUD operations on the Session collection.
 * Domain-specific methods accept plain parameters and handle
 * conversion to MongoDB queries internally.
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
     * Creates a new session.
     *
     * @param {Object} sessionData - Plain session data.
     * @returns {Promise<Object>} The created session (deep-frozen).
     */
    async create(sessionData) {
        try {
            const newSession = new this.#model(sessionData);
            await newSession.save();
            return deepFreeze(sanitizeMongoObject(newSession.toObject()));
        } catch (error) {
            console.error('Error creating session:', error);
            throw new Error('Unable to create session');
        }
    }

    /**
     * Finds a session by its ID.
     *
     * @param {string} sessionId
     * @returns {Promise<Object|null>} The session if found.
     */
    async findById(sessionId) {
        if (!isValidObjectId(sessionId)) return null;
        try {
            const session = await this.#model
                .findById(convertToObjectId(sessionId))
                .lean();
            return session ? deepFreeze(sanitizeMongoObject(session)) : null;
        } catch (error) {
            console.error('Error finding session by ID:', error);
            throw new Error('Error finding session by ID');
        }
    }

    /**
     * Finds a session by its domain keys.
     *
     * @param {Object} params - Plain parameters.
     * @param {string} params.userId
     * @param {string} params.ip
     * @param {string} params.browser
     * @param {string} params.os
     * @param {string} params.deviceType
     * @returns {Promise<Object|null>} The session if found.
     */
    async findSessionByKeys({userId, ip, browser, os, deviceType}) {
        const query = {
            userId,
            ip,
            normalizedBrowser: browser,
            normalizedOS: os,
            deviceType,
        };
        try {
            const session = await this.#model.findOne(query).lean();
            return session ? deepFreeze(sanitizeMongoObject(session)) : null;
        } catch (error) {
            console.error('Error finding session:', error);
            throw new Error('Error finding session');
        }
    }

    /**
     * Finds an active session based on domain keys.
     * A session is active if its expiredAt is greater than the provided current time.
     *
     * @param {Object} params - Plain parameters.
     * @param {string} params.userId
     * @param {string} params.ip
     * @param {string} params.browser
     * @param {string} params.os
     * @param {string} params.deviceType
     * @param {Date} params.currentTime
     * @returns {Promise<Object|null>} The active session if found.
     */
    async findActiveSessionByKeys({userId, ip, browser, os, deviceType, currentTime}) {
        const query = {
            userId,
            ip,
            normalizedBrowser: browser,
            normalizedOS: os,
            deviceType,
            expiredAt: {$gt: currentTime},
        };
        try {
            const session = await this.#model.findOne(query).lean();
            return session ? deepFreeze(sanitizeMongoObject(session)) : null;
        } catch (error) {
            console.error('Error finding active session:', error);
            throw new Error('Error finding active session');
        }
    }

    /**
     * Updates a session by its ID.
     *
     * @param {string} sessionId
     * @param {Object} updates - Plain update data.
     * @returns {Promise<Object|null>} The updated session.
     */
    async updateSessionById(sessionId, updates) {
        if (!isValidObjectId(sessionId)) return null;
        try {
            const updatedSession = await this.#model
                .findByIdAndUpdate(convertToObjectId(sessionId), {$set: updates}, {new: true, runValidators: true})
                .lean();
            return updatedSession ? deepFreeze(sanitizeMongoObject(updatedSession)) : null;
        } catch (error) {
            console.error('Error updating session:', error);
            throw new Error('Error updating session');
        }
    }
}

module.exports = new SessionRepository(Session);
