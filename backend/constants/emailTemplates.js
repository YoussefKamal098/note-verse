/**
 * A mapping of email templates used throughout the application.
 *
 * Each key represents a unique email template with the following properties:
 * @property {string} subject - The default subject line for the email.
 * @property {string} template - The template file name - extension `.hbs` - for the verification email (included in EMAIL_TEMPLATES_DIR env variable).
 *
 * @example
 * const emailTemplates = {
 *   verify_email: {
 *     subject: "Verify Your Email Address",
 *     template: "verify_email"
 *   }
 * };
 */
const emailTemplates = Object.freeze({
    verify_email: Object.freeze({
        subject: "Verify Your Email Address",
        template: "verify_email"
    }),

    note_sharing: Object.freeze({
        subject: "You\\'ve Been Added to a Note",
        template: "note_access_granted_notification"
    })
});

module.exports = emailTemplates;
