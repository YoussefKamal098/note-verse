import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    useCallback
} from 'react';
import {io} from 'socket.io-client';
import {useAuth} from "@/contexts/AuthContext";
import AppConfig from '@/config/config';
import authService, {AUTH_EVENTS} from '@/api/authService';

const SocketContext = createContext(null);
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({children}) => {
    const {user} = useAuth();
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const isConnecting = useRef(false);
    const reconnecting = useRef(false);
    const refreshTimeout = useRef(null);

    // ✅ Centralized connection logic with locking
    const connectSocketSafely = useCallback((token) => {
        if (isConnecting.current) {
            console.warn('[Socket] Connect already in progress');
            return;
        }
        isConnecting.current = true;

        if (socketRef.current) {
            // If socket exists, update token and reconnect if needed
            socketRef.current.auth.token = token;

            if (socketRef.current.connected) {
                console.info('[Socket] Reconnecting socket (existing)...');
                socketRef.current.disconnect();
                socketRef.current.connect();
            } else {
                console.info('[Socket] Connecting socket (existing)...');
                socketRef.current.connect();
            }
        } else {
            // First-time creation
            console.info('[Socket] Creating socket instance...');
            const socket = io(AppConfig.SOCKET_URL, {
                transports: ['websocket'],
                auth: {token},
                reconnection: true,
                reconnectionAttempts: 5,
                timeout: 10000,
            });

            socket.on('connect', () => {
                console.info('[Socket] Connected');
                setIsConnected(true);
            });

            socket.on('disconnect', (reason) => {
                console.warn('[Socket] Disconnected:', reason);
                setIsConnected(false);
            });

            socket.on('connect_error', (err) => {
                console.error('[Socket] Connect error:', err.message);
            });

            socketRef.current = socket;
        }

        setTimeout(() => {
            isConnecting.current = false;
        }, 1000); // prevent reconnect storm
    }, []);

    // ✅ Token refresh hook (debounced and safe)
    const onTokenRefreshed = useCallback((newToken) => {
        if (refreshTimeout.current) clearTimeout(refreshTimeout.current);

        refreshTimeout.current = setTimeout(() => {
            if (reconnecting.current) return;

            reconnecting.current = true;

            console.info('[Socket] Token refreshed — reconnecting socket...');
            connectSocketSafely(newToken);

            // Unlock after 3s
            setTimeout(() => {
                reconnecting.current = false;
            }, 3000);
        }, 100); // debounce slight delay
    }, [connectSocketSafely]);

    const onAccessTokenExpired = useCallback(() => {
        if (socketRef.current?.connected) {
            console.warn('[Socket] Access token expired — disconnecting socket...');
            socketRef.current.disconnect();
        }
    }, []);

    const onLogin = useCallback(() => {
        const token = authService.getAccessToken();
        if (token) connectSocketSafely(token);
    }, [connectSocketSafely]);

    const onLogoutOrExpired = useCallback(() => {
        if (socketRef.current?.connected) {
            console.info('[Socket] Logging out — disconnecting socket');
            socketRef.current.disconnect();
            socketRef.current = null;
        }
    }, []);

    // ✅ Handle auth events
    useEffect(() => {
        authService.on(AUTH_EVENTS.LOGIN, onLogin);
        authService.on(AUTH_EVENTS.LOGOUT, onLogoutOrExpired);
        authService.on(AUTH_EVENTS.SESSION_EXPIRED, onLogoutOrExpired);
        authService.on(AUTH_EVENTS.ACCESS_TOKEN_REFRESHED, onTokenRefreshed);
        authService.on(AUTH_EVENTS.ACCESS_TOKEN_EXPIRED, onAccessTokenExpired);

        return () => {
            authService.off(AUTH_EVENTS.LOGIN, onLogin);
            authService.off(AUTH_EVENTS.LOGOUT, onLogoutOrExpired);
            authService.off(AUTH_EVENTS.SESSION_EXPIRED, onLogoutOrExpired);
            authService.off(AUTH_EVENTS.ACCESS_TOKEN_REFRESHED, onTokenRefreshed);
            authService.off(AUTH_EVENTS.ACCESS_TOKEN_EXPIRED, onAccessTokenExpired);

            if (socketRef.current?.connected) {
                socketRef.current.disconnect();
            }
        };
    }, [onLogin, onLogoutOrExpired, onTokenRefreshed, onAccessTokenExpired]);

    // ✅ Watch user state
    useEffect(() => {
        const token = authService.getAccessToken();
        if (user && token) {
            connectSocketSafely(token);
        } else if (!user && socketRef.current?.connected) {
            socketRef.current.disconnect();
        }

        const handleOnline = () => {
            const token = authService.getAccessToken();
            if (user && token && socketRef.current && !socketRef.current.connected) {
                console.info('[Socket] Reconnecting after coming online');
                connectSocketSafely(token);
            }
        };

        const handleOffline = () => {
            if (socketRef.current?.connected) {
                console.info('[Socket] Offline detected — disconnecting');
                socketRef.current.disconnect();
            }
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [user, connectSocketSafely]);

    return (
        <SocketContext.Provider value={{socket: socketRef.current, isConnected}}>
            {children}
        </SocketContext.Provider>
    );
};
