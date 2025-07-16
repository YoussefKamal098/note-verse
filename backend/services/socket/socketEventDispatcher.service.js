const {REDIS} = require('../../constants/socket.constants');

/**
 * @typedef {Object} SocketEvent
 * @property {import('@/constants/socket.constants').REDIS.EVENT_TYPES} type - Event type (e.g., NOTIFICATION)
 * @property {import('@/constants/socket.constants').SOCKET_EVENTS} event - Name of the Socket.IO event to emit
 * @property {string} room - Target room/channel name
 * @property {any} data - Payload data to send with the event
 */

/**
 * @class SocketEventDispatcher
 * @description Handles dispatching of socket events to specific rooms/channels
 *
 * This service:
 * - Routes different types of socket events
 * - Validates event formats
 * - Manages targeted event emission
 *
 * @example
 * const dispatcher = new SocketEventDispatcher(ioServer);
 * dispatcher.dispatch({
 *   type: 'NOTIFICATION',
 *   event: 'new_message',
 *   room: 'user_123',
 *   data: { text: 'Hello' }
 * });
 */
class SocketEventDispatcher {
    /**
     * @private
     * @type {import('socket.io').Server}
     * @description Socket.IO server instance
     */
    #io;

    /**
     * Creates a SocketEventDispatcher instance
     * @param {import('socket.io').Server} io - Socket.IO server instance
     * @throws {Error} If Socket.IO instance is not provided
     */
    constructor(io) {
        this.#io = io;
    }

    /**
     * Dispatches an event to the appropriate Socket.IO room
     * @param {SocketEvent} event - Event object to dispatch
     * @returns {void}
     *
     * @example
     * // Dispatch a notification event
     * dispatcher.dispatch({
     *   type: REDIS.EVENT_TYPES.NOTIFICATION,
     *   event: 'alert',
     *   room: 'user_456',
     *   data: { priority: 'high' }
     * });
     */
    dispatch(event) {
        switch (event.type) {
            case REDIS.EVENT_TYPES.NOTIFICATION:
                this.#io.to(event.room).emit(event.event, event.data);
                break;
            default:
                console.warn(`[SocketEventDispatcher] Unknown event type: ${event.type}`);
        }
    }
}

module.exports = SocketEventDispatcher;
