const httpCodes = require('../constants/httpCodes');
const statusMessages = require('../constants/statusMessages');
const {timeUnit, time, timeFromNow} = require('shared-utils/date.utils');
const {deepFreeze} = require('shared-utils/obj.utils');
const {generateSecureOTP} = require("../utils/otp.utils");
const AppError = require('../errors/app.error');
const PasswordHasherService = require('../services/passwordHasher.service');
const userValidationService = require('../validations/user.validation');
const cacheService = require('../services/cache.service');
const userRepository = require("../repositories/user.repository");
const fileRepository = require("../repositories/file.repository");
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
     * @private
     * @type {CacheService}
     */
    #cacheService
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
     * @param {CacheService} cacheService - The cache service instance used for caching operations.
     */
    constructor(userValidationService, passwordHasherService, userRepository, fileRepository, cacheService) {
        this.#userValidationService = userValidationService;
        this.passwordHasherService = passwordHasherService;
        this.#userRepository = userRepository;
        this.#fileRepository = fileRepository;
        this.#cacheService = cacheService;
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
     * Generates the cache key for an unverified user.
     *
     * @private
     * @param {string} email - The user's email address.
     * @returns {string} The generated cache key.
     */
    #getUnverifiedUserCacheKey(email) {
        return `user:unverified:${email}`;
    }

    /**
     * Creates an unverified user by validating the user details, hashing the password and OTP,
     * generating an OTP code and expiry time, and caching the user data for later verification.
     *
     * This method performs the following steps:
     * 1. Validates the user's email, password, and names.
     * 2. Generates a secure OTP code.
     * 3. Hashes both the password and the OTP code.
     * 4. Calculates the OTP expiry time (default is 15 minutes).
     * 5. Caches the user data (with hashed values) in the cache service using a key based on the email.
     * 6. Returns the plain OTP code and its expiry time (both deep-frozen) for further verification.
     *
     * @param {Object} userData - The details of the user.
     * @param {string} userData.firstname - The user's first name.
     * @param {string} userData.lastname - The user's last name.
     * @param {string} userData.email - The user's email address.
     * @param {string} userData.password - The user's password.
     * @returns {Promise<Readonly<{otpCode, otpCodeExpiresAt}>>} A deep-frozen object containing the plain OTP code and OTP expiry date.
     * @throws {AppError} If caching the unverified user data fails.
     */
    async createUnverifiedUser(userData) {
        this.#userValidationService.validateEmail('email', userData.email);
        this.#userValidationService.validatePassword('password', userData.password);
        this.#userValidationService.validateName('firstname', userData.firstname);
        this.#userValidationService.validateName('lastname', userData.lastname);

        const otpCode = generateSecureOTP({
            length: 6,
            charType: 'alphanumeric',
            caseSensitive: true
        });

        const hashedPassword = await this.passwordHasherService.hash(userData.password);
        const hashedOtpCode = await this.passwordHasherService.hash(otpCode);
        const otpCodeExpiry = time({[timeUnit.MINUTE]: 15});

        userData = {...userData, otpCode: hashedOtpCode, password: hashedPassword};

        try {
            await this.#cacheService.set(this.#getUnverifiedUserCacheKey(userData.email), JSON.stringify(userData), otpCodeExpiry);
            return deepFreeze({otpCode, otpCodeExpiresAt: timeFromNow({[timeUnit.SECOND]: otpCodeExpiry})});
        } catch (error) {
            throw new AppError(
                statusMessages.USER_CREATION_FAILED,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }
    }

    /**
     * Creates or retrieves an authenticated user for a given provider.
     *
     * This method interacts with the repository to either find an existing user
     * based on the provided authentication data and provider or create a new user.
     * The returned user document is deep-frozen to prevent unintended modifications.
     *
     * @param {Object} authUserData - The authentication provider user data.
     * @param {string} authUserData.email - The user's email address.
     * @param {string} authUserData.providerId - The unique provider authentication ID.
     * @param {string} authUserData.firstname - The user's first name.
     * @param {string} authUserData.lastname - The user's last name.
     * @param {string} [authUserData.avatarUrl] - The URL of the user's profile picture.
     * @param {string} provider - The authentication provider (e.g., 'google', 'facebook').
     * @returns {Promise<Object>} The created or retrieved user object, deep-frozen.
     * @throws {AppError} If a duplicate key error occurs or if the creation process fails.
     */
    async createAuthProviderUser(authUserData = {}, provider) {
        try {
            return await this.#userRepository.findOrCreateAuthUser(
                authUserData,
                provider
            );
        } catch (error) {
            if (error.code === dbErrorCodes.DUPLICATE_KEY) {
                throw new AppError(
                    statusMessages.USER_ALREADY_EXISTS,
                    httpCodes.CONFLICT.code,
                    httpCodes.CONFLICT.name
                );
            }

            throw new AppError(
                `${provider} user creation failed`,
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
     * @returns {Promise<Readonly<Object | null>>} The user object deep-frozen containing OTP-related fields if found.
     * @throws {AppError} If an error occurs during retrieval.
     */
    async findUnverifiedEmail(email) {
        try {
            const data = await this.#cacheService.get(this.#getUnverifiedUserCacheKey(email));
            return data ? JSON.parse(data) : null;
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
     * @returns {Promise<Readonly<Object | null>>} The updated user object deep-frozen if found.
     * @throws {AppError} If an error occurs during the update.
     */
    async verifyEmail(email) {
        const key = `user:unverified:${email}`;
        try {
            const userData = await this.findUnverifiedEmail(email);
            if (!userData) return null;

            delete userData.otpCode;

            const newUser = await this.#userRepository.createLocalUser(userData);
            await this.#cacheService.delete(key);
            return newUser;
        } catch (error) {
            if (error.code === dbErrorCodes.DUPLICATE_KEY) {
                throw new AppError(
                    statusMessages.USER_ALREADY_EXISTS,
                    httpCodes.CONFLICT.code,
                    httpCodes.CONFLICT.name
                );
            }

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
     * @returns {Promise<Readonly<Object| null>>} The deep-frozen user object if found.
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
     * @returns {Promise<Readonly<Object| null>>} The user object deep-frozen if found and verified if found.
     * @throws {AppError} If an error occurs during retrieval.
     */
    async findByEmail(email) {
        try {
            return await this.#userRepository.findOne({email});
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

module.exports = new UserService(new userValidationService(), new PasswordHasherService(), userRepository, fileRepository, cacheService);
