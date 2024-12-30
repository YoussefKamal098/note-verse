const AppError = require('../errors/app.error');
const userService = require('../services/user.service');

class UserController {
    #userService;

    constructor(userService) {
        this.#userService = userService;
    }

    async getMe(req, res, next) {
        try {
            const { id } = req.user;
            const user = await this.#userService.findById(id);
            if (!user) {
                return next(new AppError('User not found', 404));
            }

            res.json({
                id: user._id,
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController(userService);
