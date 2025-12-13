const mongoose = require('mongoose');
const httpCodes = require('@/constants/httpCodes');
const statusMessages = require('@/constants/statusMessages');
const dbErrorCodes = require("@/constants/dbErrorCodes");
const {connectDB} = require('@/services/db.service');
const {isValidObjectId, convertToObjectId} = require('../utils/obj.utils');
const {deepFreeze} = require('shared-utils/obj.utils');
const AppError = require('@/errors/app.error');

/**
 * @abstract
 * @class BaseRepository
 * * @description Abstract base class for MongoDB repositories with built-in global connection and transaction management
 */
class BaseRepository {
    /**
     * @private
     * @static
     * @type {Promise|null}
     */
    static #connectionPromise = null;

    /**
     * @private
     * @static
     * @type {boolean}
     */
    static #isConnected = false;

    /**
     * @protected
     * @type {import('mongoose').Model}
     */
    _model;

    constructor(model) {
        if (new.target === BaseRepository) {
            throw new Error('BaseRepository is abstract and cannot be instantiated directly');
        }
        if (!model) {
            throw new Error('Model must be provided');
        }
        this._model = model;
        this.#wrapMethods();
    }


    /* ------------------------ Connection Management ----------------------- */

    /**
     * @private
     * @static
     * Ensures MongoDB connection is established
     */
    static async #ensureConnection() {
        if (this.#isConnected) return;
        if (this.#connectionPromise) return this.#connectionPromise;

        this.#connectionPromise = (async () => {
            try {
                console.log('[BaseRepository] Initializing MongoDB connection...');

                await connectDB();

                mongoose.connection.on('disconnected', () => {
                    console.log('[BaseRepository] MongoDB disconnected');
                    this.#isConnected = false;
                });

                this.#isConnected = true;
                console.log('[BaseRepository] MongoDB connected successfully');
            } catch (error) {
                this.#connectionPromise = null;
                console.error('[BaseRepository] MongoDB connection failed:', error.message);
                throw new Error('Database connection failed');
            }
        })();

        return this.#connectionPromise;
    }

    /**
     * @static
     * Disconnects from MongoDB
     */
    static async disconnect() {
        if (!this.#isConnected) return;
        await mongoose.disconnect();
        this.#isConnected = false;
        this.#connectionPromise = null;
    }

    /* ------------------------ Transaction Management ----------------------- */

    /**
     * Starts a new transaction session
     * @private
     * @returns {Promise<mongoose.ClientSession>} The started session
     */
    async #beginTransaction() {
        await BaseRepository.#ensureConnection();
        const session = await mongoose.startSession();
        session.startTransaction();
        return session;
    }

    /**
     * Commits a transaction
     * @private
     * @param {mongoose.ClientSession} session - The session to commit
     */
    async #commitTransaction(session) {
        if (!session) return;
        try {
            await session.commitTransaction();
        } finally {
            await session.endSession();
        }
    }

    /**
     * Rolls back a transaction
     * @private
     * @param {mongoose.ClientSession} session - The session to rollback
     */
    async #rollbackTransaction(session) {
        if (!session) return;
        try {
            await session.abortTransaction();
        } finally {
            await session.endSession();
        }
    }

    /**
     * Executes an operation within a transaction with proper error handling
     * @template T
     * @param {(session: import('mongoose').ClientSession) => Promise<T>} operation - Operation to execute
     * @param {Object} [errorConfig] - Custom error configuration
     * @param {string} [errorConfig.message] - Custom error message
     * @param {number} [errorConfig.statusCode] - Custom status code
     * @param {string} [errorConfig.statusName] - Custom status name
     * @param {string} [errorConfig.conflictMessage] - Custom conflict message
     * @returns {Promise<T>} Result of the operation
     * @throws {AppError} When the operation fails
     */
    async executeTransaction(operation, {
        message,
        statusCode,
        statusName,
        conflictMessage
    } = {}) {
        const session = await this.#beginTransaction();
        try {
            const result = await operation(session);
            await this.#commitTransaction(session);
            return result;
        } catch (err) {
            await this.#rollbackTransaction(session);

            if (err instanceof AppError) throw err;

            if (err.code === dbErrorCodes.DUPLICATE_KEY) {
                throw new AppError(
                    conflictMessage || err.message || 'Duplicate key detected',
                    statusCode || httpCodes.CONFLICT.code,
                    statusName || httpCodes.CONFLICT.name
                );
            }

            throw new AppError(
                message || err.message || statusMessages.OPERATION_FAILED,
                statusCode || httpCodes.INTERNAL_SERVER_ERROR.code,
                statusName || httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }
    }

    /* ---------------------------- Core Utilities --------------------------- */

    /**
     * Validates if a string is a valid MongoDB ObjectId
     * @param {string} id - The ID to validate
     * @returns {boolean}
     */
    isValidId(id) {
        return isValidObjectId(id);
    }

    /**
     * Converts a string ID to MongoDB ObjectId
     * @param {string} id - The ID to convert
     * @returns {import('mongoose').Types.ObjectId}
     */
    toObjectId(id) {
        return convertToObjectId(id);
    }

    /**
     * Deep freezes an object or array to prevent modification
     * @template T
     * @param {T} obj - The object to freeze
     * @returns {Readonly<T>}
     */
    freeze(obj) {
        return deepFreeze(obj);
    }

    /**
     * Sanitizes MongoDB document(s)
     * @protected
     * @param {Object|Array<Object>} document - Document(s) to sanitize
     * @returns {Object|Array<Object>} Sanitized document(s)
     */
    sanitizeDocument(document) {
        const sanitize = doc => {
            if (!doc) return doc;
            const sanitized = {...doc};

            // Remove version key and transform _id
            delete sanitized.__v;
            if (sanitized._id) {
                sanitized.id = sanitized._id.toString();
                delete sanitized._id;
            }

            return sanitized;
        };

        return Array.isArray(document)
            ? document.map(sanitize)
            : sanitize(document);
    }

    /* --------------------------- Method Wrapping --------------------------- */

    /**
     * @private
     * Wraps all methods to ensure connection before execution
     */
    #wrapMethods() {
        const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
            .filter(prop =>
                prop !== 'constructor' &&
                typeof this[prop] === 'function' &&
                !prop.startsWith('#')
            );

        methodNames.forEach(methodName => {
            const originalMethod = this[methodName];
            this[methodName] = async (...args) => {
                await BaseRepository.#ensureConnection();
                return originalMethod.apply(this, args);
            };
        });
    }
}

module.exports = BaseRepository;
