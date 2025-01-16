const PaginatorService = require("../services/paginator.service");
const Note = require("../models/note.model");
const {sanitizeString, isValidObjectId, convertToObjectId} = require('../utils/string.utils');
const {sanitizeMongoObject} = require('../utils/obj.utils');

class NoteRepository {
    #model;
    #paginator;

    constructor(model) {
        this.#model = model;
        this.#paginator = new PaginatorService(model, {});
    }

    #sanitizeNoteMongoObject(note) {
        return {...sanitizeMongoObject(note), userId: note.userId.toString()};
    }

    async create(noteData = {}) {
        try {
            const newNote = new this.#model(noteData);
            await newNote.save();
            return this.#sanitizeNoteMongoObject(newNote.toObject());
        } catch (error) {
            console.error("Error creating note:", error);
            throw new Error("Error creating note");
        }
    }

    async findByIdAndUpdate(noteId = "", updates = {}) {
        if (!isValidObjectId(noteId)) return null;

        try {
            const updatedNote = await this.#model.findByIdAndUpdate(convertToObjectId(noteId), updates, {
                new: true,
                runValidators: true
            }).lean();
            return updatedNote ? this.#sanitizeNoteMongoObject(updatedNote) : null;
        } catch (error) {
            console.error("Error updating note:", error);
            throw new Error("Error updating note");
        }
    }

    async findById(noteId = "") {
        if (!isValidObjectId(noteId)) return null;

        try {
            const note = await this.#model.findById(convertToObjectId(noteId)).lean();
            return note ? this.#sanitizeNoteMongoObject(note) : null;
        } catch (error) {
            console.error("Error finding note by ID:", error);
            throw new Error("Error finding note by ID");
        }
    }

    async findOne(query = {}) {
        try {
            const note = await this.#model.findOne(query).lean();
            return note ? this.#sanitizeNoteMongoObject(note) : null;
        } catch (error) {
            console.error("Error finding note:", error);
            throw new Error("Error finding note");
        }
    }

    async deleteById(noteId = "") {
        if (!isValidObjectId(noteId)) return null;

        try {
            const deletedNote = await this.#model.findByIdAndDelete(convertToObjectId(noteId)).lean();
            return deletedNote ? this.#sanitizeNoteMongoObject(deletedNote) : null;
        } catch (error) {
            console.error("Error deleting note:", error);
            throw new Error("Error deleting note");
        }
    }

    // Find notes with pagination and sorting
    async find(query = {}, options = {}) {
        const {page = 1, perPage = 10, sort = {createdAt: -1}} = options;

        this.#paginator.page = page;
        this.#paginator.perPage = perPage;
        this.#paginator.sort = sort;

        try {
            const result = await this.#paginator.getPagination(query);
            result.data = result.data.map(this.#sanitizeNoteMongoObject);
            return result;
        } catch (error) {
            console.error("Error fetching notes:", error);
            throw new Error("Error fetching notes");
        }
    }

    // Find notes based on a substring search and additional query filters and with pagination and sorting (user-specific)
    async findWithSearchText(searchText = "", query = {}, options = {}) {
        const {page = 1, perPage = 10, sort = {createdAt: -1}} = options;

        // Escape the substring to prevent regex injection
        const sanitizedSearchText = sanitizeString(searchText);
        let baseQuery = {...query};

        if (sanitizedSearchText) {
            const regex = new RegExp(sanitizedSearchText, "i");

            baseQuery = {
                ...baseQuery,
                $or: [
                    {title: {$regex: regex}},
                    {tags: {$in: [regex]}}
                ]
            };
        }

        this.#paginator.page = page;
        this.#paginator.perPage = perPage;
        this.#paginator.sort = sort;

        try {
            const result = await this.#paginator.getPagination(baseQuery);
            result.data = result.data.map(this.#sanitizeNoteMongoObject);
            return result;
        } catch (error) {
            console.error("Error fetching notes:", error);
            throw new Error("Error fetching notes");
        }
    }
}

module.exports = new NoteRepository(Note);
