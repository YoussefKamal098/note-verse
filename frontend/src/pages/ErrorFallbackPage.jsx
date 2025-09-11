import React from 'react';
import {GiTerror} from "react-icons/gi";
import ErrorPage from "@/pages/errorPage/ErrorPage";

const ErrorFallbackPage = () => (
    <ErrorPage
        icon={<GiTerror/>}
        title="Oops! Something Went Wrong"
        message="We encountered an error while loading this page. Please try again later."
        reload={true}
    />
);

export default ErrorFallbackPage;
