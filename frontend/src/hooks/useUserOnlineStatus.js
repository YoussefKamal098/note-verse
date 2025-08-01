import {useEffect, useState, useRef, useCallback} from 'react';
import {useSocket} from '@/contexts/SocketContext'
import {SOCKET_EVENTS} from '@/constants/socketEvents';

/**
 * Tracks a specific user's online status in real time using Socket.IO.
 *
 * @param {string} userId - The user ID to watch
 * @returns {{ isOnline: boolean, loading: boolean }}
 */
export function useUserOnlineStatus(userId) {
    const {socket} = useSocket();
    const [isOnline, setIsOnline] = useState(false);
    const [loading, setLoading] = useState(true);
    const isSubscribedRef = useRef(false);

    const handleOnline = useCallback(({userId: updatedId}) => {
        if (updatedId === userId) {
            setIsOnline(true);
            setLoading(false);
        }
    }, [userId]);

    const handleOffline = useCallback(({userId: updatedId}) => {
        if (updatedId === userId) {
            setIsOnline(false);
            setLoading(false);
        }
    }, [userId]);

    const handleInitialStatus = useCallback(({userId: updatedId, online}) => {
        if (updatedId === userId) {
            setIsOnline(online);
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (!socket || !userId || isSubscribedRef.current) return;

        socket.emit(SOCKET_EVENTS.USER.WATCH, {userId});
        isSubscribedRef.current = true;

        socket.on(SOCKET_EVENTS.USER.STATUS, handleInitialStatus);
        socket.on(SOCKET_EVENTS.USER.ONLINE, handleOnline);
        socket.on(SOCKET_EVENTS.USER.OFFLINE, handleOffline);

        return () => {
            socket.emit(SOCKET_EVENTS.USER.UNWATCH, {userId});
            socket.off(SOCKET_EVENTS.USER.ONLINE, handleOnline);
            socket.off(SOCKET_EVENTS.USER.OFFLINE, handleOffline);
            socket.off(SOCKET_EVENTS.USER.STATUS, handleInitialStatus);
            isSubscribedRef.current = false;
        };
    }, [socket, userId, handleOnline, handleOffline]);

    return {isOnline, loading};
}
