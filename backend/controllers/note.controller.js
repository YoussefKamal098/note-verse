const QueryValidationService = require('../validations/noteQuery.validation.js');
const noteService = require('../services/note.service');

class NoteController {
    #noteService;
    #queryValidationService;

    constructor(noteService, noteQueryValidationService) {
        this.#noteService = noteService;
        this.#queryValidationService = noteQueryValidationService;
    }

    async create(req, res, next) {
        try {
            const { id:userId } = req.user;
            const { title, tags, content, isPinned } = req.body;

            const newNote = await this.#noteService.create(userId, { title, tags, content, isPinned });
            res.status(201).json({
                id: newNote._id,
                userId: userId,
                title: newNote.title,
                tags: newNote.tags,
                content: newNote.content,
                isPinned: newNote.isPinned,
                createdAt: newNote.createdAt,
                updatedAt: newNote.updatedAt
            });
        } catch (error) {
            next(error);
        }
    }

    async findById(req, res, next) {
        try {
            const { id:userId } = req.user;
            const { noteId } = req.params;

            const note = await this.#noteService.findById(userId, noteId);
            res.status(200).json({
                id: noteId,
                userId: userId,
                title: note.title,
                tags: note.tags,
                content: note.content,
                isPinned: note.isPinned,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id:userId } = req.user;
            const { noteId } = req.params;
            const { title, tags, content, isPinned } = req.body;

            const updatedNote = await this.#noteService.update(userId, noteId, { title, tags, content, isPinned });
            res.status(200).json({
                id: noteId,
                userId: userId,
                title: updatedNote.title,
                tags: updatedNote.tags,
                content: updatedNote.content,
                isPinned: updatedNote.isPinned,
                createdAt: updatedNote.createdAt,
                updatedAt: updatedNote.updatedAt
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteById(req, res, next) {
        try {
            const { id:userId } = req.user;
            const { noteId } = req.params;

            const deletedNote = await this.#noteService.deleteById(userId, noteId);
            res.status(200).json({
                id: noteId,
                userId: userId,
                title: deletedNote.title,
                tags: deletedNote.tags,
                content: deletedNote.content,
                isPinned: deletedNote.isPinned,
                createdAt: deletedNote.createdAt,
                updatedAt: deletedNote.updatedAt
            });
        } catch (error) {
            next(error);
        }
    }

    // Fetch notes with pagination and sorting
    async findByQuery(req, res, next) {
        try {
            const { id:userId } = req.user;
            const value = this.#queryValidationService.validateQuery(req.query);

            const { page, perPage, sort } = value;
            const result = await this.#noteService.findByQuery(userId, { userId }, { page, perPage, sort });

            res.status(200).json({...result, data: result.data.map((note) => ({
                id: note._id,
                userId: note.userId,
                title: note.title,
                tags: note.tags,
                content: note.content,
                isPinned: note.isPinned,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt
            }))});
        } catch (error) {
            next(error);
        }
    }

    // Search notes with substring and pagination, sorting
    async findWithSearchText(req, res, next) {
        try {
            const { id:userId } = req.user;
            const value = this.#queryValidationService.validateQuery(req.query);

            const { page, perPage, sort, searchText } = value;
            const result = await this.#noteService.findWithSearchText(userId, searchText, { userId }, { page, perPage, sort });

            res.status(200).json({...result, data: result.data.map((note) => ({
                id: note._id,
                userId: note.userId,
                title: note.title,
                tags: note.tags,
                content: note.content,
                isPinned: note.isPinned,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt
            }))});
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new NoteController(noteService, new QueryValidationService());