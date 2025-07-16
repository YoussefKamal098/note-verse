import React from "react";
import NotificationBell from "./NotificationBell";
import {PopupNotificationProvider} from './context/PopupNotificationContext';
import {RealTimeNotificationProvider} from './context/RealTimeNotificationContext';

const Notification = () => {
    return (
        <RealTimeNotificationProvider>
            <PopupNotificationProvider>
                <NotificationBell/>
            </PopupNotificationProvider>
        </RealTimeNotificationProvider>
    )
}

export default React.memo(Notification);
