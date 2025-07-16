const BaseResourceCombiner = require('./baseResourceCombiner.service');
const {deepFreeze} = require('shared-utils/obj.utils');

/**
 * Combines resources with their related user documents
 * @extends BaseResourceCombiner<Readonly<OutputUser>>
 */
class ResourceUserCombiner extends BaseResourceCombiner {
    /**
     * @private
     * @type {import('@/repositories/user.repository').UserRepository}
     */
    #userRepo;

    /**
     * Creates a new ResourceUserCombiner instance
     * @param {Object} dependencies
     * @param {import('@/repositories/user.repository').UserRepository} dependencies.userRepo
     */
    constructor({userRepo}) {
        super();
        this.#userRepo = userRepo;
    }

    /**
     * Combines resources with their user documents
     *
     * @param {Array<Object>} resources - Resources to combine with users
     * @param {Object} [options] - Configuration options
     * @param {string} [options.userIdField='userId'] - Field containing user reference
     * @param {Object|string} [options.projection] - Fields to include from users
     * @param {import('mongoose').ClientSession} [options.session] - MongoDB session
     * @returns {Promise<Readonly<Array<Readonly<Object>>>>} Frozen array of resources with users attached
     *
     * @example
     * await combiner.combineWithUsers(
     *   [{id: '1', userId: 'u1'}, {id: '2', payload: {userId: 'u2'}}],
     *   {userIdField: 'payload.userId', projection: {name: 1}}
     * )
     */
    async combineWithUsers(resources, {userIdField = 'userId', projection = null, session = null} = {}) {
        if (!resources?.length) return deepFreeze([]);

        const userIds = [
            ...new Set(resources.map(r => this._extractNestedId(r, userIdField)).filter(Boolean))
        ];

        if (!userIds.length) return deepFreeze([]);

        const users = await this.#userRepo.findByIds(userIds, {projection, session});
        return this._combineAll(resources, users, userIdField, 'user');
    }

    /**
     * Combines a single resource with its user document
     *
     * @param {Object} resource - The resource to combine with user
     * @param {Object} [options] - Configuration options
     * @param {string} [options.userIdField='userId'] - Field containing user reference
     * @param {Object|string} [options.projection] - Fields to include from user
     * @param {import('mongoose').ClientSession} [options.session] - MongoDB session
     * @returns {Promise<Readonly<Object>>} Frozen combined object with user
     *
     * @example
     * await combiner.combineWithSingleUser(
     *   {id: '1', userId: 'u1'},
     *   {userIdField: 'userId', projection: {name: 1}}
     * )
     */
    async combineWithSingleUser(resource, {userIdField = 'userId', projection = null, session = null} = {}) {
        if (!resource) return null;

        const userId = this._extractNestedId(resource, userIdField);
        if (!userId) return null;

        const user = await this.#userRepo.findById(userId, {projection, session});
        return this._combineSingle(resource, user, userIdField, 'user');
    }
}

module.exports = ResourceUserCombiner;
