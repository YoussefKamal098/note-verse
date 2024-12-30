import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../api/authService';

const AuthContext = createContext({user: null});
const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) setUser(storedUser);
        setLoading(false);

        authService.on('login', handleLogin);
        authService.on('logout', handleLogout);

        return () => {
            authService.off('login', handleLogin);
            authService.off('logout', handleLogout);
        };
    }, []);

    const handleLogin = (data) => {
        const { user } = data;
        const { firstname, lastname } = user;

        setUser( Object.freeze({ firstname, lastname }));
        localStorage.setItem('user', JSON.stringify({ firstname, lastname }));
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    if (loading) return null; // Return null or a loading spinner until the user data is fetched

    return (
        <AuthContext.Provider value={{ user }}>
            {children}
        </AuthContext.Provider>
    );
};

export { useAuth };
export default AuthProvider;
