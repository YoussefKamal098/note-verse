const diff = require('diff');
const {isValidObjectId, convertToObjectId, sanitizeMongoObject} = require('../utils/obj.utils');
const {deepFreeze} = require('shared-utils/obj.utils');
const dbErrorCodes = require("../constants/dbErrorCodes");

/**
 * Repository for managing Version documents with transaction support
 * @class VersionRepository
 */
class VersionRepository {
    /**
     * @private
     * @type {import('mongoose').Model}
     * @description The Mongoose model used for version operations
     */
    #model;

    constructor(model) {
        this.#model = model;
    }

    /**
     * Sanitizes version MongoDB documents
     * @private
     * @param {Object|Array<Object>} version - Version document(s) from MongoDB
     * @returns {Object|Array<Object>} Sanitized version object(s)
     */
    #sanitizeVersion(version) {
        const sanitize = doc => ({
            ...sanitizeMongoObject(doc),
            ...(doc.id ? {id: doc.id.toString()} : {}),
            ...(doc.noteId ? {noteId: doc.noteId.toString()} : {}),
            ...(doc.createdBy ? {createdBy: doc.createdBy.toString()} : {}),
            ...(doc.previousVersion ? {previousVersion: doc.previousVersion.toString()} : {})
        });

        return Array.isArray(version)
            ? version.map(sanitize)
            : sanitize(version);
    }

    /**
     * Normalize content for diffing by:
     * - Removing all trailing whitespace (spaces, tabs, newlines)
     * - Ensuring the content ends with exactly one newline (`\n`)
     *
     * This prevents false-positive diffs caused by inconsistent trailing whitespace
     * or missing final newlines.
     *
     * @param {string} str - The input content string to normalize
     * @returns {string} - The normalized content with consistent trailing newline
     */
    #normalizeContent(str) {
        return str.replace(/\s+$/, '') + '\n';
    }

    /**
     * Creates a new version of a note
     * @param {Object} params
     * @param {string} params.noteId - ID of the note being versioned
     * @param {string} params.oldContent - Previous content of the note
     * @param {string} params.newContent - New content of the note
     * @param {string} params.userId - ID of the user creating the version
     * @param {string} params.message - Version message/description
     * @param {Object} [options] - Options
     * @param {import('mongoose').ClientSession} [options.session] - MongoDB transaction session
     * @returns {Promise<Readonly<Object>|null>} The created version document or null if content unchanged
     */
    async createVersion({
                            noteId,
                            oldContent,
                            newContent,
                            userId,
                            message
                        }, {session = null} = {}) {
        try {
            oldContent = oldContent ? this.#normalizeContent(oldContent) : oldContent;
            newContent = newContent ? this.#normalizeContent(newContent) : newContent;

            if (oldContent === newContent) return null;

            // Get the previous version ID
            const previousVersion = await this.#model.findOne(
                {noteId: convertToObjectId(noteId)},
                {_id: 1},
                {sort: {createdAt: -1}, session}
            );

            // Create the diff patch
            const patch = diff.createPatch('content.md', oldContent, newContent);

            // Create the new version
            const [version] = await this.#model.create([{
                noteId: convertToObjectId(noteId),
                createdBy: convertToObjectId(userId),
                patch,
                message,
                previousVersion: previousVersion?._id || null
            }], {session});

            return deepFreeze(this.#sanitizeVersion(version.toObject()));
        } catch (error) {
            if (error.code === dbErrorCodes.DUPLICATE_KEY) {
                const conflictError = new Error('Duplicate version detected');
                conflictError.code = dbErrorCodes.DUPLICATE_KEY;
                throw conflictError;
            }

            console.error("Version operation failed:", error);
            throw new Error(`Failed to process versions: ${error.message}`);
        }
    }

    /**
     * Restores a note to a specific version
     * @param {Object} params
     * @param {string} params.versionId - ID of the version to restore to
     * @param {string} params.userId - ID of the user performing the restore
     * @param {Object} [options] - Options
     * @param {import('mongoose').ClientSession} [options.session] - MongoDB transaction session
     * @returns {Promise<{version: Readonly<Object | null>, content: string}|null>} Restoration result or null if version not found
     */
    async restoreVersion({
                             versionId,
                             userId
                         }, {session = null} = {}) {
        try {
            const version = await this.#model.findById(convertToObjectId(versionId)).session(session);
            if (!version) return null;
            const versionContent = await this.getVersionContent(versionId, {session});
            if (!versionContent) return null;

            // Get current content (would come from Note model in practice)
            const currentVersion = await this.#model.findOne(
                {noteId: version.noteId},
                {_id: 1},
                {sort: {createdAt: -1}, session}
            );

            const currentContent = currentVersion
                ? await this.getVersionContent(currentVersion._id, {session})
                : '';

            // Create a new version representing the restore
            const lastestVersion = await this.createVersion({
                noteId: version.noteId,
                oldContent: currentContent,
                newContent: versionContent,
                userId,
                message: `This version is restored from version \`${versionId}\``
            }, {session});

            return Object.freeze({
                version: deepFreeze(lastestVersion),
                content: versionContent
            });
        } catch (error) {
            if (error.code === dbErrorCodes.DUPLICATE_KEY) {
                throw new Error('Duplicate version detected');
            }
            console.error(`[VersionRepository] Failed to restore version ${versionId}:`, error);
            throw new Error('Failed to restore version. Please try again later');
        }
    }

    /**
     * Gets a specific version by ID
     * @param {string} versionId - ID of the version to retrieve
     * @param {Object} [options] - Options
     * @param {import('mongoose').ClientSession} [options.session] - MongoDB transaction session
     * @param {Object|string} [options.projection] - MongoDB projection
     * @returns {Promise<Readonly<OutputVersion|null>>} The version document or null if not found
     */
    async getVersion(versionId, {session = null, projection = null} = {}) {
        if (!isValidObjectId(versionId)) return null;
        try {
            const query = this.#model
                .findById(convertToObjectId(versionId))
                .session(session);

            if (projection) query.select(projection);

            const version = await query.lean();
            return version ? deepFreeze(this.#sanitizeVersion(version)) : null;
        } catch (error) {
            console.error(`[VersionRepository] Failed to get version ${versionId}:`, error);
            throw new Error('Failed to retrieve version. Please try again later');
        }
    }

    /**
     * Gets the content of a specific version by reconstructing from patches
     * @param {string} versionId - ID of the version to get content for
     * @param {Object} [options] - Options
     * @param {import('mongoose').ClientSession} [options.session] - MongoDB transaction session
     * @returns {Promise<string|null>} The reconstructed content or null if version not found
     */
    async getVersionContent(versionId, {session = null} = {}) {
        if (!isValidObjectId(versionId)) return null;

        // Get all versions in the chain (oldest first)
        const versionChain = [];
        let currentVersionId = convertToObjectId(versionId);
        try {
            while (currentVersionId) {
                const version = await this.#model
                    .findById(currentVersionId)
                    .select('patch previousVersion')
                    .session(session)
                    .lean();

                if (!version) return null;

                versionChain.unshift(version);
                currentVersionId = version.previousVersion;
            }

            // Reconstruct content by applying patches sequentially
            let content = '';
            for (const version of versionChain) {
                const result = diff.applyPatch(content, version.patch);
                if (result === false) {
                    throw new Error(`Failed to apply patch for version ${version._id}`);
                }
                content = result;
            }

            return content;
        } catch (error) {
            console.error(`[VersionRepository] Failed to get content for version ${versionId}:`, error);
            throw new Error('Failed to reconstruct version content. Please try again later');
        }
    }

    /**
     * Gets the commit history for a note with pagination
     * @param {Object} params
     * @param {string} params.noteId - ID of the note to get history for
     * @param {Object} [options] - Options
     * @param {number} [options.limit=10] - Maximum number of records to return
     * @param {number} [options.page=0] - Zero-based page number
     * @param {import('mongoose').ClientSession} [options.session] - MongoDB transaction session
     * @param {Object|string} [options.projection] - MongoDB projection
     * @returns {Promise<Readonly<Array<Object>>>} Array of commits objects (empty if none found)
     */
    async getCommitHistory({noteId}, {limit = 10, page = 0, session = null, projection = null} = {}) {
        if (!isValidObjectId(noteId)) return deepFreeze([]);

        try {
            const skip = page * limit;
            const pipeline = [
                {
                    $match: {
                        noteId: convertToObjectId(noteId),
                        previousVersion: {$ne: null}
                    }
                },
                {$sort: {createdAt: -1}},
                {$skip: skip},
                {$limit: limit},
                {
                    $project: {
                        id: '$_id',
                        _id: 0,
                        createdAt: 1,
                        createdBy: 1,
                        message: 1,
                        size: 1,
                        isInitial: {$eq: ['$previousVersion', null]},
                        ...(projection || {})
                    }
                }
            ];

            const history = await this.#model.aggregate(pipeline).session(session);
            return deepFreeze(history.map(h => this.#sanitizeVersion(h)));
        } catch (error) {
            console.error(`[VersionRepository] Failed to get commit history for note ${noteId}:`, error);
            throw new Error('Failed to retrieve commit history. Please try again later');
        }
    }

    /**
     * Gets contributors for a note with their commit counts
     * @param {Object} params
     * @param {string} params.noteId - ID of the note to get contributors for
     * @param {Object} [options] - Options
     * @param {number} [options.limit=10] - Maximum number of records to return
     * @param {number} [options.page=0] - Zero-based page number
     * @param {import('mongoose').ClientSession} [options.session] - MongoDB transaction session
     * @returns {Promise<Readonly<{contributors: Array<{
     *      userId: string,
     *      commitCount: number,
     *      lastCommitAt: Date
     *  }>, totalContributors: number}>>} Object containing paginated contributors array and total count
     */
    async getContributors({noteId}, {limit = 10, page = 0, session = null} = {}) {
        if (!isValidObjectId(noteId)) return deepFreeze([]);

        try {
            const skip = page * limit;
            const result = await this.#model.aggregate([
                // Match documents for this note
                {$match: {noteId: convertToObjectId(noteId), previousVersion: {$ne: null}}},

                // First group by user to get commit counts
                {
                    $group: {
                        _id: '$createdBy',
                        commitCount: {$sum: 1},
                        lastCommitAt: {$max: '$createdAt'}
                    }
                },

                // Create two parallel pipelines using $facet
                {
                    $facet: {
                        // Pipeline for paginated results
                        paginatedResults: [
                            {$sort: {commitCount: -1, lastCommitAt: -1}},
                            {$skip: skip},
                            {$limit: limit},
                            {
                                $project: {
                                    userId: '$_id',
                                    _id: 0,
                                    commitCount: 1,
                                    lastCommitAt: 1
                                }
                            }
                        ],
                        // Pipeline for total count
                        totalCount: [
                            {$count: 'totalContributors'}
                        ]
                    }
                },

                // Reshape the output
                {
                    $project: {
                        contributors: '$paginatedResults',
                        totalContributors: {
                            $ifNull: [{$arrayElemAt: ['$totalCount.totalContributors', 0]}, 0]
                        }
                    }
                }
            ]).session(session);

            const formattedResult = {
                contributors: result[0]?.contributors?.map(c => ({
                    ...this.#sanitizeVersion(c),
                    userId: c.userId.toString()
                })) || [],
                totalContributors: result[0]?.totalContributors || 0
            };

            return deepFreeze(formattedResult);
        } catch (error) {
            console.error(`[VersionRepository] Failed to get contributors for note ${noteId}:`, error);
            throw new Error('Failed to retrieve contributors. Please try again later');
        }
    }

    /**
     * Gets commits by a specific user for a specific note with pagination
     * @param {Object} params
     * @param {string} params.userId - ID of the user to filter by
     * @param {string} params.noteId - ID of the note to filter by
     * @param {Object} [options] - Options
     * @param {number} [options.limit=10] - Maximum number of records to return
     * @param {number} [options.page=0] - Zero-based page number
     * @param {import('mongoose').ClientSession} [options.session] - MongoDB transaction session
     * @param {Object|string} [options.projection] - MongoDB projection
     * @returns {Promise<Readonly<Array<Object>>>} Array of version documents (empty if none found)
     */
    async getUserCommitsForNote({userId, noteId}, {limit = 10, page = 0, session = null, projection = null} = {}) {
        if (!isValidObjectId(userId)) return deepFreeze([]);
        if (!isValidObjectId(noteId)) return deepFreeze([]);
        try {
            const skip = page * limit;
            const query = this.#model
                .find({
                    noteId: convertToObjectId(noteId),
                    createdBy: convertToObjectId(userId),
                    previousVersion: {$ne: null}
                })
                .sort({createdAt: -1})
                .skip(skip)
                .limit(limit)
                .session(session);

            if (projection) {
                query.select(projection);
            }

            const commits = await query.lean();
            return deepFreeze(commits.map(c => this.#sanitizeVersion(c)));
        } catch (error) {
            console.error(
                `[VersionRepository] Failed to get commits for user ${userId} on note ${noteId}:`,
                error
            );
            throw new Error('Failed to retrieve user commits. Please try again later');
        }
    }


    /**
     * Finds multiple versions by their IDs with optional projection
     * @param {Array<string>} versionIds - Array of version IDs to find
     * @param {Object} [options] - Options
     * @param {Object|string} [options.projection] - MongoDB projection to select specific fields
     * @param {import('mongoose').ClientSession} [options.session] - MongoDB transaction session
     * @returns {Promise<Readonly<Array<OutputVersion>>>} Array of version documents (empty if none found)
     */
    async findByIds(versionIds, {projection = null, session = null} = {}) {
        if (!Array.isArray(versionIds)) return deepFreeze([]);

        const validIds = versionIds
            .filter(id => isValidObjectId(id))
            .map(id => convertToObjectId(id));

        if (validIds.length === 0) return deepFreeze([]);

        try {
            const query = this.#model.find({_id: {$in: validIds}}).session(session);
            if (projection) query.select(projection);

            const versions = await query.lean();
            return deepFreeze(versions.map(version => this.#sanitizeVersion(version)));
        } catch (error) {
            console.error("Error finding versions by IDs:", error);
            throw new Error("Error finding versions by IDs");
        }
    }
}

module.exports = VersionRepository;
