const httpCodes = require('../constants/httpCodes');
const statusMessages = require('../constants/statusMessages');
const {timeUnit, time} = require('shared-utils/date.utils');
const timeoutHandler = require('express-timeout-handler');
const AppError = require("../errors/app.error");

/**
 * Creates an Express middleware to handle request timeouts.
 *
 * @param {Object} [customOptions={}] - Custom options to override the default timeout settings.
 * @param {number} [customOptions.timeoutSeconds=15] - Timeout duration in seconds.
 * @param {string} [customOptions.timeoutMessage=statusMessages.REQUEST_TIMEOUT] - Message for the timeout error.
 * @param {number} [customOptions.timeoutHttpCode=httpCodes.REQUEST_TIMEOUT.code] - HTTP status code for the timeout error.
 * @param {string} [customOptions.timeoutHttpCodeName=httpCodes.REQUEST_TIMEOUT.name] - HTTP status code name for the timeout error.
 * @param {Function} [customOptions.onTimeout] - Custom function to be executed when a timeout occurs. Receives the Express request, response, and next parameters. Overrides the default error handler.
 * @returns {Function} Express middleware that enforces the request timeout.
 */
function createTimeoutMiddleware(
    {
        timeoutSeconds = 15,
        timeoutMessage = statusMessages.REQUEST_TIMEOUT,
        timeoutHttpCode = httpCodes.REQUEST_TIMEOUT.code,
        timeoutHttpCodeName = httpCodes.REQUEST_TIMEOUT.name,
        onTimeout
    } = {}) {
    const options = {
        timeout: time({[timeUnit.SECOND]: timeoutSeconds}, timeUnit.MILLISECOND),
        onTimeout: onTimeout || ((req, res, next) => {
            next(new AppError(timeoutMessage, timeoutHttpCode, timeoutHttpCodeName));
        }),
    };

    return (req, res, next) => {
        timeoutHandler.handler(options)(req, res, next);
    };
}

module.exports = {createTimeoutMiddleware};
