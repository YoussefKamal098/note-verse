const AppError = require('../errors/app.error');
const httpCodes = require('../constants/httpCodes');
const statusMessages = require("../constants/statusMessages");
const config = require("../config/config");

/**
 * Controller for user-related operations.
 */
class UserController {
    /**
     * @private
     * @type {UserService}
     * @description The user service instance for handling user-related operations.
     */
    #userService
    /**
     * @private
     * @type {PermissionService}
     * @description The user service instance for handling permission-related operations.
     */
    #permissionService;

    /**
     * Constructs a new UserController.
     * @param depndencies
     * @param {UserService} depndencies.userService - The user service instance.
     * @param {PermissionService} depndencies.permissionService - The permission service instance.     */
    constructor({userService, permissionService}) {
        this.#userService = userService;
        this.#permissionService = permissionService;
    }

    /**
     * Retrieves a user by ID or Email.
     *
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @param {Function} next - The Express next middleware function.
     * @returns {Promise<void>} A promise that resolves when the response is sent.
     * @throws {AppError} If the user is not found.
     */
    async getUser(req, res, next) {
        const {email, id} = req.query;

        const user = id ?
            await this.#userService.findById(id) :
            await this.#userService.findByEmail(email);

        if (!user) {
            next(new AppError(
                statusMessages.USER_NOT_FOUND,
                httpCodes.NOT_FOUND.code,
                httpCodes.NOT_FOUND.name
            ));
        }

        res.status(httpCodes.OK.code).json({
            id: user?.id,
            email: user?.email,
            firstname: user?.firstname,
            lastname: user?.lastname,
            avatarUrl: user?.avatarUrl
        });
    }

    /**
     * Uploads a user's avatar.
     *
     * @param {FileUploadRequest} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @param {Function} next - The Express next middleware function.
     * @returns {Promise<void>} A promise that resolves when the response is sent.
     */
    async uploadUserAvatar(req, res, next) {
        const {userId} = req.params;
        if (!req.files[0]) {
            next(new AppError(
                statusMessages.NO_AVATAR_UPLOADED,
                httpCodes.BAD_REQUEST.code,
                httpCodes.BAD_REQUEST.name
            ));
            return;
        }

        const avatar = await this.#userService.updateAvatar(userId, req.files[0].fileId);

        if (!avatar) {
            next(new AppError(
                statusMessages.USER_NOT_FOUND,
                httpCodes.NOT_FOUND.code,
                httpCodes.NOT_FOUND.name
            ));
        }

        res.status(httpCodes.CREATED.code).json({avatarUrl: config.storage.constructFileUrl(avatar)});
    }

    /**
     * Gets all permissions granted by a specific user.
     * @param {import('express').Request} req - Express request object.
     * @param {string} req.params.userId - ID of the user who granted permissions.
     * @param {Object} req.body - Pagination options.
     * @param {number} [req.body.page=0] - Page number.
     * @param {number} [req.body.limit=10] - Items per page.
     * @param {import('express').Response} res - Express response object.
     * @returns {Promise<void>}
     */
    async getPermissionsGrantedByUser(req, res) {
        const {userId} = req.params;
        const {page = 0, limit = 10, resource} = req.query;

        const permissions = await this.#permissionService.getPermissionsGrantedByUser(
            userId,
            resource,
            {page, limit}
        );

        res.status(httpCodes.OK.code).json(permissions);
    }
}

module.exports = UserController;
