const {SOCKET_EVENTS, getUserPresenceRoom} = require('@/constants/socket.constants');

/**
 * UserRoomSocket manages real-time subscriptions to a user's online/offline status.
 * Clients can watch or unwatch specific users to receive presence updates.
 */
class UserRoomSocket {
    /**
     * @private
     * @type {import('@/services/online/onlineUser.service').OnlineUserService}
     */
    #onlineUserService;

    /**
     * @param {{
     *   onlineUserService: import('@/services/online/onlineUser.service').OnlineUserService
     * }} dependencies - Injected dependencies for user presence tracking.
     */
    constructor({onlineUserService}) {
        this.#onlineUserService = onlineUserService;
    }

    /**
     * Registers socket event handlers for watching/unwatching specific user presence.
     * Automatically handles joining/leaving Socket.IO rooms based on watched users.
     *
     * @param {import('socket.io').Socket & { userId: string }} socket - The connected user socket.
     */
    registerSocket(socket) {
        const watchingUserIds = new Set();

        socket.on(SOCKET_EVENTS.USER.WATCH, async ({userId}) => {
            if (!userId || userId === socket.userId) return;
            watchingUserIds.add(userId);
            socket.join(getUserPresenceRoom(userId));

            // ✅ Respond with initial online status
            const isOnline = await this.#onlineUserService.isOnline(userId);
            socket.emit(SOCKET_EVENTS.USER.STATUS, {userId, online: isOnline});
        });

        socket.on(SOCKET_EVENTS.USER.UNWATCH, ({userId}) => {
            if (!userId) return;
            watchingUserIds.delete(userId);
            socket.leave(getUserPresenceRoom(userId));
        });

        socket.on(SOCKET_EVENTS.DISCONNECT, () => {
            for (const userId of watchingUserIds) {
                socket.leave(getUserPresenceRoom(userId));
            }
            watchingUserIds.clear();
        });
    }
}

module.exports = UserRoomSocket;
