/**
 * Parses an environment variable as a string.
 * If the variable is not set, returns the default value.
 *
 * @param {string} envVar - The environment variable to parse.
 * @param {string} [defaultValue=''] - The default value to return if the variable is not set.
 * @returns {string} - The parsed string value or the default value.
 */
function parseString(envVar, defaultValue = '') {
    return envVar || defaultValue;
}

/**
 * Parses an environment variable as a number.
 * If the variable is not set or cannot be parsed, returns the default value.
 *
 * @param {string} envVar - The environment variable to parse.
 * @param {number} [defaultValue=0] - The default value to return if the variable is not set or cannot be parsed.
 * @returns {number} - The parsed number value or the default value.
 */
function parseNumber(envVar, defaultValue = 0) {
    return envVar ? parseInt(envVar, 10) : defaultValue;
}

/**
 * Parses an environment variable as an array.
 * If the variable is not set, returns the default value.
 * The array is split by commas.
 *
 * @param {string} envVar - The environment variable to parse.
 * @param {Array} [defaultValue=[]] - The default value to return if the variable is not set.
 * @returns {Array} - The parsed array or the default value.
 */
function parseArray(envVar, defaultValue = []) {
    return envVar ? envVar.split(',') : defaultValue;
}

/**
 * Parses an environment variable as a boolean.
 * If the variable is not set or cannot be parsed, returns the default value.
 *
 * @param {string} envVar - The environment variable to parse.
 * @param {boolean} [defaultValue=false] - The default value to return if the variable is not set or cannot be parsed.
 * @returns {boolean} - The parsed boolean value or the default value.
 */
function parseBoolean(envVar, defaultValue = false) {
    if (envVar === undefined) return defaultValue;
    return envVar.toLowerCase() === 'true';
}

module.exports = {parseString, parseNumber, parseArray, parseBoolean};
