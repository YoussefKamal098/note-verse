const {isValidObjectId, convertToObjectId, sanitizeMongoObject} = require('../utils/obj.utils');
const dbErrorCodes = require('../constants/dbErrorCodes');
const {deepFreeze} = require('shared-utils/obj.utils');
const config = require("../config/config");

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
     * Adds authProvider population to a query
     * @private
     * @param {import('mongoose').Query} query - The query to modify
     * @returns {import('mongoose').Query} The modified query
     */
    #withAuthProvider(query) {
        return query.populate({
            path: 'authProvider',
            select: 'providerId avatarUrl -_id -userId',
            options: {lean: true}
        });
    }

    /**
     * Processes and prepares a user document for return
     * @private
     * @param {Object} user - The raw user document
     * @returns {Readonly<Object>} Processed user document
     */
    #prepareUserDocument(user) {
        return user
            ? deepFreeze(sanitizeMongoObject(this.#constructUserAvatarUrl(user)))
            : null;
    }

    /**
     * Constructs the avatar URL for a user document.
     * @private
     * @param {Object} user - The user document
     * @returns {Object} The user document with avatarUrl property
     */
    #constructUserAvatarUrl(user) {
        if (!user) return user;

        const userWithAvatar = {...user};

        if (user.avatar !== null) {
            userWithAvatar.avatarUrl = user.avatar
                ? config.storage.constructFileUrl(user.avatar)
                : user.authProvider?.avatarUrl;
        }

        delete userWithAvatar?.authProvider;
        delete userWithAvatar.provider;
        delete userWithAvatar.avatar;

        return userWithAvatar;
    }

    /**
     * @private
     * Initializes a session if one isn't provided
     */
    async #initializeSession(session) {
        return session || await this.#userModel.db.startSession();
    }

    /**
     * @private
     * Begins transaction if no session was provided
     */
    async #beginTransactionIfNeeded(externalSession, session) {
        if (!externalSession) {
            await session.startTransaction();
        }
    }

    /**
     * @private
     * Checks for existing auth provider user
     */
    async #checkExistingAuthUser({provider, providerId}, session) {
        const existingUser = await this.#findUserByAuthProvider(provider, providerId, session);
        if (existingUser) {
            return deepFreeze(sanitizeMongoObject(existingUser));
        }
        return null;
    }

    /**
     * @private
     * Checks for email conflict with existing users
     */
    async #checkForLocalEmailConflict(email, session) {
        const emailUser = await this.#userModel.findOne({email}).session(session).lean();
        if (emailUser) {
            throw {code: dbErrorCodes.DUPLICATE_KEY};
        }
    }

    /**
     * @private
     * Creates new user with auth provider
     */
    async #createAuthUserWithProvider({firstname, lastname, email, provider, providerId, avatarUrl}, session) {
        const newUser = await this.#userModel.create([{
            firstname,
            lastname,
            email,
            provider
        }], {session});

        await this.#authProviderModel.create([{
            userId: newUser[0]._id,
            provider,
            providerId,
            avatarUrl
        }], {session});

        return deepFreeze(sanitizeMongoObject(newUser[0].toObject()));
    }

    /**
     * @private
     * Commits transaction if no session was provided
     */
    async #commitTransactionIfNeeded(externalSession, session) {
        if (!externalSession) {
            await session.commitTransaction();
        }
    }

    /**
     * @private
     * Handles errors during user creation
     */
    async #handleFindOrCreateAuthUserError(error, provider, externalSession, session) {
        if (!externalSession) {
            await session.abortTransaction();
        }

        if (error.code === dbErrorCodes.DUPLICATE_KEY) {
            const conflictError = new Error("User already exists");
            conflictError.code = dbErrorCodes.DUPLICATE_KEY;
            throw conflictError;
        }

        console.error(`Error creating ${provider} user:`, error);
        throw new Error(`Unable to create ${provider} user`);
    }

    /**
     * @private
     * Cleans up session if we created it
     */
    async #cleanupSession(externalSession, session) {
        if (!externalSession) {
            await session.endSession();
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
     * Merges a user-provided projection with default exclusions (e.g., password).
     * Supports both object and string projection formats.
     *
     * @private
     * @param {Object|string} base - The original projection (object or space-delimited string).
     * @param {Object} defaults - Default projection to merge in (e.g., { password: 0 }).
     * @returns {Object} The merged projection object.
     */
    #mergeProjection(base, defaults) {
        if (!base) return defaults;

        if (typeof base === 'string') {
            // Convert string to object and merge
            const fields = base.split(/\s+/).filter(Boolean);
            const projectionObj = {};

            for (const field of fields) {
                const key = field.replace(/^-/, '');
                projectionObj[key] = field.startsWith('-') ? 0 : 1;
            }

            return {...projectionObj, ...defaults};
        }

        // Object case: merge with defaults
        return {...base, ...defaults};
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
     * @param {Object} [options] - Options
     * @param {import('mongoose').ClientSession} [options.session] - MongoDB session
     * @returns {Promise<Readonly<Object>>} The created or updated user document, deep-frozen.
     * @throws {Error} If a duplicate key error occurs (indicating a conflict, e.g., a verified user already exists),
     * or if any other error occurs during the operation.
     */
    async createLocalUser(userData = {}, {session = null} = {}) {
        try {
            const newUser = new this.#userModel(userData);
            await newUser.save({session});
            return deepFreeze(sanitizeMongoObject(newUser.toObject()));
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
     * @param {string} authUserData.provider - The authentication provider (e.g., 'google', 'facebook').
     * @param {string} [authUserData.avatarUrl] - The URL of the user's profile picture.
     * @param {Object} [options] - Options
     * @param {import('mongoose').ClientSession} [options.session] - MongoDB session
     * @returns {Promise<Readonly<Object>>} The created or existing user document, deep-frozen.
     *
     * @throws {Error} Throws an error if:
     * - A **duplicate key conflict** occurs (`DUPLICATE_KEY`),
     *   meaning a non-authenticated user with the same email already exists.
     * - Any other database error happens during the operation.
     */
    async findOrCreateAuthUser(authUserData = {}, {session = null} = {}) {
        const {email, provider} = authUserData;
        const InSession = await this.#initializeSession(session);

        try {
            await this.#beginTransactionIfNeeded(session, InSession);

            const existingUser = await this.#checkExistingAuthUser(authUserData, InSession);
            if (existingUser) return existingUser;

            await this.#checkForLocalEmailConflict(email, InSession);
            const newUser = await this.#createAuthUserWithProvider(authUserData, InSession);

            await this.#commitTransactionIfNeeded(session, InSession);
            return newUser;
        } catch (error) {
            await this.#handleFindOrCreateAuthUserError(error, provider, session, InSession);
            throw error; // Re-throw after handling
        } finally {
            await this.#cleanupSession(session, InSession);
        }
    }

    /**
     * Finds a user by ID
     * @param {string} userId - User ID
     * @param {Object} [options] - Options
     * @param {import('mongoose').ClientSession} [options.session] - MongoDB session
     * @param {Object} [options.projection] - Fields to include/exclude
     * @returns {Promise<Readonly<Object>|null>} User document or null
     */
    async findById(userId, {session = null, projection = {}} = {}) {
        if (!isValidObjectId(userId)) return null;

        try {
            let query = this.#userModel.findById(convertToObjectId(userId))

            if (projection) query = query.select(projection)
            if (session) query = query.session(session);

            const user = await this.#withAuthProvider(query).lean();
            return this.#prepareUserDocument(user);
        } catch (error) {
            console.error("Error finding user by ID:", error);
            throw new Error("Error finding user by ID");
        }
    }

    /**
     * Finds and updates a user by ID
     * @param {string} userId - User ID
     * @param {Object} updates - Update operations
     * @param {Object} options - Options
     * @param {import('mongoose').ClientSession} [options.session] - MongoDB session
     * @param {Object} [options.projection] - Fields to return
     * @returns {Promise<Readonly<Object|null>>} Updated user or null
     */
    async findByIdAndUpdate(userId, updates = {}, {session = null, projection = {}} = {}) {
        if (!isValidObjectId(userId)) return null;

        try {
            let query = this.#userModel.findByIdAndUpdate(
                convertToObjectId(userId),
                {$set: updates},
                {
                    new: true,
                    runValidators: true
                }
            ).select(projection);

            if (session) query = query.session(session);

            const updatedUser = await query.lean();
            return this.#prepareUserDocument(updatedUser);
        } catch (error) {
            console.error("Error updating user:", error);

            if (error.code === dbErrorCodes && error.keyPattern) {
                const conflictedField = Object.keys(error.keyPattern)[0];

                if (conflictedField === 'email') {
                    throw new Error('Email address is already in use.');
                } else if (conflictedField === 'avatar') {
                    throw new Error('Avatar is already in use.');
                } else {
                    throw new Error(`Duplicate key conflict on field: ${conflictedField}`);
                }
            }

            throw new Error("Error updating user");
        }
    }

    /**
     * Finds multiple users by their IDs in a single query
     * @param {Array<string>} userIds - Array of user IDs to find
     * @param {Object} [options] - Options
     * @param {import('mongoose').ClientSession} [options.session] - MongoDB session
     * @param {Object | string} [options.projection] - Fields to include/exclude
     * @returns {Promise<ReadonlyArray<Readonly<Object>>>} Array of user documents
     */
    async findByIds(userIds, {session = null, projection = {}} = {}) {
        if (!Array.isArray(userIds) || userIds.length === 0) return Object.freeze([]);

        // Filter valid IDs and convert to ObjectId
        const objectIds = userIds
            .filter(id => isValidObjectId(id))
            .map(id => convertToObjectId(id));

        try {
            let query = this.#userModel.find({_id: {$in: objectIds}})

            // Normalize and merge projections
            const normalizedProjection = this.#mergeProjection(projection, {password: 0});
            if (normalizedProjection) query.select(normalizedProjection);

            query = this.#withAuthProvider(query);
            if (session) query = query.session(session);

            const users = await query.lean();
            return users.map(user => this.#prepareUserDocument(user));
        } catch (error) {
            console.error("Error finding users by IDs:", error);
            throw new Error("Error finding users by IDs");
        }
    }

    /**
     * Finds a single user matching query
     * @param {Object} [query={}] - Query conditions
     * @param {Object} [options] - Options
     * @param {import('mongoose').ClientSession} [options.session] - MongoDB session
     * @param {Object} [options.projection] - Fields to include/exclude
     * @returns {Promise<Readonly<Object|null>>} User document or null
     */
    async findOne(query = {}, {session = null, projection = {}} = {}) {
        try {
            let baseQuery = this.#userModel.findOne(query)
                .select(projection);

            if (session) baseQuery = baseQuery.session(session);

            const user = await this.#withAuthProvider(baseQuery).lean();
            return this.#prepareUserDocument(user);
        } catch (error) {
            console.error("Error finding user:", error);
            throw new Error("Error finding user");
        }
    }
}

module.exports = UserRepository;
