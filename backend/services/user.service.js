const httpCodes = require('../constants/httpCodes');
const statusMessages = require('../constants/statusMessages');
const AppError = require('../errors/app.error');
const PasswordHasherService = require('../services/passwordHasher.service');
const userValidationService = require('../validations/user.validation');
const userRepository = require("../repositories/user.repository");
const {deepFreeze} = require('shared-utils/obj.utils');

class UserService {
    #userValidationService;
    #userRepository;
    passwordHasherService;

    constructor(userValidationService, passwordHasherService, userRepository) {
        this.#userValidationService = userValidationService;
        this.passwordHasherService = passwordHasherService;
        this.#userRepository = userRepository;
    }

    async ensureUserExists(userId = "") {
        if (!userId || !(await this.findById(userId))) {
            throw new AppError(
                statusMessages.USER_NOT_FOUND,
                httpCodes.NOT_FOUND.code,
                httpCodes.NOT_FOUND.name
            );
        }
    }

    async create({firstname = "", lastname = "", email = "", password = ""} = {}) {
        this.#userValidationService.validateEmail('email', email);
        this.#userValidationService.validatePassword('password', password);
        this.#userValidationService.validateName('firstname', firstname);
        this.#userValidationService.validateName('lastname', lastname);

        const hashedPassword = await this.passwordHasherService.hash(password);
        const userData = {
            firstname,
            lastname,
            email,
            password: hashedPassword,
        };

        let savedUser;

        try {
            savedUser = this.#userRepository.create(userData);
        } catch (error) {
            throw new AppError(
                statusMessages.USER_CREATION_FAILED,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }

        return deepFreeze(savedUser);
    }

    async findById(userId = "") {
        let user;

        try {
            user = await this.#userRepository.findById(userId);
        } catch (error) {
            throw new AppError(
                statusMessages.USER_NOT_FOUND,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }

        return user ? deepFreeze(user) : null;
    }

    async findByEmail(email = "") {
        let user;

        try {
            user = await this.#userRepository.findOne({email});
        } catch (error) {
            throw new AppError(
                statusMessages.USER_NOT_FOUND,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }

        return user ? deepFreeze(user) : null;
    }
}

module.exports = new UserService(new userValidationService(), new PasswordHasherService(), userRepository);
