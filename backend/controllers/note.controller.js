const AppError = require('../errors/app.error');
const httpCodes = require('../constants/httpCodes');
const statusMessages = require('../constants/statusMessages');
const resources = require('../enums/resources.enum');

class NotesController {
    /**
     * @private
     * @type {NoteService}
     * @description Service for handling note operations.
     */
    #noteService
    /**
     * @private
     * @type {PermissionService}
     * @description Service for handling permission operations.
     */
    #permissionService

    /**
     * @private
     * @type {GrantNotePermissionsUseCase}
     * @description UseCase for Grant permissions
     */
    #grantNotePermissionsUseCase
    /**
     * @private
     * @type {CreateNoteUseCase}
     * @description UseCase for Create note
     */
    #createNoteUseCase
    /**
     * @private
     * @type {UpdateNoteUseCase}
     * @description UseCase for Update note
     */
    #updateNoteUseCase
    /**
     * @private
     * @type {VersionService}
     * @descriptionService for handling note versions operations.
     */
    #versionService
    /**
     * @private
     * @type {ReactionService}
     */
    #reactionService;

    /**
     * Constructs a new NotesController.
     * @param {Object} dependencies - Controller dependencies.
     * @param {NoteService} dependencies.noteService - Note service instance.
     * @param {PermissionService} dependencies.permissionService - Permission service instance.
     * @param {GrantNotePermissionsUseCase} dependencies.grantNotePermissionsUseCase - Grant permissions UseCase
     * @param {import("@/services/reaction.service").ReactionService} dependencies.reactionService
     * @param {CreateNoteUseCase} dependencies.createNoteUseCase - Create note UseCase
     * @param {UpdateNoteUseCase} dependencies.updateNoteUseCase - Update note UseCase
     * */
    constructor({
                    noteService, permissionService,
                    grantNotePermissionsUseCase,
                    createNoteUseCase,
                    updateNoteUseCase,
                    reactionService,
                    versionService,
                }) {
        this.#noteService = noteService;
        this.#permissionService = permissionService;
        this.#grantNotePermissionsUseCase = grantNotePermissionsUseCase;
        this.#createNoteUseCase = createNoteUseCase;
        this.#updateNoteUseCase = updateNoteUseCase;
        this.#reactionService = reactionService;
        this.#versionService = versionService;
    }

    /**
     * Creates a new note for a user.
     * @param {import('express').Request} req - Express request object.
     * @param {string} req.userId - ID of the user creating the note.
     * @param {Object} req.body - Note data.
     * @param {string} req.body.title - Note title.
     * @param {string[]} [req.body.tags] - Note tags.
     * @param {string} req.body.content - Note content.
     * @param {boolean} [req.body.isPinned=false] - Whether the note is pinned.
     * @param {boolean} [req.body.isPublic=false] - Whether the note is public.
     * @param {import('express').Response} res - Express response object.
     * @returns {Promise<void>}
     * @throws {AppError} If note creation fails.
     */
    async create(req, res) {
        const userId = req.userId;
        const {
            title,
            tags,
            content,
            isPinned,
            isPublic
        } = req.body;

        const newNote = await this.#createNoteUseCase.execute({
            userId,
            title,
            tags,
            content,
            isPinned,
            isPublic
        });

        res.status(httpCodes.CREATED.code).json(newNote);
    }

    /**
     * Retrieves a specific note by ID.
     * @param {import('express').Request} req - Express request object.
     * @param {string} req.userId - ID of the authenticated user.
     * @param {OutputNote} req.note - The note object attached by middleware.
     * @param {import('express').Response} res - Express response object.
     * @returns {Promise<void>}
     */
    async findNoteById(req, res) {
        const userId = req.userId;
        const note = req.note;
        const reaction = await this.#reactionService.getUserReaction(note.id, userId);
        res.status(httpCodes.OK.code).json({
            ...note,
            authUserReaction: reaction
        });
    }

    /**
     * Updates a note by ID.
     * @param {import('express').Request} req - Express request object.
     * @param {string} req.userId - ID of the authenticated user.
     * @param {string} req.params.noteId - ID of the note to update.
     * @param {Object} req.body - Updated note data.
     * @param {string} [req.body.title] - New note title.
     * @param {string[]} [req.body.tags] - New note tags.
     * @param {string} [req.body.content] - New note content.
     * @param {boolean} [req.body.isPinned] - New pinned status.
     * @param {boolean} [req.body.isPublic] - New public status.
     * @param {import('express').Response} res - Express response object.
     * @returns {Promise<void>}
     * @throws {AppError} If note update fails (404).
     */
    async updateNoteById(req, res) {
        const {noteId} = req.params;
        const {title, tags, content, isPinned, isPublic, commitMessage} = req.body;

        const {note: updatedNote} = await this.#updateNoteUseCase.execute({
            userId: req.userId,
            noteId,
            commitMessage,
            updateData: {
                title,
                tags,
                content,
                isPinned,
                isPublic
            }
        });

        if (!updatedNote) {
            throw new AppError(
                statusMessages.NOTE_UPDATE_FAILED,
                httpCodes.NOT_FOUND.code,
                httpCodes.NOT_FOUND.name
            );
        }

        res.status(httpCodes.OK.code).json(updatedNote);
    }

    /**
     * Deletes a note by ID.
     * @param {import('express').Request} req - Express request object.
     * @param {string} req.params.noteId - ID of the note to delete.
     * @param {import('express').Response} res - Express response object.
     * @returns {Promise<void>}
     * @throws {AppError} If note deletion fails (404).
     */
    async deleteNoteById(req, res) {
        const {noteId} = req.params;

        const deletedNote = await this.#noteService.deleteNoteById(noteId);

        if (!deletedNote) {
            throw new AppError(
                statusMessages.NOTE_DELETION_FAILED,
                httpCodes.NOT_FOUND.code,
                httpCodes.NOT_FOUND.name
            );
        }

        res.status(httpCodes.OK.code).json({message: statusMessages.NOTE_DELETION_SUCCESS});
    }

    /**
     * Retrieves paginated, sorted, and filtered notes for authenticated user.
     * @param {import('express').Request} req - Express request object.
     * @param {string} req.userId - ID of the authenticated user.
     * @param {Object} req.query - Query parameters.
     * @param {number} [req.query.page=1] - Page number.
     * @param {number} [req.query.perPage=10] - Items per page.
     * @param {Object} [req.query.sort] - Sorting criteria.
     * @param {string} [req.query.searchText] - Text to search in notes.
     * @param {import('express').Response} res - Express response object.
     * @returns {Promise<void>}
     */
    async findPaginatedUserNotes(req, res) {
        const userId = req.userId;
        const {page, perPage, sort, searchText} = req.query;

        const result = await this.#noteService.findUserNotes(userId, {
            searchText,
            options: {page, perPage, sort}
        });

        res.status(httpCodes.OK.code).json({...result});
    }

    /**
     * Grants permissions for a note to multiple users.
     * @param {import('express').Request} req - Express request object.
     * @param {string} req.params.noteId - ID of the note.
     * @param {string} req.userId - ID of the user granting permissions.
     * @param {Object} req.body - Permission data.
     * @param {string[]} req.body.userIds - IDs of users to receive permissions.
     * @param {string} req.body.role - Permission role to grant.
     * @param {import('express').Response} res - Express response object.
     * @returns {Promise<void>}
     */
    async grantPermissions(req, res) {
        const {noteId} = req.params;
        const {userIds, role, notify, message} = req.body;

        const permissions = await this.#grantNotePermissionsUseCase.execute({
            userIds,
            resourceId: noteId,
            role,
            grantedBy: req.userId,
            notify,
            message
        });

        res.status(httpCodes.CREATED.code).json(permissions.map(perm => ({
            id: perm.id,
            userId: perm.userId,
            role: perm.role
        })));
    }

    /**
     * Gets all permissions for a specific note.
     * @param {import('express').Request} req - Express request object.
     * @param {string} req.params.noteId - ID of the note.
     * @param {Object} req.body - Pagination options.
     * @param {number} [req.body.page=0] - Page number.
     * @param {number} [req.body.limit=10] - Items per page.
     * @param {import('express').Response} res - Express response object.
     * @returns {Promise<void>}
     */
    async getNotePermissions(req, res) {
        const {noteId} = req.params;
        const {page = 0, limit = 10} = req.query;

        const users = await this.#permissionService.getResourceUsers({
            resourceType: resources.NOTE,
            resourceId: noteId
        }, {page, limit});

        res.status(httpCodes.OK.code).json(users);
    }

    /**
     * Get commit history for a note
     */
    async getCommitHistory(req, res) {
        const {noteId} = req.params;
        const {page = 0, limit = 10} = req.query;

        const history = await this.#versionService.getCommitHistory(
            {noteId},
            {page, limit}
        );

        res.status(httpCodes.OK.code).json(history);
    }

    /**
     * Get contributors for a note
     */
    async getContributors(req, res) {
        const {noteId} = req.params;
        const {page = 0, limit = 10} = req.query;

        const contributors = await this.#versionService.getContributors(
            {noteId},
            {page, limit}
        );

        res.status(httpCodes.OK.code).json(contributors);
    }


    /**
     * Create, update, or remove a reaction for a note
     * @async
     * @method createOrUpdateReaction
     * @param {import('express').Request} req - Express request object
     * @param {string} req.userId - ID of the authenticated user.
     * @param {import('express').Response} res - Express response object
     * @returns {Promise<void>}
     * @description Publishes reaction event to message queue for async processing
     */
    async reaction(req, res) {
        const {noteId} = req.params;
        const {type} = req.body;
        const userId = req.userId;

        // Publish reaction event
        await this.#reactionService.reaction({
            noteId,
            userId,
            type
        });

        // Return 202 Accepted since processing is async
        res.status(httpCodes.ACCEPTED.code).json({
            noteId,
            message: type ? 'Reaction queued for processing ' : 'Reaction removal queued for processing',
            ...(type ? {reaction: type} : {}),
        });
    }
}

module.exports = NotesController;
