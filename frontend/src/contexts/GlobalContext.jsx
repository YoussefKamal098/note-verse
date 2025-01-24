import React from 'react';
import AuthProvider from './AuthContext';
import ConfirmationPopUpProvider from './ConfirmationContext';
import ToastNotificationProvider from './ToastNotificationsContext';

const GlobalContextProvider = ({children}) => (
    <ConfirmationPopUpProvider>
        <ToastNotificationProvider>
            <AuthProvider>
                {children}
            </AuthProvider>
        </ToastNotificationProvider>
    </ConfirmationPopUpProvider>
);

export default GlobalContextProvider;
