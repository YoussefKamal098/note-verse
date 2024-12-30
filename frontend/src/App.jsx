import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import ThemeProvider, { useTheme } from "./contexts/ThemeContext";
import AuthProvider, { useAuth } from "./contexts/AuthContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotePage from "./pages/NotePage";

const PrivateRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" replace />;
};

const routes = (
    <Router>
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<Navigate to="/home" replace />} />
            {/* Protected Route */}
            <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
            <Route path="/note/:id" element={<PrivateRoute><NotePage /></PrivateRoute>} />
        </Routes>
    </Router>
);

function App() {
    const { theme } = useTheme();

    return (
        <AuthProvider>
            <ThemeProvider>
                <div className="App" data-theme={theme}>
                    {routes}

                    <ToastContainer
                        position="top-right"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                    />
                </div>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;
