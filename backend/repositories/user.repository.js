const User = require("../models/user.model");
const authProvider = require("../models/authProvider.model");
const {isValidObjectId, convertToObjectId, sanitizeMongoObject} = require('../utils/obj.utils');
const dbErrorCodes = require('../constants/dbErrorCodes');
const {deepFreeze} = require('shared-utils/obj.utils');


/**
 * Repository for performing CRUD operations on the User collection.
 *
 * This class encapsulates all database operations related to users, including
 * - Creating or `upserting` a user (with email, OTP, and verification status).
 * - Updating a user by ID or by email.
 * - Retrieving a user by ID or by a custom query.
 *
 * All returned user documents are sanitized and deep-frozen to prevent further modifications.
 *
 * @class UserRepository
 */
class UserRepository {
    /**
     * @private
     * @type {import('mongoose').Model}
     * @description The Mongoose model for users.
     */
    #userModel;

    /**
     * @private
     * @type {import('mongoose').Model}
     * @description The Mongoose model for Google authentication mappings.
     */
    #authProviderModel;

    /**
     * Creates an instance of UserRepository.
     *
     * @param {import('mongoose').Model} userModel - The Mongoose model for users.
     * @param {import('mongoose').Model} authProviderModel - The Mongoose model for authentication mappings.
     */
    constructor(userModel, authProviderModel) {
        this.#userModel = userModel;
        this.#authProviderModel = authProviderModel;
    }

    /**
     * Creates or updates a local email/password user document with OTP verification handling.
     *
     * This method performs a findOneAndUpdate operation with upsert enabled to either update an existing
     * non-verified user (whose OTP has expired) or create a new user document.
     * The update only applies to
     * non-email fields, while the email field is set only during document insertion.
     * The userData object
     * may include the following properties:
     *
     * @param {Object} userData - The data for creating or updating the user.
     * @param {string} userData.firstname - The user's first name.
     * @param {string} userData.lastname - The user's last name.
     * @param {string} userData.email - The user's email address.
     * @param {string} userData.password - The user's hashed password.
     * @param {string} [userData.otpCode] - The one-time password (OTP) for email verification.
     * @param {Date} [userData.otpCodeExpiresAt] - The expiration time of the OTP code.
     * @param {boolean} [userData.isVerified] - The user's verification status (default is false).
     *
     * @returns {Promise<Object>} The created or updated user document, deep-frozen.
     * @throws {Error} If a duplicate key error occurs (indicating a conflict, e.g., a verified user already exists),
     * or if any other error occurs during the operation.
     */
    async createLocalUser(userData = {}) {
        try {
            const {email, ...otherData} = userData; // Remove email from userData for $set

            const user = await this.#userModel.findOneAndUpdate(
                {
                    email: email,
                    isVerified: false,
                    otpCodeExpiresAt: {$lt: new Date()}
                },
                {
                    $set: otherData,                 // Only update other fields
                    $setOnInsert: {email: email}     // Set email only when inserting a new document
                },
                {new: true, upsert: true, runValidators: true}
            ).lean();

            return deepFreeze(sanitizeMongoObject(user));
        } catch (error) {
            // Check for duplicate key error (E11000) which indicates a conflict (e.g., verified user exists)
            if (error.code === dbErrorCodes.DUPLICATE_KEY) {
                console.error("Duplicate local user conflict:", error);
                const conflictError = new Error("Local user already exists");
                conflictError.code = dbErrorCodes.DUPLICATE_KEY;
                throw conflictError;
            }
            console.error("Error creating local user:", error);
            throw new Error("Unable to create local user");
        }
    }

    /**
     * Finds a user associated with a given authentication provider ID.
     *
     * This method searches the `authProvider` collection for a record with the specified `provider` and `providerId`.
     * If found, it retrieves the corresponding user document from the `user` collection.
     *
     * @private
     * @param {string} provider - The authentication provider (e.g., 'google', 'facebook').
     * @param {string} providerId - The unique authentication provider ID.
     * @param {import("mongoose").ClientSession} [session=null] - An optional MongoDB session for transaction consistency.
     *
     * @returns {Promise<Object|null>} The user document if found, otherwise `null`.
     */
    async #findUserByAuthProvider(provider, providerId, session = null) {
        const query = this.#authProviderModel.findOne({provider, providerId});
        if (session) query.session(session);
        const authProvider = await query.lean();
        return authProvider?.userId ? this.#userModel.findById(authProvider.userId).lean() : null;
    }

    /**
     * Finds an existing user by an authentication provider ID or creates a new user.
     *
     * This method performs the following steps:
     * 1. Start a MongoDB session and transaction.
     * 2. Checks if the user is already associated with the given `providerId`.
     *    - If found, returns the existing user.
     * 3. Checks if an unlinked user exists with the same email.
     *    - If found, throws a `DUPLICATE_KEY` error.
     * 4. Create a new user document with the specified authentication provider.
     * 5. Creates a corresponding `authProvider` entry linking the user to their provider account.
     * 6. Commits the transaction and returns the newly created user.
     *
     * @param {Object} authUserData - The authentication provider user data.
     * @param {string} authUserData.email - The user's email address.
     * @param {string} authUserData.providerId - The unique provider authentication ID.
     * @param {string} authUserData.firstname - The user's first name.
     * @param {string} authUserData.lastname - The user's last name.
     * @param {string} [authUserData.avatarUrl] - The URL of the user's profile picture.
     * @param {string} provider - The authentication provider (e.g., 'google', 'facebook').
     *
     * @returns {Promise<Object>} The created or existing user document, deep-frozen.
     *
     * @throws {Error} Throws an error if:
     * - A **duplicate key conflict** occurs (`DUPLICATE_KEY`),
     *   meaning a non-authenticated user with the same email already exists.
     * - Any other database error happens during the operation.
     */
    async findOrCreateAuthUser(authUserData = {}, provider) {
        const session = await this.#userModel.db.startSession();
        try {
            session.startTransaction();
            const {email, providerId, firstname, lastname, avatarUrl} = authUserData;

            // Check existing auth provider
            const existingUser = await this.#findUserByAuthProvider(provider, providerId, session);
            if (existingUser) {
                await session.commitTransaction();
                return deepFreeze(sanitizeMongoObject(existingUser));
            }

            // Check for existing email conflict
            const emailUser = await this.#userModel.findOne({email}).session(session).lean();
            if (emailUser) {
                throw {code: dbErrorCodes.DUPLICATE_KEY};
            }

            // Create new User
            const newUser = await this.#userModel.create([{
                firstname,
                lastname,
                email,
                provider: provider
            }], {session});

            // Create AuthProvider entry
            await this.#authProviderModel.create([{
                userId: newUser[0]._id,
                provider,
                providerId,
                avatarUrl
            }], {session});

            await session.commitTransaction();
            return deepFreeze(sanitizeMongoObject(newUser[0].toObject()));
        } catch (error) {
            await session.abortTransaction();
            if (error.code === dbErrorCodes.DUPLICATE_KEY) {
                const conflictError = new Error("User already exists");
                conflictError.code = dbErrorCodes.DUPLICATE_KEY;
                throw conflictError;
            }
            console.error(`Error creating ${provider} user:`, error);
            throw new Error(`Unable to create ${provider} user`);
        } finally {
            await session.endSession();
        }
    }

    /**
     * Finds a verified user by ID.
     *
     * Only users with `isVerified` set to `true` will be retrieved.
     *
     * @param {string} userId - The ID of the user to retrieve.
     *
     * @returns {Promise<Readonly<Object>|null>} The user document if found, or `null` if not found.
     * @throws {Error} If an error occurs while retrieving the user.
     */
    async findById(userId) {
        if (!isValidObjectId(userId)) return null;

        try {
            const user = await this.#userModel.findOne({
                _id: convertToObjectId(userId),
                isVerified: true
            }).populate({
                path: 'authProvider',
                select: 'providerId avatarUrl -_id -userId',
                options: {lean: true}
            }).lean();

            if (!user) return null;
            return deepFreeze(sanitizeMongoObject(user));
        } catch (error) {
            console.error("Error finding user by ID:", error);
            throw new Error("Error finding user by ID");
        }
    }

    /**
     * Finds a verified user by ID and updates the document.
     *
     * Only users with isVerified equal to true will be updated.
     *
     * @param {string} userId - The ID of the user to update.
     * @param {Object} updates - The update operations to apply.
     * @returns {Promise<Readonly<Object|null>>} The updated user document, or null if not found.
     * @throws {Error} If an error occurs during the update.
     */
    async findByIdAndUpdate(userId, updates = {}) {
        if (!isValidObjectId(userId)) return null;

        try {
            // Only update if the user is verified
            const updatedUser = await this.#userModel.findOneAndUpdate(
                {_id: convertToObjectId(userId), isVerified: true},
                {$set: updates},
                {new: true, runValidators: true}
            ).lean();
            return updatedUser ? deepFreeze(sanitizeMongoObject(updatedUser)) : null;
        } catch (error) {
            console.error("Error updating user:", error);
            throw new Error("Error updating user");
        }
    }

    /**
     * Finds a user by email and updates the document.
     *
     * @param {string} email - The user's email address.
     * @param {Object} updates - The update operations to apply.
     * @returns {Promise<Readonly<Object|null>>} The updated user document, or null if not found.
     * @throws {Error} If an error occurs during the update.
     */
    async findByEmailAndUpdate(email, updates = {}) {
        try {
            const updatedUser = await this.#userModel.findOneAndUpdate(
                {email},
                {$set: updates},
                {new: true, runValidators: true}
            ).lean();

            return updatedUser ? deepFreeze(sanitizeMongoObject(updatedUser)) : null;
        } catch (error) {
            console.error("Error updating user by email:", error);
            throw new Error("Error updating user by email");
        }
    }

    /**
     * Finds a user based on a query and optional projection.
     *
     * @param {Object} [query={}] - The MongoDB query object to filter users.
     * @param {Object} [projection={}] - An optional projection to specify which fields to include or exclude.
     * @returns {Promise<Readonly<Object|null>>} The user document if found; otherwise, null.
     * @throws {Error} If an error occurs during the query.
     */
    async findOne(query = {}, projection = {}) {
        try {
            const user = await this.#userModel.findOne(query)
                .select(projection)
                .lean();
            return user ? deepFreeze(sanitizeMongoObject(user)) : null;
        } catch (error) {
            console.error("Error finding user:", error);
            throw new Error("Error finding user");
        }
    }
}

module.exports = new UserRepository(User, authProvider);
