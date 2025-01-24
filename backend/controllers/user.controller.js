const httpCodes = require('../constants/httpCodes');
const AppError = require('../errors/app.error');
const userService = require('../services/user.service');
const statusMessages = require("../constants/statusMessages");

class UserController {
    #userService;

    constructor(userService) {
        this.#userService = userService;
    }

    async getMe(req, res, next) {
        const {id} = req.user;
        const user = await this.#userService.findById(id);
        if (!user) {
            next(new AppError(
                statusMessages.USER_NOT_FOUND,
                httpCodes.NOT_FOUND.code,
                httpCodes.NOT_FOUND.name
            ));
        }

        res.status(httpCodes.OK.code).json({
            id: user.id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
        });
    }
}

module.exports = new UserController(userService);
