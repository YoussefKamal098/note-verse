const RoutesPaths = Object.freeze({
    LOGIN: '/login',
    REGISTER: '/register',
    VERIFY_ACCOUNT: '/verify_account',
    HOME: '/home',
    NOTE: (id) => `/note/${id ? id : ":id"}`,
    ERROR: '/error',
    NOT_FOUND: '*',
});

export default RoutesPaths;
