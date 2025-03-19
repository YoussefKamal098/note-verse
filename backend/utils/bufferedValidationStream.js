const {PassThrough} = require('stream');
const {fromBuffer} = require('file-type');
const mime = require('mime-types');

/**
 * A transform stream that validates files against allowed MIME types using initial buffer analysis
 * @class
 * @extends PassThrough
 *
 * @emits BufferedValidationStream#validationFinish
 */
class BufferedValidationStream extends PassThrough {
    /**
     * @private
     * @type {Set<string>|null}
     */
    #allowedMimeTypes;

    /**
     * @private
     * @type {Buffer[]}
     */
    #buffer;

    /**
     * @private
     * @type {number}
     */
    #bytesBuffered;

    /**
     * @private
     * @type {boolean}
     */
    #typeDetected;

    /**
     * @private
     * @type {number}
     */
    #maxBufferSize;

    /**
     * @private
     * @type {import('file-type').FileTypeResult|null}
     */
    #fileType;

    /**
     * Creates a new BufferedValidationStream instance
     * @param {Set<string>|null} allowedMimeTypes - Set of allowed MIME types
     * @param {number} [maxBufferSize=4096] - Maximum bytes to buffer for type detection
     * @throws {Error} If invalid MIME types are provided
     */
    constructor(allowedMimeTypes = null, maxBufferSize = 4096) {
        super({objectMode: false});
        this.#setAllowedMimeTypes = allowedMimeTypes ? new Set(allowedMimeTypes) : null;
        this.#buffer = [];
        this.#bytesBuffered = 0;
        this.#typeDetected = false;
        this.#maxBufferSize = maxBufferSize;
    }

    /**
     * @private
     * Validates and sets allowed MIME types
     * @param {Set<string>} mimeTypes
     * @throws {Error} If no valid MIME types are provided
     */
    set #setAllowedMimeTypes(mimeTypes) {
        if (!mimeTypes) {
            this.#allowedMimeTypes = mimeTypes;
            return;
        }

        const validMimeTypes = Array.from(mimeTypes).filter(mimeType =>
            mime.extension(mimeType)
        );

        if (validMimeTypes.length !== mimeTypes.size) {
            throw new Error('No valid MIME types provided');
        }

        this.#allowedMimeTypes = mimeTypes;
    }

    /**
     * Transform stream implementation
     * @private
     * @param {Buffer} chunk
     * @param {BufferEncoding} encoding
     * @param {function(Error?, any?): void} callback
     */
    async _transform(chunk, encoding, callback) {
        if (!this.#typeDetected) {
            this.#buffer.push(chunk);
            this.#bytesBuffered += chunk.length;

            try {
                const type = await fromBuffer(Buffer.concat(this.#buffer));
                if (type) {
                    if (this.#allowedMimeTypes && !this.#allowedMimeTypes.has(type.mime)) {
                        return callback(new Error(`Invalid file type: ${type.mime}`));
                    }
                    this.#typeDetected = true;
                    this.#fileType = type;
                    this.#flushBuffer();
                } else if (this.#bytesBuffered > this.#maxBufferSize) {
                    return callback(new Error('Could not detect file type'));
                }
            } catch (err) {
                return callback(err);
            }
        } else {
            this.push(chunk);
        }
        callback();
    }

    /**
     * Flushes buffered chunks and emitted validationFinish event
     * @private
     */
    #flushBuffer() {
        /**
         * @event BufferedValidationStream#validationFinish
         * @type {import('file-type').FileTypeResult}
         */
        this.emit('validationFinish', this.#fileType);

        for (const chunk of this.#buffer) {
            this.push(chunk);
        }
        this.#buffer = null;
    }

    /**
     * Final flush implementation
     * @private
     * @param {function(Error?): void} callback
     */
    _flush(callback) {
        if (!this.#typeDetected) {
            callback(new Error('File type not detected'));
        } else {
            callback();
        }
    }
}

module.exports = BufferedValidationStream;
