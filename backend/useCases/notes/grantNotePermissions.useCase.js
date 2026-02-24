const statusMessages = require('@/constants/statusMessages');
const roles = require('@/enums/roles.enum');
const resources = require('@/enums/resources.enum');
const {FRONTEND_ROUTES} = require('@/constants/frontendUrls');
const {isOwner} = require("@/utils/roles.utils");
const errorFactory = require('@/errors/factory.error');

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
        return this.#transactionService.executeTransaction(async (session) => {
                // 1. Validate all users exist first
                const existingUsers = await this.#validateUsersExist(userIds, session);

                // 2. Validate granter permissions
                const granterPermission = await this.#permissionRepo.getUserPermission(
                    {userId: grantedBy, resourceType: resources.NOTE, resourceId},
                    session
                );

                // 3. Get resource and granter details
                const [note, granter] = await Promise.all([
                    this.#noteRepo.findById(resourceId, {session}),
                    this.#userRepo.findById(grantedBy, {session})
                ]);

                if (!note) throw errorFactory.noteNotFound();
                if (isOwner(granterPermission?.role)) throw errorFactory.permissionDenied();

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
                    await this.#notify(
                        {
                            granter,
                            resourceId,
                            note,
                            users: existingUsers,
                            role,
                            message,
                            session
                        }
                    )
                }

                return permissions;
            }, {
                message: statusMessages.PERMISSION_GRANT_FAILED,
                conflictMessage: statusMessages.PERMISSIONS_GRANT_CONFLICT
            }
        );
    }

    /**
     * notify granted users
     * @private
     */
    async #notify({
                      granter,
                      resourceId,
                      note,
                      users,
                      role,
                      message,
                      session
                  }) {
        // Define default message for notification
        const defaultMessage = {
            [roles.VIEWER]: 'You now have view-only access to this note',
            [roles.EDITOR]: 'You can now view and edit this note',
        }[role];

        await this.#sendNotifications({
            granter,
            resourceId,
            note,
            users,
            role,
            message: message || defaultMessage,
            session
        });
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

            throw errorFactory.usersNotFound(missingIds);
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
}

module.exports = GrantNotePermissionsUseCase;
