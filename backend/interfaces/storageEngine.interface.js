const {PassThrough} = require('stream');
const {ReadStream} = require('fs');

/**
 * @interface IStorageEngine
 */
class IStorageEngine {
    /**
     * Creates a writable stream for file upload.
     * @param {string} filename
     * @returns {Promise<{ writeStream: PassThrough, promise: Promise<{filename: string, size: number, fileId: string, fileUrl: string}>}>}
     */
    async uploadStream(filename) {
        throw new Error("uploadStream() must be implemented");
    }

    /**
     * Creates a readable stream for file download.
     * @param {string} filename
     * @returns {Promise<{stream: ReadStream, metadata: Record<any, any>}>}
     */
    async downloadStream(filename) {
        throw new Error("downloadStream() must be implemented");
    }

    /**
     * Deletes a file from B2 storage.
     * @param {string} filename
     * @returns {Promise<void>}
     */
    async delete(filename) {
        throw new Error("delete() must be implemented");
    }

    /**
     * Checks if a file exists in B2 storage.
     * @param {string} filename
     * @returns {Promise<boolean>}
     */
    async exists(filename) {
        throw new Error("exists() must be implemented");
    }
}
