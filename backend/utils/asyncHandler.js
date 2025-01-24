/**
 * Wraps an asynchronous request handler function to ensure any errors are caught and passed to the next middleware.
 * @param {Function} fn - The asynchronous request handler function.
 * @returns {Function} - A new function that handles errors and passes them to the next middleware.
 */
const asyncRequestHandler = (fn) => (req, res, next) => {
    // Resolve the promise returned by the handler function
    Promise.resolve(fn(req, res, next))
        // If an error occurs, pass it to the next middleware
        .catch(next);
};

// Export the asyncRequestHandler for use in other modules
module.exports = asyncRequestHandler;