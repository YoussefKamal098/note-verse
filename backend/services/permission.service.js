const statusMessages = require("../constants/statusMessages");

/**
 * Service for managing permissions with transaction support.
 * The service handles UoW sessions, orchestrates repository calls,
 * and transforms exceptions into AppErrors.
 */
class PermissionService {
    /**
     * @private
     * @type {PermissionRepository}
     */
    #permissionRepo;

    /**
     * @private
     * @type {BaseTransactionService}
     */
    #transactionService;

    /**
     * @private
     * @type {ResourceUserCombiner}
     */
    #resourceUserCombiner;

    /**
     * @param {Object} dependencies
     * @param {PermissionRepository} dependencies.permissionRepo
     * @param {BaseTransactionService} dependencies.transactionService
     * @param {ResourceUserCombiner} dependencies.resourceUserCombiner
     */
    constructor({
                    permissionRepo,
                    transactionService,
                    resourceUserCombiner
                }) {
        this.#permissionRepo = permissionRepo;
        this.#transactionService = transactionService;
        this.#resourceUserCombiner = resourceUserCombiner;
    }

    /**
     * Grants permissions to multiple users atomically.
     * @param {Object} params
     * @param {string[]} params.userIds - IDs of users to grant permissions.
     * @param {ResourceType} params.resourceType - Type of the resource.
     * @param {string} params.resourceId - ID of the resource.
     * @param {UserRoleType} params.role - User role
     * @param {string} params.grantedBy - ID of the user who granted the permission
     * @returns {Promise<Readonly<Object[]>>} Array of created permission objects.
     * @throws {AppError} When creation fails.
     */
    async grantPermissions({userIds, resourceType, resourceId, role, grantedBy}) {
        return this.#transactionService.executeTransaction(async (session) => {
            return await this.#permissionRepo.grantPermissionsForUsers({
                userIds,
                resourceType,
                resourceId,
                role,
                grantedBy
            }, session);
        }, {message: statusMessages.PERMISSION_OPERATION_FAILED});
    }

    /**
     * Removes users' permission from a resource atomically.
     * @param {Object} params
     * @param {ResourceType} params.resourceType
     * @param {string} params.resourceId
     * @param {string} params.userId
     * @returns {Promise<boolean>}  True if found false otherwise
     */
    async revokePermission({resourceType, resourceId, userId}) {
        return await this.#permissionRepo.removeUserFromResource({resourceType, resourceId, userId});
    }

    /**
     * Updates a user's permissions for a specific resource atomically.
     * @param {Object} params
     * @param {string} params.userId
     * @param {ResourceType} params.resourceType
     * @param {string} params.resourceId
     * @param {Object} updates
     * @param {UserRoleType} updates.role
     * @returns {Promise<Readonly<Object|null>>} Updated permission or null.
     * @throws {AppError} When update fails.
     */
    async updatePermissions({userId, resourceType, resourceId}, {role}) {
        return this.#transactionService.executeTransaction(async (session) => {
            return await this.#permissionRepo.updateUserPermissions({
                userId,
                resourceType,
                resourceId
            }, {role}, session);
        }, {message: statusMessages.PERMISSION_OPERATION_FAILED});
    }

    /**
     * Retrieves a user's permissions for a resource with user details
     * @param {Object} params
     * @param {string} params.userId - Target user ID
     * @param {ResourceType} params.resourceType - Resource type
     * @param {string} params.resourceId - Resource ID
     * @returns {Promise<Object|null>} Combined permission and user data or null
     * @throws {AppError} When retrieval fails
     */
    async getUserPermission({userId, resourceType, resourceId}) {
        return await this.#permissionRepo.getUserPermission({userId, resourceType, resourceId});
    }

    /**
     * Gets resource users with full user details
     * @param {Object} params
     * @param {string} params.resourceType - Resource type
     * @param {string} params.resourceId - Resource ID
     * @param {Object} options - Pagination options
     * @param {number} [options.limit=10] - Results per page
     * @param {number} [options.page=0] - Page number
     * @returns {Promise<Array<Object>>} Array of { permission, user } objects
     */
    async getResourceUsers({resourceType, resourceId}, {limit = 10, page = 0} = {}) {
        return this.#transactionService.executeTransaction(async (session) => {
            const permissions = await this.#permissionRepo.getResourceUsers(
                {resourceType, resourceId},
                {limit, page},
                session
            );

            return this.#resourceUserCombiner.combineWithUsers(permissions, {session});
        }, {message: statusMessages.PERMISSION_OPERATION_FAILED});
    }

    /**
     * Gets permissions granted by a user with full details
     * @param {string} userId - Granting user ID
     * @param {string} [resourceType] - Optional resource type filter
     * @param {Object} options - Pagination options
     * @param {number} [options.limit=10] - Results per page
     * @param {number} [options.page=0] - Page number
     * @returns {Promise<Array<Object>>} Array of { permission, user } objects
     */
    async getPermissionsGrantedByUser(userId, resourceType, {limit = 10, page = 0} = {}) {
        return this.#transactionService.executeTransaction(async (session) => {
            const permissions = await this.#permissionRepo.getPermissionsGrantedByUser(
                userId,
                resourceType,
                {limit, page},
                session
            );

            return this.#resourceUserCombiner.combineWithUsers(permissions, {session});
        }, {message: statusMessages.PERMISSION_OPERATION_FAILED});
    }
}

module.exports = PermissionService;
