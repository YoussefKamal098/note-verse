import React from "react";
import {Navigate, useLocation} from "react-router-dom";
import routesPaths from "@/constants/routesPaths";
import {useAuth} from "@/contexts/AuthContext";

const PrivateRoute = ({children}) => {
    const location = useLocation();
    const {user} = useAuth();

    return user ? children : <Navigate to={routesPaths.LOGIN} state={{from: location}}/>;
};

export default PrivateRoute;
