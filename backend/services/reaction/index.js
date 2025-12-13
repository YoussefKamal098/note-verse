/**
 * @typedef {Object} ProduceParams
 * @property {string|number} noteId
 * @property {string|number} userId
 * @property {ReactionType|null} type
 */

class ReactionService {
    /** @type {import("@/services/reaction/reaction.producer").ReactionProducer} */ #producer;
    /** @type {import("@/services/caches/reaction.cache").ReactionCache} */ #cache;
    /** @type {import("@/repositories/reaction.repository").reactionRepository} */
    #repo;

    /**
     * @param {Object} params
     * @param {import("@/services/reaction/reaction.producer").ReactionProducer} params.reactionProducer
     * @param {import("@/services/caches/reaction.cache").ReactionCache} params.reactionCache
     * @param {import("@/repositories/reaction.repository").reactionRepository} params.reactionRepo
     */
    constructor({reactionProducer, reactionCache, reactionRepo}) {
        this.#producer = reactionProducer;
        this.#cache = reactionCache;
        this.#repo = reactionRepo;
    }

    /**
     * Publishes a reaction event to the queue/stream.
     * @param {ProduceParams} params
     * @returns {Promise<string>} id of produced reaction log
     */
    async reaction({noteId, userId, type}) {
        return this.#producer.produce({noteId, userId, type});
    }

    /**
     * Retrieves the cached counts for a specific note.
     * @param {string} noteId
     * @returns {Promise<ReactionCounts | null>}
     */
    async getCounts(noteId) {
        return this.#cache.getCounts(noteId);
    }

    /**
     * Retrieves the specific reaction of a user for a specific note directly from the repository.
     * This method is safe, read-only, and utilizes lean queries for performance.
     * @param {string} noteId - The ID of the note.
     * @param {string} userId - The ID of the user.
     * @returns {Promise<ReactionType|null>} The reaction type or null if no reaction exists.
     */
    async getUserReaction(noteId, userId) {
        return this.#repo.getReaction(noteId, userId);
    }
}

module.exports = ReactionService;
