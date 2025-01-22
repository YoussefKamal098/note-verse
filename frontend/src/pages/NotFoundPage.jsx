import React from 'react';
import ErrorPage from "../components/errors/ErrorPage";
import {TbError404Off} from "react-icons/tb";

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
