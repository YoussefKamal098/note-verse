const emailService = require('../services/email.service');

class EmailWorker {
    /**
     * Processes an email job by sending an email using the specified parameters.
     *
     * @param {Object} jobData - The data required to send the email.
     * @param {string} jobData.to - The recipient's email address.
     * @param {string} jobData.subject - The subject line of the email.
     * @param {string} jobData.template - The name of the email template file (without the .hbs extension).
     * The template file should have a .hbs extension.
     * @param {Object} jobData.context - An object containing key-value pairs to inject into the template.
     * @param {Array} [jobData.attachments] - Optional array of attachment objects.
     *
     * @returns {Promise<void>} Resolves when the email has been successfully sent.
     * @throws {Error} Throws an error if required options are missing or if sending the email fails.
     */
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
