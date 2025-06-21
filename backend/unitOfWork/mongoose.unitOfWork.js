const mongoose = require('mongoose');
const IUnitOfWork = require('../interfaces/unitOfWork.interface');

/**
 * @implements {IUnitOfWork<mongoose.ClientSession>}
 */
class MongooseUnitOfWork extends IUnitOfWork {
    /**
     * @private
     * @type {import('mongoose').Connection}
     */
    #connection

    constructor() {
        super();
        this.#connection = mongoose.connection;
    }

    /** @returns {Promise<mongoose.ClientSession>} */
    async begin() {
        const session = await this.#connection.startSession();
        session.startTransaction();
        return session;
    }

    /** @param {mongoose.ClientSession} session */
    async commit(session) {
        if (!session) return;
        try {
            await session.commitTransaction();
        } finally {
            await session.endSession();
        }
    }

    /** @param {mongoose.ClientSession} session */
    async rollback(session) {
        if (!session) return;
        try {
            await session.abortTransaction();
        } finally {
            await session.endSession();
        }
    }
}

module.exports = MongooseUnitOfWork;
