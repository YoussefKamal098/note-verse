const AppError = require('../errors/app.error');
const NoteValidationService = require("../validations/note.validation");
const noteRepository = require("../repositories/note.repository");
const userService = require('../services/user.service');
const { convertToObjectId } = require('../utils/string.utils');
const  { deepFreeze } = require('../utils/obj.utils');

const DEFAULT_NOTE_OPTIONS = { page: 0, perPage: 10, sort: { isPinned: -1, createdAt: -1 } };

class NoteService {
    #noteRepository;
    #noteValidationService;
    #userService;

    constructor(noteRepository, noteValidationService, userService) {
        this.#noteRepository = noteRepository;
        this.#noteValidationService = noteValidationService;
        this.#userService = userService;
    }

    #validateNoteData({ title, tags, content, isPinned }, isNew=true) {
        if (isNew || title !== undefined) this.#noteValidationService.validateTitle(title);
        if (isNew || tags !== undefined) this.#noteValidationService.validateTags(tags);
        if (isNew || content !== undefined) this.#noteValidationService.validateContent(content);
        if (isNew || isPinned !== undefined) this.#noteValidationService.validateIsPinned(isPinned);
    }

    async create(userId="", { title = "", tags = [], content = "", isPinned = false }) {
        if (!userId) throw new AppError('User ID is required', 400);

        this.#validateNoteData({ title, tags, content, isPinned });
        if (!(await this.#userService.findById(userId))) {
            throw new AppError('User note found', 404);
        }

        try {
           return deepFreeze(await this.#noteRepository.create({
                userId: userId,
                title,
                tags,
                content,
                isPinned,
            }));
        } catch (error) {
            console.error("Error creating note:", error);
            throw new AppError('Unable to create note', 500);
        }
    }

    async findById(userId="", noteId="") {
        if (!userId || !noteId) throw new AppError('User ID and Note ID are required', 400);

        let note;

        try {
            note = await this.#noteRepository.findById(noteId);
        } catch (error) {
            console.error("Error finding note by ID:", error);
            throw new AppError('Unable to find note', 500);
        }

        if (!note || note.userId.toString() !== userId) {
            throw new AppError('Note not found or not associated with the user', 404);
        }

        return deepFreeze(note);
    }

    async update(userId, noteId, { title, tags, content, isPinned }) {
        if (!userId || !noteId) throw new AppError('User ID and Note ID are required', 400);
        this.#validateNoteData( { title, tags, content, isPinned }, false);

        if (!(await this.findById(userId, noteId))){
            throw new AppError('Note not found or not associated with the user', 404);
        }

        try {
            const updates = { title, tags, content, isPinned };
            return  deepFreeze(await this.#noteRepository.findByIdAndUpdate(noteId, updates));
        } catch (error) {
            console.error("Error updating note:", error);
            throw new AppError('Unable to update note', 500);
        }
    }

    async deleteById(userId, noteId) {
        if (!userId || !noteId) throw new AppError('User ID and Note ID are required', 400);

        if (!(await this.findById(userId, noteId))){
            throw new AppError('Note not found or not associated with the user', 404);
        }

        try {
            return deepFreeze(await this.#noteRepository.deleteById(noteId));
        } catch (error) {
            console.error("Error deleting note:", error);
            throw new AppError('Unable to delete note', 500);
        }
    }

    async findByQuery(userId="", query = {}, options =DEFAULT_NOTE_OPTIONS) {
        if (!userId) throw new AppError('User ID is required', 400);
        if (!(await this.#userService.findById(userId))) {
            throw new AppError('User note found', 404);
        }

        try {
            const {
                page=DEFAULT_NOTE_OPTIONS.page,
                perPage=DEFAULT_NOTE_OPTIONS.perPage,
                sort=DEFAULT_NOTE_OPTIONS.sort
            } = options;
            return deepFreeze(await this.#noteRepository.find({ ...query, userId: convertToObjectId(userId) }, { page, perPage, sort }));
        } catch (error) {
            console.error("Error fetching notes:", error);
            throw new AppError('Unable to fetch notes', 500);
        }
    }

    async findWithSearchText(userId = "", searchText = "", query = {}, options =DEFAULT_NOTE_OPTIONS) {
        if (!userId) throw new AppError('User ID is required', 400);
        await this.#userService.findById(userId);

        try {
            const {
                page=DEFAULT_NOTE_OPTIONS.page,
                perPage=DEFAULT_NOTE_OPTIONS.perPage,
                sort=DEFAULT_NOTE_OPTIONS.sort
            } = options;
            return deepFreeze(await this.#noteRepository.findWithSearchText(searchText, { ...query, userId: convertToObjectId(userId) }, { page, perPage, sort  }));
        } catch (error) {
            console.error("Error searching notes with substring and additional filters:", error);
            throw new AppError('Unable to search notes', 500);
        }
    }

}

module.exports = new NoteService(noteRepository, new NoteValidationService(), userService);
