const AppError = require('../errors/app.error');
const JwtAuthService = require('../services/jwtAuth.service');

const authenticate = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return next(new AppError('No token provided', 401));
    }

    try {
        req.user = await JwtAuthService.verify(token);
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = authenticate;
