const httpCodes = require('../constants/httpCodes');
const statusMessages = require('../constants/statusMessages');
const AppError = require('../errors/app.error');
const PasswordHasherService = require('../services/passwordHasher.service');
const userValidationService = require('../validations/user.validation');
const userRepository = require("../repositories/user.repository");
const {deepFreeze} = require('../utils/obj.utils');

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

    async findByRefreshToken(refreshToken = "") {
        let user;

        try {
            user = await this.#userRepository.findOne({refreshToken});
        } catch (error) {
            throw new AppError(
                statusMessages.USER_NOT_FOUND,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }

        return user ? deepFreeze(user) : null;
    }

    async updatePassword(userId = "", newPassword = "") {
        await this.ensureUserExists(userId);
        this.#userValidationService.validatePassword('password', newPassword);
        let user;

        try {
            const hashedPassword = await this.passwordHasherService.hash(newPassword);
            user = await this.#userRepository.findByIdAndUpdate(userId, {password: hashedPassword});
        } catch (error) {
            throw new AppError(
                statusMessages.PASSWORD_UPDATE_FAILED,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }

        return user ? deepFreeze(user) : null;
    }

    async updateEmail(userId = "", newEmail = "") {
        await this.ensureUserExists(userId);
        this.#userValidationService.validateEmail('email', newEmail);
        let user;

        try {
            user = await this.#userRepository.findByIdAndUpdate(userId, {email: newEmail});
            if (!user) return null;
        } catch (error) {
            throw new AppError(
                statusMessages.EMAIL_UPDATE_FAILED,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }

        return user ? deepFreeze(user) : null;
    }

    async updateFullname(userId = "", {firstname = "", lastname = ""} = {}) {
        await this.ensureUserExists(userId);
        this.#userValidationService.validateName('firstname', firstname);
        this.#userValidationService.validateName('lastname', lastname);
        let user;

        try {
            user = await this.#userRepository.findByIdAndUpdate(userId, {firstname, lastname});
        } catch (error) {
            throw new AppError(
                statusMessages.FULLNAME_UPDATE_FAILED,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }

        return user ? deepFreeze(user) : null;
    }

    async updateRefreshToken(userId = "", newRefreshToken = null) {
        await this.ensureUserExists(userId);
        let user;

        try {
            user = await this.#userRepository.findByIdAndUpdate(userId, {refreshToken: newRefreshToken});
        } catch (error) {
            throw new AppError(
                statusMessages.REFRESH_TOKEN_UPDATE_FAILED,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }

        return user ? deepFreeze(user) : null;
    }
}

module.exports = new UserService(new userValidationService(), new PasswordHasherService(), userRepository);
