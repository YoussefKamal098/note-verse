import React from 'react';
import AuthProvider from './AuthContext';
import ConfirmationPopUpProvider from './ConfirmationContext';
import ToastNotificationProvider from './ToastNotificationsContext';

const GlobalContextProvider = ({children}) => (
    <AuthProvider>
        <ConfirmationPopUpProvider>
            <ToastNotificationProvider>
                {children}
            </ToastNotificationProvider>
        </ConfirmationPopUpProvider>
    </AuthProvider>
);

export default GlobalContextProvider;
