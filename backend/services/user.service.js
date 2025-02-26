const httpCodes = require('../constants/httpCodes');
const statusMessages = require('../constants/statusMessages');
const {timeUnit, timeFromNow, time} = require('shared-utils/date.utils');
const AppError = require('../errors/app.error');
const PasswordHasherService = require('../services/passwordHasher.service');
const userValidationService = require('../validations/user.validation');
const userRepository = require("../repositories/user.repository");
const {deepFreeze} = require('shared-utils/obj.utils');


/**
 * Service for managing user operations.
 *
 * This service provides methods to:
 * - Ensure a user exists based on an ID.
 * - Create a new user with proper validations and hashed credentials.
 * - Retrieve user data for email verification.
 * - Mark a user's email as verified.
 * - Find a user by ID or by email (only verified users).
 *
 * @class UserService
 */
class UserService {
    /**
     * @private
     * @type {UserValidationService}
     */
    #userValidationService;
    /**
     * @private
     * @type {UserRepository}
     */
    #userRepository;
    /**
     * @type {PasswordHasherService}
     */
    passwordHasherService;

    /**
     * Creates an instance of UserService.
     *
     * @param {UserValidationService} userValidationService - Service for validating user data.
     * @param {PasswordHasherService} passwordHasherService - Service for hashing and verifying passwords.
     * @param {UserRepository} userRepository - Repository for user database operations.
     */
    constructor(userValidationService, passwordHasherService, userRepository) {
        this.#userValidationService = userValidationService;
        this.passwordHasherService = passwordHasherService;
        this.#userRepository = userRepository;
    }

    /**
     * Ensures that a user exists with the given ID.
     *
     * @param {string} userId - The ID of the user.
     * @returns {Promise<void>}
     * @throws {AppError} If the user does not exist.
     */
    async ensureUserExists(userId) {
        if (!userId || !(await this.findById(userId))) {
            throw new AppError(
                statusMessages.USER_NOT_FOUND,
                httpCodes.NOT_FOUND.code,
                httpCodes.NOT_FOUND.name
            );
        }
    }

    /**
     * Creates a new user with the provided details.
     *
     * Validates the user's email, password, and names.
     * Hashes the password and OTP code,
     * sets the OTP expiry time, and stores the new user.
     *
     * @param {Object} userDetails - The details of the user.
     * @param {string} userDetails.firstname - The user's first name.
     * @param {string} userDetails.lastname - The user's last name.
     * @param {string} userDetails.email - The user's email address.
     * @param {string} userDetails.password - The user's password.
     * @param {string} userDetails.otpCode - The one-time password (OTP) code for email verification.
     * @param {number|Date|string} [userDetails.otpCodeExpiry=time({[timeUnit.MINUTE]: 15}, timeUnit.MINUTE)]
     *        - The expiry time for the OTP code.
     *        Defaults to 15 minutes.
     * @returns {Promise<Object>} The newly created user object, deep-frozen.
     * @throws {AppError} If user creation fails due to a conflict or server error.
     */
    async create({
                     firstname,
                     lastname,
                     email,
                     password,
                     otpCode,
                     otpCodeExpiry = time({[timeUnit.MINUTE]: 15}, timeUnit.MINUTE)
                 } = {}) {
        const existingUser = await this.findByEmail(email);
        if (existingUser) {
            throw new AppError(
                statusMessages.USER_ALREADY_EXISTS,
                httpCodes.CONFLICT.code,
                httpCodes.CONFLICT.name
            );
        }

        this.#userValidationService.validateEmail('email', email);
        this.#userValidationService.validatePassword('password', password);
        this.#userValidationService.validateName('firstname', firstname);
        this.#userValidationService.validateName('lastname', lastname);

        const hashedPassword = await this.passwordHasherService.hash(password);
        const hashedOtpCode = await this.passwordHasherService.hash(otpCode);
        const otpCodeExpiresAt = timeFromNow({[timeUnit.MINUTE]: otpCodeExpiry});

        const userData = {
            firstname,
            lastname,
            email,
            password: hashedPassword,
            otpCode: hashedOtpCode,
            otpCodeExpiresAt
        };

        try {
            const user = await this.#userRepository.create(userData);
            return deepFreeze({...user, otpCode, otpCodeExpiresAt})
        } catch (error) {
            if (error.name === "Conflict") {
                throw new AppError(
                    statusMessages.USER_CREATION_FAILED,
                    httpCodes.CONFLICT.code,
                    httpCodes.CONFLICT.name
                );
            }

            throw new AppError(
                statusMessages.USER_CREATION_FAILED,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }
    }

    /**
     * Retrieves a user with the specified email for email verification.
     *
     * The returned object includes the OTP code, OTP expiration, and verification status.
     *
     * @param {string} email - The email address of the user.
     * @returns {Promise<Object | null>} The user object deep-frozen containing OTP-related fields if found.
     * @throws {AppError} If an error occurs during retrieval.
     */
    async getUserForEmailVerification(email) {
        try {
            return await this.#userRepository.findOne(
                {email},
                {otpCode: 1, otpCodeExpiresAt: 1, isVerified: 1}
            );
        } catch (error) {
            throw new AppError(
                httpCodes.INTERNAL_SERVER_ERROR.message,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }
    }

    /**
     * Marks the email as verified for the user with the given email address.
     *
     * Updates the user's record to set the email as verified, records the verification date,
     * and clears the OTP code and its expiration.
     *
     * @param {string} email - The email address to mark as verified.
     * @returns {Promise<Object | null>} The updated user object deep-frozen if found.
     * @throws {AppError} If an error occurs during the update.
     */
    async markEmailAsVerified(email) {
        try {
            return await this.#userRepository.findByEmailAndUpdate(email, {
                isVerified: true,
                verifiedAt: new Date(),
                otpCode: null,
                otpCodeExpiresAt: null
            });
        } catch (error) {
            throw new AppError(
                httpCodes.INTERNAL_SERVER_ERROR.message,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }
    }

    /**
     * Finds a user by their unique identifier.
     *
     * @param {string} userId - The unique ID of the user.
     * @returns {Promise<Object| null>} The deep-frozen user object if found.
     * @throws {AppError} If an error occurs during retrieval.
     */
    async findById(userId) {
        try {
            return await this.#userRepository.findById(userId);
        } catch (error) {
            throw new AppError(
                httpCodes.INTERNAL_SERVER_ERROR.message,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }
    }

    /**
     * Finds a verified user by their email address.
     *
     * @param {string} email - The email address of the user.
     * @returns {Promise<Object | null>} The user object deep-frozen if found and verified if found.
     * @throws {AppError} If an error occurs during retrieval.
     */
    async findByEmail(email) {
        try {
            return await this.#userRepository.findOne({email, isVerified: true});
        } catch (error) {
            throw new AppError(
                httpCodes.INTERNAL_SERVER_ERROR.message,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }
    }
}

module.exports = new UserService(new userValidationService(), new PasswordHasherService(), userRepository);
