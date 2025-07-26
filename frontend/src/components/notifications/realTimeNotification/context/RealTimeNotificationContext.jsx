import React, {createContext, useContext, useCallback, useState, useEffect, useRef} from 'react';
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
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const notificationCallbacksRef = useRef([]);
    const {createAbortController, removeAbortController} = useRequestManager();
    const fetchUnreadController = useRef(null)
    const fetchAllController = useRef(null);

    const fetchUnreadCount = useCallback(async () => {
        const controller = createAbortController();

        try {
            const result = await notificationService.getUnreadCount({
                signal: controller.signal
            });
            setUnreadCount(result.data.count);
        } catch (err) {
        } finally {
            removeAbortController(controller);
        }
    }, [createAbortController, removeAbortController]);

    useOnlineBack(fetchUnreadCount);

    // Fetch initial unread count on mount
    useEffect(() => {
        fetchUnreadCount();
    }, [fetchUnreadCount]);

    // Fetch unread notifications
    const fetchUnreadNotifications = useCallback(async (page = 0, perPage = 10) => {
        const controller = createAbortController();
        fetchUnreadController.current = controller;

        setIsLoading(true);
        setError(null);

        try {
            const response = await notificationService.getNotifications({
                page,
                limit: perPage,
                filter: {read: false}
            }, {
                signal: controller.signal
            });
            return response.data;
        } catch (err) {
            if (err.code !== API_CLIENT_ERROR_CODES.ERR_CANCELED) {
                setError(err.message || 'Failed to fetch unread notifications');
            }
            throw err;
        } finally {
            setIsLoading(false);
            removeAbortController(controller);
            fetchUnreadController.current = null;
        }
    }, [createAbortController, removeAbortController]);

    // Fetch all notifications with pagination
    const fetchNotifications = useCallback(async (page = 0, perPage = 10) => {
        const controller = createAbortController();
        fetchAllController.current = controller;

        setIsLoading(true);
        setError(null);

        try {
            const response = await notificationService.getNotifications({
                page,
                limit: perPage
            }, {
                signal: controller.signal
            });
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

    // Mark notification as read
    const markAsRead = useCallback(async (notificationId) => {
        const controller = createAbortController();

        try {
            setUnreadCount(prev => prev - 1);
            await notificationService.markAsRead(notificationId, {
                signal: controller.signal
            });
        } catch (err) {
            if (err.code !== API_CLIENT_ERROR_CODES.ERR_CANCELED) {
                setError(err.message || 'Failed to mark as read');
                setUnreadCount(prev => prev + 1);
                throw err;
            }
        } finally {
            removeAbortController(controller);
        }
    }, [createAbortController, removeAbortController]);

    // Mark all as read
    const markAllAsRead = useCallback(async () => {
        const controller = createAbortController();
        let tempUnreadCount = unreadCount;

        try {
            setUnreadCount((pev) => {
                tempUnreadCount = pev;
                return 0;
            });
            await notificationService.markAllAsRead({
                signal: controller.signal
            });
        } catch (err) {
            if (err.code !== API_CLIENT_ERROR_CODES.ERR_CANCELED) {
                setError(err.message || 'Failed to mark all as read');
                setUnreadCount(tempUnreadCount);
                throw err;
            }
        } finally {
            removeAbortController(controller);
        }
    }, [createAbortController, removeAbortController]);

    // Register notification callback
    const onNotification = useCallback((callback) => {
        if (!notificationCallbacksRef.current.includes(callback)) {
            notificationCallbacksRef.current.push(callback);
        }
        return () => {
            notificationCallbacksRef.current = notificationCallbacksRef.current.filter(cb => cb !== callback);
        };
    }, []);

    const handleNewNotification = useCallback((newNotification) => {
        if (!newNotification.read) {
            setUnreadCount(prev => prev + 1);
        }
        notificationCallbacksRef.current.forEach(cb => cb(newNotification));
    }, []);

    const abortNotificationFetchRequests = useCallback(() => {
        fetchUnreadController.current && removeAbortController(fetchUnreadController.current);
        fetchAllController.current && removeAbortController(fetchAllController.current);
    }, []);

    useSocketEvent(SOCKET_EVENTS.NEW_NOTIFICATION, handleNewNotification);

    return (
        <NotificationContext.Provider value={{
            unreadCount,
            isLoading,
            error,
            fetchNotifications,
            fetchUnreadNotifications,
            markAsRead,
            markAllAsRead,
            onNotification,
            abortNotificationFetchRequests
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useRealTimeNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useRealTimeNotifications must be used within a RealTimeNotificationProvider');
    return context;
};
