const httpCodes = require('../constants/httpCodes');
const statusMessages = require('../constants/statusMessages');
const {timeUnit, timeFromNow, time} = require('shared-utils/date.utils');
const AppError = require('../errors/app.error');
const PasswordHasherService = require('../services/passwordHasher.service');
const userValidationService = require('../validations/user.validation');
const userRepository = require("../repositories/user.repository");
const fileRepository = require("../repositories/file.repository");
const {deepFreeze} = require('shared-utils/obj.utils');
const dbErrorCodes = require('../constants/dbErrorCodes');

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
     * @private
     * @type {FileRepository}
     */
    #fileRepository;
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
     * @param {FileRepository} fileRepository - Repository for file database operations.
     */
    constructor(userValidationService, passwordHasherService, userRepository, fileRepository) {
        this.#userValidationService = userValidationService;
        this.passwordHasherService = passwordHasherService;
        this.#userRepository = userRepository;
        this.#fileRepository = fileRepository;
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
     * Creates or updates a local email/password user document with OTP verification handling.
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
    async createLocalUser({
                              firstname,
                              lastname,
                              email,
                              password,
                              otpCode,
                              otpCodeExpiry = time({[timeUnit.MINUTE]: 15}, timeUnit.MINUTE)
                          } = {}) {
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
            const user = await this.#userRepository.createLocalUser(userData);
            return deepFreeze({...user, otpCode, otpCodeExpiresAt})
        } catch (error) {
            if (error.code === dbErrorCodes.DUPLICATE_KEY) {
                throw new AppError(
                    statusMessages.USER_ALREADY_EXISTS,
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
     * Creates or retrieves a Google-authenticated user.
     *
     * This method delegates to the repository's findOrCreateGoogleUser method, which either finds an
     * existing user based on the provided email and Google ID or creates a new user document.
     * The returned user document is deep-frozen to prevent unintended modifications.
     *
     * @param {Object} googleUser - The Google user data.
     * @param {string} googleUser.firstname - The user's first name.
     * @param {string} googleUser.lastname - The user's last name.
     * @param {string} googleUser.email - The user's email address.
     * @param {string} googleUser.googleId - The user's ID Google.
     * @returns {Promise<Object>} The created or updated user document, deep-frozen.
     * @throws {Error} If a duplicate key error occurs, or if any other error occurs during the operation.
     */
    async createGoogleUser(googleUser = {}) {
        try {
            return await this.#userRepository.findOrCreateGoogleUser(googleUser);
        } catch (error) {
            if (error.code === dbErrorCodes.DUPLICATE_KEY) {
                throw new AppError(
                    statusMessages.USER_ALREADY_EXISTS,
                    httpCodes.CONFLICT.code,
                    httpCodes.CONFLICT.name
                );
            }

            throw new AppError(
                statusMessages.GOOGLE_USER_CREATE_FAILED,
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

    /**
     * Updates a user's avatar by linking to a File document via fileId.
     *
     * @param {string} userId - The ID of the user to update
     * @param {string} fileId - unique identifier of the File document from storage service
     * @returns {Promise<string>} Updated fileId
     * @throws {AppError} If:
     * - User doesn't exist (404)
     * - File doesn't exist (404)
     * - Database update fails (500)
     */
    async updateAvatar(userId, fileId) {
        await this.ensureUserExists(userId);

        // Verify the file exists first
        const file = await this.#fileRepository.findByFileId(fileId);
        if (!file) {
            throw new AppError(
                statusMessages.FILE_NOT_FOUND,
                httpCodes.NOT_FOUND.code,
                httpCodes.NOT_FOUND.name
            );
        }

        try {
            const updatedUser = await this.#userRepository.findByIdAndUpdate(
                userId,
                {avatar: fileId}
            );

            return updatedUser.avatar; // Returns the fileId string
        } catch (error) {
            throw new AppError(
                statusMessages.AVATAR_UPDATE_FAILED,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }
    }
}

module.exports = new UserService(new userValidationService(), new PasswordHasherService(), userRepository, fileRepository);
