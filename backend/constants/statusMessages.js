const statusMessages = Object.freeze({
    // =======================
    // User-related errors
    // =======================
    USER_CREATION_FAILED: "Failed to create a new user. Please try again later.",
    USER_UPDATE_FAILED: "Unable to update user details. Ensure the provided data is correct and try again.",
    USER_LOGIN_FAILED: "Login attempt unsuccessful. Verify your email and password, then try again.",
    USER_REGISTRATION_FAILED: "User registration failed. Please ensure all required fields are correctly filled.",
    USER_NOT_FOUND: "User not found, Ensure the provided id is correct and try again later.",
    USERS_NOT_FOUND: "The following users could not be found: %s",
    USER_ID_MISSING: "User ID is missing. Please provide a valid user ID to proceed.",
    USER_ID_REQUIRED: "User ID is required. Please provide a valid user ID to access this resource.",
    USER_ID_INVALID: "User ID is invalid. Please provide a valid user ID and try again.",
    AVATAR_UPDATE_FAILED: "Failed to update user avatar. Please try again later.",
    AVATAR_FETCH_FAILED: "Failed to retrieve user avatar. Please try again later.",
    USER_NOT_AUTH: "Authentication required. Please provide a valid user ID to access this resource.",
    GOOGLE_USER_CREATE_FAILED: "Google authentication process failed. Please try again later.",
    MISSING_GOOGLE_AUTH_DATA: "Required Google authentication data is missing",
    USER_NOTE_UPDATE_FORBIDDEN: "You do not have permission to update this note. Ensure you have the correct permissions.",

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
    NOTE_DELETION_SUCCESS: "The note has been successfully deleted.",
    NOTE_NOT_FOUND: "The note you requested does not exist.",
    USER_NOTE_NOT_FOUND: "The note you requested either does not exist or is not linked to your account.",
    USER_NOTE_FORBIDDEN: "Forbidden: You do not have permission to access this note.",
    NOTES_FETCH_FAILED: "Failed to retrieve notes. Please try again later.",
    NOTE_FETCH_FAILED: "Failed to retrieve note. Please try again later.",
    NOTE_ID_MISSING: "Note ID is missing. Please provide a valid note ID to proceed.",
    NOTE_ID_REQUIRED: "Note ID is required. Please provide a valid note ID to access this resource.",
    NOTE_ID_INVALID: "Note ID is invalid. Please provide a valid note ID and try again.",
    NOTE_UPDATE_VALIDATION_FAILED: 'Note update validation failed',
    NOTE_ACCESS_CHECK_FAILED: 'Failed to check note access permissions',
    NOTE_OWNER_REQUIRED: 'Only the note owner can perform this action',

    // =======================
    // Authentication errors
    // =======================
    INVALID_CREDENTIALS: "The email or password you provided is incorrect. Please try again with correct email and password.",
    CREDENTIALS_REQUIRED: "Email and password are required. Please provide them to log in.",
    INVALID_OR_EXPIRED_TOKEN: "The token provided is invalid or has expired. Please log in again.",
    INVALID_ACCESS_TOKEN: "Invalid or expired access token. Please authenticate again.",
    INVALID_STATE_TOKEN: "Invalid or expired state token. Please again with valid one.",
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
    GOOGLE_USER_ALREADY_EXISTS: "Google User already exists. Please log in or use a different email.",
    INVALID_GOOGLE_TOKEN: "The provided Google token is invalid or expired. Please verify your credentials and try again.",

    EMAIL_NOT_FOUND: "No account found with this email address or the OTP has expired or incorrect. Please check your email or request a new OTP.",
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
    // File upload errors
    // =======================
    INVALID_CONTENT_TYPE: "Invalid content type.",
    FILE_NOT_FOUND: "The requested file could not be found. Please check the file ID or try again later.",
    NO_FILES_UPLOADED: "No files uploaded!",
    NO_AVATAR_UPLOADED: "No avatar uploaded!",
    UPLOAD_FILE_STREAM_READ_ERROR: "Upload file Stream read error.",
    UPLOAD_FILE_WRITE_STREAM_ERROR: "Upload file Write stream error.",
    UPLOAD_FILE_PROCESS_FAILED: "Upload file process failed.",
    DOWNLOAD_FILE_FAILED: "Download file failed.",
    DELETE_FILE_FAILED: "Delete file failed.",
    CHECK_FILE_EXISTENCE_FAILED: "Checking file existence failed.",

    // ======================= 💠 NEW PERMISSION ERRORS 💠 =======================
    PERMISSION_OPERATION_FAILED: "Permission operation failed. Please check your permissions and try again.",
    PERMISSION_GRANT_FAILED: "Failed to grant permissions. Please verify the users and resource exist.",
    PERMISSION_REMOVAL_FAILED: "Failed to remove permissions. Please verify the permissions exist.",
    PERMISSION_UPDATE_FAILED: "Failed to update permissions. Ensure valid roles/actions are provided.",
    PERMISSION_RETRIEVAL_FAILED: "Failed to retrieve permissions. Please try again later.",
    RESOURCE_USERS_RETRIEVAL_FAILED: "Failed to retrieve permissions. Please try again later.",
    GRANTED_PERMISSIONS_RETRIEVAL_FAILED: "Failed to retrieve permissions. Please try again later.",
    PERMISSION_NOT_FOUND: "Permission not found. The requested permission does not exist or was revoked.",
    PERMISSION_DENIED: "Access denied. You don't have permission to perform this action.",
    MISSING_RESOURCE_ID: 'The resource ID is required but was not provided.',

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
