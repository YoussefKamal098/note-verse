import React, {Suspense} from "react";
import {BrowserRouter as Router, Navigate, Route, Routes} from "react-router-dom";
import {useTheme} from "./contexts/ThemeContext";
import Loader from "./components/common/Loader";
import AuthProvider, {useAuth} from "./contexts/AuthContext";
import ConfirmationPopUpProvider from "./contexts/ConfirmationContext";
import ToastNotifications from "./components/notifications/ToastNotifications";

// Lazy load components
const HomePage = React.lazy(() => import("./pages/HomePage"));
const LoginPage = React.lazy(() => import("./pages/LoginPage"));
const RegisterPage = React.lazy(() => import("./pages/RegisterPage"));
const NotePage = React.lazy(() => import("./pages/NotePage"));
const NotFoundPage = React.lazy(() => import("./pages/NotFoundPage"));

const PrivateRoute = ({children}) => {
    const {user} = useAuth();
    return user ? children : <Navigate to="/login" replace/>;
};

const AuthRoute = ({children}) => {
    const {user} = useAuth();
    return user ? <Navigate to="/home" replace/> : children;
};

function App() {
    const {theme} = useTheme();

    return (
        <div className="App" data-theme={theme}>
            <ConfirmationPopUpProvider>
                <AuthProvider>
                    <Router>
                        <Suspense fallback={<Loader/>}>
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
                        </Suspense>
                    </Router>
                    <ToastNotifications/>
                </AuthProvider>
            </ConfirmationPopUpProvider>
        </div>
    );
}

export default App;
