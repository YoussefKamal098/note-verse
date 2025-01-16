const mongoose = require("mongoose");
const {Types} = mongoose;

/**
 * Capitalizes the first letter of a string.
 *
 * @param {string} [fieldName=""] - The string to capitalize.
 * @returns {string} - The input string with the first letter capitalized.
 * @throws {Error} - Throws an error if the input is not a string or is empty.
 */
const capitalizeFirstLetter = (fieldName = "") => {
    if (typeof fieldName !== 'string' || fieldName.length === 0) {
        throw new Error(`${fieldName} is not a string`);
    }
    return fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
};

/**
 * Sanitizes a string by escaping special characters.
 *
 * @param {string} str - The string to sanitize.
 * @returns {string} - The sanitized string with special characters escaped.
 */
function sanitizeString(str) {
    if (typeof str !== 'string') return '';

    return str.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, "\\$&").trim();
}

/**
 * Checks if the given string is a valid MongoDB ObjectId.
 *
 * @param {string} [id=""] - The string to check.
 * @returns {boolean} - True if the string is a valid ObjectId, otherwise false.
 */
function isValidObjectId(id = "") {
    return mongoose.isValidObjectId(id);
}

/**
 * Converts a valid string ID into a MongoDB ObjectId.
 *
 * @param {string} [id=""] - The string ID to convert.
 * @returns {mongoose.Types.ObjectId|null} - The ObjectId corresponding to the string ID, or null if the ID is invalid.
 */
function convertToObjectId(id = "") {
    if (!mongoose.isValidObjectId(id))
        return null;

    return new Types.ObjectId(id);
}

/**
 * Convert a size string (e.g., "10KB", "1MB", "1.5KB") into its byte value.
 * Supports sizes in bytes (B), kilobytes (KB, Kb, kB, kb), megabytes (MB), gigabytes (GB), and terabytes (TB).
 *
 * @param {string} input - The size input to convert (e.g., "10KB", "1MB", "1.5KB").
 * @returns {number} - The size in bytes.
 * @throws {Error} - Throws an error if the input format is invalid.
 */
function convertToBytes(input) {
    // Normalize the input to lowercase and trim any spaces
    const normalizedInput = input.trim().toLowerCase();

    // Regex to match the number and the unit (e.g., 10KB, 1MB, 1.5GB, 1Kb, 1kB)
    const regex = /^(\d+(\.\d+)?)(b|kb|mb|gb|tb)$/i;  // Added 'i' for case insensitivity

    const match = normalizedInput.match(regex);

    if (!match) {
        throw new Error('Invalid size format. Expected a number followed by a unit (e.g., "10KB", "1MB").');
    }

    // Extract numeric value and unit
    const value = parseFloat(match[1]);
    const unit = match[3].toLowerCase();  // Ensure unit is lowercase for consistency

    // Map the unit to its corresponding byte multiplier
    const unitToBytes = {
        b: 1,       // bytes
        kb: 1024,   // kilobytes
        mb: 1024 * 1024,  // megabytes
        gb: 1024 * 1024 * 1024, // gigabytes
        tb: 1024 * 1024 * 1024 * 1024, // terabytes
    };

    // Return the value converted to bytes
    return value * unitToBytes[unit];
}

module.exports = {capitalizeFirstLetter, sanitizeString, isValidObjectId, convertToObjectId, convertToBytes};
