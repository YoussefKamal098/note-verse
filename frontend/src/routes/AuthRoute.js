import React from "react";
import {Navigate, useLocation} from "react-router-dom";
import routesPaths from "@/constants/routesPaths";
import {useAuth} from "@/contexts/AuthContext";

const AuthRoute = ({children}) => {
    const location = useLocation();
    const {user} = useAuth();

    return user ? <Navigate to={location.state?.from?.pathname || routesPaths.HOME} replace/> : children;
};

export default AuthRoute;
