const {compareDates, parseTime} = require('shared-utils/date.utils');
const {parseUserAgent} = require('../utils/userAgent.utils');
const {parseIp} = require('../utils/ip.utils');
const AppError = require('../errors/app.error');
const httpCodes = require('../constants/httpCodes');
const statusMessages = require('../constants/statusMessages');
const userService = require('../services/user.service');
const sessionRepository = require('../repositories/session.repository');

/**
 * Service for managing user sessions.
 * The service validates and normalizes session data,
 * ensures the associated user exists, and delegate's database
 * operations via the repository using plain parameters.
 */
class SessionService {
    #userService;
    #sessionRepository;

    constructor(userService, sessionRepository) {
        this.#userService = userService;
        this.#sessionRepository = sessionRepository;
    }

    /**
     * Creates a new session or updates an expired one.
     *
     * Logic:
     * 1. Ensure the user exists.
     * 2. Validate and normalize the User-Agent and IP.
     * 3. Look for an existing session (by plain domain keys).
     *    - If found and expired, update it.
     *    - If found and active, return it.
     * 4. Otherwise, create a new session.
     *
     * @param {Object} params
     * @param {string} params.userId
     * @param {string} params.ip
     * @param {string} params.userAgent
     * @param {string|Date|number} params.expiredAt
     * @returns {Promise<Object>} The session document.
     * @throws {AppError} If validations fail.
     */
    async createSession({userId, ip, userAgent, expiredAt}) {
        await this.#userService.ensureUserExists(userId);

        // Validate and normalize the User-Agent.
        const parsedUA = parseUserAgent(userAgent);
        if (!parsedUA) {
            throw new AppError(
                statusMessages.INVALID_USER_AGENT,
                httpCodes.BAD_REQUEST.code,
                httpCodes.BAD_REQUEST.name
            );
        }
        const {info} = parsedUA;

        // Validate and normalize the IP.
        const {ip: parsedIp, version: ipVersion} = parseIp(ip);
        if (parsedIp === 'unknown' || ipVersion === 'unknown') {
            throw new AppError(
                statusMessages.INVALID_IP_ADDRESS,
                httpCodes.BAD_REQUEST.code,
                httpCodes.BAD_REQUEST.name
            );
        }

        const now = Date.now();

        // Look for an existing session using plain domain keys.
        const existingSession = await this.#sessionRepository.findSessionByKeys({
            userId,
            ip: parsedIp,
            browserName: info.browser.name,
            osName: info.os.name,
            deviceType: info.device.type,
        });

        if (existingSession && compareDates(now, existingSession.expiredAt) >= 0) {
            // Session expired – update it.
            return this.#sessionRepository.updateSessionById(existingSession.id, {
                userAgent,
                expiredAt: parseTime(expiredAt),
                lastAccessedAt: now,
                reusedAt: now,
            });
        }

        if (existingSession) {
            // Session is active.
            return existingSession;
        }

        // Construct new session data.
        const sessionData = {
            userId,
            userAgent,
            ipVersion,
            ip: parsedIp,
            browserName: info.browser.name,
            osName: info.os.name,
            deviceModel: info.device.model,
            deviceType: info.device.type,
            expiredAt: parseTime(expiredAt),
            lastAccessedAt: now,
        };

        return this.#sessionRepository.create(sessionData);
    }

    /**
     * Finds an active session based on plain parameters.
     *
     * @param {Object} params
     * @param {string} params.userId
     * @param {string} params.ip
     * @param {string} params.userAgent
     * @returns {Promise<Object|null>} The active session if found.
     */
    async findActiveSessionByUserIpAgent({userId, ip, userAgent}) {
        const {ip: normalizedIp} = parseIp(ip);
        const parsedUA = parseUserAgent(userAgent);
        if (!parsedUA) {
            throw new AppError(
                statusMessages.INVALID_USER_AGENT,
                httpCodes.BAD_REQUEST.code,
                httpCodes.BAD_REQUEST.name
            );
        }
        const {info} = parsedUA;

        return this.#sessionRepository.findActiveSessionByKeys({
            userId,
            ip: normalizedIp,
            browserName: info.browser.name,
            osName: info.os.name,
            deviceType: info.device.type,
            currentTime: new Date(),
        });
    }

    /**
     * Finds a session by its ID.
     *
     * @param {string} sessionId
     * @returns {Promise<Object|null>} The session if found.
     */
    async findSessionById(sessionId) {
        return this.#sessionRepository.findById(sessionId);
    }

    /**
     * Marks a session as inactive by setting its expiredAt to now.
     *
     * @param {string} sessionId
     * @returns {Promise<Object>} The updated session.
     * @throws {AppError} If the session is not found or is already expired.
     */
    async inactivateSession(sessionId) {
        const session = await this.#sessionRepository.findById(sessionId);
        if (!session || compareDates(Date.now(), session.expiredAt) >= 0) {
            throw new AppError(
                statusMessages.SESSION_NOT_FOUND_OR_ALREADY_LOGGED_OUT,
                httpCodes.UNAUTHORIZED.code,
                httpCodes.UNAUTHORIZED.name
            );
        }
        return this.#sessionRepository.updateSessionById(sessionId, {
            expiredAt: new Date(),
        });
    }

    /**
     * Checks if a session is expired or missing.
     *
     * @param {string} sessionId
     * @returns {Promise<boolean>} True if expired or not found.
     */
    async isSessionExpired(sessionId) {
        const session = await this.findSessionById(sessionId);
        return !session || compareDates(Date.now(), session.expiredAt) >= 0;
    }

    /**
     * Updates the lastAccessedAt field.
     *
     * @param {string} sessionId
     * @returns {Promise<Object>} The updated session.
     * @throws {AppError} If the session is not found.
     */
    async updateLastAccess(sessionId) {
        const session = await this.#sessionRepository.findById(sessionId);
        if (!session) {
            throw new AppError(
                statusMessages.SESSION_NOT_FOUND_OR_ALREADY_LOGGED_OUT,
                httpCodes.NOT_FOUND.code,
                httpCodes.NOT_FOUND.name
            );
        }
        return this.#sessionRepository.updateSessionById(sessionId, {
            lastAccessedAt: Date.now(),
        });
    }
}

module.exports = new SessionService(userService, sessionRepository);
