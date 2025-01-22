const RoutesPaths = Object.freeze({
    LOGIN: '/login',
    REGISTER: '/register',
    HOME: '/home',
    NOTE: (id) => `/note/${id ? id : ":id"}`,
    ERROR: '/error',
    NOT_FOUND: '*',
});

export default RoutesPaths;