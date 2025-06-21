const AppError = require('../errors/app.error');
const httpCodes = require('../constants/httpCodes');
const statusMessages = require('../constants/statusMessages');
const {deepFreeze} = require('shared-utils/obj.utils');
const dbErrorCodes = require("../constants/dbErrorCodes");

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
     * @type {UserRepository}
     */
    #userRepo;
    /**
     * @private
     * @type {IUnitOfWork}
     */
    #uow;

    /**
     * @param {PermissionRepository} permissionRepo - Repository for permission operations.
     * @param {UserRepository} userRepo - Repository for user operations.
     * @param {IUnitOfWork} uow - Unit of Work for transaction management.
     */
    constructor(permissionRepo, userRepo, uow) {
        this.#permissionRepo = permissionRepo;
        this.#userRepo = userRepo;
        this.#uow = uow;
    }

    /**
     * @private
     * Executes a transaction with proper error handling
     * @param {Function} operation - The operation to perform within the transaction
     * @returns {Promise<any>} The result of the operation
     * @throws {AppError} When the operation fails
     */
    async #executeTransaction(operation) {
        const session = await this.#uow.begin();
        try {
            const result = await operation(session);
            await this.#uow.commit(session);
            return result;
        } catch (err) {
            await this.#uow.rollback(session);
            if (err.code === dbErrorCodes.DUPLICATE_KEY) {
                throw new AppError(
                    err.message,
                    httpCodes.CONFLICT.code,
                    httpCodes.CONFLICT.name
                );
            }

            throw new AppError(
                statusMessages.PERMISSION_OPERATION_FAILED,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }
    }

    /**
     * @private
     * Combines permission data with user data and freezes the result
     * @param {Object} permission - The permission data
     * @param {Object|null} user - The user data or null
     * @returns {Readonly<Object>} The combined and frozen result
     */
    #combinePermissionWithUser(permission, user) {
        const {userId: _, ...permissionData} = permission;
        const result = {
            ...permissionData,
            user: user ? deepFreeze(user) : null
        };
        return deepFreeze(result);
    }

    /**
     * @private
     * Combines an array of permissions with their corresponding users and freezes the result
     * @param {ReadonlyArray<Object>} permissions - Array of permission data
     * @param {ReadonlyArray<Object>} users - Array of user data
     * @returns {Readonly<Array<Object>>} The combined and frozen result array
     */
    #combinePermissionsWithUsers(permissions, users) {
        const result = permissions.map(permission => {
            const user = users.find(u => u.id === permission.userId.toString());
            return this.#combinePermissionWithUser(permission, user || null);
        });

        return deepFreeze(result);
    }

    /**
     * @private
     * Fetches users for permissions and combines them into a frozen result
     * @param {ReadonlyArray<Object>} permissions - Array of permission data
     * @param {Object} session - The database session
     * @returns {Promise<Readonly<Array<Object>>>} Combined and frozen permissions with users
     */
    async #getPermissionsWithUsers(permissions, session) {
        if (permissions.length === 0) {
            return deepFreeze([]);
        }

        const userIds = [...new Set(permissions.map(p => p.userId))];
        const users = await this.#userRepo.findByIds(userIds, {session});
        return this.#combinePermissionsWithUsers(permissions, users);
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
        return this.#executeTransaction(async (session) => {
            return await this.#permissionRepo.grantPermissionsForUsers({
                userIds,
                resourceType,
                resourceId,
                role,
                grantedBy
            }, session);
        });
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
        return this.#executeTransaction(async (session) => {
            return await this.#permissionRepo.updateUserPermissions({
                userId,
                resourceType,
                resourceId
            }, {role}, session);
        });
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
        return this.#executeTransaction(async (session) => {
            const permissions = await this.#permissionRepo.getResourceUsers(
                {resourceType, resourceId},
                {limit, page},
                session
            );

            return this.#getPermissionsWithUsers(permissions, session);
        });
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
        return this.#executeTransaction(async (session) => {
            const permissions = await this.#permissionRepo.getPermissionsGrantedByUser(
                userId,
                resourceType,
                {limit, page},
                session
            );

            return this.#getPermissionsWithUsers(permissions, session);
        });
    }
}

module.exports = PermissionService;
