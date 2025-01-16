const httpCodes = require('../constants/httpCodes');
const statusMessages = require('../constants/statusMessages');
const AppError = require('../errors/app.error');
const NoteValidationService = require("../validations/note.validation");
const noteRepository = require("../repositories/note.repository");
const userService = require('../services/user.service');
const {convertToObjectId} = require('../utils/string.utils');
const {deepFreeze} = require('../utils/obj.utils');

const DEFAULT_NOTE_PAGINATION_OPTIONS = {page: 0, perPage: 10, sort: {isPinned: -1, createdAt: -1}};

class NoteService {
    #noteRepository;
    #noteValidationService;
    #userService;

    constructor(noteRepository, noteValidationService, userService) {
        this.#noteRepository = noteRepository;
        this.#noteValidationService = noteValidationService;
        this.#userService = userService;
    }

    #validateNoteData({title, tags, content, isPinned}, isNew = true) {
        if (isNew || title !== undefined) {
            this.#noteValidationService.validateTitle(title);
        }
        if (isNew || tags !== undefined) {
            this.#noteValidationService.validateTags(tags);
        }
        if (isNew || content !== undefined) {
            this.#noteValidationService.validateContent(content);
        }
        if (isNew || isPinned !== undefined) {
            this.#noteValidationService.validateIsPinned(isPinned);
        }
    }

    async #ensureUserNoteExists(userId, noteId) {
        await this.findUserNoteById(userId, noteId);
    }

    async create({userId = "", title = "", tags = [], content = "", isPinned = false} = {}) {
        await this.#userService.ensureUserExists(userId);
        this.#validateNoteData({title, tags, content, isPinned});

        try {
            return deepFreeze(await this.#noteRepository.create({userId, title, tags, content, isPinned}));
        } catch (error) {
            throw new AppError(
                statusMessages.NOTE_CREATION_FAILED,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }
    }

    async findUserNoteById(userId = "", noteId = "") {
        await this.#userService.ensureUserExists(userId);
        let note;

        try {
            note = await this.#noteRepository.findById(noteId);
        } catch (error) {
            throw new AppError(
                statusMessages.USER_NOTE_NOT_FOUND,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }

        if (!note || note.userId !== userId) {
            throw new AppError(
                statusMessages.USER_NOTE_NOT_FOUND,
                httpCodes.NOT_FOUND.code,
                httpCodes.NOT_FOUND.name
            );
        }

        return deepFreeze(note);
    }

    async updateUserNote(userId = "", noteId = "", {title, tags, content, isPinned}) {
        await this.#ensureUserNoteExists(userId, noteId);
        this.#validateNoteData({title, tags, content, isPinned}, false);
        let note;

        try {
            const updates = {title, tags, content, isPinned};
            note = await this.#noteRepository.findByIdAndUpdate(noteId, updates);
        } catch (error) {
            throw new AppError(
                statusMessages.NOTE_UPDATE_FAILED,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }

        if (!note) {
            throw new AppError(
                statusMessages.NOTE_UPDATE_FAILED,
                httpCodes.NOT_FOUND.code,
                httpCodes.NOT_FOUND.name
            );
        }

        return deepFreeze(note);
    }

    async deleteUserNoteById(userId = "", noteId = "") {
        await this.#ensureUserNoteExists(userId, noteId);

        try {
            await this.#noteRepository.deleteById(noteId);
        } catch (error) {
            throw new AppError(
                statusMessages.NOTE_DELETION_FAILED,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }
    }

    async findUserNotes(userId = "", {
        searchText = "",
        query = {},
        options = DEFAULT_NOTE_PAGINATION_OPTIONS
    } = {}) {
        await this.#userService.ensureUserExists(userId);

        try {
            const {
                page = DEFAULT_NOTE_PAGINATION_OPTIONS.page,
                perPage = DEFAULT_NOTE_PAGINATION_OPTIONS.perPage,
                sort = DEFAULT_NOTE_PAGINATION_OPTIONS.sort
            } = options;

            if (searchText) {
                return deepFreeze(await this.#noteRepository.findWithSearchText(searchText, {
                    ...query,
                    userId: convertToObjectId(userId)
                }, {page, perPage, sort}));

            } else {
                return deepFreeze(await this.#noteRepository.find({
                    ...query,
                    userId: convertToObjectId(userId)
                }, {page, perPage, sort}));
            }

        } catch (error) {
            throw new AppError(
                statusMessages.NOTES_FETCH_FAILED,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }
    }
}

module.exports = new NoteService(noteRepository, new NoteValidationService(), userService);
