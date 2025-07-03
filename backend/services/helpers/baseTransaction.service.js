const AppError = require('../../errors/app.error');
const httpCodes = require('../../constants/httpCodes');
const statusMessages = require('../../constants/statusMessages');
const dbErrorCodes = require("../../constants/dbErrorCodes");

/**
 * Base service class providing common transaction handling functionality
 */
class BaseTransactionService {
    /**
     * @protected
     * @type {IUnitOfWork}
     */
    uow;

    /**
     * @param {IUnitOfWork} uow - Unit of Work for transaction management
     */
    constructor({uow}) {
        this.uow = uow;
    }

    /**
     * Executes an operation within a transaction with proper error handling
     * @template T
     * @param {function(session: ClientSession): Promise<T>} operation - Operation to execute
     * @param {Object} [errorConfig] - Custom error configuration
     * @param {string} [errorConfig.message] - Custom error message
     * @param {string} [errorConfig.statusCode] - Custom status code
     * @param {string} [errorConfig.statusName] - Custom status name
     * @param {string} [errorConfig.conflictMessage] - Custom status name
     * @returns {Promise<T>} Result of the operation
     * @throws {AppError} When the operation fails
     */
    async executeTransaction(operation, {message, statusCode, statusName, conflictMessage} = {}) {
        const session = await this.uow.begin();
        try {
            const result = await operation(session);
            await this.uow.commit(session);
            return result;
        } catch (err) {
            await this.uow.rollback(session);
            if (err instanceof AppError) throw err;

            if (err.code === dbErrorCodes.DUPLICATE_KEY) {
                throw new AppError(
                    conflictMessage || err.message || 'Duplicate key detected',
                    httpCodes.CONFLICT.code,
                    httpCodes.CONFLICT.name
                );
            }

            throw new AppError(
                message || statusMessages.OPERATION_FAILED,
                statusCode || httpCodes.INTERNAL_SERVER_ERROR.code,
                statusName || httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }
    }
}

module.exports = BaseTransactionService;
