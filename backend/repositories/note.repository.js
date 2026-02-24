const {isValidObjectId, convertToObjectId, sanitizeMongoObject} = require('@/utils/obj.utils');
const {deepFreeze} = require('shared-utils/obj.utils');
const roles = require('@/enums/roles.enum');


/**
 * Defines the MongoDB projection rules for each role.
 * This data is now local to the Repository as it concerns data retrieval/visibility.
 */
const NOTE_PROJECTIONS = Object.freeze({
    // OWNER: null means no projection is applied, returning the full document.
    [roles.OWNER]: null,

    // EDITOR and VIEWER roles restrict the view, primarily showing less sensitive data.
    [roles.EDITOR]: Object.freeze({
        isPinned: 0
    }),

    [roles.VIEWER]: Object.freeze({
        isPinned: 0
    }),
});

/**
 * Repository for managing Note documents in the database.
 *
 * This class encapsulates CRUD operations for notes including creation, updating,
 * deletion, retrieval, and text-based search with pagination support.
 * It leverages a PaginatorService instance to paginate query results.
 *
 * @class NoteRepository
 */
class NoteRepository {
    /**
     * @private
     * @type {import('mongoose').Model}
     * @description The Mongoose model used for note operations.
     */
    #model;

    /**
     * Creates an instance of NoteRepository.
     *
     * @param {import('mongoose').Model} model - The Mongoose model for notes.
     */
    constructor(model) {
        this.#model = model;
    }

    /**
     * Sanitizes a note MongoDB object.
     *
     * Converts internal fields and ensures the userId is returned as a string.
     *
     * @private
     * @param {Object} note - The note object retrieved from MongoDB.
     * @returns {Object} The sanitized note object.
     */
    #sanitizeNoteMongoObject(note) {
        return {
            ...sanitizeMongoObject(note),
            ...(note.userId ? {userId: note.userId.toString()} : {})
        };
    }

    /**
     * Calculates the final MongoDB projection object based on the user's role and an optional override.
     * @private
     * @param {string} [role] - User role (e.g., 'OWNER', 'VIEWER').
     * @param {Object|string} [projectionOverride] - Manual projection override from the caller.
     * @returns {Object|null} The final projection object to use in the Mongoose query.
     */
    #getFinalProjection(role, projectionOverride) {
        // 1. Highest precedence: Use the manual projection override if provided.
        if (projectionOverride) {
            return projectionOverride;
        }

        // 2. Fallback: Use the projection defined for the role.
        if (role && NOTE_PROJECTIONS[role]) {
            return NOTE_PROJECTIONS[role];
        }

        // 3. Default: If no role or no projection defined for the role, return null (full document).
        return null;
    }

    /**
     * Creates a new note document.
     *
     * @param {Object} noteData - The data for the new note.
     * @param {string} noteData.userId - The ID of the user creating the note.
     * @param {string} noteData.title - The title of the note.
     * @param {Array<string>} noteData.tags - An array of tags associated with the note.
     * @param {string} noteData.content - The content of the note.
     * @param {boolean} [noteData.isPinned] - The pinned status.
     * @param {boolean} [noteData.isPublic] - The public accessibility
     * @param {import('mongoose').ClientSession} [session] - MongoDB transaction session
     * @returns {Promise<Readonly<Object>>} The created note document, deep-frozen.
     * @throws {Error} If an error occurs during note creation.
     */
    async create(noteData = {}, session = null) {
        try {
            const newNote = new this.#model(noteData);
            await newNote.save({session});
            return this.#sanitizeNoteMongoObject(newNote.toObject());
        } catch (error) {
            console.error("Error creating note:", error);
            throw new Error("Error creating note");
        }
    }

    /**
     * Finds a note by its ID and updates it with the provided fields.
     *
     * @param {string} noteId - The ID of the note to update.
     * @param {Object} updates - The fields to update.
     * @param options Options
     * @param {import('mongoose').ClientSession} [options.session] - MongoDB transaction session
     * @param {Object|string} [options.projection] - Fields to include from note
     * @param {UserRoleType| null} [options.role] - User role to apply default projection.
     * @returns {Promise<Readonly<OutputNote|null>>} The updated note document, deep-frozen, or null if not found.
     * @throws {Error} If an error occurs during the update.
     */
    async findByIdAndUpdate(noteId, updates = {}, {session = null, projection = null, role} = {}) {
        if (!isValidObjectId(noteId)) return null;
        const finalProjection = this.#getFinalProjection(role, projection);

        try {
            const updatedNote = await this.#model.findByIdAndUpdate(
                convertToObjectId(noteId),
                {$set: updates}, {
                    new: true,
                    runValidators: true,
                    projection: finalProjection,
                    session
                }).lean();
            return updatedNote ? deepFreeze(this.#sanitizeNoteMongoObject(updatedNote)) : null;
        } catch (error) {
            console.error("Error updating note:", error);
            throw new Error("Error updating note");
        }
    }

    /**
     * Retrieves a note by its ID.
     *
     * @param {string} noteId - The ID of the note.
     * @param options Options
     * @param {import('mongoose').ClientSession} [options.session] - MongoDB transaction session
     * @param {Object|string} [options.projection] - Manual projection override.
     * @param {UserRoleType| null} [options.role] - User role to apply default projection.
     * @returns {Promise<Readonly<OutputNote|null>>} The note document, deep-frozen, or null if not found.
     * @throws {Error} If an error occurs during the query.
     */
    async findById(noteId, {session = null, projection = null, role = null} = {}) {
        if (!isValidObjectId(noteId)) return null;
        const finalProjection = this.#getFinalProjection(role, projection);

        try {
            const query = this.#model.findById(convertToObjectId(noteId)).lean();
            if (finalProjection) query.select(finalProjection);
            if (session) query.session(session);

            const note = await query.exec();

            return note ? deepFreeze(this.#sanitizeNoteMongoObject(note)) : null;
        } catch (error) {
            console.error("Error finding note by ID:", error);
            throw new Error("Failed to find note by ID");
        }
    }

    /**
     * Retrieves a single note matching the provided query.
     *
     * @param {Object} [query={}] - The MongoDB query to filter notes.
     * @param {import('mongoose').ClientSession} [session] - MongoDB transaction session
     * @returns {Promise<Readonly<Object|null>>} The found note document, deep-frozen, or null if not found.
     * @throws {Error} If an error occurs during the query.
     */
    async findOne(query = {}, session = null) {
        try {
            const note = await this.#model.findOne(query).session(session).lean();
            return note ? deepFreeze(this.#sanitizeNoteMongoObject(note)) : null;
        } catch (error) {
            console.error("Error finding note:", error);
            throw new Error("Error finding note");
        }
    }

    /**
     * Deletes a note by its ID.
     *
     * @param {string} noteId - The ID of the note to delete.
     * @param {import('mongoose').ClientSession} [session] - MongoDB transaction session
     * @returns {Promise<Readonly<Object|null>>} The deleted note document, deep-frozen, or null if not found.
     * @throws {Error} If an error occurs during deletion.
     */
    async deleteById(noteId, session = null) {
        if (!isValidObjectId(noteId)) return null;

        try {
            const deletedNote = await this.#model.findByIdAndDelete(convertToObjectId(noteId), {session}).lean();
            return deletedNote ? deepFreeze(this.#sanitizeNoteMongoObject(deletedNote)) : null;
        } catch (error) {
            console.error("Error deleting note:", error);
            throw new Error("Error deleting note");
        }
    }

    /**
     * Finds multiple notes by their IDs with optional projection
     * @param {Array<string>} noteIds - Array of note IDs to find
     * @param {Object} [options] - Options
     * @param {Object|string} [options.projection] - MongoDB projection to select specific fields
     * @param {import('mongoose').ClientSession} [options.session] - MongoDB transaction session
     * @returns {Promise<Readonly<Array<Readonly<OutputNote>>>>} Array of note documents (empty if none found)
     */
    async findByIds(noteIds, {projection = null, session = null} = {}) {
        if (!Array.isArray(noteIds)) return deepFreeze([]);

        const validIds = noteIds
            .filter(id => isValidObjectId(id))
            .map(id => convertToObjectId(id));

        if (validIds.length === 0) return deepFreeze([]);

        try {
            const query = this.#model.find({_id: {$in: validIds}}).session(session);
            if (projection) query.select(projection);

            const notes = await query.lean();
            return deepFreeze(notes.map(note => this.#sanitizeNoteMongoObject(note)));
        } catch (error) {
            console.error("Error finding notes by IDs:", error);
            throw new Error("Error finding notes by IDs");
        }
    }
}

module.exports = NoteRepository;
