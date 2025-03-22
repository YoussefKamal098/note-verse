const httpCodes = require('../constants/httpCodes');
const AppError = require('../errors/app.error');
const userService = require('../services/user.service');
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
    #userService;

    /**
     * Constructs a new UserController.
     * @param {UserService} userService - The user service instance.
     */
    constructor(userService) {
        this.#userService = userService;
    }

    /**
     * Retrieves a user by ID.
     *
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @param {Function} next - The Express next middleware function.
     * @returns {Promise<void>} A promise that resolves when the response is sent.
     * @throws {AppError} If the user is not found.
     */
    async getUser(req, res, next) {
        const {userId} = req.params;
        const user = await this.#userService.findById(userId);
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
            avatarUrl: config.storage.constructFileUrl(user?.avatar)
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

        res.status(httpCodes.CREATED.code).json({avatarUrl: config.storage.constructFileUrl(avatar)});
    }
}

module.exports = new UserController(userService);
