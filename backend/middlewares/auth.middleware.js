const httpCodes = require('../constants/httpCodes');
const statusMessages = require('../constants/statusMessages');
const AppError = require('../errors/app.error');
const JwtAuthService = require('../services/jwtAuth.service');

const authenticate = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return next(new AppError(
            statusMessages.ACCESS_TOKEN_NOT_PROVIDED,
            httpCodes.UNAUTHORIZED.code,
            httpCodes.UNAUTHORIZED.name,
        ));
    }

    try {
        req.user = await JwtAuthService.verify(token);
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = authenticate;
