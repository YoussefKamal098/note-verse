import React from 'react';
import ErrorPage from "../components/errors/ErrorPage";
import {GiTerror} from "react-icons/gi";

const ErrorFallbackPage = () => (
    <ErrorPage
        icon={<GiTerror/>}
        title="Oops! Something Went Wrong"
        message="We encountered an error while loading this page. Please try again later."
        reload={true}
    />
);

export default ErrorFallbackPage;
