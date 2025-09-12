import React, {
    createContext,
    useContext,
    useCallback,
    useState,
    useEffect,
    useRef
} from 'react';
import {useSocketEvent} from '@/hooks/useSocketEvent';
import {SOCKET_EVENTS} from "@/constants/socketEvents";
import notificationService from '@/api/notificationService';
import useRequestManager from '@/hooks/useRequestManager';
import {useOnlineBack} from "@/hooks/useOnlineBack";
import {API_CLIENT_ERROR_CODES} from '@/api/apiClient';

// Context
const NotificationContext = createContext(null);

// Provider Component
export const RealTimeNotificationProvider = ({children}) => {
    const [unseenCount, setUnseenCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const notificationCallbacksRef = useRef([]);
    const {createAbortController, removeAbortController} = useRequestManager();
    const fetchAllController = useRef(null);

    // Fetch unseen count
    const fetchUnseenCount = useCallback(async () => {
        const controller = createAbortController();

        try {
            const result = await notificationService.getUnseenCount({
                signal: controller.signal
            });

            setUnseenCount(result.data.count);
        } catch (err) {
            // Ignore cancelled
        } finally {
            removeAbortController(controller);
        }
    }, [createAbortController, removeAbortController]);

    useOnlineBack(fetchUnseenCount);

    // Initial unseen count
    useEffect(() => {
        fetchUnseenCount();
    }, [fetchUnseenCount]);

    // Fetch notifications (cursor-based)
    const fetchNotifications = useCallback(async (limit = 10, cursor) => {
        const controller = createAbortController();
        fetchAllController.current = controller;

        setIsLoading(true);
        setError(null);

        try {
            const response = await notificationService.getNotifications(
                {limit, cursor},
                {signal: controller.signal}
            );
            return response.data;
        } catch (err) {
            if (err.code !== API_CLIENT_ERROR_CODES.ERR_CANCELED) {
                setError(err.message || 'Failed to fetch notifications');
            }
            throw err;
        } finally {
            setIsLoading(false);
            removeAbortController(controller);
            fetchAllController.current = null;
        }
    }, [createAbortController, removeAbortController]);

    // Mark single notification as read
    const markAsRead = useCallback(async (notificationId) => {
        const controller = createAbortController();

        try {
            await notificationService.markAsRead(notificationId, {
                signal: controller.signal
            });
        } catch (err) {
            if (err.code !== API_CLIENT_ERROR_CODES.ERR_CANCELED) {
                setError(err.message || 'Failed to mark as read');
                throw err;
            }
        } finally {
            removeAbortController(controller);
        }
    }, [createAbortController, removeAbortController]);

    // Mark all as seen
    const markAllAsSeen = useCallback(async () => {
        const controller = createAbortController();
        const prevCount = unseenCount;

        try {
            setUnseenCount(0);
            await notificationService.markAllAsSeen({
                signal: controller.signal
            });
        } catch (err) {
            if (err.code !== API_CLIENT_ERROR_CODES.ERR_CANCELED) {
                setError(err.message || 'Failed to mark all as seen');
                setUnseenCount(prevCount);
                throw err;
            }
        } finally {
            removeAbortController(controller);
        }
    }, [createAbortController, removeAbortController, unseenCount]);

    // Register callbacks for new notifications
    const onNotification = useCallback((callback) => {
        if (!notificationCallbacksRef.current.includes(callback)) {
            notificationCallbacksRef.current.push(callback);
        }
        return () => {
            notificationCallbacksRef.current = notificationCallbacksRef.current.filter(cb => cb !== callback);
        };
    }, []);

    // Handle new notifications
    const handleNewNotification = useCallback((newNotification) => {
        if (!newNotification.seen) {
            setUnseenCount(prev => prev + 1);
        }
        notificationCallbacksRef.current.forEach(cb => cb(newNotification));
    }, []);

    // Abort ongoing fetch requests
    const abortNotificationFetchRequests = useCallback(() => {
        fetchAllController.current &&
        removeAbortController(fetchAllController.current);
    }, [removeAbortController]);

    useSocketEvent(SOCKET_EVENTS.NEW_NOTIFICATION, handleNewNotification);

    return (
        <NotificationContext.Provider
            value={{
                unseenCount,
                isLoading,
                error,
                fetchNotifications,
                markAsRead,
                markAllAsSeen,
                onNotification,
                abortNotificationFetchRequests
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useRealTimeNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useRealTimeNotifications must be used within a RealTimeNotificationProvider');
    }
    return context;
};
