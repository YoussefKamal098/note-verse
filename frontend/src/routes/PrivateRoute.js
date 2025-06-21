import React from "react";
import routesPaths from "../constants/routesPaths";
import {useAuth} from "../contexts/AuthContext";
import {Navigate} from "react-router-dom";

const PrivateRoute = ({children}) => {
    const {user} = useAuth();
    return user ? children : <Navigate to={routesPaths.LOGIN} replace/>;
};

export default PrivateRoute;
