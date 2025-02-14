/**
 * Checks if a status code represents a successful response (2xx).
 * @param {number} statusCode - The HTTP status code to check.
 * @returns {boolean} - True if the status code is between 200 and 299, otherwise false.
 */
function isSuccessfulStatus(statusCode) {
    return statusCode >= 200 && statusCode < 300;
}

/**
 * Checks if a status code represents a server error (5xx).
 * @param {number} statusCode - The HTTP status code to check.
 * @returns {boolean} - True if the status code is between 500 and 599, otherwise false.
 */
function isServerErrorStatus(statusCode) {
    return statusCode >= 500 && statusCode < 600;
}

module.exports = {
    isSuccessfulStatus,
    isServerErrorStatus,
};
