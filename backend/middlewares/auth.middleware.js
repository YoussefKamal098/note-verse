const httpCodes = require('../constants/httpCodes');
const httpHeaders = require('../constants/httpHeaders');
const statusMessages = require('../constants/statusMessages');
const AppError = require('../errors/app.error');
const JwtAuthService = require('../services/jwtAuth.service');

const authenticate = async (req, res, next) => {
    const token = req.header(httpHeaders.AUTHORIZATION)?.replace('Bearer ', '');
    if (!token) {
        return next(new AppError(
            statusMessages.ACCESS_TOKEN_NOT_PROVIDED,
            httpCodes.UNAUTHORIZED.code,
            httpCodes.UNAUTHORIZED.name,
        ));
    }

    try {
        req.userId = (await JwtAuthService.verify(token)).userId;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = authenticate;
