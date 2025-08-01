const AppError = require('../errors/app.error');
const httpCodes = require('../constants/httpCodes');
const httpHeaders = require('../constants/httpHeaders');
const statusMessages = require('../constants/statusMessages');

/**
 * Controller for authentication-related endpoints.
 */
class AuthController {
    /**
     * @private
     * @type {import('@/services/jwtAuth.service').JwtAuthService}
     * @description The JWT authentication service instance.
     */
    #jwtAuthService;
    /**
     * @private
     * @type {import('@/services/googleAuth.service').GoogleAuthService}
     * @description The Google authentication service instance
     */
    #googleAuthService;
    /**
     * @private
     * @type {import('@/services/email.mediator').EmailMediator}
     * @description Email mediator
     */
    #emailMediator;
    /**
     * @private
     * @type {import('@/useCases/auth/login.useCase').LoginUseCase}
     * @description Login UseCase
     */
    #loginUseCase
    /**
     * @private
     * @type {import('@/useCases/auth/googleCallback.useCase').GoogleCallbackUseCase}
     * @description Google Callback UseCase
     */
    #googleCallbackUseCase
    /**
     * @private
     * @type {import('@/useCases/auth/verifyEmail.useCase').VerifyEmailUseCase}
     * @description Google Callback UseCase
     */
    #verifyEmailUseCase;

    /**
     * Constructs a new AuthController.
     * @param depndencies
     * @param {import('@/services/jwtAuth.service').JwtAuthService} depndencies.jwtAuthService
     * @param {import('@/services/googleAuth.service').GoogleAuthService} depndencies.googleAuthService
     * @param {import('@/useCases/auth/login.useCase').LoginUseCase} depndencies.loginUseCase
     * @param {import('@/useCases/auth/googleCallback.useCase').GoogleCallbackUseCase} depndencies.googleCallbackUseCase
     * @param {import('@/services/email.mediator').EmailMediator} depndencies.emailMediator
     * @param {import('@/useCases/auth/verifyEmail.useCase').VerifyEmailUseCase} depndencies.verifyEmailUseCase
     */
    constructor({
                    jwtAuthService,
                    googleAuthService,
                    loginUseCase,
                    googleCallbackUseCase,
                    emailMediator,
                    verifyEmailUseCase
                }) {
        this.#jwtAuthService = jwtAuthService;
        this.#googleAuthService = googleAuthService;
        this.#emailMediator = emailMediator;
        this.#loginUseCase = loginUseCase;
        this.#googleCallbackUseCase = googleCallbackUseCase;
        this.#verifyEmailUseCase = verifyEmailUseCase;
    }

    /**
     * Sends the access and refresh tokens to the client.
     *
     * @private
     * @param {import('express').Response} res - The Express response object.
     * @param {string} accessToken - The JWT access token.
     * @param {string} refreshToken - The JWT refresh token.
     */
    #sendTokens(res, accessToken, refreshToken) {
        const cookieOptions = this.#jwtAuthService.config.getCookieOptions();
        res.cookie(this.#jwtAuthService.config.cookiesName, refreshToken, cookieOptions);
        res.json({accessToken});
    }

    /**
     * Clears Google authentication cookies
     * @private
     * @param {import('express').Response} res
     */
    #clearGoogleAuthCookie(res) {
        const options = this.#jwtAuthService.config.getClearCookieOptions();
        res.clearCookie(this.#jwtAuthService.config.cookiesName, options);
    }

    /**
     * Clears JWT authentication cookies
     * @private
     * @param {import('express').Response} res
     */
    #clearJwtAuthCookie(res) {
        const options = this.#googleAuthService.config.getClearCookieOptions();
        res.clearCookie(this.#googleAuthService.config.cookiesName, options);
    }

    /**
     * Extracts session information from request
     * @private
     * @param {import('express').Request} req
     * @returns {SessionInfo}
     */
    #getSessionInfo(req) {
        return {
            ip: req.ip,
            userAgent: req.get(httpHeaders.USER_AGENT)
        };
    }

    /**
     * Registers a new user and automatically logs them in.
     *
     * Extracts session info from the request (IP and User-Agent) and passes it along to the JWT service.
     *
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>}
     * @throws {AppError} If user registration fails.
     */
    async register(req, res) {
        const {firstname, lastname, email, password} = req.body;
        // Extract session info from request
        const sessionInfo = {
            ip: req.ip,
            userAgent: req.get(httpHeaders.USER_AGENT)
        };
        const user = await this.#jwtAuthService.register({
            firstname,
            lastname,
            email,
            password,
            sessionInfo
        });

        await this.#emailMediator.sendAccountVerificationEmail({
            email,
            name: `${firstname} ${lastname}`,
            otpCode: user.otpCode,
            otpCodeExpiresAt: user.otpCodeExpiresAt
        });

        res.status(httpCodes.CREATED.code).json({message: statusMessages.USER_CREATED});
    }

    /**
     * Verifies user email with OTP code
     * @param {import('express').Request} req - Request object
     * @param {import('express').Response} res - Response object
     */
    async verifyEmail(req, res) {
        const {email, otpCode} = req.body;
        const sessionInfo = this.#getSessionInfo(req);

        const {accessToken, refreshToken} = await this.#verifyEmailUseCase.execute({email, otpCode, sessionInfo});

        this.#sendTokens(res, accessToken, refreshToken);
    }

    /**
     * Logs in a user by verifying credentials and creating/reactivating a session.
     *
     * Extracts session info (IP and User-Agent) from the request and passes it to the JWT service.
     *
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>}
     * @throws {AppError} If credentials are missing or invalid.
     */
    async login(req, res) {
        const {email, password} = req.body;

        const sessionInfo = this.#getSessionInfo(req);
        const {accessToken, refreshToken} = await this.#loginUseCase.execute({email, password, sessionInfo});

        this.#sendTokens(res, accessToken, refreshToken);
    }

    /**
     * Initiates the Google authentication flow.
     *
     * Generates a state token based on session info, sets a cookie with the state token,
     * and returns the Google authorization URL.
     *
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} A promise that resolves when the response is sent.
     */
    initiateGoogleAuth = async (req, res) => {
        const sessionInfo = this.#getSessionInfo(req);
        const stateToken = await this.#googleAuthService.generateStateToken(sessionInfo);

        // Use config from service for cookie settings
        const cookieOptions = this.#googleAuthService.config.getCookieOptions();
        res.cookie(this.#googleAuthService.config.cookiesName, stateToken, cookieOptions);

        res.json({authUrl: this.#googleAuthService.getAuthorizationUrl()});
    }

    /**
     * Handles the callback from Google authentication.
     *
     * Exchanges the provided authorization code and state token for JWT tokens,
     * clears the state cookie, and sends the access and refresh tokens to the client.
     *
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} A promise that resolves when the tokens are sent.
     * @throws {AppError} If the authorization code or state token is missing.
     */
    handleGoogleCallback = async (req, res) => {
        const {code} = req.body;
        const stateToken = req.cookies[this.#googleAuthService.config.cookiesName];

        const sessionInfo = this.#getSessionInfo(req);
        const tokens = await this.#googleCallbackUseCase.execute({code, stateToken, sessionInfo});

        // Clear state cookie using config options
        this.#clearGoogleAuthCookie(res);
        const {accessToken, refreshToken} = tokens;
        this.#sendTokens(res, accessToken, refreshToken);
    }

    /**
     * Logs out a user by marking the session as inactive.
     *
     * Retrieves the refresh token from cookies and calls the JWT service to log out.
     *
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @param {Function} next - The Express next middleware function.
     * @returns {Promise<void>}
     * @throws {AppError} If the refresh token is not provided or is invalid.
     */
    async logout(req, res, next) {
        try {
            const refreshToken = req.cookies[this.#jwtAuthService.config.cookiesName];
            if (!refreshToken) {
                return next(new AppError(
                    statusMessages.REFRESH_TOKEN_NOT_PROVIDED,
                    httpCodes.UNAUTHORIZED.code,
                    httpCodes.UNAUTHORIZED.name
                ));
            }

            await this.#jwtAuthService.logout(refreshToken);
            this.#clearJwtAuthCookie(res);
            res.sendStatus(httpCodes.NO_CONTENT.code);
        } catch (error) {
            if (error instanceof AppError && error.httpCode === httpCodes.UNAUTHORIZED.code) {
                this.#clearJwtAuthCookie(res);
            }

            throw error;
        }
    }

    /**
     * Refreshes the access token using the refresh token from cookies.
     *
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @param {Function} next - The Express next middleware function.
     * @returns {Promise<void>}
     * @throws {AppError} If the refresh token is not provided or is invalid.
     */
    async refreshToken(req, res, next) {
        try {
            const refreshToken = req.cookies[this.#jwtAuthService.config.cookiesName];
            if (!refreshToken) {
                return next(new AppError(
                    statusMessages.REFRESH_TOKEN_NOT_PROVIDED,
                    httpCodes.UNAUTHORIZED.code,
                    httpCodes.UNAUTHORIZED.name
                ));
            }

            const {accessToken} = await this.#jwtAuthService.refreshToken(refreshToken);
            res.json({accessToken});
        } catch (error) {
            if (error instanceof AppError && error.httpCode === httpCodes.UNAUTHORIZED.code) {
                this.#clearJwtAuthCookie(res);
            }

            throw error;
        }
    }

}

module.exports = AuthController;
