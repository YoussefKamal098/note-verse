import React from "react";
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import {useTheme} from "./contexts/ThemeContext";
import AuthProvider, {useAuth} from "./contexts/AuthContext";
import ConfirmationPopUpProvider from "./contexts/ConfirmationContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotePage from "./pages/NotePage";
import NotFoundPage from "./pages/NotFoundPage";
import ToastNotifications from "./components/notifications/ToastNotifications";

const PrivateRoute = ({children}) => {
    const {user} = useAuth();
    return user ? children : <Navigate to="/login" replace/>;
};

const AuthRoute = ({children}) => {
    const {user} = useAuth();
    return user ? <Navigate to="/home" replace/> : children;
};

const routes = (
    <Router>
        <Routes>
            <Route path="/login" element={<AuthRoute><LoginPage/></AuthRoute>}/>
            <Route path="/register" element={<AuthRoute><RegisterPage/></AuthRoute>}/>
            <Route path="/" element={<Navigate to="/home" replace/>}/>
            {/* Protected Route */}
            <Route path="/home" element={<PrivateRoute><HomePage/></PrivateRoute>}/>
            <Route path="/note/:id" element={<PrivateRoute><NotePage/></PrivateRoute>}/>
            {/* Catch-all route for unknown pages */}
            <Route path="*" element={<NotFoundPage/>}/>
        </Routes>
    </Router>
);

function App() {
    const {theme} = useTheme();

    return (
        <div className="App" data-theme={theme}>
            <ConfirmationPopUpProvider>
                <AuthProvider>
                    {routes}
                    <ToastNotifications/>
                </AuthProvider>
            </ConfirmationPopUpProvider>
        </div>
    );
}

export default App;
