import React, {createContext, useContext, useEffect, useState} from 'react';
import {useConfirmation} from "./ConfirmationContext";
import {POPUP_TYPE} from "../components/confirmationPopup/ConfirmationPopup";
import cacheService from "../services/cacheService";
import authService, {AUTH_EVENTS} from '../api/authService';

const AUTH_USER_STORED_KEY = "auth_user";

const AuthContext = createContext({user: null});
const useAuth = () => useContext(AuthContext);

const AuthProvider = ({children}) => {
    const {showConfirmation} = useConfirmation();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem(AUTH_USER_STORED_KEY));
        if (storedUser) setUser(storedUser);
        setLoading(false);

        authService.on(AUTH_EVENTS.LOGIN, handleLogin);
        authService.on(AUTH_EVENTS.LOGOUT, handleLogout);
        authService.on(AUTH_EVENTS.SESSION_EXPIRED, handleSessionExpired);

        return () => {
            authService.off(AUTH_EVENTS.LOGIN, handleLogin);
            authService.off(AUTH_EVENTS.LOGOUT, handleLogout);
            authService.off(AUTH_EVENTS.SESSION_EXPIRED, handleSessionExpired);
        };
    }, []);

    const handleLogin = (data) => {
        const {user} = data;
        const {id} = user;
        const storedUserData = {id};

        setUser(Object.freeze(storedUserData));
        localStorage.setItem(AUTH_USER_STORED_KEY, JSON.stringify(storedUserData));
    };

    const handleLogout = async () => {
        setUser(null);
        localStorage.clear();
        await cacheService.flushDB();
    };

    const handleSessionExpired = () => {
        showConfirmation({
            type: POPUP_TYPE.OK,
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
