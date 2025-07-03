const AppError = require('../../errors/app.error');
const httpCodes = require('../../constants/httpCodes');
const statusMessages = require('../../constants/statusMessages');
const roles = require('../../enums/roles.enum');
const resources = require('../../enums/resources.enum');
const {FRONTEND_ROUTES} = require('../../constants/frontendUrls');

class GrantNotePermissionsUseCase {
    /**
     * @private
     * @type {PermissionRepository}
     */
    #permissionRepo;

    /**
     * @private
     * @type {UserRepository}
     */
    #userRepo;

    /**
     * @private
     * @type {NoteRepository}
     */
    #noteRepo;

    /**
     * @private
     * @type {EmailMediator}
     */
    #emailMediator;

    /**
     * @private
     * @type {BaseTransactionService}
     */
    #transactionService;
    ;

    /**
     * @param {Object} dependencies
     * @param {PermissionRepository} dependencies.permissionRepo
     * @param {UserRepository} dependencies.userRepo
     * @param {NoteRepository} dependencies.noteRepo
     * @param {EmailMediator} dependencies.emailMediator
     */

    constructor({
                    permissionRepo,
                    userRepo,
                    noteRepo,
                    emailMediator,
                    transactionService
                }) {
        this.#permissionRepo = permissionRepo;
        this.#userRepo = userRepo;
        this.#noteRepo = noteRepo;
        this.#emailMediator = emailMediator;
        this.#transactionService = transactionService;
    }

    /**
     * Grants permissions and sends notifications in a single transaction
     * @param {Object} params
     * @param {string} params.grantedBy - ID of user granting permissions
     * @param {string} params.resourceId - Note ID being shared
     * @param {string[]} params.userIds - Array of recipient user IDs
     * @param {string} params.role - Permission role being granted
     * @param {string} [params.message] - Optional custom message
     * @param {boolean} [params.notify=true] - Whether to send notifications
     * @returns {Promise<Readonly<Object[]>>} Array of created/updated permissions
     * @throws {AppError} For authorization failures
     */
    async execute({grantedBy, resourceId, userIds, role, message = '', notify = true}) {
        return this.#transactionService.executeTransaction(
            async (session) => {
                // 1. Validate all users exist first
                const existingUsers = await this.#validateUsersExist(userIds, session);

                // 2. Validate granter permissions
                const granterPermission = await this.#permissionRepo.getUserPermission(
                    {userId: grantedBy, resourceType: resources.NOTE, resourceId},
                    session
                );

                // 3. Get resource and granter details
                const [note, granter] = await Promise.all([
                    this.#noteRepo.findById(resourceId, session),
                    this.#userRepo.findById(grantedBy, {session})
                ]);

                if (!note) {
                    throw new AppError(
                        statusMessages.NOTE_NOT_FOUND,
                        httpCodes.NOT_FOUND.code,
                        httpCodes.NOT_FOUND.name
                    );
                }

                if (!this.#isOwner({userId: grantedBy, note, permission: granterPermission})) {
                    throw new AppError(
                        statusMessages.PERMISSION_DENIED,
                        httpCodes.FORBIDDEN.code,
                        httpCodes.FORBIDDEN.name
                    );
                }

                // 3. Process permissions
                const permissions = await this.#permissionRepo.grantPermissionsForUsers({
                    userIds,
                    resourceType: resources.NOTE,
                    resourceId,
                    role,
                    grantedBy
                }, session);

                // 4. Send notifications if enabled
                if (notify) {
                    await this.#sendNotifications({
                        granter,
                        resourceId,
                        note,
                        users: existingUsers,
                        role,
                        message: message || {
                            [roles.VIEWER]: 'You now have view-only access to this note',
                            [roles.EDITOR]: 'You can now view and edit this note',
                        }[role],
                        session
                    });
                }

                return permissions;
            },
            {
                message: statusMessages.PERMISSION_GRANT_FAILED,
                conflictMessage: statusMessages.PERMISSIONS_GRANT_CONFLICT
            }
        );
    }


    /**
     * Validates that all users exist
     * @private
     */
    async #validateUsersExist(userIds, session) {
        const users = await this.#userRepo.findByIds(userIds, {session});

        if (users.length !== userIds.length) {
            const foundIds = new Set(users.map(u => u.id));
            const missingIds = userIds.filter(id => !foundIds.has(id));

            throw new AppError(
                statusMessages.USERS_NOT_FOUND.replace('%s', missingIds.join(', ')),
                httpCodes.NOT_FOUND.code,
                httpCodes.NOT_FOUND.name
            );
        }

        return users;
    }

    /**
     * Sends notifications to all recipients
     * @private
     */
    async #sendNotifications({granter, resourceId, note, users, role, message}) {
        await Promise.all(
            users.map(recipient =>
                this.#emailMediator.sendNoteSharingNotification({
                    recipientEmail: recipient.email,
                    recipientName: recipient.firstname,
                    senderFirstname: granter.firstname,
                    senderLastname: granter.lastname,
                    senderEmail: granter.email,
                    senderAvatar: granter.avatarUrl,
                    customMessage: message,
                    noteTitle: note.title,
                    role: role,
                    noteLink: FRONTEND_ROUTES.NOTE(resourceId)
                })
            )
        );
    }

    /**
     * Determines if user is the owner
     * @param {Object} params
     * @param {string} params.userId
     * @param {Object} params.note
     * @param {Object|null} params.permission
     * @returns {boolean}
     */
    #isOwner({userId, note, permission}) {
        return note.userId === userId || permission?.role === roles.OWNER;
    }
}

module.exports = GrantNotePermissionsUseCase;
