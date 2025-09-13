import React, {useCallback, forwardRef, useState, useEffect} from 'react';
import {AnimatePresence} from 'framer-motion';
import {HiOutlineBell} from 'react-icons/hi2';
import CloseButton from '@/components/buttons/CloseButton';
import Tabs from '@/components/tabs';
import InfiniteScrollLoader from '@/components/infiniteScrollLoader';
import NotificationItem from './NotificationItem';
import {NOTIFICATION_TABS, TABS} from "./constant";
import {DEVICE_SIZES} from "@/constants/breakpoints";
import useMediaSize from "@/hooks/useMediaSize";
import useMobileDrag from "@/hooks/useMobileDrag";
import {
    ResponsiveDropdownContainer,
    DynamicMenuHeaderStyled,
    DropdownContainer,
    DropdownHeader,
    DropdownTitle,
    EmptyState
} from './styles';

const EmptyNotification = ({tab}) => (
    <EmptyState>
        <HiOutlineBell size={24}/>
        <p>
            {tab === NOTIFICATION_TABS.ALL ?
                "No notifications yet" :
                "You're all caught up – no unread notifications"}
        </p>
    </EmptyState>
);

const NotificationDropdown = forwardRef(({
                                             isOpen,
                                             onClose,
                                             activeTab,
                                             setActiveTab,
                                             unseenCount,
                                             markAsRead,
                                             fetchNotifications,
                                             onNotification
                                         }, ref) => {
    const isMobile = useMediaSize(DEVICE_SIZES.mobileL);
    const {
        dragOffset,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp
    } = useMobileDrag(isMobile, onClose);

    const [notifications, setNotifications] = useState([]);
    const [cursor, setCursor] = useState(null);

    const handleChange = useCallback((newItems, cursor) => {
        setNotifications((prev) => {
            // Filter out items that already exist in the current state
            const uniqueNewItems = newItems.filter(newItem =>
                !prev.some(existingItem => existingItem.id === newItem.id)
            );

            return [...prev, ...uniqueNewItems];
        });
        setCursor(cursor);
    }, []);

    const handleMarkAsRead = useCallback(async (notificationId) => {
        try {
            setNotifications(prev => prev.map(n =>
                n.id === notificationId ? {...n, read: true} : n
            ));
            await markAsRead(notificationId);
        } catch (error) {
            setNotifications(prev => prev.map(n =>
                n.id === notificationId ? {...n, read: false} : n
            ));
        }
    }, [markAsRead]);

    const Item = useCallback((item) => (
        <NotificationItem
            key={item.id}
            notification={item}
            onMarkAsRead={handleMarkAsRead}
        />
    ), [handleMarkAsRead]);

    // Handle real-time notifications
    useEffect(() => {
        const handleNewNotification = (notification) => {
            setNotifications((prev) => [notification, ...prev]);
        };

        const unsubscribe = onNotification(handleNewNotification);
        return unsubscribe;
    }, [onNotification]);

    useEffect(() => {
        setCursor(null);
        setNotifications([]);
    }, [activeTab]);

    return (
        <AnimatePresence>
            {isOpen && (
                <ResponsiveDropdownContainer
                    initial={{opacity: 0, y: isMobile ? '100%' : 0}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: isMobile ? '100%' : 0}}
                    transition={{type: 'spring', damping: 25, stiffness: 300}}
                >
                    <DropdownContainer
                        ref={ref}
                        style={{...(isMobile ? {translate: `0 ${dragOffset}px`} : {})}}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                        initial={{opacity: 0, y: -10}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -10}}
                        transition={{type: 'spring', damping: 25, stiffness: 300}}
                    >
                        {isMobile && <DynamicMenuHeaderStyled aria-hidden="true"/>}

                        <DropdownHeader>
                            <DropdownTitle>Notifications</DropdownTitle>
                            <CloseButton size="1.75em" color={"var(--color-primary)"} onClick={onClose}/>
                        </DropdownHeader>

                        <Tabs tabs={TABS}
                              activeTab={activeTab}
                              onTabChange={setActiveTab}
                              ariaLabel="Notification categories"
                        />

                        <InfiniteScrollLoader
                            onChange={handleChange}
                            initItems={notifications}
                            useCursor={true}
                            initCursor={cursor}
                            fetchData={fetchNotifications}
                            renderItem={Item}
                            pageSize={10}
                            threshold={10}
                            containerStyle={{gap: "0"}}
                            endMessage={"No more Notifications to load"}
                            emptyListMessage={<EmptyNotification tab={activeTab}/>}
                        />
                    </DropdownContainer>
                </ResponsiveDropdownContainer>
            )}
        </AnimatePresence>
    );
});

export default React.memo(NotificationDropdown);
