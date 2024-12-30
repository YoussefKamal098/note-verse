import EventEmitter from 'events';
import apiClient from './apiClient';
import tokenStorage from './tokenStorage';
import userService from './userService';

const AUTH_EVENTS = {
    LOGIN: 'login',
    LOGOUT: 'logout',
};

const HEADERS = {
    AUTHORIZATION: 'Authorization',
};

const ENDPOINTS = {
    REFRESH: 'auth/refresh',
    LOGIN: 'auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
};

class AuthService {
    #apiClient;
    #tokenStorage;
    #eventEmitter;
    #userService;

    constructor(apiClient, tokenStorage, userService) {
        this.#apiClient = apiClient;
        this.#tokenStorage = tokenStorage;
        this.#eventEmitter = new EventEmitter();
        this.#userService = userService;

        this.#setupInterceptors();
    }

    #setupInterceptors() {
        this.#apiClient.instance.interceptors.request.use(
            (config) => {
                const token = this.#tokenStorage.getAccessToken();
                if (token) {
                    config.headers[HEADERS.AUTHORIZATION] = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        this.#apiClient.instance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                // Skip refresh logic for specific endpoints
                if (
                    originalRequest.url.includes(ENDPOINTS.REFRESH) ||
                    originalRequest.url.includes(ENDPOINTS.LOGOUT)
                ) {
                    return Promise.reject(error);
                }

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    try {
                        const { accessToken: newAccessToken } = await this.#refreshAccessToken();
                        originalRequest.headers[HEADERS.AUTHORIZATION] = `Bearer ${newAccessToken}`;

                        return this.#apiClient.instance(originalRequest);
                    } catch (refreshError) {
                        console.error('Token refresh failed:', refreshError);
                        return Promise.reject(error);
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    async #refreshAccessToken() {
        try {
            const { data } = await this.#apiClient.instance.post(ENDPOINTS.REFRESH);
            this.#tokenStorage.setAccessToken(data.accessToken);
            return { accessToken: data.accessToken };
        } catch (error) {
            this.#handleTokenFailure();
            try { await this.logout() } catch (logoutError) {}
            console.error('Error refreshing access token:', error);
            throw new Error('Token refresh failed');
        }
    }

    #handleTokenFailure() {
        this.#tokenStorage.clearAccessToken();
        this.#eventEmitter.emit(AUTH_EVENTS.LOGOUT);
    }

    async login({ email, password }) {
        try {
            const response = await this.#apiClient.instance.post(ENDPOINTS.LOGIN, { email, password }, { withCredentials: true });
            const { accessToken } = response.data;

            this.#tokenStorage.setAccessToken(accessToken);

            const user = await this.#userService.getUserInfo();
            const { firstname, lastname } = user.data;

            this.#eventEmitter.emit(AUTH_EVENTS.LOGIN, { user: { email, firstname, lastname } });

            return { statusCode: response.status, data: response.data };
        } catch (error) {
            return this.#handleError(error, 'Login failed');
        }
    }

    async logout() {
        try {
            const response = await this.#apiClient.instance.post(ENDPOINTS.LOGOUT);
            this.#handleTokenFailure();
            return { statusCode: response.status, message: 'Logged out successfully' };
        } catch (error) {
            return this.#handleError(error, 'Logout failed');
        }
    }

    async register({ email, password, firstname, lastname }) {
        try {
            const response = await this.#apiClient.instance.post(ENDPOINTS.REGISTER, { email, password, firstname, lastname });
            const { accessToken } = response.data;

            this.#tokenStorage.setAccessToken(accessToken);
            this.#eventEmitter.emit(AUTH_EVENTS.LOGIN, { user: { email, firstname, lastname } });

            return { statusCode: response.status, data: response.data };
        } catch (error) {
            return this.#handleError(error, 'Registration failed');
        }
    }

    on(event, listener) {
        this.#eventEmitter.on(event, listener);
    }

    off(event, listener) {
        this.#eventEmitter.off(event, listener);
    }

    #handleError(error, defaultMessage) {
        error.statusCode = error.statusCode || 500;
        error.message = error.message || defaultMessage;
        return error;
    }
}

export default new AuthService(apiClient, tokenStorage, userService);