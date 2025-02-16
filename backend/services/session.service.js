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
 * This service validates and normalizes session data (IP and User-Agent),
 * ensures that the associated user exists, and delegates database operations
 * to the injected SessionRepository.
 */
class SessionService {
    /**
     * @private
     * @type {import('../services/user.service')}
     * @description The UserService instance used to validate user existence and perform user-related operations.
     */
    #userService;

    /**
     * @private
     * @type {import('../repositories/session.repository')}
     * @description The SessionRepository instance used to handle CRUD operations on session data in the database.
     */
    #sessionRepository;

    /**
     * Constructs a new SessionService.
     *
     * @param {import('../services/user.service')} userService - An instance of the UserService.
     * @param {import('../repositories/session.repository')} sessionRepository - An instance of the SessionRepository.
     */
    constructor(userService, sessionRepository) {
        this.#userService = userService;
        this.#sessionRepository = sessionRepository;
    }

    /**
     * Creates a new session for the given user.
     *
     * Ensures the user exists, parses the User-Agent and IP, and then checks for an existing session.
     * If a session exists and is expired (i.e., expiredAt ≤ now), it updates the expiration and last accessed time.
     * If an active session exists (expiredAt > now), it is returned.
     * Otherwise, a new session is created.
     *
     * @param {object} params - The parameters object.
     * @param {string} params.userId - The ID of the user.
     * @param {string} params.ip - The raw IP address.
     * @param {string} params.userAgent - The raw User-Agent string.
     * @param {string|Date|number} params.expiredAt - The expiration date/time for the session (e.g., "30d").
     * @returns {Promise<Object>} The session document (updated or newly created).
     * @throws {AppError} If the user does not exist, or if the IP/User-Agent is invalid.
     */
    async createSession({userId, ip, userAgent, expiredAt}) {
        await this.#userService.ensureUserExists(userId);

        const parsedUA = parseUserAgent(userAgent);
        if (!parsedUA) {
            throw new AppError(
                statusMessages.INVALID_USER_AGENT,
                httpCodes.BAD_REQUEST.code,
                httpCodes.BAD_REQUEST.name
            );
        }
        const {info} = parsedUA;

        const {ip: normalizedIp, version} = parseIp(ip);
        if (normalizedIp === 'unknown' || version === 'unknown') {
            throw new AppError(
                statusMessages.INVALID_IP_ADDRESS,
                httpCodes.BAD_REQUEST.code,
                httpCodes.BAD_REQUEST.name
            );
        }

        // Look for an existing session using the normalized fields
        const existingSession = await this.#sessionRepository.findOne({
            userId,
            ip: normalizedIp,
            normalizedBrowser: info.browser.name,
            normalizedOS: info.os.name,
            deviceType: info.device.type,
        });

        if (existingSession && compareDates(Date.now(), existingSession.expiredAt) >= 0) {
            // Session expired: update expiration and last access, userAgent.
            return this.#sessionRepository.findByIdAndUpdate(existingSession.id, {
                userAgent,
                expiredAt: parseTime(expiredAt),
                lastAccessedAt: Date.now()
            });
        } else if (existingSession) {
            // Session is active.
            return existingSession;
        }

        // Construct session data based on the updated schema
        const sessionData = {
            userId,
            userAgent,
            ip: normalizedIp,
            ipVersion: version,
            normalizedBrowser: info.browser.name,
            normalizedOS: info.os.name,
            deviceModel: info.device.model,
            deviceType: info.device.type,
            expiredAt: parseTime(expiredAt),
            lastAccessedAt: Date.now()
        };

        return this.#sessionRepository.create(sessionData);
    }

    /**
     * Finds an active session for the given user based on IP and User-Agent.
     * A session is considered active if its expiredAt is in the future.
     *
     * @param {object} params - The parameters object.
     * @param {string} params.userId - The user's ID.
     * @param {string} params.ip - The raw IP address.
     * @param {string} params.userAgent - The raw User-Agent string.
     * @returns {Promise<Object|null>} The active session document if found; otherwise, null.
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
        return this.#sessionRepository.findOne({
            userId,
            ip: normalizedIp,
            normalizedBrowser: info.browser.name,
            normalizedOS: info.os.name,
            deviceType: info.device.type,
            expiredAt: {$gt: new Date()}
        });
    }

    /**
     * Finds a session by its ID.
     *
     * @param {string} sessionId - The session's ID.
     * @returns {Promise<Object|null>} The session document if found; otherwise, null.
     */
    async findSessionById(sessionId) {
        return this.#sessionRepository.findById(sessionId);
    }

    /**
     * Marks a session as inactive by setting its expiredAt to the current time.
     *
     * This method treats a session as inactive if its expiredAt is less than or equal to the current time.
     *
     * @param {string} sessionId - The session's ID.
     * @returns {Promise<Object>} The updated session document.
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
        // Mark the session as inactive by setting expiredAt to now.
        return this.#sessionRepository.findByIdAndUpdate(sessionId, {expiredAt: new Date()});
    }

    /**
     * Updates the lastAccessedAt field of the session to the current time.
     *
     * @param {string} sessionId - The session's ID.
     * @returns {Promise<Object>} The updated session document.
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
        return this.#sessionRepository.findByIdAndUpdate(sessionId, {lastAccessedAt: Date.now()});
    }
}

module.exports = new SessionService(userService, sessionRepository);
