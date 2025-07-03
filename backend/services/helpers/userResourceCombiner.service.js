const {deepFreeze} = require('shared-utils/obj.utils');

class ResourceUserCombiner {
    /**
     * @private
     * @type {import('../repositories/user.repository').UserRepository}
     */
    #userRepo;

    /**
     * @param {Object} dependencies
     * @param {import('../repositories/user.repository').UserRepository} dependencies.userRepo
     */
    constructor({userRepo}) {
        this.#userRepo = userRepo;
    }

    /**
     * @private
     * Static method to combine single resource with user
     * @param {Object} resource - Resource data
     * @param {Object|null} user - User data or null
     * @param {string} [userIdField='userId'] - Field containing user reference
     * @returns {Readonly<Object>} Frozen combined object
     */
    #combine(resource, user, userIdField = 'userId') {
        const {[userIdField]: _, ...resourceData} = resource;
        return deepFreeze({
            ...resourceData,
            user: user ? deepFreeze(user) : null
        });
    }

    /**
     * @private
     * Static method to combine array of resources with users
     * @param {Array} resources - Resource array
     * @param {Array} users - User array
     * @param {string} [userIdField='userId'] - Field containing user reference
     * @returns {Readonly<Array>} Frozen array of combined objects
     */
    #combineAll(resources, users, userIdField = 'userId') {
        const combined = resources.map(resource => {
            const user = users.find(u => u.id === resource[userIdField]?.toString());
            return this.#combine(resource, user, userIdField);
        });
        return deepFreeze(combined.filter(x => x.user !== null));
    }

    /**
     * Instance method to fetch users and combine with resources
     * @param {Array<Object>} resources - Resources to combine
     * @param {Object} [options]
     * @param {string} [options.userIdField='userId'] - Field containing user reference
     * @param {Object} [options.session] - Database session
     * @returns {Promise<Readonly<Array>>} Combined resources with users
     */
    async combineWithUsers(resources, {userIdField = 'userId', session} = {}) {
        if (!resources?.length) return deepFreeze([]);

        const userIds = [...new Set(resources.map(r => r[userIdField]).filter(Boolean))];

        if (!userIds.length) return deepFreeze([]);

        const users = await this.#userRepo.findByIds(userIds, {session});
        return this.#combineAll(resources, users, userIdField);
    }
}

module.exports = ResourceUserCombiner;
