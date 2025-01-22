import React from "react";
import RoutesPaths from "../constants/RoutesPaths";
import {useAuth} from "../contexts/AuthContext";
import {Navigate} from "react-router-dom";

const PrivateRoute = ({children}) => {
    const {user} = useAuth();
    return user ? children : <Navigate to={RoutesPaths.LOGIN} replace/>;
};

export default PrivateRoute;
