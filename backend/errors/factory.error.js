const AppError = require('./app.error');
const httpCodes = require('@/constants/httpCodes');
const statusMessages = require('@/constants/statusMessages');

const errorFactory = {
    // 404 NOT FOUND errors
    notFound: (message) => new AppError(
        message || httpCodes.NOT_FOUND.message,
        httpCodes.NOT_FOUND.code,
        httpCodes.NOT_FOUND.name
    ),
    versionNotFound: () => new AppError(
        statusMessages.VERSION_NOT_FOUND,
        httpCodes.NOT_FOUND.code,
        httpCodes.NOT_FOUND.name
    ),
    noteNotFound: () => new AppError(
        statusMessages.NOTE_NOT_FOUND,
        httpCodes.NOT_FOUND.code,
        httpCodes.NOT_FOUND.name
    ),
    usersNotFound: (missingIds) => new AppError(
        statusMessages.USERS_NOT_FOUND.replace('%s', missingIds.join(', ')),
        httpCodes.NOT_FOUND.code,
        httpCodes.NOT_FOUND.name
    ),


    // 403 FORBIDDEN errors
    forbidden: (message = null) => new AppError(
        message || httpCodes.FORBIDDEN.message,
        httpCodes.FORBIDDEN.code,
        httpCodes.FORBIDDEN.name
    ),
    permissionDenied: () => new AppError(
        statusMessages.PERMISSION_DENIED,
        httpCodes.FORBIDDEN.code,
        httpCodes.FORBIDDEN.name
    ),
    noteOwnerRequired: () => new AppError(
        statusMessages.NOTE_OWNER_REQUIRED,
        httpCodes.FORBIDDEN.code,
        httpCodes.FORBIDDEN.name
    ),
    noteViewDenied: () => new AppError(
        statusMessages.NOTE_VIEW_DENIED,
        httpCodes.FORBIDDEN.code,
        httpCodes.FORBIDDEN.name
    ),
    noteEditDenied: () => new AppError(
        statusMessages.NOTE_EDIT_DENIED,
        httpCodes.FORBIDDEN.code,
        httpCodes.FORBIDDEN.name
    ),

    // 409 CONFLICT errors
    versionAlreadyCurrent: () => new AppError(
        statusMessages.VERSION_ALREADY_CURRENT,
        httpCodes.CONFLICT.code,
        httpCodes.CONFLICT.name
    ),

    // A specific 500 error for this type of failure
    versionAccessCheckFailed: () => new AppError(
        statusMessages.VERSION_ACCESS_CHECK_FAILED,
        httpCodes.INTERNAL_SERVER_ERROR.code,
        httpCodes.INTERNAL_SERVER_ERROR.name
    ),
    noteAccessCheckFailed: () => new AppError(
        statusMessages.NOTE_ACCESS_CHECK_FAILED,
        httpCodes.INTERNAL_SERVER_ERROR.code,
        httpCodes.INTERNAL_SERVER_ERROR.name
    ),


    // A generic 500 error for reuse
    internalServerError: (message) => new AppError(
        message || statusMessages.SERVER_ERROR,
        httpCodes.INTERNAL_SERVER_ERROR.code,
        httpCodes.INTERNAL_SERVER_ERROR.name
    ),
};

module.exports = errorFactory;
