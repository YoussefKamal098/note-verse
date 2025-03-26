const User = require("../models/user.model");
const GoogleAuth = require("../models/googleAuth.model");
const {isValidObjectId, convertToObjectId, sanitizeMongoObject} = require('../utils/obj.utils');
const dbErrorCodes = require('../constants/dbErrorCodes');
const {deepFreeze} = require('shared-utils/obj.utils');
const AuthProvider = require("../enums/auth.enum");

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
    #googleAuthModel;

    /**
     * Creates an instance of UserRepository.
     *
     * @param {import('mongoose').Model} userModel - The Mongoose model for users.
     * @param {import('mongoose').Model} googleAuthModel - The Mongoose model for Google authentication mappings.
     */
    constructor(userModel, googleAuthModel) {
        this.#userModel = userModel;
        this.#googleAuthModel = googleAuthModel;
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
     * Finds a user associated with a given Google authentication ID.
     *
     * This method searches the `googleAuth` collection for a record with the specified `googleId`.
     * If found, it retrieves the corresponding user document from the `user` collection.
     *
     * @private
     * @param {string} googleId - The unique Google authentication ID.
     * @param {import("mongoose").ClientSession} [session=null] - An optional MongoDB session for transaction consistency.
     *
     * @returns {Promise<Object|null>} The user document if found, otherwise `null`.
     */
    async #findUserByGoogleAuth(googleId, session = null) {
        const query = this.#googleAuthModel.findOne({googleId});
        if (session) query.session(session);
        const googleAuth = await query.lean();
        if (!googleAuth) return null;

        const userQuery = this.#userModel.findById(googleAuth.userId);
        if (session) userQuery.session(session);
        return userQuery.lean();
    }

    /**
     * Finds an existing Google user by `googleId` or creates a new Google-authenticated user.
     *
     * This method performs the following steps:
     * 1. Start a MongoDB session and transaction.
     * 2. Checks if the user is already associated with the given `googleId`.
     *    - If found, returns the existing user.
     * 3. Checks if an unlinked user exists with the same email.
     *    - If found, throws a `DUPLICATE_KEY` error.
     * 4. Create a new user document with Google as the authentication provider.
     * 5. Creates a corresponding `googleAuth` entry linking the user to their Google account.
     * 6. Commits the transaction and returns the newly created user.
     *
     * @param {Object} googleUser - The Google user data.
     * @param {string} googleUser.email - The user's email address.
     * @param {string} googleUser.googleId - The unique Google authentication ID.
     * @param {string} googleUser.firstname - The user's first name.
     * @param {string} googleUser.lastname - The user's last name.
     * @param {string} [googleUser.avatarUrl] - The URL of the user's Google profile picture.
     *
     * @returns {Promise<Object>} The created or existing user document, deep-frozen.
     *
     * @throws {Error} Throws an error if:
     * - A **duplicate key conflict** occurs (`DUPLICATE_KEY`),
     *   meaning a non-Google user with the same email already exists.
     * - Any other database error happens during the operation.
     */
    async findOrCreateGoogleUser(googleUser = {}) {
        const session = await this.#userModel.db.startSession();
        try {
            session.startTransaction();
            const {email, googleId, firstname, lastname, avatarUrl} = googleUser;

            // Check existing GoogleAuth
            const existingUser = await this.#findUserByGoogleAuth(googleId, session);
            if (existingUser) {
                await session.commitTransaction();
                return deepFreeze(sanitizeMongoObject(existingUser));
            }

            // Check for existing email
            const emailUser = await this.#userModel.findOne({email}).session(session).lean();
            if (emailUser) {
                throw {code: dbErrorCodes.DUPLICATE_KEY};
            }

            // Create new User
            const newUser = await this.#userModel.create([{
                firstname,
                lastname,
                email,
                provider: AuthProvider.GOOGLE,
                isVerified: true,
                verifiedAt: new Date()
            }], {session});

            // Create GoogleAuth
            await this.#googleAuthModel.create([{
                userId: newUser[0]._id,
                googleId,
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
            console.error("Error creating Google user:", error);
            throw new Error("Unable to create Google user");
        } finally {
            await session.endSession();
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
     * Retrieves a verified user by their ID.
     *
     * Only return the user if they are marked as verified.
     *
     * @param {string} userId - The ID of the user.
     * @returns {Promise<Readonly<Object|null>>} The user document if found and verified; otherwise, null.
     * @throws {Error} If an error occurs during the query.
     */
    async findById(userId) {
        if (!isValidObjectId(userId)) return null;

        try {
            // Return the user only if they are verified.
            const user = await this.#userModel.findOne({
                _id: convertToObjectId(userId),
                isVerified: true
            }).populate({
                path: 'googleAuth',
                select: 'googleId avatarUrl -_id -userId', // Include googleId and avatarUrl, exclude _id and userId
                options: {lean: true} // Return a plain object
            }).lean();

            return user ? deepFreeze(sanitizeMongoObject(user)) : null;
        } catch (error) {
            console.error("Error finding user by ID:", error);
            throw new Error("Error finding user by ID");
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

module.exports = new UserRepository(User, GoogleAuth);
