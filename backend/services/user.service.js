const httpCodes = require('../constants/httpCodes');
const statusMessages = require('../constants/statusMessages');
const {timeUnit, time, timeFromNow} = require('shared-utils/date.utils');
const {deepFreeze} = require('shared-utils/obj.utils');
const {generateSecureOTP} = require("../utils/otp.utils");
const AppError = require('../errors/app.error');
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
     * @type {UserRepository}
     */
    #userRepository;
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
     * @param {PasswordHasherService} passwordHasherService - Service for hashing and verifying passwords.
     * @param {UserRepository} userRepository - Repository for user database operations.
     * @param {CacheService} cacheService - The cache service instance used for caching operations.
     */
    constructor(passwordHasherService, userRepository, cacheService) {
        this.passwordHasherService = passwordHasherService;
        this.#userRepository = userRepository;
        this.#cacheService = cacheService;
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
     * @param {authProvider} provider - The authentication provider (e.g., 'google', 'facebook').
     * @returns {Promise<Readonly<{ user: Object, exist: boolean }>>}
     * An object with:
     * - `user`: the existing or newly created user document.
     * - `exist`: `true` if the user already existed, `false` if a new user was created.
     *
     * @throws {AppError} If a duplicate key error occurs or if the creation process fails.
     */
    async getOrCreateProviderUser(authUserData = {}, provider) {
        try {
            return await this.#userRepository.findOrCreateAuthUser({...authUserData, provider});
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
     * Finds a user by email and authentication provider type
     * @param {string} email - The user's email address
     * @param {authProvider} provider - The authentication provider type (e.g., 'google', 'facebook')
     * @returns {Promise<Object|null>} The user object if found, null otherwise
     * @throws {AppError} If there's a database error
     */
    async getAuthUser(email, provider) {
        try {
            const user = await this.#userRepository.findOne({email});
            return user?.provider === provider ? user : null;
        } catch (error) {
            throw new AppError(
                `Failed to retrieve ${provider} user`,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }
    }

    /**
     * Updates a user's information.
     *
     * This method updates the specified user's details in the database. It can update
     * any combination of the user's first name, last name, email, avatar, or password.
     * If a password is provided, it will be hashed before storage.
     * Only defined properties in updateData will be included in the update.
     *
     * @param {string} userId - The ID of the user to update.
     * @param {Object} updateData - The data to update.
     * @param {string} [updateData.firstname] - The new first name.
     * @param {string} [updateData.lastname] - The new last name.
     * @param {string | null} [updateData.avatar] - The new avatar ID.
     * @param {string} [updateData.email] - The new email address.
     * @param {string} [updateData.password] - The new password (will be hashed).
     * @returns {Promise<Readonly<Object>>} The updated user object, deep-frozen.
     * @throws {AppError} If:
     * - The user doesn't exist (404)
     * - The avatar is already in use by another account (409)
     * - The email is already in use by another account (409)
     * - There's a database error (500)
     */
    async updateUser(userId, {firstname, lastname, avatar, email, password} = {}) {
        const updates = {firstname, lastname, avatar, email, password};

        try {
            // Create update object with only defined properties
            const cleanUpdateData = Object.entries(updates).reduce((acc, [key, value]) => {
                if (value !== undefined) {
                    acc[key] = value;
                }
                return acc;
            }, {});

            // Only proceed with update if we have actual data to update
            if (Object.keys(cleanUpdateData).length === 0) {
                return await this.#userRepository.findById(userId);
            }

            // Special handling for password (hash if provided)
            if (cleanUpdateData.password) {
                cleanUpdateData.password = await this.passwordHasherService.hash(cleanUpdateData.password);
            }

            return await this.#userRepository.findByIdAndUpdate(userId, cleanUpdateData);
        } catch (error) {
            if (error.code === dbErrorCodes.DUPLICATE_KEY) {
                throw new AppError(
                    error.message,
                    httpCodes.CONFLICT.code,
                    httpCodes.CONFLICT.name
                );
            }

            throw new AppError(
                statusMessages.USER_UPDATE_FAILED,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }
    }
}

module.exports = UserService;
