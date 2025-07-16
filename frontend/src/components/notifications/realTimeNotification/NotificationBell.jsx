import React, {useState, useRef, useCallback, useEffect, useMemo} from 'react';
import DropDown from './DropDown';
import {NOTIFICATION_TABS} from "./constant";
import useOutsideClick from '@/hooks/useOutsideClick';
import BellButton from './BellButton';
import {usePopupNotifications} from './context/PopupNotificationContext';
import {useRealTimeNotifications} from './context/RealTimeNotificationContext';
import {useToastNotification} from "@/contexts/ToastNotificationsContext";
import {NotificationContainer} from './styles';

const NotificationBell = () => {
    const {showNotification} = usePopupNotifications();
    const {notify} = useToastNotification();
    const {
        unreadCount,
        error,
        fetchNotifications,
        fetchUnreadNotifications,
        markAsRead,
        markAllAsRead,
        onNotification
    } = useRealTimeNotifications();

    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(NOTIFICATION_TABS.ALL);
    const dropdownRef = useRef(null);
    const bellButtonRef = useRef(null);

    // Show error toast if there's an error
    useEffect(() => {
        if (error) {
            notify.error(error);
        }
    }, [error, notify]);

    // Handle real-time notifications
    useEffect(() => {
        const handleNewNotification = (notification) => {
            if (!notification.read) {
                showNotification(notification);
            }
        };

        const unsubscribe = onNotification(handleNewNotification);
        return unsubscribe;
    }, [onNotification, showNotification]);

    // Create different fetch functions for each tab
    const fetchFunctions = useMemo(() => ({
        [NOTIFICATION_TABS.ALL]: fetchNotifications,
        [NOTIFICATION_TABS.UNREAD]: fetchUnreadNotifications,
    }), [fetchNotifications, fetchUnreadNotifications]);

    // Get the current fetch function based on active tab
    const currentFetchFunction = useMemo(() => (
        fetchFunctions[activeTab]
    ), [activeTab, fetchFunctions]);

    // Handle tab change
    const handleTabChange = useCallback((newTab) => {
        setActiveTab(newTab);
        // The function reference changes when tab changes
    }, []);

    const onClose = useCallback(() => setIsOpen(false), []);
    const toggleClose = useCallback(() => setIsOpen((prev) => !prev), []);

    useOutsideClick(dropdownRef, onClose, [], [bellButtonRef]);

    return (
        <NotificationContainer>
            <BellButton
                ref={bellButtonRef}
                onClick={toggleClose}
                unreadCount={unreadCount}
            />

            <DropDown
                ref={dropdownRef}
                isOpen={isOpen}
                onClose={onClose}
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                unreadCount={unreadCount}
                markAllAsRead={markAllAsRead}
                markAsRead={markAsRead}
                fetchNotifications={currentFetchFunction}
                onNotification={onNotification}
            />
        </NotificationContainer>
    );
};

export default React.memo(NotificationBell);
