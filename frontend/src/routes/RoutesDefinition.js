import React from 'react';
import {Navigate} from 'react-router-dom';
import AuthRoute from "./AuthRoute";
import PrivateRoute from "./PrivateRoute";
import GeneralErrorPage from "@/pages/GeneralErrorPage";
import routesPaths from "@/constants/routesPaths";
import ProfileTabRouter from "@/pages/profilePage/tabRouter";

// Lazy load components
const HomePage = React.lazy(() => import('@/pages/HomePage'));
const ProfilePage = React.lazy(() => import('@/pages/profilePage'));
const ProfileTab = React.lazy(() => import('@/pages/profilePage/tabs/ProfileTab'));
const LoginPage = React.lazy(() => import('@/pages/LoginPage'));
const RegisterPage = React.lazy(() => import('@/pages/RegisterPage'));
const NotePage = React.lazy(() => import('@/pages/NotePage'));
const NoteVersionPage = React.lazy(() => import('@/pages/NoteVersionPage'));
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage'));
const OTPVerificationPage = React.lazy(() => import('@/pages/OTPVerificationPage'));
const GoogleCallbackAuthPage = React.lazy(() => import('@/pages/GoogleCallbackAuthPage'));

const RoutesDefinition = [
    {path: routesPaths.LOGIN, element: <AuthRoute><LoginPage/></AuthRoute>},
    {path: routesPaths.REGISTER, element: <AuthRoute><RegisterPage/></AuthRoute>},
    {path: routesPaths.HOME, element: <PrivateRoute><HomePage/></PrivateRoute>},
    {path: '/', element: <Navigate to={routesPaths.HOME} replace/>},
    {path: routesPaths.NOTE(":id"), element: <PrivateRoute><NotePage/></PrivateRoute>},
    {path: routesPaths.NOTE_VERSION(":id"), element: <PrivateRoute><NoteVersionPage/></PrivateRoute>},
    {path: routesPaths.ERROR, element: <GeneralErrorPage/>},
    {path: routesPaths.NOT_FOUND, element: <NotFoundPage/>},
    {path: routesPaths.VERIFY_ACCOUNT, element: <OTPVerificationPage/>},
    {path: routesPaths.GOOGLE_AUTH_CALLBACK, element: <AuthRoute><GoogleCallbackAuthPage/></AuthRoute>},
    {
        path: routesPaths.PROFILE,
        element: <PrivateRoute><ProfilePage/></PrivateRoute>,
        children: [
            {index: true, element: <ProfileTab/>},
            {path: ":tab", element: <ProfileTabRouter/>},
        ]
    }
];

export default RoutesDefinition;
