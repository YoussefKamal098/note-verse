import {useEffect, useState, useRef, useCallback} from 'react';
import {useSocket} from '@/contexts/SocketContext';
import {SOCKET_EVENTS} from '@/constants/socketEvents';

/**
 * Tracks a specific user's online status in real time using Socket.IO.
 *
 * 🔒 Automatically resubscribes on:
 * - socket reconnect
 * - browser comes back online
 *
 * Prevents duplicate subscriptions & listeners.
 */
export function useUserOnlineStatus(userId) {
    const {socket} = useSocket();
    const [isOnline, setIsOnline] = useState(false);
    const [loading, setLoading] = useState(true);
    const isSubscribedRef = useRef(false);

    const handleOnline = useCallback(({userId: updatedId}) => {
        // console.log("Online")

        if (updatedId === userId) {
            setIsOnline(true);
            setLoading(false);
        }
    }, [userId]);

    const handleOffline = useCallback(({userId: updatedId}) => {
        // console.log("Offline")

        if (updatedId === userId) {
            setIsOnline(false);
            setLoading(false);
        }
    }, [userId]);

    const handleInitialStatus = useCallback(({userId: updatedId, online}) => {
        // console.log("init");

        if (updatedId === userId) {
            setIsOnline(online);
            setLoading(false);
        }
    }, [userId]);

    const subscribe = useCallback(() => {
        // console.log("subscribe");

        if (!socket || !userId) return;
        if (isSubscribedRef.current) return; // 🛡 prevent double-subscription

        // console.log("subscribe inside");

        isSubscribedRef.current = true; // mark subscribed

        socket.on(SOCKET_EVENTS.USER.STATUS, handleInitialStatus);
        socket.on(SOCKET_EVENTS.USER.ONLINE, handleOnline);
        socket.on(SOCKET_EVENTS.USER.OFFLINE, handleOffline);

        socket.emit(SOCKET_EVENTS.USER.WATCH, {userId});
    }, [socket, userId, handleInitialStatus, handleOnline, handleOffline]);

    const unsubscribe = useCallback(() => {
        // console.log("unsubscribe");

        if (!socket || !userId) return;
        if (!isSubscribedRef.current) return; // 🛡 only if already subscribed

        // console.log("unsubscribe inside");

        isSubscribedRef.current = false; // mark unsubscribed

        socket.off(SOCKET_EVENTS.USER.STATUS, handleInitialStatus);
        socket.off(SOCKET_EVENTS.USER.ONLINE, handleOnline);
        socket.off(SOCKET_EVENTS.USER.OFFLINE, handleOffline);

        socket.emit(SOCKET_EVENTS.USER.UNWATCH, {userId});
        setIsOnline(false);
    }, [socket, userId, handleInitialStatus, handleOnline, handleOffline]);

    const handleConnect = useCallback(() => {
        subscribe();
    }, [subscribe, unsubscribe]);

    const handleDisconnect = useCallback(() => {
        unsubscribe();
    }, [unsubscribe]);


    // Initial subscribe + cleanup on unmount
    useEffect(() => {
        if (!socket || !userId) return;
        subscribe();

        socket.on('disconnect', handleDisconnect)
        socket.on('connect', handleConnect);

        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect)
            unsubscribe();
        };
    }, [userId, subscribe, unsubscribe, handleDisconnect, handleConnect, socket?.connected]);

    return {isOnline, loading};
}
