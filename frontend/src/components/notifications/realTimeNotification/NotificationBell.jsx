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
        unseenCount,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsSeen,
        onNotification,
        abortNotificationFetchRequests
    } = useRealTimeNotifications();

    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(NOTIFICATION_TABS.ALL);
    const dropdownRef = useRef(null);
    const bellButtonRef = useRef(null);

    useEffect(() => {
        !isOpen && abortNotificationFetchRequests()
    }, [isOpen]);

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
    }), [fetchNotifications]);

    // Get the current fetch function based on active tab
    const currentFetchFunction = useMemo(() => (
        fetchFunctions[activeTab]
    ), [activeTab, fetchFunctions]);

    // Handle tab change
    const handleTabChange = useCallback((newTab) => {
        // The function reference changes when tab changes
        setActiveTab(newTab);
    }, []);

    const toggleClose = useCallback(() => {
        setIsOpen((prev) => !prev);
        markAllAsSeen();
    }, []);

    const onClose = useCallback(() => setIsOpen(false), []);

    useOutsideClick(dropdownRef, onClose, [], [bellButtonRef]);

    return (
        <NotificationContainer>
            <BellButton
                ref={bellButtonRef}
                onClick={toggleClose}
                unseenCount={unseenCount}
            />

            <DropDown
                ref={dropdownRef}
                isOpen={isOpen}
                onClose={onClose}
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                unseenCount={unseenCount}
                markAllAsSeen={markAllAsSeen}
                markAsRead={markAsRead}
                fetchNotifications={currentFetchFunction}
                onNotification={onNotification}
            />
        </NotificationContainer>
    );
};

export default React.memo(NotificationBell);
