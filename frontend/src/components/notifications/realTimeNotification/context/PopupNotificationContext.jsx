import React, {createContext, useContext, useState, useCallback} from 'react';
import styled from "styled-components";
import {AnimatePresence, motion} from 'framer-motion';
import NotificationItem from "../NotificationItem";

const NotificationsContainer = styled.div`
    position: fixed;
    top: 0;
    right: 0;
    padding: 10px;
    z-index: 2000;
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 90vw;
    max-width: 500px;
`;

const NotificationWrapperStyles = styled(motion.div)`
    background: var(--color-background);
    border-radius: 10px;
    width: 100%;
    box-shadow: var(--box-shadow);
    overflow: hidden;
`;

const NotificationWrapper = ({notification, onDismiss}) => {
    const onClose = useCallback(() => {
        onDismiss(notification.id);
    }, [onDismiss]);

    return (
        <NotificationWrapperStyles
            layout
            initial={{x: 300, opacity: 0}}
            animate={{x: 0, opacity: 1}}
            exit={{x: 300, opacity: 0}}
            transition={{type: 'spring', damping: 25, stiffness: 300}}
        >
            <NotificationItem notification={notification} onClose={onClose}/>
        </NotificationWrapperStyles>
    );
};

const PopUpNotificationContext = createContext(null);

export const PopupNotificationProvider = ({children}) => {
    const [activeNotifications, setActiveNotifications] = useState([]);

    // Add a new notification to display
    const showNotification = useCallback((notification) => {
        const id = notification.id || crypto.randomUUID?.() || Date.now() + Math.random(); // Unique ID for each notification

        setActiveNotifications(prev => {
            return [...prev, {...notification, id: notification.id || id, read: true}];
        });

        // Auto-remove after delay (default 5 seconds)
        const duration = notification.duration || 5000;
        setTimeout(() => {
            dismissNotification(id);
        }, duration);
    }, []);

    // Remove a notification by ID
    const dismissNotification = useCallback((id) => {
        setActiveNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    return (
        <PopUpNotificationContext.Provider value={{showNotification, dismissNotification}}>
            {children}

            {/* Notification container */}
            <NotificationsContainer>
                <AnimatePresence>
                    {activeNotifications.map((notification) => (
                        <NotificationWrapper
                            key={notification.id}
                            notification={notification}
                            onDismiss={dismissNotification}
                        />
                    ))}
                </AnimatePresence>
            </NotificationsContainer>
        </PopUpNotificationContext.Provider>
    );
};

export const usePopupNotifications = () => useContext(PopUpNotificationContext);
