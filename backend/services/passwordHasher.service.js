const bcrypt = require('bcrypt');

class PasswordHasherService {
    constructor() {
        this.saltRounds = 10; // Number of salt rounds for bcrypt
    }

    // Hash the password
    async hash(password) {
        const salt = await bcrypt.genSalt(this.saltRounds);
        return await bcrypt.hash(password, salt);
    }

    // Verify the password against the hash
    async verify(password, hash) {
        return await bcrypt.compare(password, hash);
    }
}

module.exports = PasswordHasherService;
