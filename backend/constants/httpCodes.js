const httpCodes = Object.freeze({
    OK: {
        code: 200,
        name: "OK",
        message: "Success",
    },
    CREATED: {
        code: 201,
        name: "Created",
        message: "Resource successfully created",
    },
    ACCEPTED: {
        code: 202,
        name: "Accepted",
        message: "Request accepted, but not yet processed",
    },
    NO_CONTENT: {
        code: 204,
        name: "No Content",
        message: "No content to return",
    },
    BAD_REQUEST: {
        code: 400,
        name: "Bad Request",
        message: "Bad request, please check the data provided",
    },
    CONFLICT: {
        code: 409,
        name: "Conflict",
        message: "Request could not be completed due to a conflict with the current state of the resource",
    },
    UNAUTHORIZED: {
        code: 401,
        name: "Unauthorized",
        message: "Unauthorized, please log in",
    },
    FORBIDDEN: {
        code: 403,
        name: "Forbidden",
        message: "Forbidden, you do not have permission",
    },
    NOT_FOUND: {
        code: 404,
        name: "Not Found",
        message: "Resource not found",
    },
    METHOD_NOT_ALLOWED: {
        code: 405,
        name: "Method Not Allowed",
        message: "Method not allowed for this endpoint",
    },
    INTERNAL_SERVER_ERROR: {
        code: 500,
        name: "Internal Server Error",
        message: "Internal server error, please try again later",
    },
    REQUEST_TIMEOUT: {
        code: 408,
        name: "Request Timeout",
        message: "Request timeout, the server took too long to respond",
    },
    TOO_MANY_REQUESTS: {
        code: 429,
        name: "Too Many Requests",
        message: "Too many requests, please try again later",
    },
});

module.exports = httpCodes;
