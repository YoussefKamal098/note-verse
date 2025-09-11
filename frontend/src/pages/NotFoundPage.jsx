import React from 'react';
import {TbError404Off} from "react-icons/tb";
import ErrorPage from "@/pages/errorPage/ErrorPage";

const NotFoundPage = () => {
    return (
        <ErrorPage
            icon={<TbError404Off/>}
            title={"Page Not Found"}
            message={"Sorry, but we can't find the page you are looking for..."}
        />
    );
};

export default NotFoundPage;
