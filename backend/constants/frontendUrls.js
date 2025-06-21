const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';

const FRONTEND_ROUTES = {
    NOTE: (id) => `${FRONTEND_BASE_URL}/notes/${id}`,
};

module.exports = {
    FRONTEND_BASE_URL,
    FRONTEND_ROUTES
};