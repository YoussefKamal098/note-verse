const AppError = require('../errors/app.error');
const httpCodes = require('../constants/httpCodes');
const statusMessages = require('../constants/statusMessages');
const {deepFreeze} = require("shared-utils/obj.utils");

/**
 * Service for managing note versions with transaction support.
 * Handles version creation, restoration, and history tracking with proper transaction management.
 */
class VersionService {
    /**
     * @private
     * @type {VersionRepository}
     */
    #versionRepo;

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
     * @param {VersionRepository} dependencies.versionRepo
     * @param {BaseTransactionService} dependencies.transactionService
     * @param {ResourceUserCombiner} dependencies.resourceUserCombiner
     */
    constructor({versionRepo, transactionService, resourceUserCombiner}) {
        this.#versionRepo = versionRepo;
        this.#transactionService = transactionService;
        this.#resourceUserCombiner = resourceUserCombiner;
    }

    /**
     * Creates a new version of a note
     * @param {Object} params
     * @param {string} params.noteId - ID of the note being versioned
     * @param {string} params.oldContent - Previous content of the note
     * @param {string} params.newContent - New content of the note
     * @param {string} params.userId - ID of the user creating the version
     * @param {string} params.message - Version description message
     * @returns {Promise<Readonly<Object>|null>} Created version document or null if content unchanged
     * @throws {AppError} When version creation fails
     */
    async createVersion({noteId, oldContent, newContent, userId, message}) {
        return this.#transactionService.executeTransaction(async (session) => {
            return await this.#versionRepo.createVersion({
                noteId,
                oldContent,
                newContent,
                userId,
                message
            }, {session});
        }, {
            message: statusMessages.VERSION_OPERATION_FAILED,
            conflictMessage: statusMessages.VERSION_CONFLICT
        });
    }

    /**
     * Restores a note to a specific version and returns both the new version and restored content
     * @param {Object} params
     * @param {string} params.versionId - ID of the version to restore to
     * @param {string} params.userId - ID of the user performing the restore
     * @returns {Promise<{version: Readonly<Object>, content: string}|null>} Restoration result or null if version not found
     * @throws {AppError} When restoration fails
     */
    async restoreVersion({versionId, userId}) {
        return this.#transactionService.executeTransaction(async (session) => {
                return await this.#versionRepo.restoreVersion({
                    versionId,
                    userId
                }, {session});
            },
            {message: statusMessages.VERSION_OPERATION_FAILED}
        );
    }

    /**
     * Gets a specific version by ID
     * @param {string} versionId - ID of the version to retrieve
     * @param {Object} [options] - Options
     * @param {Object|string} [options.projection] - Fields to include/exclude
     * @returns {Promise<Readonly<Object>|null>} Version document or null if not found
     * @throws {AppError} When retrieval fails
     */
    async getVersion(versionId, {projection = null} = {}) {
        try {
            return await this.#versionRepo.getVersion(versionId, {projection});
        } catch (err) {
            throw new AppError(
                'Failed to retrieve version',
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }
    }

    /**
     * Gets the content of a specific version
     * @param {string} versionId - ID of the version to get content for
     * @returns {Promise<string|null>} Reconstructed content or null if version not found
     * @throws {AppError} When content reconstruction fails
     */
    async getVersionContent(versionId) {
        return this.#transactionService.executeTransaction(async (session) => {
            return await this.#versionRepo.getVersionContent(versionId, {session});
        });
    }

    /**
     * Gets the commit history for a note with pagination
     * @param {Object} params
     * @param {string} params.noteId - ID of the note
     * @param {Object} [options] - Options
     * @param {number} [options.limit=10] - Results per page
     * @param {number} [options.page=0] - Page number (0-based)
     * @param {Object|string} [options.projection] - Fields to include/exclude
     * @returns {Promise<Readonly<Array<Object>>>} Array of commit history objects (empty if none found)
     * @throws {AppError} When history retrieval fails
     */
    async getCommitHistory({noteId}, {limit = 10, page = 0, projection = null} = {}) {
        try {
            const versions = await this.#versionRepo.getCommitHistory(
                {noteId},
                {limit, page, projection}
            );

            return this.#resourceUserCombiner.combineWithUsers(
                versions,
                {userIdField: 'createdBy', projection: {createdAt: 0, updatedAt: 0}} // Using createdBy field for user reference
            );
        } catch (err) {
            throw new AppError(
                'Failed to retrieve commit history',
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }
    }

    /**
     * Gets contributors for a note with their commit counts
     * @param {Object} params
     * @param {string} params.noteId - ID of the note
     * @param {Object} [options] - Options
     * @param {number} [options.limit=10] - Results per page
     * @param {number} [options.page=0] - Page number (0-based)
     * @returns {Promise<Readonly<Array<Object>>>} Array of contributor objects (empty if none found)
     * @throws {AppError} When contributor retrieval fails
     */
    async getContributors({noteId}, {limit = 10, page = 0} = {}) {
        try {
            const {contributors, totalContributors} = await this.#versionRepo.getContributors(
                {noteId},
                {limit, page}
            );

            const contributorsWithUsers = await this.#resourceUserCombiner.combineWithUsers(
                contributors, {userIdField: 'userId', projection: {createdAt: 0, updatedAt: 0}} // Using userId field for user reference
            );

            return deepFreeze({
                contributors: contributorsWithUsers,
                totalContributors
            })
        } catch (err) {
            throw new AppError(
                'Failed to retrieve contributors',
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }
    }

    /**
     * Gets commits by a specific user for a specific note
     * @param {Object} params
     * @param {string} params.userId - ID of the user
     * @param {string} params.noteId - ID of the note
     * @param {Object} [options] - Options
     * @param {number} [options.limit=10] - Results per page
     * @param {number} [options.page=0] - Page number (0-based)
     * @param {Object|string} [options.projection] - Fields to include/exclude
     * @returns {Promise<Readonly<Array<Object>>>} Array of version documents (empty if none found)
     * @throws {AppError} When commit retrieval fails
     */
    async getUserCommitsForNote({userId, noteId}, {limit = 10, page = 0, projection = null} = {}) {
        try {
            return await this.#versionRepo.getUserCommitsForNote(
                {userId, noteId},
                {limit, page, projection}
            );
        } catch (err) {
            throw new AppError(
                'Failed to retrieve user commits',
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }
    }
}

module.exports = VersionService;
