const httpCodes = require('../constants/httpCodes');
const httpHeaders = require('../constants/httpHeaders');
const errorCodes = require('../constants/errorCodes');
const statusMessages = require('../constants/statusMessages');
const AppError = require('../errors/app.error');

const authenticate = ({jwtAuthService}) => async (req, res, next) => {
    const access_token = req.header(httpHeaders.AUTHORIZATION)?.replace('Bearer ', '');
    if (!access_token) {
        return next(new AppError(
            statusMessages.ACCESS_TOKEN_NOT_PROVIDED,
            httpCodes.UNAUTHORIZED.code,
            errorCodes.ACCESS_TOKEN_FAILED
        ));
    }

    try {
        req.userId = (await jwtAuthService.verifyAccessToken(access_token)).userId;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = authenticate;
