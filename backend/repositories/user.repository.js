const User = require("../models/user.model");
const {isValidObjectId, convertToObjectId} = require('../utils/string.utils');
const {sanitizeMongoObject} = require('../utils/obj.utils');

class UserRepository {
    #model;

    constructor(model) {
        this.#model = model;
    }

    async create(userData = {}) {
        try {
            const newUser = new this.#model(userData);
            await newUser.save();
            return sanitizeMongoObject(newUser.toObject()); // Sanitize the created user
        } catch (error) {
            console.error("Error creating user:", error);
            throw new Error("Unable to create user");
        }
    }

    async findByIdAndUpdate(userId = "", updates = {}) {
        if (!isValidObjectId(userId)) return null;

        try {
            const updatedUser = await this.#model.findByIdAndUpdate(convertToObjectId(userId), updates, {
                new: true,
                runValidators: true
            }).lean();
            return updatedUser ? sanitizeMongoObject(updatedUser) : null;
        } catch (error) {
            console.error("Error updating user:", error);
            throw new Error("Error updating user");
        }
    }

    async findById(userId = "") {
        if (!isValidObjectId(userId)) return null;

        try {
            const user = await this.#model.findById(convertToObjectId(userId)).lean();
            return user ? sanitizeMongoObject(user) : null;
        } catch (error) {
            console.error("Error finding user by ID:", error);
            throw new Error("Error finding user by ID");
        }
    }

    async findOne(query = {}) {
        try {
            const user = await this.#model.findOne(query).lean();
            return user ? sanitizeMongoObject(user) : null;
        } catch (error) {
            console.error("Error finding user:", error);
            throw new Error("Error finding user");
        }
    }
}

module.exports = new UserRepository(User);
