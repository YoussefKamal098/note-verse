import React, {createContext, useContext, useEffect, useState} from 'react';
import {useConfirmation} from "./ConfirmationContext";
import authService, {AUTH_EVENTS} from '../api/authService';

const AuthContext = createContext({user: null});
const useAuth = () => useContext(AuthContext);

const AuthProvider = ({children}) => {
    const {showConfirmation} = useConfirmation();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) setUser(storedUser);
        setLoading(false);

        authService.on(AUTH_EVENTS.LOGIN, handleLogin);
        authService.on(AUTH_EVENTS.LOGOUT, handleLogout);
        authService.on(AUTH_EVENTS.REFRESH_TOKEN_FAILURE, handleRefreshTokenFailure);

        return () => {
            authService.off(AUTH_EVENTS.LOGIN, handleLogin);
            authService.off(AUTH_EVENTS.LOGOUT, handleLogout);
            authService.off(AUTH_EVENTS.REFRESH_TOKEN_FAILURE, handleRefreshTokenFailure);
        };
    }, []);

    const handleLogin = (data) => {
        const {user} = data;
        const {firstname, lastname} = user;

        setUser(Object.freeze({firstname, lastname}));
        localStorage.setItem('user', JSON.stringify({firstname, lastname}));
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem("user");
    };

    const handleRefreshTokenFailure = () => {
        showConfirmation({
            type: "okOnly",
            confirmationMessage: "Your session has expired. You will be logged out. Please sign in again.",
            onConfirm: handleLogout
        });
    };

    if (loading) return null; // Return null or a loading spinner until the user data is fetched

    return (
        <AuthContext.Provider value={{user}}>
            {children}
        </AuthContext.Provider>
    );
};

export {useAuth};
export default AuthProvider;
