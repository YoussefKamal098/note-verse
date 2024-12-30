const User = require("../models/user.model");
const { isValidObjectId, convertToObjectId } = require('../utils/string.utils');

class UserRepository {
    #model;

    constructor(model) {
        this.#model = model;
    }

    async create(userData = {}) {
        try {
            const newUser = new this.#model(userData);
            await newUser.save();
            return newUser;
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
            return updatedUser || null;
        } catch (error) {
            console.error("Error updating user:", error);
            return null;
        }
    }

    async findById(userId = "") {
        if (!isValidObjectId(userId)) return null;

        try {
            const user = await this.#model.findById(convertToObjectId(userId)).lean();
            return user || null;
        } catch (error) {
            console.error("Error finding user by ID:", error);
            return null;
        }
    }

    async findOne(query = {}) {
        try {
            const user = await this.#model.findOne(query).exec()
            return user || null;
        } catch (error) {
            console.error("Error finding user:", error);
            return null;
        }
    }
}

module.exports = new UserRepository(User);
