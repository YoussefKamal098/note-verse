import React, {createContext, useContext, useEffect, useState} from 'react';
import useRequestManager from "../hooks/useRequestManager";
import {useConfirmation} from "./ConfirmationContext";
import {POPUP_TYPE} from "../components/confirmationPopup/ConfirmationPopup";
import cacheService from "../services/cacheService";
import authService, {AUTH_EVENTS} from '../api/authService';
import userService from '../api/userService';
import {API_CLIENT_ERROR_CODES} from "../api/apiClient";
import {useToastNotification} from "./ToastNotificationsContext";

const AUTH_USER_STORED_KEY = "auth_user";

const AuthContext = createContext({user: null});
const useAuth = () => useContext(AuthContext);

const AuthProvider = ({children}) => {
    const {showConfirmation} = useConfirmation();
    const {createAbortController} = useRequestManager();
    const {notify} = useToastNotification();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadUser = async ({id}) => {
        if (!id) {
            setLoading(false);
            return;
        }

        try {
            const controller = createAbortController();
            const response = await userService.getUser(id, {signal: controller.signal});
            setUser(response.data);
        } catch (error) {
            if (error.code !== API_CLIENT_ERROR_CODES.ERR_CANCELED) {
                notify.error(error.message);
            }
        }

        setLoading(false);
    };

    useEffect(() => {
        const authUser = JSON.parse(localStorage.getItem(AUTH_USER_STORED_KEY));
        if (authUser) {
            setUser(authUser);
            loadUser({id: authUser.id});
        }

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
        const authUser = {id};

        setUser(user);
        localStorage.setItem(AUTH_USER_STORED_KEY, JSON.stringify(authUser));
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

    if (loading) return null;

    return (
        <AuthContext.Provider value={{user}}>
            {children}
        </AuthContext.Provider>
    );
};

export {useAuth};
export default AuthProvider;
