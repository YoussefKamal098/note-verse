const emailTemplates = require('../constants/emailTemplates');
const {formatDate} = require('shared-utils/date.utils');

class EmailMediator {
    /**
     * @type Queue<any>
     */
    #emailQueue;

    /**
     * Creates an instance of EmailMediator.
     * @param {Queue<any>} emailQueue
     */
    constructor(emailQueue) {
        this.#emailQueue = emailQueue;
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
     * @returns {Promise<void>} A promise that resolves when the email job is successfully added to the queue.
     * @throws {Error} If adding the email job to the queue fails.
     */
    async sendAccountVerificationEmail({email, name, otpCode, otpCodeExpiresAt}) {
        const emailContext = {
            name,
            otpCode,
            expiryTime: formatDate(otpCodeExpiresAt),
            timestamp: formatDate(new Date()),
            year: new Date().getFullYear()
        };

        await this.#emailQueue.add({
            to: email,
            subject: emailTemplates.verify_email.subject,
            template: emailTemplates.verify_email.template,
            context: emailContext
        });
    }

    /**
     * Sends a note sharing notification email by adding a job to the email queue.
     *
     * This method constructs the email context using the provided parameters and enqueues
     * an email job with the subject "You've been added to a note" using the 'note_sharing' template.
     *
     * @async
     * @param {Object} params - The parameters object.
     * @param {string} params.recipientEmail - The recipient's email address.
     * @param {string} params.recipientFullName - The recipient's full name.
     * @param {string} params.senderFullName - The sender's full name.
     * @param {string} params.senderEmail - The sender's email address.
     * @param {string} params.senderAvatar - URL to the sender's avatar image.
     * @param {string} params.customMessage - The personalized message from the sender.
     * @param {string} params.noteTitle - The title of the shared note.
     * @param {string} params.role - The access level (viewer/editor/etc).
     * @param {string} params.noteLink - Direct link to access the note.
     * @returns {Promise<void>} A promise that resolves when the email job is successfully added to the queue.
     * @throws {Error} If adding the email job to the queue fails.
     */
    async sendNoteSharingNotification({
                                          recipientEmail,
                                          recipientFullName,
                                          senderFullName,
                                          senderEmail,
                                          senderAvatar,
                                          customMessage,
                                          noteTitle,
                                          role,
                                          noteLink
                                      }) {
        const emailContext = {
            recipient_full_name: recipientFullName,
            sender_full_name: senderFullName,
            sender_email: senderEmail,
            sender_avatar: senderAvatar,
            custom_message: customMessage,
            note_title: noteTitle,
            role: role,
            note_link: noteLink,
            share_date: formatDate(new Date()),
            current_year: new Date().getFullYear()
        };

        await this.#emailQueue.add({
            to: recipientEmail,
            subject: emailTemplates.note_sharing.subject,
            template: emailTemplates.note_sharing.template,
            context: emailContext
        });
    }
}

module.exports = EmailMediator;
