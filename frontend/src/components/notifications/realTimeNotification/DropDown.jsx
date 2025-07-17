import React, {useCallback, forwardRef, useState, useEffect} from 'react';
import {AnimatePresence} from 'framer-motion';
import {HiOutlineBell} from 'react-icons/hi2';
import {TbChecks} from "react-icons/tb";
import CloseButton from '@/components/buttons/CloseButton';
import Tabs from '@/components/tabs';
import InfiniteScrollLoader from '@/components/infiniteScrollLoader';
import NotificationItem from './NotificationItem';
import {NOTIFICATION_TABS, TABS} from "./constant";
import Button, {BUTTON_TYPE} from '@/components/buttons/Button';
import {DEVICE_SIZES} from "@/constants/breakpoints";
import useMediaSize from "@/hooks/useMediaSize";
import useMobileDrag from "@/hooks/useMobileDrag";
import {
    ResponsiveDropdownContainer,
    DynamicMenuHeaderStyled,
    DropdownContainer,
    DropdownHeader,
    DropdownTitle,
    DropdownActions,
    EmptyState
} from './styles';
import {deepClone} from "shared-utils/obj.utils";

const EmptyNotification = (tab) => (
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
                                             unreadCount,
                                             markAllAsRead,
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
    const [page, setPage] = useState(0);

    const handleChange = useCallback((newItems, newPage) => {
        setNotifications(newItems);
        setPage(newPage);
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

    const handleMarkAllAsRead = useCallback(async () => {
        // Save the previous state in case we need to roll back
        const previousNotifications = deepClone(notifications);

        // Update UI optimistically
        setNotifications(prev => {
            if (activeTab === NOTIFICATION_TABS.ALL) {
                return prev.map(n => (n.read ? n : {...n, read: true}));
            }

            if (activeTab === NOTIFICATION_TABS.UNREAD) {
                return [];
            }

            return prev;
        });

        try {
            await markAllAsRead();
        } catch (err) {
            // Roll back on failure
            setNotifications(previousNotifications);
        }
    }, [markAllAsRead]);

    const Item = useCallback((item) => (
        <NotificationItem
            key={item.id}
            notification={item}
            onMarkAsRead={handleMarkAsRead}
        />
    ), [handleMarkAsRead]);

    useEffect(() => {
        setPage(0);
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
                            <DropdownActions>
                                {unreadCount > 0 &&
                                    <div style={{fontSize: ".75em"}}>
                                        <Button
                                            type={BUTTON_TYPE.INFO} onClick={handleMarkAllAsRead}
                                            Icon={TbChecks}
                                        >
                                            Dismiss All
                                        </Button>
                                    </div>

                                }
                                <CloseButton size="1.75em" color={"var(--color-primary)"} onClick={onClose}/>
                            </DropdownActions>
                        </DropdownHeader>

                        <Tabs tabs={TABS}
                              activeTab={activeTab}
                              onTabChange={setActiveTab}
                              ariaLabel="Notification categories"
                        />

                        <InfiniteScrollLoader
                            onChange={handleChange}
                            initItems={notifications}
                            initPage={page}
                            fetchData={fetchNotifications}
                            renderItem={Item}
                            pageSize={10}
                            threshold={10}
                            containerStyle={{gap: "0"}}
                            endMessage={"No more Notifications to load"}
                            emptyListMessage={<EmptyNotification/>}
                        />
                    </DropdownContainer>
                </ResponsiveDropdownContainer>
            )}
        </AnimatePresence>
    );
});

export default React.memo(NotificationDropdown);
