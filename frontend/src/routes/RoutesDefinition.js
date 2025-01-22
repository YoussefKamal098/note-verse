import React from 'react';
import AuthRoute from "./AuthRoute";
import PrivateRoute from "./PrivateRoute";
import {Navigate} from "react-router-dom";
import GeneralErrorPage from "../pages/GeneralErrorPage";
import RoutesPaths from "../constants/RoutesPaths";

// Lazy load components
const HomePage = React.lazy(() => import('../pages/HomePage'));
const LoginPage = React.lazy(() => import('../pages/LoginPage'));
const RegisterPage = React.lazy(() => import('../pages/RegisterPage'));
const NotePage = React.lazy(() => import('../pages/NotePage'));
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage'));

const RoutesDefinition = [
    {path: RoutesPaths.LOGIN, element: <AuthRoute><LoginPage/></AuthRoute>},
    {path: RoutesPaths.REGISTER, element: <AuthRoute><RegisterPage/></AuthRoute>},
    {path: RoutesPaths.HOME, element: <PrivateRoute><HomePage/></PrivateRoute>},
    {path: '/', element: <Navigate to={RoutesPaths.HOME} replace/>},
    {path: RoutesPaths.NOTE(":id"), element: <PrivateRoute><NotePage/></PrivateRoute>},
    {path: RoutesPaths.ERROR, element: <GeneralErrorPage/>},
    {path: RoutesPaths.NOT_FOUND, element: <NotFoundPage/>},
];

export default RoutesDefinition;