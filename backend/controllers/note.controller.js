const httpCodes = require('../constants/httpCodes');
const NoteQueryValidationService = require('../validations/noteQuery.validation.js');
const noteService = require('../services/note.service');

class NotesControllerUser {
    /**
     * @private
     * @type {NoteService}
     * @description The file storage service instance.
     */
    #noteService
    /**
     * @private
     * @type {NoteQueryValidationService}
     * @description The file storage service instance.
     */
    #queryValidationService;

    /**
     * @param {NoteService} noteService - Service for handling note operations.
     * @param {NoteQueryValidationService} noteQueryValidationService - Service for validating query parameters.
     */
    constructor(noteService, noteQueryValidationService) {
        this.#noteService = noteService;
        this.#queryValidationService = noteQueryValidationService;
    }

    /**
     * Creates a new note for a user.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     */
    async create(req, res) {
        const {userId} = req.params;
        const {title, tags, content, isPinned} = req.body;

        const newNote = await this.#noteService.create({userId, title, tags, content, isPinned});
        res.status(httpCodes.CREATED.code).json({
            id: newNote.id,
            userId: userId,
            title: newNote.title,
            tags: newNote.tags,
            content: newNote.content,
            isPinned: newNote.isPinned,
            createdAt: newNote.createdAt,
            updatedAt: newNote.updatedAt
        });
    }

    /**
     * Retrieves a specific note for a user by ID.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     */
    async findUserNoteById(req, res) {
        const {noteId, userId} = req.params;

        const note = await this.#noteService.findUserNoteById(userId, noteId);
        res.status(httpCodes.OK.code).json({
            id: noteId,
            userId: userId,
            title: note.title,
            tags: note.tags,
            content: note.content,
            isPinned: note.isPinned,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt
        });

    }

    /**
     * Updates a user's note by ID.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     */
    async updateUserNoteById(req, res) {
        const {noteId, userId} = req.params;
        const {title, tags, content, isPinned} = req.body;

        const updatedNote = await this.#noteService.updateUserNote(userId, noteId, {
            title,
            tags,
            content,
            isPinned
        });

        res.status(httpCodes.OK.code).json({
            id: noteId,
            userId: userId,
            title: updatedNote.title,
            tags: updatedNote.tags,
            content: updatedNote.content,
            isPinned: updatedNote.isPinned,
            createdAt: updatedNote.createdAt,
            updatedAt: updatedNote.updatedAt
        });
    }

    /**
     * Deletes a user's note by ID.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     */
    async deleteUserNoteById(req, res) {
        const {noteId, userId} = req.params;

        const deletedNote = await this.#noteService.deleteUserNoteById(userId, noteId);
        res.status(httpCodes.OK.code).json({
            id: noteId,
            userId: userId,
            title: deletedNote.title,
            tags: deletedNote.tags,
            content: deletedNote.content,
            isPinned: deletedNote.isPinned,
            createdAt: deletedNote.createdAt,
            updatedAt: deletedNote.updatedAt
        });

    }

    /**
     * Retrieves paginated, sorted, and filtered notes for a user.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     */
    async findPaginatedUserNotes(req, res) {
        const {userId} = req.params;
        const value = this.#queryValidationService.validateQuery(req.query);

        const {page, perPage, sort, searchText} = value;
        const result = await this.#noteService.findUserNotes(userId, {
            searchText,
            options: {page, perPage, sort}
        });

        res.status(httpCodes.OK.code).json({
            ...result, data: result.data.map((note) => ({
                id: note.id,
                userId: note.userId,
                title: note.title,
                tags: note.tags,
                content: note.content,
                isPinned: note.isPinned,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt
            }))
        });
    }
}

module.exports = new NotesControllerUser(noteService, new NoteQueryValidationService());
