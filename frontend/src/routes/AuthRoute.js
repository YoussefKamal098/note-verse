import React from "react";
import {Navigate} from "react-router-dom";
import RoutesPaths from "../constants/RoutesPaths";
import {useAuth} from "../contexts/AuthContext";

const AuthRoute = ({children}) => {
    const {user} = useAuth();
    return user ? <Navigate to={RoutesPaths.HOME} replace/> : children;
};

export default AuthRoute;
