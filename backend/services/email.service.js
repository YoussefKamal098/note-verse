const fs = require('fs');
const nodemailer = require('nodemailer');
const emailConfig = require('../config/emailConfig');
const emailTemplates = require('../constants/emailTemplates');

/**
 * EmailService is responsible for sending emails using SMTP settings.
 * It uses Nodemailer along with the express-handlebars plugin to render .hbs templates.
 */
class EmailService {
    #host;
    #port;
    #secure;
    #user;
    #pass;
    #from;
    #templatesDir;
    #transporter;
    #isSetupComplete = false;

    /**
     * Creates an instance of EmailService.
     *
     * @param {Object} config={} - Custom configuration overrides.
     * @param {string} config.host - SMTP host.
     * @param {number} config.port - SMTP port.
     * @param {boolean} config.secure - Whether to use a secure connection.
     * @param {string} config.user - SMTP username.
     * @param {string} config.pass - SMTP password.
     * @param {string} config.from - Default sender email.
     * @param {string} config.templatesDir - Directory for email templates.
     *
     * @throws {Error} If required configuration (user or pass) is missing or if setup fails.
     */
    constructor({
                    host,
                    port,
                    secure,
                    user,
                    pass,
                    from,
                    templatesDir
                } = {}) {
        this.#host = host;
        this.#port = port;
        this.#secure = secure;
        this.#user = user;
        this.#pass = pass;
        this.#from = from;
        this.#templatesDir = templatesDir;

        // Validate required configuration.
        if (!this.#user || !this.#pass) {
            throw new Error('Email configuration error: "user" and "pass" are required.');
        }

        // Create the Nodemailer transporter.
        try {
            this.#transporter = nodemailer.createTransport({
                host: this.#host,
                port: this.#port,
                secure: this.#secure,
                auth: {
                    user: this.#user,
                    pass: this.#pass,
                },
            });
        } catch (err) {
            console.error('Error creating email transporter:', err);
            throw new Error('Failed to create email transporter.');
        }

        this.#ensureTemplatesDirExists();
        this.#setupHandlebars();
    }

    /**
     * Asynchronously sets up the Handlebars template engine for Nodemailer.
     * Ensures that the setup is performed only once.
     *
     * @private
     * @async
     * @throws {Error} If there is an issue importing or configuring Handlebars.
     * @returns {Promise<void>} Resolves when the setup is successfully completed.
     */
    async #setupHandlebars() {
        if (this.#isSetupComplete) return; // Skip if already set up

        try {
            const hbs = (await import('nodemailer-express-handlebars')).default;

            const handlebarOptions = {
                viewEngine: {
                    extName: '.hbs',
                    partialsDir: this.#templatesDir,
                    layoutsDir: this.#templatesDir,
                    defaultLayout: false,
                },
                viewPath: this.#templatesDir,
                extName: '.hbs',
            };

            this.#transporter.use('compile', hbs(handlebarOptions));
            this.#isSetupComplete = true; // Mark setup as complete
        } catch (err) {
            console.error('Error setting up handlebars template engine:', err);
            throw new Error('Failed to configure email template engine.');
        }
    }

    /**
     * Ensures that the templates directory exists. If it doesn't exist, an error is thrown.
     *
     * @private
     * @throws {Error} If the directory does not exist.
     * @returns {void}
     */
    #ensureTemplatesDirExists() {
        if (!fs.existsSync(this.#templatesDir)) {
            // Throw an error if the directory does not exist
            throw new Error(`Templates directory does not exist: ${this.#templatesDir}`);
        }
    }

    /**
     * Sends an email using the provided options.
     *
     * @param {Object} options - Options for sending the email.
     * @param {string} options.to - The recipient's email address.
     * @param {string} options.subject - The subject of the email.
     * @param {string} options.template - The name of the template file (without extension). Templates must have a .hbs extension.
     * @param {Object} options.context - Data to be injected into the template.
     * @param {Array} [options.attachments] - Optional list of attachments.
     *
     * @returns {Promise<void>} Resolves when the email is sent.
     * @throws {Error} If required options are missing or if sending fails.
     */
    async sendEmail(options) {
        const {to, subject, template, context, attachments} = options;
        if (!to || !subject || !template || !context) {
            throw new Error('Missing required email options: "to", "subject", "template", or "context".');
        }

        await this.#setupHandlebars(); // Ensure setup before sending

        const mailOptions = {
            from: this.#from || this.#user,
            to,
            subject,
            template,
            context,
            attachments,
        };

        try {
            await this.#transporter.sendMail(mailOptions);
            console.log(`Email sent to ${to}`);
        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error(`Failed to send email to ${to}: ${error.message}`);
        }
    }

    /**
     * Sends a verification email by adding a job to the email queue.
     *
     * This method constructs the email context using the provided parameters and enqueues
     * an email job with the subject "Verify Your Email address" using the 'verify_email' template.
     *
     * @async
     * @param {Object} params - The parameters object.
     * @param {string} params.email - The recipient's email address.
     * @param {string} params.name - The recipient's full name.
     * @param {string} params.otpCode - The one-time password (OTP) code for verification.
     * @param {Date|string|number} params.otpCodeExpiresAt - The expiration time for the OTP code.
     * @param {Function} params.formatDate - A function that formats a Date object into a string.
     * @param {import('bull').Queue} params.emailQueue - The Bull queue instance used to add email jobs.
     * @returns {Promise<void>} A promise that resolves when the email job is successfully added to the queue.
     * @throws {Error} If adding the email job to the queue fails.
     */
    async sendVerificationEmail({email, name, otpCode, otpCodeExpiresAt, formatDate, emailQueue}) {
        const emailContext = {
            name: name,
            otpCode: otpCode,
            expiryTime: formatDate(otpCodeExpiresAt),
            timestamp: formatDate(new Date()),
            year: new Date().getFullYear()
        };

        // Add the email job to the queue using the specified template, subject, and constructed context.
        await emailQueue.add({
            to: email,
            subject: emailTemplates.verify_email.subject,
            template: emailTemplates.verify_email.template,
            context: emailContext
        });
    }
}

const emailService = new EmailService({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    user: emailConfig.user,
    pass: emailConfig.pass,
    from: emailConfig.from,
    templatesDir: emailConfig.templatesDir,
});

module.exports = emailService;
