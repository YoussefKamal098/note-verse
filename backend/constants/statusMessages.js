const statusMessages = Object.freeze({
    // =======================
    // User-related errors
    // =======================
    USER_CREATION_FAILED: "Failed to create a new user. Please try again later.",
    USER_UPDATE_FAILED: "Unable to update user details. Ensure the provided data is correct and try again.",
    USER_LOGIN_FAILED: "Login attempt unsuccessful. Verify your email and password, then try again.",
    USER_REGISTRATION_FAILED: "User registration failed. Please ensure all required fields are correctly filled.",
    USER_NOT_FOUND: "User not found, Ensure the provided id is correct and try again later.",
    USER_ID_MISSING: "User ID is missing. Please provide a valid user ID to proceed.",
    USER_ID_REQUIRED: "User ID is required. Please provide a valid user ID to access this resource.",
    USER_ID_INVALID: "User ID is invalid. Please provide a valid user ID and try again.",
    USER_NOT_AUTH: "Authentication required. Please provide a valid user ID to access this resource.",

    // =======================
    // User-specific update errors
    // =======================
    PASSWORD_UPDATE_FAILED: "Password update failed. Please ensure it meets the password policy and try again later.",
    EMAIL_UPDATE_FAILED: "Unable to update the email address. Ensure it is valid and try again.",
    FULLNAME_UPDATE_FAILED: "Failed to update the user's full name. Please try again later.",
    REFRESH_TOKEN_UPDATE_FAILED: "Could not update the user's refresh token. Please log in again.",

    // =======================
    // Note-related errors
    // =======================
    NOTE_CREATION_FAILED: "Failed to create the note. Please check your inputs and try again later.",
    NOTE_UPDATE_FAILED: "Unable to update the note. Ensure the note exists and your data is valid and try again later.",
    NOTE_DELETION_FAILED: "Unable to delete the note. It may not exist or is not associated with your account.",
    NOTE_NOT_FOUND: "The note you requested does not exist.",
    USER_NOTE_NOT_FOUND: "The note you requested either does not exist or is not linked to your account.",
    USER_NOTE_FORBIDDEN: "Forbidden: You do not have permission to access this note.",
    NOTES_FETCH_FAILED: "Failed to retrieve notes. Please try again later.",
    NOTE_FETCH_FAILED: "Failed to retrieve note. Please try again later.",
    NOTE_ID_MISSING: "Note ID is missing. Please provide a valid note ID to proceed.",
    NOTE_ID_REQUIRED: "Note ID is required. Please provide a valid note ID to access this resource.",
    NOTE_ID_INVALID: "Note ID is invalid. Please provide a valid note ID and try again.",

    // =======================
    // Authentication errors
    // =======================
    INVALID_CREDENTIALS: "The email or password you provided is incorrect. Please try again with correct email and password.",
    CREDENTIALS_REQUIRED: "Email and password are required. Please provide them to log in.",
    INVALID_OR_EXPIRED_TOKEN: "The token provided is invalid or has expired. Please log in again.",
    INVALID_ACCESS_TOKEN: "Invalid or expired access token. Please authenticate again.",
    INVALID_REFRESH_TOKEN: "Invalid or expired refresh token. Please log in again.",
    TOKEN_EXPIRED: "Your session has expired. Please log in again to continue.",
    INVALID_TOKEN: "The token provided is invalid or expired. Please authenticate again.",
    ACCESS_TOKEN_NOT_PROVIDED: "Access token is missing. Please provide a valid access token in the 'Authorization' header to access this resource or log in again.",
    REFRESH_TOKEN_NOT_PROVIDED: "Refresh token is missing. Please provide a valid refresh token as a cookie to renew your session or log in again.",
    REFRESH_TOKEN_EXPIRED: "Your refresh token has expired. Please log in to obtain a new one.",
    ACCESS_TOKEN_EXPIRED: "Your access token has expired. Please log in to obtain a new one or refresh it.",
    USER_NOT_AUTHORIZED: "User not authorized. Please log in to continue.",
    USER_ALREADY_EXISTS: "User already exists. Please log in or use a different email.",
    USER_CREATED: "User created successfully. Please verify your email address to complete registration",

    EMAIL_NOT_FOUND: "No account found with this email address. Please check email and try again later.",
    EMAIL_ALREADY_VERIFIED: "Email address already verified. No further action required.",
    INVALID_OTP: "Invalid verification code. Please check the code and try again. ",
    OTP_EXPIRED: "Verification code has expired.",
    MISSING_VERIFICATION_DATA: "Email and verification code are required. Please provide both fields to complete verification.",
    EMAIL_VERIFICATION_SUCCESS: "Email successfully verified! Your account is now fully activated. !",

    // Custom messages for session management
    INVALID_IP_ADDRESS: "The IP address provided is invalid or unrecognized. Please provide a valid IPv4 or IPv6 address and try again.",
    INVALID_USER_AGENT: "The User-Agent provided is either missing or invalid. Please include a valid User-Agent string in your request.",
    SESSION_NOT_FOUND_OR_ALREADY_LOGGED_OUT: "The session was not found or has already been terminated. Please log in again to continue.",
    USER_ALREADY_LOGGED_IN_SAME_DEVICE: "User is already logged in from this device and location.",

    // =======================
    // CSRF errors
    // =======================
    INVALID_CSRF_TOKEN: "The CSRF token provided is invalid or missing. Please refresh the page to retrieve a new token and try your request again. If the problem persists, please contact support.",
    CSRF_TOKEN_GENERATION_FAILED: "Failed to generate a CSRF token. Please refresh the page and try again. If the issue continues, contact support for assistance.",

    // =======================
    // General errors
    // =======================
    SERVER_ERROR: "An unexpected server error occurred. Please try again later.",
    RESOURCE_NOT_FOUND: "The requested resource could not be found. Verify the URL and try again.",
    CORS_NOT_ALLOWED: "Cross-Origin Resource Sharing (CORS) is not allowed from this origin. Access to the requested resource has been denied.",
    REQUEST_TIMEOUT: "The server took too long to respond. Please try again later.",
    TOO_MANY_REQUESTS: "You have made too many requests in a short period. Please try again later.",
});

module.exports = statusMessages
