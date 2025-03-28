const File = require("../models/file.model");
const {sanitizeMongoObject, convertToObjectId} = require('../utils/obj.utils');
const dbErrorCodes = require('../constants/dbErrorCodes');
const {deepFreeze} = require('shared-utils/obj.utils');

/**
 * Repository for performing CRUD operations on the File collection.
 *
 * This class encapsulates all database operations related to files, including
 *
 * - Creating new file records with fileId unique file name identifier
 * - Finding files by ID, fileId, owner, or custom queries
 * - Updating and deleting file records
 *
 * All returned file documents are sanitized and deep-frozen to prevent modifications.
 *
 * @class FileRepository
 */
class FileRepository {
    /**
     * @private
     * @type {import('mongoose').Model}
     */
    #model;

    constructor(model) {
        this.#model = model;
    }

    /**
     * Sanitizes a file MongoDB object.
     *
     * Converts internal fields and ensures the owner user ID is returned as a string.
     *
     * @private
     * @param {Object} file - The file object retrieved from MongoDB.
     * @returns {Object} The sanitized file object.
     */
    #sanitizeFileMongoObject(file) {
        return {...sanitizeMongoObject(file), userId: file.userId.toString()};
    }

    /**
     * Creates a new file record with auto-generated UUID.
     *
     * @param {Object} fileData
     * @param {string} fileData.name - Unique file name identifier
     * @param {string} fileData.ext - File extension
     * @param {string} fileData.hash - SHA-1 hash of the file content
     * @param {string} fileData.mimetype - MIME type
     * @param {number} fileData.size - File size in bytes
     * @param {string} fileData.userId - Owner's user ID
     * @returns {Promise<Readonly<Object>>} Created file document
     * @throws {Error} If duplicate fileId or validation error occurs
     */
    async createFile(fileData) {
        try {
            const file = await this.#model.create(fileData);
            return deepFreeze(this.#sanitizeFileMongoObject(file.toObject()));
        } catch (error) {
            if (error.code === dbErrorCodes.DUPLICATE_KEY) {
                const conflictError = new Error("File ID conflict");
                conflictError.code = dbErrorCodes.DUPLICATE_KEY;
                throw conflictError;
            }
            console.error("Error creating a file document:", error);
            throw new Error("Unable to create a file document");
        }
    }

    /**
     * Finds a file by its unique fileId.
     *
     * @param {string} fileId - Unique file identifier
     * @returns {Promise<Readonly<Object|null>>}
     */
    async findByFileId(fileId) {
        try {
            const fileDoc = await this.#model.findById(convertToObjectId(fileId)).lean();
            return fileDoc ? deepFreeze(this.#sanitizeFileMongoObject(fileDoc)) : null;
        } catch (error) {
            console.error("Error finding a file document by fileId:", error);
            throw new Error("Error finding a file document by fileId");
        }
    }

    /**
     * Deletes a file by its unique fileId.
     *
     * @param {string} fileId - Unique file identifier
     * @returns {Promise<Readonly<Object|null>>} Deleted document
     */
    async deleteByFileId(fileId) {
        try {
            const deletedFile = await this.#model.findByIdAndDelete(convertToObjectId(fileId)).lean();

            return deletedFile ? deepFreeze(this.#sanitizeFileMongoObject(deletedFile)) : null;
        } catch (error) {
            console.error("Error deleting a file document:", error);
            throw new Error("Error deleting a file document");
        }
    }

    /**
     * Finds a file by both fileId and owner ID
     * @param {string} fileId - Unique file identifier
     * @param {string} userId - Owner user ID
     * @returns {Promise<Readonly<Object|null>>}
     */
    async findByFileIdAndOwner(fileId, userId) {
        try {
            const file = await this.#model.findOne({
                _id: convertToObjectId(fileId),
                userId: convertToObjectId(userId)
            }).lean();
            return file ? deepFreeze(this.#sanitizeFileMongoObject(file)) : null;
        } catch (error) {
            console.error("Error finding file by fileId and owner:", error);
            throw new Error("Error finding file document");
        }
    }

    /**
     * Deletes a file by both fileId and owner ID
     * @param {string} fileId - Unique file identifier
     * @param {string} userId - Owner user ID
     * @returns {Promise<Readonly<Object|null>>} Deleted document
     */
    async deleteByFileIdAndOwner(fileId, userId) {
        try {
            const deletedFile = await this.#model.findOneAndDelete({
                _id: convertToObjectId(fileId),
                userId: convertToObjectId(userId)
            }).lean();
            return deletedFile ? deepFreeze(this.#sanitizeFileMongoObject(deletedFile)) : null;
        } catch (error) {
            console.error("Error deleting file by fileId and owner:", error);
            throw new Error("Error deleting file document");
        }
    }

}

module.exports = new FileRepository(File);
