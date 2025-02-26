/**
 * Returns the initials of the given first and last names.
 *
 * @param {string} firstName - The first name.
 * @param {string} lastName - The last name.
 * @returns {string} - A string containing the initials (first letter of first and last name).
 */
function getInitials(firstName, lastName) {
    if (!firstName || !lastName) return '';

    // Getting initials
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();

    return `${firstInitial}${lastInitial}`;
}

/**
 * Capitalizes the first letter of a string and converts the rest to lowercase.
 *
 * @param {string} str - The string to capitalize.
 * @returns {string} - The string with the first letter capitalized.
 */
function capitalizeStringFirstLetter(str) {
    if (!str) return '';

    // Capitalizing the first letter of the string
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Calculates the size of a string in bytes.
 *
 * @param {string} str - The string to calculate the size of.
 * @returns {number} - The size of the string in bytes.
 */
function stringSizeInBytes(str) {
    return new TextEncoder().encode(str).length;
}

/**
 * Formats a size in bytes to a human-readable string (e.g., "10.5 MB").
 *
 * @param {number} sizeInBytes - The size in bytes to format.
 * @returns {string} - The formatted size string with units (e.g., "10.5 MB").
 */
function formatBytes(sizeInBytes) {
    const units = [
        {threshold: 1024 ** 3, suffix: 'GB'},
        {threshold: 1024 ** 2, suffix: 'MB'},
        {threshold: 1024, suffix: 'KB'},
        {threshold: 1, suffix: 'Bytes'},
    ];

    const unit = units.find(({threshold}) => sizeInBytes >= threshold);
    return `${(sizeInBytes / unit.threshold).toFixed(2)} ${unit.suffix}`;
}

/**
 * Capitalizes the first letter of a string.
 *
 * @param {string} [fieldName] - The string to capitalize.
 * @returns {string} - The input string with the first letter capitalized.
 * @throws {Error} - Throws an error if the input is not a string or is empty.
 */
function capitalizeFirstLetter(fieldName) {
    if (typeof fieldName !== 'string' || fieldName.length === 0) {
        throw new Error(`${fieldName} is not a string`);
    }
    return fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
}

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

/**
 * Checks if the provided string is alphanumeric.
 * @param {string} str - The string to check.
 * @returns {boolean} True if alphanumeric, false otherwise.
 */
const isAlphanumeric = (str) => /^[0-9A-Za-z]+$/.test(str);


module.exports = {
    capitalizeFirstLetter,
    sanitizeString,
    convertToBytes,
    getInitials,
    capitalizeStringFirstLetter,
    stringSizeInBytes,
    formatBytes,
    isAlphanumeric
};
