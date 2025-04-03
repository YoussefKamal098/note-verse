const crypto = require('crypto');
const B2 = require('backblaze-b2');
const {PassThrough} = require('stream');
const {ReadStream} = require('fs');

const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB per chunk
const MIN_LARGE_FILE_PARTS = 2;
const MAX_RETRIES = 3;

const B2_HEADERS = {
    CONTENT_LENGTH: 'content-length',
    CONTENT_SHA1: 'x-bz-content-sha1',
    UPLOAD_TIMESTAMP: 'x-bz-upload-timestamp',
    FILE_ID: 'x-bz-file-id',
    FILE_NAME: 'x-bz-file-name',
    FILE_RETENTION: 'x-bz-file-retention',
    LEGAL_HOLD: 'x-bz-legal-hold',
    PART_NUMBER: 'x-bz-part-number',
    SERVER_SIDE_ENCRYPTION: 'x-bz-server-side-encryption'
};


/**
 * @typedef {Object} UploadContext
 * @property {string} fileId
 * @property {Awaited<{ fileId: string }>} regularUploadAuth
 * @property {PassThrough} passThrough
 * @property {Buffer} buffer
 * @property {number} partNumber
 * @property {string[]} partSha1Array
 * @property {boolean} isLargeFile
 * @property {boolean} cancelled
 * @property {boolean} isUploading
 * @property {boolean} streamPaused
 */

/**
 * @implements {IStorageEngine}
 * B2StorageEngine handles file operations in Backblaze B2 cloud storage.
 */
class B2StorageEngine {
    /**
     * @private
     * @type {import('backblaze-b2').B2}
     */
    #b2;

    /**
     * @private
     * @type {string}
     */
    #bucketId;

    /**
     * @private
     * @type {string}
     */
    #bucketName;

    /**
     * @private
     * @type {string}
     */
    #bucketRegion;

    /**
     * @private
     * @type {boolean}
     */
    #authorized = false;

    /**
     * @param {B2StorageConfig} config
     */
    constructor(config) {
        this.#b2 = new B2({
            applicationKeyId: config.applicationKeyId,
            applicationKey: config.applicationKey,
        });

        this.#bucketId = config.bucketId;
        this.#bucketName = config.bucketName;
        this.#bucketRegion = config.bucketRegion;
    }

    /**
     * Creates a writable stream for file upload
     * @param {string} filename
     * @returns {Promise<{writeStream: PassThrough, promise: Promise<{filename: string, size: number, fileId: string, fileUrl: string}>}>}
     */
    async uploadStream(filename) {
        await this.#authorize();

        // Prepare both upload types simultaneously
        const [largeFileSession, regularUploadAuth] = await Promise.all([
            this.#startLargeFileSession(filename),
            this.#getRegularUploadAuth()
        ]);

        const context = this.#createUploadContext(
            largeFileSession.fileId,
            regularUploadAuth
        );

        this.#setupStreamHandlers(context);

        return {
            writeStream: context.passThrough,
            promise: this.#handleUploadCompletion(context, filename)
        };
    }

    /**
     * @private
     * @param {string[]} partSha1Array
     * @returns {string}
     */
    #computeCombinedSha1(partSha1Array) {
        const combinedHash = crypto.createHash('sha1');
        combinedHash.update(partSha1Array.join(''), 'hex');
        return combinedHash.digest('hex');
    }

    /**
     * @private
     * @returns {Promise<void>}
     */
    async #authorize() {
        try {
            if (!this.#authorized) {
                await this.#b2.authorize();
                this.#authorized = true;
            }
        } catch (error) {
            throw new Error(`Failed to authorize: ${error.message}`);
        }
    }

    /**
     * @private
     * @param {string} filename
     * @returns {Promise<{ fileId: string}>}
     */
    async #startLargeFileSession(filename) {
        try {
            const response = await this.#b2.startLargeFile({
                bucketId: this.#bucketId,
                fileName: filename
            });
            return {fileId: response.data.fileId};
        } catch (error) {
            throw new Error(`Failed to start large file session: ${error}`);
        }
    }

    /**
     * @private
     * @returns {Awaited<{ fileId: string }>}
     */
    async #getRegularUploadAuth() {
        try {
            return await this.#b2.getUploadUrl({bucketId: this.#bucketId});
        } catch (error) {
            throw new Error(`Failed to get regular upload URL: ${error}`);
        }
    }

    /**
     * @private
     * @param {string} fileId
     * @param {Awaited<{ fileId: string }>} regularUploadAuth
     * @returns {UploadContext}
     */
    #createUploadContext(fileId, regularUploadAuth) {
        return {
            fileId,
            regularUploadAuth,
            passThrough: new PassThrough(),
            buffer: Buffer.alloc(0),
            partNumber: 1,
            partSha1Array: [],
            isLargeFile: false,
            cancelled: false,
            isUploading: false,
            streamPaused: false
        };
    }

    /**
     * @private
     * @param {UploadContext} context
     */
    #setupStreamHandlers(context) {
        context.passThrough.on("data", (chunk) => {
            try {
                context.buffer = Buffer.concat([context.buffer, chunk]);

                if (!context.isLargeFile && context.buffer.length >= CHUNK_SIZE) {
                    context.isLargeFile = true;
                    // console.log(`Switching to large file upload`);
                }

                if (context.isLargeFile) {
                    this.#handleLargeFileData(context).catch(err =>
                        context.passThrough.destroy(err)
                    );
                }
            } catch (error) {
                context.passThrough.destroy(error);
            }
        });

        context.passThrough.on("error", (err) => {
            context.passThrough.destroy(err);
            console.error("Stream encountered an error", err);
            context.cancelled = true;
        });
    }

    /**
     * @private
     * @param {UploadContext} context
     * @returns {Promise<void>}
     */
    async #handleLargeFileData(context) {
        while (context.buffer.length >= CHUNK_SIZE && !context.cancelled) {
            if (context.isUploading) return;

            try {
                context.isUploading = true;
                this.#pauseStream(context);

                const chunk = context.buffer.subarray(0, CHUNK_SIZE);
                context.buffer = context.buffer.subarray(CHUNK_SIZE);

                await this.#uploadChunk(context, chunk);
                context.partNumber++;
            } catch (error) {
                context.passThrough.destroy(error);
                throw error;
            } finally {
                context.isUploading = false;
                if (!context.cancelled) {
                    this.#resumeStream(context);
                    this.#checkForMoreData(context);
                }
            }
        }
    }

    /**
     * @private
     * @param {UploadContext} context
     */
    #pauseStream(context) {
        if (!context.streamPaused) {
            context.passThrough.pause();
            context.streamPaused = true;
            // console.log('Stream paused');
        }
    }

    /**
     * @private
     * @param {UploadContext} context
     */
    #resumeStream(context) {
        if (context.streamPaused) {
            context.streamPaused = false;
            context.passThrough.resume();
            // console.log('Stream resumed');
        }
    }

    /**
     * @private
     * @param {UploadContext} context
     */
    #checkForMoreData(context) {
        if (context.buffer.length >= CHUNK_SIZE) {
            setImmediate(() => this.#handleLargeFileData(context));
        }
    }

    /**
     * @private
     * @param {UploadContext} context
     * @param {Buffer} chunk
     * @returns {Promise<void>}
     */
    async #uploadChunk(context, chunk) {
        let attempt = 0;
        while (attempt < MAX_RETRIES) {
            try {
                // console.log(`Uploading part ${context.partNumber} (attempt ${attempt + 1})`);
                const partUrl = await this.#b2.getUploadPartUrl({fileId: context.fileId});

                const response = await this.#b2.uploadPart({
                    uploadUrl: partUrl.data.uploadUrl,
                    uploadAuthToken: partUrl.data.authorizationToken,
                    partNumber: context.partNumber,
                    data: chunk
                });

                context.partSha1Array.push(response.data.contentSha1);
                // console.log(`Completed part ${context.partNumber}`);
                return;
            } catch (error) {
                attempt++;
                console.error(`Part upload failed (attempt ${attempt}): ${error.message}`);

                if (attempt >= MAX_RETRIES) {
                    console.error("Max retries reached. Cancelling upload.");
                    await this.#cancelLargeFile(context.fileId);
                    context.passThrough.destroy(error);
                    throw new Error(`Part upload failed after ${MAX_RETRIES} attempts: ${error.message}`);
                }
            }
        }
    }

    /**
     * @private
     * @param {UploadContext} context
     * @param {string} filename
     * @returns {Promise<{filename: string, size: number, fileId: string, fileUrl: string}>}
     */
    #handleUploadCompletion(context, filename) {
        return new Promise(async (resolve, reject) => {
            context.passThrough.on("end", async () => {
                try {
                    const result = await this.#finalizeUpload(context, filename);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });

            context.passThrough.on("error", reject);
        });
    }

    /**
     * @private
     * @param {UploadContext} context
     * @param {string} filename
     * @returns {Promise<{filename: string, hash: string, size: number, uploadTimestamp: number, fileId: string, fileUrl: string}>}
     */
    async #finalizeUpload(context, filename) {
        if (context.cancelled) {
            throw new Error('Upload was cancelled');
        }

        return context.isLargeFile
            ? this.#finalizeLargeFile(context, filename)
            : this.#finalizeRegularUpload(context, filename);
    }

    /**
     * @private
     * @param {UploadContext} context
     * @param {string} filename
     * @returns {Promise<{filename: string, hash: string, size: number, uploadTimestamp: number, fileId: string, fileUrl: string}>}
     */
    async #finalizeLargeFile(context, filename) {
        if (context.buffer.length > 0) {
            await this.#uploadChunk(context, context.buffer);
            context.partNumber++;
        }

        if (context.partNumber < MIN_LARGE_FILE_PARTS) {
            await this.#cancelLargeFile(context.fileId);
            throw new Error(`Large files require at least ${MIN_LARGE_FILE_PARTS} parts`);
        }

        const response = await this.#b2.finishLargeFile({
            fileId: context.fileId,
            partSha1Array: context.partSha1Array
        });

        return this.#createFileResponse({
            ...response.data,
            contentSha1: this.#computeCombinedSha1(context.partSha1Array)
        }, filename);
    }

    /**
     * @private
     * @param {UploadContext} context
     * @param {string} filename
     * @returns {Promise<{filename: string, hash: string, size: number, uploadTimestamp: number, fileId: string, fileUrl: string}>}
     */
    async #finalizeRegularUpload(context, filename) {
        await this.#cancelLargeFile(context.fileId);

        const {uploadUrl, authorizationToken} = context.regularUploadAuth.data;
        const response = await this.#b2.uploadFile({
            uploadUrl,
            uploadAuthToken: authorizationToken,
            fileName: filename,
            data: context.buffer
        });

        return this.#createFileResponse(response.data, filename);
    }

    /**
     * @private
     * @param {string} fileId
     * @returns {Promise<void>}
     */
    async #cancelLargeFile(fileId) {
        try {
            await this.#b2.cancelLargeFile({fileId});
            // console.log(`Cancelled large file session: ${fileId}`);
        } catch (error) {
            console.error(`Failed to cancel large file: ${error}`);
        }
    }

    /**
     * @private
     * @param {Object} fileData
     * @param {string} filename
     * @returns {{filename: string, hash: string, size: number, uploadTimestamp: number, fileId: string, fileUrl: string}}
     */
    #createFileResponse(fileData, filename) {
        return {
            filename,
            hash: fileData.contentSha1,
            size: fileData.contentLength,
            uploadTimestamp: fileData.uploadTimestamp,
            fileId: fileData.fileId,
            fileUrl: `https://${this.#bucketName}.${this.#bucketRegion}.backblazeb2.com/${filename}`
        };
    }

    /**
     * Creates a readable stream for file download with metadata
     * @param {string} filename
     * @returns {Promise<{stream: ReadStream, metadata: {size: number, hash: string, lastModified: Date}}>}
     */
    async downloadStream(filename) {
        await this.#authorize();

        try {
            const response = await this.#b2.downloadFileByName({
                bucketName: this.#bucketName,
                fileName: filename,
                responseType: 'stream',
            });

            // Extract metadata from headers
            const headers = response.headers;
            const metadata = {
                size: headers[B2_HEADERS.CONTENT_LENGTH],
                hash: headers[B2_HEADERS.CONTENT_SHA1],
                lastModified: new Date(parseInt(headers[B2_HEADERS.UPLOAD_TIMESTAMP]))
            };

            return {
                stream: response.data,
                metadata
            };
        } catch (error) {
            throw new Error(`Download failed: ${error}`);
        }
    }

    /**
     * Deletes a file from B2 storage
     * @param {string} filename
     * @returns {Promise<void>}
     */
    async delete(filename) {
        await this.#authorize();

        try {
            const fileInfo = await this.#b2.listFileNames({
                bucketId: this.#bucketId,
                startFileName: filename,
                prefix: filename,
                maxFileCount: 1,
                delimiter: "",
            });

            if (!fileInfo.data.files.length || fileInfo.data.files[0].fileName !== filename) {
                throw new Error('File not found');
            }

            await this.#b2.deleteFileVersion({
                fileId: fileInfo.data.files[0].fileId,
                fileName: filename,
            });
        } catch (error) {
            throw new Error(`Delete failed: ${error}`);
        }
    }

    /**
     * Checks if a file exists in B2 storage
     * @param {string} filename
     * @returns {Promise<boolean>}
     */
    async exists(filename) {
        await this.#authorize();

        try {
            const fileInfo = await this.#b2.listFileNames({
                bucketId: this.#bucketId,
                startFileName: filename,
                prefix: filename,
                maxFileCount: 1,
                delimiter: ""
            });

            return fileInfo.data.files.length > 0 && fileInfo.data.files[0].fileName === filename;
        } catch (error) {
            throw new Error(`Existence check failed: ${error}`);
        }
    }
}

module.exports = B2StorageEngine;
