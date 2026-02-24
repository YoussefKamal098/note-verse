const {isValidObjectId, convertToObjectId, sanitizeMongoObject} = require('@/utils/obj.utils');
const {deepFreeze} = require('shared-utils/obj.utils');
const dbErrorCodes = require("@/constants/dbErrorCodes");

/**
 * Repository for managing Permission documents with transaction support
 * @class PermissionRepository
 */
class PermissionRepository {
    /**
     * @private
     * @type {import('mongoose').Model}
     * @description The Mongoose model used for permission operations.
     */
    #model;

    constructor(model) {
        this.#model = model;
    }

    /**
     * Sanitizes permission MongoDB documents
     * @private
     * @param {Object|Array<Object>} permission - Permission document(s) from MongoDB
     * @returns {Object|Array<Object>} Sanitized permission object(s)
     */
    #sanitizePermission(permission) {
        const sanitize = doc => ({
            ...sanitizeMongoObject(doc),
            ...(doc.userId ? {userId: doc.userId.toString()} : {}),
            ...(doc.grantedBy ? {grantedBy: doc.grantedBy.toString()} : {}),
            resourceId: doc.resourceId.toString()
        });

        return Array.isArray(permission)
            ? permission.map(sanitize)
            : sanitize(permission);
    }

    /**
     * get Sort options
     * @private
     * @returns {Object}  Sort options
     */
    #getSortOptions() {
        return {
            updatedAt: -1,
            createdAt: -1
        }
    }

    /**
     * Creates or updates permissions for multiple users in bulk with transaction support
     * @param {Object} params
     * @param {Array<string>} params.userIds - Array of user IDs to grant permissions to
     * @param {ResourceType} params.resourceType - Resource type from resources enum
     * @param {string} params.resourceId - ID of the target resource
     * @param {UserRoleType} params.role - User role
     * @param {string} params.grantedBy - ID of the user who granted the permission
     * @param {import('mongoose').ClientSession} [session] - MongoDB transaction session
     * @returns {Promise<Array<Readonly<Object>>>} Array of created/updated permissions
     */
    async grantPermissionsForUsers({
                                       userIds,
                                       resourceType,
                                       resourceId,
                                       role,
                                       grantedBy
                                   }, session = null) {
        try {
            const resourceObjectId = convertToObjectId(resourceId);
            const grantedByObjectId = convertToObjectId(grantedBy);
            const permissions = [];

            // Process each user individually
            for (const userId of userIds) {
                const userObjectId = convertToObjectId(userId);

                // First try to find existing permission
                const existing = await this.#model.findOne({
                    resourceId: resourceObjectId,
                    resourceType,
                    userId: userObjectId,
                    grantedBy: grantedByObjectId
                }, null, {session});

                if (existing) {
                    // Update existing permission
                    existing.role = role;
                    await existing.save({session});
                    permissions.push(existing);
                } else {
                    // Create new permission
                    const newPermission = await this.#model.create([{
                        resourceId: resourceObjectId,
                        resourceType,
                        userId: userObjectId,
                        grantedBy: grantedByObjectId,
                        role,
                    }], {session});

                    permissions.push(newPermission[0]);
                }
            }

            return deepFreeze(this.#sanitizePermission(permissions.map(doc => doc.toObject())));
        } catch (error) {
            if (error.code === dbErrorCodes.DUPLICATE_KEY) {
                const conflictError = new Error('Duplicate permission detected');
                conflictError.code = dbErrorCodes.DUPLICATE_KEY;
                throw conflictError;
            }

            console.error("Permission operation failed:", error);
            throw new Error(`Failed to process permissions: ${error.message}`);
        }
    }

    /**
     * Removes permissions for multiple users on a specific resource with transaction support
     * @param {Object} params
     * @param {ResourceType} params.resourceType - Type of resource
     * @param {string} params.resourceId - ID of the target resource
     * @param {string} params.userId - Array of user IDs to remove
     * @param {import('mongoose').ClientSession} [session] - MongoDB transaction session
     * @returns {Promise<boolean>}  True if found false otherwise
     */
    async removeUserFromResource({
                                     resourceType,
                                     resourceId,
                                     userId
                                 }, session = null) {
        try {
            const result = await this.#model.deleteOne({
                resourceId: convertToObjectId(resourceId),
                resourceType,
                userId: convertToObjectId(userId)
            }, {session});

            return result.deletedCount === 1;
        } catch (error) {
            console.error("Permission removal failed:", error);
            throw new Error(`Failed to remove permissions: ${error.message}`);
        }
    }

    /**
     * Updates a user's permissions for a specific resource with transaction support
     * @param {Object} params
     * @param {string} params.userId - Target user ID
     * @param {ResourceType} params.resourceType - Resource type
     * @param {string} params.resourceId - Resource ID
     * @param {Object} updates
     * @param {UserRoleType} updates.role
     * @param {import('mongoose').ClientSession} [session] - MongoDB transaction session
     * @returns {Promise<Readonly<Object|null>>} Updated permission document
     */
    async updateUserPermissions({
                                    userId,
                                    resourceType,
                                    resourceId,
                                }, {role}, session = null) {
        if (!isValidObjectId(userId) || !isValidObjectId(resourceId)) return null;

        const update = {role};

        try {
            const updated = await this.#model.findOneAndUpdate(
                {
                    resourceId: convertToObjectId(resourceId),
                    resourceType,
                    userId: convertToObjectId(userId)
                },
                {$set: update},
                {new: true, runValidators: true, session}
            ).lean();

            return updated ? deepFreeze(this.#sanitizePermission(updated)) : null;
        } catch (error) {
            console.error("Permission update failed:", error);
            throw new Error(`Failed to update permissions: ${error.message}`);
        }
    }

    /**
     * Retrieves permissions for a specific user-resource combination with transaction support
     * @param {Object} params
     * @param {string} params.userId - Target user ID
     * @param {ResourceType} params.resourceType - Resource type filter
     * @param {string} params.resourceId - Resource ID filter
     * @param {import('mongoose').ClientSession} [session] - MongoDB transaction session
     * @returns {Promise<Readonly<Object|null>>} Permission document or null
     */
    async getUserPermission(
        {userId, resourceType, resourceId},
        session = null
    ) {
        if (!isValidObjectId(userId) || !isValidObjectId(resourceId)) return null;

        const query = {
            resourceId: convertToObjectId(resourceId),
            resourceType,
            userId: convertToObjectId(userId)
        };

        try {
            const permission = await this.#model
                .findOne(query)
                .session(session)
                .lean({virtuals: true});

            if (!permission) return null;

            return deepFreeze(this.#sanitizePermission(permission));
        } catch (error) {
            console.error("Permission retrieval failed:", error);
            throw new Error(`Failed to get user permissions: ${error.message}`);
        }
    }

    /**
     * Retrieves allowed resource IDs for a user based on role and resource type.
     * Uses Redis caching to improve performance for frequent lookups.
     *
     * @param {Object} params
     * @param {string} params.userId - ID of the user
     * @param {ResourceType} params.resourceType - Type of resource, e.g., 'note'
     * @param {Object} [options] - session options
     * @param {import('mongoose').ClientSession} [session] - MongoDB transaction session
     * @returns {Promise<Array<string>>} - Array of allowed resource IDs as strings
     */
    async getAllowedResourceIds({userId, resourceType}, {session = null}) {
        if (!isValidObjectId(userId)) return [];

        return await this.#model.find({
            userId: convertToObjectId(userId),
            resourceType
        }).distinct('resourceId').session(session);
    }

    /**
     * Retrieves a paginated list of users with access to a specific resource, with optional transaction support.
     *
     * @param {Object} params                          - Query parameters
     * @param {ResourceType} params.resourceType       - Type of resource to check
     * @param {string} params.resourceId               - ID of the resource to check
     * @param {Object} [options]                       - Pagination and session options
     * @param {number} [options.limit=10]              - Maximum number of records to return per page
     * @param {number} [options.page=0]                - Zero-based page number (skips page * limit docs)
     * @param {import('mongoose').ClientSession} [session] - MongoDB transaction session
     * @returns {Promise<Readonly<Array<Object>>>}       - A frozen array of user access documents
     */
    async getResourceUsers({resourceType, resourceId}, {limit = 10, page = 0} = {}, session = null) {
        if (!isValidObjectId(resourceId)) return [];

        const query = {resourceId: convertToObjectId(resourceId), resourceType};
        const skip = page * limit;

        try {
            const perms = await this.#model
                .find(query)
                .sort(this.#getSortOptions())
                .skip(skip)
                .limit(limit)
                .session(session)
                .lean({virtuals: true})

            return deepFreeze(perms.map(perm => this.#sanitizePermission(perm)));
        } catch (error) {
            console.error("Resource user retrieval failed:", error);
            throw new Error(`Failed to get resource users: ${error.message}`);
        }
    }

    /**
     * Retrieves a paginated list of permissions granted by a specific user, with optional resource type filter and transaction support.
     *
     * @param {string} userId                          - ID of the granting user
     * @param {ResourceType} [resourceType]            - Optional filter for resource type
     * @param {Object} [options]                       - Pagination and session options
     * @param {number} [options.limit=10]              - Maximum number of records to return per page
     * @param {number} [options.page=0]                - Zero-based page number (skips page * limit docs)
     * @param {import('mongoose').ClientSession} [session] - MongoDB transaction session
     * @returns {Promise<Readonly<Array<Object>>>}        - A frozen array of sanitized permission objects
     * @throws {Error}                                  - If the user ID is invalid or the query fails
     */
    async getPermissionsGrantedByUser(userId, resourceType, {limit = 10, page = 0} = {}, session = null) {
        if (!isValidObjectId(userId)) return [];

        const query = {grantedBy: convertToObjectId(userId)};
        if (resourceType) query.resourceType = resourceType;

        try {
            const skip = page * limit;

            const perms = await this.#model
                .find(query)
                .sort(this.#getSortOptions())
                .skip(skip)
                .limit(limit)
                .session(session)
                .lean({virtuals: true});

            return deepFreeze(perms.map(perm => this.#sanitizePermission(perm)));
        } catch (error) {
            console.error("Granted permissions retrieval failed:", error);
            throw new Error(`Failed to get granted permissions: ${error.message}`);
        }
    }
}

module.exports = PermissionRepository;
