const crypto = require('crypto');

class HasherService {
    async generateHash(data) {
        // Create an SHA-256 hash from the input data
        return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
    }
}

module.exports = HasherService;
