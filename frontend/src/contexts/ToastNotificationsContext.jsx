import React, {createContext, useContext} from 'react';
import {toast} from "react-toastify";
import ToastNotifications from "../components/notifications/ToastNotifications";

const NotificationContext = createContext({
    success: (any) => (any),
    error: (any) => (any),
    warn: (any) => (any),
    info: (any) => (any)
});

const useToastNotification = () => useContext(NotificationContext);

const ToastNotificationProvider = ({children}) => {
    const notify = {
        success: toast.success,
        error: toast.error,
        warn: toast.warn,
        info: toast.info,
    };

    return (
        <NotificationContext.Provider value={{notify}}>
            <ToastNotifications/>
            {children}
        </NotificationContext.Provider>
    );
};

export {useToastNotification};
export default ToastNotificationProvider;
