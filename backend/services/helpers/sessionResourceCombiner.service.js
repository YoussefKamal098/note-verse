const BaseResourceCombiner = require('./baseResourceCombiner.service');
const {deepFreeze} = require('shared-utils/obj.utils');

/**
 * Combines resources with their related session documents
 * @extends BaseResourceCombiner<Readonly<OutputSession>>
 */
class ResourceSessionCombiner extends BaseResourceCombiner {
    /**
     * @private
     * @type {import('@/repositories/session.repository')} SessionRepository
     */
    #sessionRepo;

    /**
     * Creates a new ResourceSessionCombiner instance
     * @param {Object} dependencies
     * @param {import('@/repositories/session.repository')} dependencies.sessionRepo
     */
    constructor({sessionRepo}) {
        super();
        this.#sessionRepo = sessionRepo;
    }

    /**
     * Combines resources with their session documents
     *
     * @param {Array<Object>} resources - Resources to combine with sessions
     * @param {Object} [options] - Configuration options
     * @param {string} [options.sessionIdField='sessionId'] - Field containing session reference
     * @param {Object|string} [options.projection] - Fields to include from sessions
     * @param {import('mongoose').ClientSession} [options.session] - MongoDB session
     * @returns {Promise<Readonly<Array<Readonly<Object>>>>} Frozen array of resources with sessions attached
     */
    async combineWithSessions(resources, {sessionIdField = 'sessionId', projection = null, session = null} = {}) {
        if (!resources?.length) return deepFreeze([]);

        const sessionIds = [
            ...new Set(resources.map(r => this._extractNestedId(r, sessionIdField)).filter(Boolean))
        ];

        if (!sessionIds.length) return deepFreeze([]);

        const sessions = await this.#sessionRepo.findByIds(sessionIds, {projection, session});
        return this._combineAll(resources, sessions, sessionIdField, 'session');
    }

    /**
     * Combines a single resource with its session document
     *
     * @param {Object} resource - The resource to combine with session
     * @param {Object} [options] - Configuration options
     * @param {string} [options.sessionIdField='sessionId'] - Field containing session reference
     * @param {Object|string} [options.projection] - Fields to include from session
     * @param {import('mongoose').ClientSession} [options.session] - MongoDB session
     * @returns {Promise<Readonly<Object>>} Frozen combined object with session
     */
    async combineWithSingleSession(resource, {sessionIdField = 'sessionId', projection = null, session = null} = {}) {
        if (!resource) return null;

        const sessionId = this._extractNestedId(resource, sessionIdField);
        if (!sessionId) return null;

        const sessionDoc = await this.#sessionRepo.findById(sessionId, {session, projection});
        return this._combineSingle(resource, sessionDoc, sessionIdField, 'session');
    }
}

module.exports = ResourceSessionCombiner;
