import React from 'react';
import ErrorPage from "../components/errors/ErrorPage";
import {useLocation} from 'react-router-dom';
import {TbFaceIdError} from "react-icons/tb";

const GeneralErrorPage = () => {
    const {state} = useLocation();

    const {
        icon = <TbFaceIdError/>,
        title = 'Oops! Something Went Wrong',
        message = "Something went wrong. The server encountered an unexpected error, and we couldn't process your request.",
    } = state || {};

    return (
        <ErrorPage
            icon={icon}
            title={title}
            message={message}
        />
    );
};


export default GeneralErrorPage;