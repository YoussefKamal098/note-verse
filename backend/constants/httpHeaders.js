const httpHeaders = Object.freeze({
    ACCEPT: 'Accept',
    ACCEPT_ENCODING: 'Accept-Encoding',
    AUTHORIZATION: 'Authorization',
    CONTENT_TYPE: 'Content-Type',
    CONTENT_LENGTH: 'Content-Length',
    COOKIE: 'Cookie',
    HOST: 'host',
    USER_AGENT: 'user-agent',
    IF_MODIFIED_SINCE: 'If-Modified-Since',
    IF_NONE_MATCH: 'If-None-Match',
    REFERER: 'Referer',
    LOCATION: 'Location',
    CACHE_CONTROL: 'Cache-Control',
    ETAG: 'ETag',
    PRAGMA: 'Pragma',
    EXPIRES: 'Expires',
    X_REQUESTED_WITH: 'X-Requested-With',
    X_FORWARDED_FOR: 'X-Forwarded-For',
    X_FORWARDED_PROTO: 'X-Forwarded-Proto',
    X_CACHE: 'X-Cache',
    X_CSRF_TOKEN: "x_csrf_token"
});

module.exports = httpHeaders;
