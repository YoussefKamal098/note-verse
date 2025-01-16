const httpCodes = require('../constants/httpCodes');
const statusMessages = require('../constants/statusMessages');
const {timeUnit, time} = require('../utils/date.utils');
const timeoutHandler = require('express-timeout-handler');
const AppError = require("../errors/app.error");

const timeoutOptions = {
    timeout: time({[timeUnit.SECOND]: 15}, timeUnit.MILLISECOND),
    onTimeout: function (req, res, next) {
        next(new AppError(
            statusMessages.REQUEST_TIMEOUT,
            httpCodes.REQUEST_TIMEOUT.code,
            httpCodes.REQUEST_TIMEOUT.name
        ));
    },
};

// Middleware function for request timeout
const timeoutMiddleware = (req, res, next) => {
    timeoutHandler.handler(timeoutOptions)(req, res, next);
};

module.exports = timeoutMiddleware;
