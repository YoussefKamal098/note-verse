const User = require("../models/user.model");
const {isValidObjectId, convertToObjectId, sanitizeMongoObject} = require('../utils/obj.utils');
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
     * @description The Mongoose model used for user operations.
     */
    #model;

    /**
     * Creates an instance of UserRepository.
     *
     * @param {import('mongoose').Model} model - The Mongoose model for users.
     */
    constructor(model) {
        this.#model = model;
    }

    /**
     * Creates or updates a user document.
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
    async create(userData = {}) {
        try {
            const {email, ...otherData} = userData; // Remove email from userData for $set

            const user = await this.#model.findOneAndUpdate(
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
            if (error.code === 11000) {
                console.error("Duplicate email conflict:", error);
                const conflictError = new Error("Email already exists");
                conflictError.code = 11000;
                conflictError.name = "Conflict";
                throw conflictError;
            }
            console.error("Error creating user:", error);
            throw new Error("Unable to create user");
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
            const updatedUser = await this.#model.findOneAndUpdate(
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
            const user = await this.#model.findOne({
                _id: convertToObjectId(userId),
                isVerified: true
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
            const updatedUser = await this.#model.findOneAndUpdate(
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
            const user = await this.#model.findOne(query)
                .select(projection)
                .lean();
            return user ? deepFreeze(sanitizeMongoObject(user)) : null;
        } catch (error) {
            console.error("Error finding user:", error);
            throw new Error("Error finding user");
        }
    }
}

module.exports = new UserRepository(User);
