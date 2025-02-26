/**
 * Masks an email address for privacy.
 * @param {string} email - The full email address.
 * @returns {string} The masked email address.
 */
const maskEmail = (email) => {
    const [localPart, domain] = email.split("@");
    if (!localPart || !domain) return email;
    return localPart.length <= 2
        ? `${localPart[0]}***@${domain}`
        : `${localPart.substring(0, 2)}***@${domain}`;
};

module.exports = {maskEmail};
