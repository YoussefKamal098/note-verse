const routesPaths = Object.freeze({
    LOGIN: '/login',
    REGISTER: '/register',
    VERIFY_ACCOUNT: '/verify_account',
    GOOGLE_AUTH_CALLBACK: '/auth/google/callback',
    HOME: '/home',
    PROFILE: '/profile',
    PROFILE_TAB: (tab) => `/profile/${tab}`,
    NOTE: (id) => `/notes/${id ? id : ":id"}`,
    NOTE_VERSION: (id) => `/versions/${id ? id : ":id"}`,
    ERROR: '/error',
    NOT_FOUND: '*'
});

export default routesPaths;
