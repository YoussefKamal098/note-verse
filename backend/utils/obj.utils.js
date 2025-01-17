const mongoose = require("mongoose");

/**
 * Sanitizes a MongoDB object by removing `__v` and replacing `_id` with `id`.
 * @param {Object} mongoObject - The MongoDB object to sanitize.
 * @returns {Object} - The sanitized object.
 */
function sanitizeMongoObject(mongoObject) {
    if (!mongoObject) return mongoObject;

    const sanitizedObject = {...mongoObject};

    // Remove __v and replace _id with id
    delete sanitizedObject.__v;
    if (sanitizedObject._id) {
        sanitizedObject.id = sanitizedObject._id.toString();
        delete sanitizedObject._id;
    }

    return sanitizedObject;
}

/**
 * Checks if the given string is a valid MongoDB ObjectId.
 *
 * @param {string} [id] - The string to check.
 * @returns {boolean} - True if the string is a valid ObjectId, otherwise false.
 */
function isValidObjectId(id) {
    return mongoose.isValidObjectId(id);
}

/**
 * Converts a valid string ID into a MongoDB ObjectId.
 *
 * @param {string} [id] - The string ID to convert.
 * @returns {mongoose.Types.ObjectId|null} - The ObjectId corresponding to the string ID, or null if the ID is invalid.
 */
function convertToObjectId(id) {
    if (!mongoose.isValidObjectId(id))
        return null;

    return new mongoose.Types.ObjectId(id);
}

module.exports = {sanitizeMongoObject, isValidObjectId, convertToObjectId};