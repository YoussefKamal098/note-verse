const PaginatorService = require("../services/paginator.service");
const Note = require("../models/note.model");
const { sanitizeString, isValidObjectId, convertToObjectId} = require('../utils/string.utils');

class NoteRepository {
    #model;
    #paginator;

    constructor(model) {
        this.#model = model;
        this.#paginator = new PaginatorService(model, {});
    }

    async create(noteData={}) {
        try {
            const newNote = new this.#model(noteData);
            await newNote.save();
            return newNote;
        } catch (error) {
            console.error("Error creating note:", error);
            throw new Error("Unable to create note");
        }
    }

    async findByIdAndUpdate(noteId="", updates={}) {
        if (!isValidObjectId(noteId)) return null;

        try {
            const updatedNote = await this.#model.findByIdAndUpdate(convertToObjectId(noteId), updates, {
                new: true,
                runValidators: true
            }).lean();
            return updatedNote || null;
        } catch (error) {
            console.error("Error updating note:", error);
            return null;
        }
    }

    async findById(noteId="") {
        if (!isValidObjectId(noteId)) return null;

        try {
            const note = await this.#model.findById(convertToObjectId(noteId)).lean();
            return note || null;
        } catch (error) {
            console.error("Error finding note by ID:", error);
            return null;
        }
    }

    async findOne(query={}) {
        try {
            const note = await this.#model.findOne(query).lean();
            return note || null;
        } catch (error) {
            console.error("Error finding note:", error);
            return null;
        }
    }

    async deleteById(noteId="") {
        if (!isValidObjectId(noteId)) return null;

        try {
            const deletedNote = await this.#model.findByIdAndDelete(convertToObjectId(noteId));
            return deletedNote || null;
        } catch (error) {
            console.error("Error deleting note:", error);
            return null;
        }
    }

    // Find notes with pagination and sorting
    async find(query={}, options= {}) {
        const { page = 1, perPage = 10, sort = { createdAt: -1 } } = options;

        this.#paginator.page = page;
        this.#paginator.perPage = perPage;
        this.#paginator.sort = sort;

        try {
            return await this.#paginator.getPagination(query);
        } catch (error) {
            console.error("Error fetching notes:", error);
            return [];
        }
    }

    // Find notes based on a substring search and additional query filters and with pagination and sorting (user-specific)
    async findWithSearchText(searchText="", query={}, options={}) {
        const { page = 1, perPage = 10, sort = { createdAt: -1 } } = options;

        // Escape the substring to prevent regex injection
        const sanitizedSearchText = sanitizeString(searchText);
        let baseQuery = { ...query};

        if (sanitizedSearchText) {
            const regex = new RegExp(sanitizedSearchText, "i");

            baseQuery = {
                ...baseQuery,
                // Text search: Match full-text search in indexed fields
                // { $text: { $search: substring } },
                // Or use
                // Regex search: Match substrings in specific fields
                $or: [
                    { title: { $regex: regex } },
                    { tags: { $in: [regex] } }
                ]
                // (I will implement N-gram search later!)
            };
        }

        this.#paginator.page = page;
        this.#paginator.perPage = perPage;
        this.#paginator.sort = sort;

        try {
            return await this.#paginator.getPagination(baseQuery);
        } catch (error) {
            console.error("Error fetching notes:", error);
            return [];
        }
    }
}

module.exports = new NoteRepository(Note);
