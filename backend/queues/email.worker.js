const emailService = require('../services/email.service');

class EmailWorker {
    async processEmail(jobData) {
        try {
            await emailService.sendEmail(jobData);
            console.log(`Successfully processed email for ${jobData.to}`);
        } catch (error) {
            console.error(`Error processing email for ${jobData.to}:`, error);
            throw error;
        }
    }
}

module.exports = new EmailWorker();
