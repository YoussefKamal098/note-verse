const {ReadStream} = require('fs');
const {deepClone, deepFreeze} = require("shared-utils/obj.utils");
const statusMessages = require('../constants/statusMessages');
const httpCodes = require('../constants/httpCodes');
const AppError = require('../errors/app.error');
const B2StorageEngine = require("./storage/b2storage-engine");
const B2StorageConfig = require("../config/B2StorageConfig");
const fileRepository = require("../repositories/file.repository");

/**
 * FileStorageService handles file storage operations, including upload, download, deletion,
 * and validation using a storage engine and file processors.
 */
class FileStorageService {
    /**
     * @private
     * @param {Object} config - Configuration settings for file processing.
     * @param {Function} config.filenameGenerator - Function to generate unique filenames.
     **/
    #config
    /**
     * @private
     * @type {IStorageEngine}
     */
    #storageEngine;
    /**
     * @private
     * @type {FileRepository}
     */
    #fileRepository;

    /**
     * @param {IStorageEngine} storageEngine - The storage engine implementing IStorageEngine.
     * @param {FileRepository} fileRepository - Repository for file database operations.
     * @param {Object} config - Configuration object.
     * @param {Function} config.filenameGenerator - Function to generate unique filenames.
     */
    constructor(storageEngine, fileRepository, config) {
        this.#storageEngine = storageEngine;
        this.#fileRepository = fileRepository;
        this.#config = deepFreeze(deepClone(config));
    }

    /**
     * Handles file upload with metadata tracking
     * @param {ReadStream} stream - File content stream
     * @param {Object} fileInfo
     * @param {string} fileInfo.mimetype - Detected MIME type
     * @param {string} fileInfo.userId - User ID of a file owner
     * @returns {Promise<{fileId: string, size: number, mimetype: string, userId: string}>}
     */
    async upload(stream, {mimetype, userId}) {
        const filename = this.#generateFilename();

        const {writeStream, promise} = await this.#storageEngine.uploadStream(filename);

        return new Promise((resolve, reject) => {
            stream.pipe(writeStream).on('error', reject);

            stream.on('error', (err) => {
                stream.destroy();
                writeStream.destroy();
                reject(new Error(`Upload file Stream read error ${err}`));
            });

            writeStream.on('error', (err) => {
                stream.destroy();
                writeStream.destroy();
                reject(new Error(`Upload file Write stream error ${err}`));
            });

            promise.then(async ({filename, hash, size}) => {
                const fileData = {
                    name: filename,
                    size: size,
                    mimetype,
                    userId,
                    hash
                };

                try {
                    const fileDoc = await this.#fileRepository.createFile(fileData);

                    resolve({
                        id: fileDoc.id,
                        name: fileDoc.name,
                        mimetype: fileDoc.mimetype,
                        size: fileDoc.size,
                        userId: fileDoc.userId
                    });
                } catch (err) {
                    reject(new Error(`Upload file process failed ${err}`));
                }
            }).catch((err) => {
                stream.destroy();
                writeStream.destroy();
                reject(new Error(`Upload file process failed ${err}`));
            });
        });
    }

    /**
     * Generates a unique filename using the provided generator function.
     * @private
     * @returns {string} - The generated filename.
     */
    #generateFilename() {
        return `${this.#config.filenameGenerator()}-${Date.now()}`;
    }

    /**
     * Downloads a file as a readable stream.
     *
     * @async
     * @param {string} fileId - Unique file name identifier
     * @returns {Promise<{stream: ReadStream, metadata: {
     * hash: string, lastModified: Date, size: number,
     * mimetype:string, userId: string
     * }}>} - The file stream.
     */
    async download(fileId) {
        try {
            const fileDoc = await this.#fileRepository.findByFileId(fileId);
            if (!fileDoc) {
                throw new AppError(
                    statusMessages.FILE_NOT_FOUND,
                    httpCodes.NOT_FOUND.code,
                    httpCodes.NOT_FOUND.name
                );
            }

            const {stream} = await this.#storageEngine.downloadStream(fileDoc.name);
            return {
                stream,
                metadata: {
                    hash: fileDoc.hash,
                    lastModified: fileDoc.createdAt,
                    size: fileDoc.size,
                    mimetype: fileDoc.mimetype,
                    userId: fileDoc.userId
                }
            };
        } catch (error) {
            if (error instanceof AppError) {
                throw error
            } else {
                throw new Error(`Download file failed: ${error.message}`);
            }
        }
    }

    /**
     * Deletes a file with owner validation
     *
     * @async
     * @param {string} fileId - Unique file name identifier
     * @param {string} userId - Owner user ID
     * @param {boolean} [silent=true] - Suppress errors
     * @returns {Promise<{size: number, mimetype: string, userId: string} | null>}
     */
    async delete(fileId, userId, silent = true) {
        try {
            const fileDoc = await this.#fileRepository.deleteByFileIdAndOwner(fileId, userId);
            if (!silent && !fileDoc) {
                throw new AppError(
                    statusMessages.FILE_NOT_FOUND,
                    httpCodes.NOT_FOUND.code,
                    httpCodes.NOT_FOUND.name
                );
            }

            if (!fileDoc) {
                return null;
            }

            await this.#storageEngine.delete(fileDoc.name);

            return {
                size: fileDoc.size,
                mimetype: fileDoc.mimetype,
                userId: fileDoc.userId
            };
        } catch (error) {
            if (!silent) return null;

            if (error instanceof AppError) {
                throw error
            } else {
                throw new Error(`Delete file failed: ${error.message}`);
            }
        }
    }

    /**
     * Checks if a file exists in storage.
     *
     * @async
     * @param {string} fileId - Unique file name identifier
     * @returns {Promise<boolean>} - True if the file exists, otherwise false.
     */
    async exists(fileId) {
        try {
            const fileDoc = await this.#fileRepository.findByFileId(fileId);
            if (!fileDoc) return false;

            return this.#storageEngine.exists(fileDoc.name);
        } catch (error) {
            throw new Error(`Checking file existence failed: ${error.message}`);
        }
    }
}

module.exports = new FileStorageService(new B2StorageEngine(B2StorageConfig), fileRepository,
    {filenameGenerator: () => crypto.randomUUID()}
);
