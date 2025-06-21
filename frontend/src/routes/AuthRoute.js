import React from "react";
import {Navigate} from "react-router-dom";
import routesPaths from "../constants/routesPaths";
import {useAuth} from "../contexts/AuthContext";

const AuthRoute = ({children}) => {
    const {user} = useAuth();
    return user ? <Navigate to={routesPaths.HOME} replace/> : children;
};

export default AuthRoute;
