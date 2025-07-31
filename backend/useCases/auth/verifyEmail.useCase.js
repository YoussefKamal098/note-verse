const AppError = require("@/errors/app.error");
const statusMessages = require("@/constants/statusMessages");
const httpCodes = require("@/constants/httpCodes");
const AvatarGenerationTypes = require("@/enums/avatarGenerationTypes.enum");

/**
 * Use case for verifying a user's email address using a one-time password (OTP).
 *
 * This use case validates the OTP and, upon successful verification, issues JWT access and refresh tokens.
 * It also queues an avatar generation job for the user.
 */
class VerifyEmailUseCase {
    /**
     * @private
     * @type {import('@/services/jwtAuth.service').JwtAuthService}
     * @description Service for handling JWT-based authentication logic.
     */
    #jwtAuthService;

    /**
     * @private
     * @type {import('@/queues/avatarGeneration.queue').AvatarGenerationQueue}
     * @description Queue service for generating user avatars asynchronously.
     */
    #avatarGenerationQueue;

    /**
     * Constructs a new VerifyEmailUseCase instance.
     *
     * @param {object} deps - The dependencies required for this use case.
     * @param {import('@/services/jwtAuth.service').JwtAuthService} deps.jwtAuthService - The JWT authentication service.
     * @param {import('@/queues/avatarGeneration.queue').AvatarGenerationQueue} deps.avatarGenerationQueue - The avatar generation queue instance.
     */
    constructor({jwtAuthService, avatarGenerationQueue}) {
        this.#jwtAuthService = jwtAuthService;
        this.#avatarGenerationQueue = avatarGenerationQueue;
    }

    /**
     * Executes the email verification process using an OTP code.
     *
     * If verification is successful, issues access and refresh tokens and queues a placeholder avatar generation job.
     *
     * @param {object} params - The verification data.
     * @param {string} params.email - The email address to verify.
     * @param {string} params.otpCode - The OTP code sent to the user's email.
     * @param {SessionInfo} params.sessionInfo - Information about the current session (e.g., IP and user-agent).
     *
     * @returns {Promise<{accessToken: string, refreshToken: string}>} The JWT access and refresh tokens.
     *
     * @throws {AppError} If email or OTP code is missing, or verification fails.
     */
    async execute({email, otpCode, sessionInfo}) {
        if (!email || !otpCode) {
            throw new AppError(
                statusMessages.MISSING_VERIFICATION_DATA,
                httpCodes.BAD_REQUEST.code,
                httpCodes.BAD_REQUEST.name
            );
        }

        const {user, accessToken, refreshToken} = await this.#jwtAuthService.verifyEmail(email, otpCode, sessionInfo);
        // Queue a placeholder avatar generation job
        await this.#avatarGenerationQueue.addAvatarJob({
            userId: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            useType: AvatarGenerationTypes.PLACEHOLDER
        });

        return {accessToken, refreshToken};
    }
}

module.exports = VerifyEmailUseCase;
