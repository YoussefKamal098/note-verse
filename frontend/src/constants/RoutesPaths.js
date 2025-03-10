const RoutesPaths = Object.freeze({
    LOGIN: '/login',
    REGISTER: '/register',
    VERIFY_ACCOUNT: '/verify_account',
    GOOGLE_AUTH_CALLBACK: '/auth/google/callback',
    HOME: '/home',
    NOTE: (id) => `/note/${id ? id : ":id"}`,
    ERROR: '/error',
    NOT_FOUND: '*'
});

export default RoutesPaths;
