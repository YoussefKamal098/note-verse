/**
 * @template TSession
 * @interface IUnitOfWork
 * Defines stateless transaction lifecycle methods.
 */
class IUnitOfWork {
    /**
     * Begins a new transaction and returns a session object.
     * @abstract
     * @returns {Promise<TSession>}
     */
    async begin() {
        throw new Error('Method "begin" not implemented');
    }

    /**
     * Commits the transaction for the given session.
     * @abstract
     * @param {TSession} session
     * @returns {Promise<void>}
     */
    async commit(session) {
        throw new Error('Method "commit" not implemented');
    }

    /**
     * Rolls back the transaction for the given session.
     * @abstract
     * @param {TSession} session
     * @returns {Promise<void>}
     */
    async rollback(session) {
        throw new Error('Method "rollback" not implemented');
    }
}

module.exports = IUnitOfWork;
