const BaseRepository = require("@/repositories/base.repository");
const ReactionUtils = require("@/utils/reaction.utils");
const {convertToObjectId, isValidObjectId} = require('@/utils/obj.utils');
const {Reactions, DEFAULT_REACTION_COUNTS} = require('@/constants/reaction.constants');


/**
 * @typedef {Object} UserReactionMap
 * @property {Record<string, ReactionType|null>} [userId]
 */

/**
 * Repository for managing reaction with atomic updates.
 */
class ReactionRepository extends BaseRepository {
    /** @private @type {import('mongoose').Model} */
    #noteModel;

    /**
     * @param {Object} models
     * @param {import('mongoose').Model} models.reactionModel
     * @param {import('mongoose').Model} models.noteModel
     */
    constructor({reactionModel, noteModel}) {
        super(reactionModel);
        if (!noteModel) throw new Error('noteModel is required');
        this.#noteModel = noteModel;
    }

    /**
     * Bulk apply reaction for many notes in one transaction
     * @param {Record<string, UserReactionMap>} notesMap - {"noteId": {"userId": "like" | null}}
     * @returns {Promise<{noteDelta: Record<string, ReactionCounts>,
     * noteTotalReactionsCount: Record<string, ReactionCounts>}>}
     */
    async bulkApplyReactionsForManyNotes(notesMap) {
        this.#validateNotesMap(notesMap);

        return this.executeTransaction(async (session) => {
            /** @type {Record<string, UserReactionMap>} */
            const existingMap = await this.#fetchExistingReactions(notesMap, session);

            /** @type {{reactionOps: Array<Object>, noteDelta: Record<string, ReactionCounts>}} */
            const {reactionOps, noteDelta} = this.#buildBulkOps(notesMap, existingMap);

            if (reactionOps.length > 0) {
                await this._model.bulkWrite(reactionOps, {ordered: false, session});
            }

            const noteTotalReactionsCount = await this.#updateNoteCounts(noteDelta, session);
            return {
                noteDelta,
                noteTotalReactionsCount
            };
        });
    }

    /**
     * Validate all noteIds and userIds
     * @param {Record<string, UserReactionMap>} notesMap
     * @returns {void}
     * @private
     */
    #validateNotesMap(notesMap) {
        for (const [noteId, users] of Object.entries(notesMap)) {
            if (!isValidObjectId(noteId)) throw new Error(`Invalid noteId: ${noteId}`);
            for (const userId of Object.keys(users)) {
                if (!isValidObjectId(userId)) throw new Error(`Invalid userId: ${userId}`);
            }
        }
    }

    /**
     * Fetch all existing reaction for the given notes/users
     * @param {Record<string, UserReactionMap>} notesMap
     * @param {import('mongoose').ClientSession} [session]
     * @returns {Promise<Record<string, UserReactionMap>>} map of noteId -> userId -> oldType
     * @private
     */
    async #fetchExistingReactions(notesMap, session) {
        const filters = [];
        for (const [noteId, users] of Object.entries(notesMap)) {
            const uids = Object.keys(users).map(convertToObjectId);
            filters.push({noteId: convertToObjectId(noteId), userId: {$in: uids}});
        }

        const existing = await this._model.find(
            {$or: filters},
            {noteId: 1, userId: 1, type: 1}
        ).session(session).lean();

        /** @type {Record<string, UserReactionMap>} */
        const map = {};
        for (const r of existing) {
            const nid = r.noteId.toString();
            const uid = r.userId.toString();
            if (!map[nid]) map[nid] = {};
            map[nid][uid] = r.type;
        }
        return map;
    }

    /**
     * Build bulk operations and note deltas
     * @param {Record<string, UserReactionMap>} notesMap
     * @param {Record<string, UserReactionMap>} existingMap
     * @returns {{reactionOps: Array<Object>, noteDelta: Record<string, ReactionCounts>}}
     * @private
     */
    #buildBulkOps(notesMap, existingMap) {
        const reactionOps = [];
        const noteDelta = {};

        for (const [noteId, users] of Object.entries(notesMap)) {
            const nid = convertToObjectId(noteId);
            const delta = noteDelta[noteId] = {...DEFAULT_REACTION_COUNTS};

            for (const [userId, newType] of Object.entries(users)) {
                const uid = convertToObjectId(userId);
                const oldType = existingMap[noteId]?.[userId] || null;

                if (newType === null) {
                    reactionOps.push({deleteOne: {filter: {noteId: nid, userId: uid}}});
                    if (Object.values(Reactions).includes(oldType)) delta[oldType]--;
                    continue;
                }

                const clean = ReactionUtils.sanitizeReactionType(newType);
                reactionOps.push({
                    updateOne: {
                        filter: {noteId: nid, userId: uid},
                        update: {$set: {type: clean, updatedAt: new Date()}},
                        upsert: true
                    }
                });

                if (oldType !== clean) {
                    if (Object.values(Reactions).includes(oldType)) delta[oldType]--;
                    if (Object.values(Reactions).includes(clean)) delta[clean]++;
                }
            }
        }

        return {reactionOps, noteDelta};
    }

    /**
     * Update all note counts at once
     * @param {Record<string, ReactionCounts>} noteDelta
     * @param {import('mongoose').ClientSession} [session]
     * @returns {Promise<Record<string, ReactionCounts>>} total note likes and loves {noteId: {like: 10, love:5}}
     * @private
     */
    async #updateNoteCounts(noteDelta, session) {
        const ops = [];
        for (const [noteId, delta] of Object.entries(noteDelta)) {
            const inc = {};
            for (const type of Object.values(Reactions)) {
                if (delta[type] !== 0) inc[`reactionsCount.${type}`] = delta[type];
            }
            if (Object.keys(inc).length) {
                ops.push({updateOne: {filter: {_id: convertToObjectId(noteId)}, update: {$inc: inc}}});
            }
        }

        if (ops.length > 0) {
            await this.#noteModel.bulkWrite(ops, {ordered: false, session});
        }

        // Retrieve only the reactionsCount field
        const updatedNotes = await this.#noteModel.find(
            {_id: {$in: Object.keys(noteDelta).map(id => convertToObjectId(id))}},
            {reactionsCount: 1} // projection to only get reactionsCount
        ).session(session);

        const totals = {};
        for (const note of updatedNotes) {
            totals[note._id.toString()] = note.reactionsCount;
        }

        return totals;
    }

    /**
     * Get reaction counts for a note
     * @param {string} noteId
     * @param {Object} [options]
     * @param {import('mongoose').ClientSession} [options.session]
     * @returns {Promise<ReactionCounts | null>}
     */
    async getNoteCounts(noteId, {session} = {}) {
        if (!isValidObjectId(noteId)) throw new Error(`Invalid noteId: ${noteId}`);
        const query = this.#noteModel.findById(convertToObjectId(noteId), 'reactionsCount');
        if (session) query.session(session);
        const note = await query.lean();
        return note?.reactionsCount
            ? ReactionUtils.filterValidCounts(note.reactionsCount) : null
    }

    /**
     * Retrieves a specific user's reaction for a specific note.
     * @param {string} noteId - The ID of the note.
     * @param {string} userId - The ID of the user.
     * @returns {Promise<ReactionType|null>} The reaction type (e.g., 'like') or null if not found.
     * @throws {Error} If noteId or userId are invalid.
     */
    async getReaction(noteId, userId) {
        if (!isValidObjectId(noteId)) throw new Error(`Invalid noteId: ${noteId}`);
        if (!isValidObjectId(userId)) throw new Error(`Invalid userId: ${userId}`);

        // Use lean() for performance as we only need the plain object
        const result = await this._model.findOne(
            {
                noteId: convertToObjectId(noteId),
                userId: convertToObjectId(userId)
            },
            {type: 1} // Projection: only fetch the type field
        ).lean();

        return result ? result.type : null;
    }
}

module.exports = ReactionRepository;
