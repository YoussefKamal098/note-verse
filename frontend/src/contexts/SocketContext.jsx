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

    const createSocket = useCallback((token) => {
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

        return socket;
    }, []);

    const onTokenRefreshed = useCallback((newToken) => {
        if (!socketRef.current) {
            socketRef.current = createSocket(newToken);
            return;
        }

        console.info('[Socket] Token refreshed — reconnecting socket...');

        if (socketRef.current.connected) {
            socketRef.current.auth.token = newToken;
            socketRef.current.disconnect();
            socketRef.current.connect();
        } else {
            socketRef.current.auth.token = newToken;
            socketRef.current.connect();
        }
    }, [createSocket]);

    const onAccessTokenExpired = useCallback(() => {
        if (socketRef.current?.connected) {
            console.warn('[Socket] Access token expired — disconnecting socket...');
            socketRef.current.disconnect();
        }
    }, []);

    const onLogin = useCallback(({_}) => {
        const token = authService.getAccessToken();
        if (socketRef.current) {
            socketRef.current.auth.token = token;
            socketRef.current.connect();
        } else {
            socketRef.current = createSocket(token);
        }
    }, [createSocket]);

    const onLogoutOrExpired = useCallback(() => {
        if (socketRef.current?.connected) {
            socketRef.current.disconnect();
        }
    }, []);

    // Manage connection based on user state
    useEffect(() => {
        const token = authService.getAccessToken();

        if (user && token) {
            if (!socketRef.current) {
                socketRef.current = createSocket(token);
            } else if (!socketRef.current.connected) {
                socketRef.current.auth.token = token;
                socketRef.current.connect();
            }
        } else {
            // Disconnect if user becomes null (e.g., logged out)
            if (socketRef.current?.connected) {
                socketRef.current.disconnect();
            }
        }

        const handleOnline = () => {
            const token = authService.getAccessToken();
            if (user && token && socketRef.current && !socketRef.current.connected) {
                console.info('[Socket] Reconnecting after going online...');
                socketRef.current.auth.token = token;
                socketRef.current.connect();
            }
        };

        const handleOffline = () => {
            if (socketRef.current?.connected) {
                console.info('[Socket] Disconnected due to offline status');
                socketRef.current.disconnect();
            }
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }

            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [user, createSocket]);

    // Handle auth events
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
        };
    }, [onLogin, onLogoutOrExpired, onTokenRefreshed, onAccessTokenExpired]);

    return (
        <SocketContext.Provider value={{socket: socketRef.current, isConnected}}>
            {children}
        </SocketContext.Provider>
    );
};
