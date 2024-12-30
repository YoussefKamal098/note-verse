const AppError = require('../errors/app.error');
const jwt = require('jsonwebtoken');

class JwtProviderService {
    async generateToken(payload, secret, expiry) {
        return new Promise((resolve, reject) => {
            jwt.sign(payload, secret, { expiresIn: expiry }, (err, token) => {
                if (err || !token) {
                    return reject(new AppError(`Token generation failed: ${err}`, 500));
                }
                resolve(token);
            });
        });
    }

    async verifyToken(token, secret) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, secret, (err, decoded) => {
                if (err) {
                    return reject(new AppError(`Token generation failed: ${err}`, 500));
                }
                resolve(decoded);
            });
        });
    }
}

module.exports = JwtProviderService;