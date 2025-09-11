import React from "react";
import {useNavigate} from "react-router-dom";
import PageLayout from "@/layouts/PageLayout";
import {
    ErrorContainerStyled,
    IconContainerStyled,
    MessageStyled
} from "./ErrorPageStyled";

const ErrorPage = ({icon, title, message, reload = false}) => {
    const navigate = useNavigate();

    const handleAction = (e) => {
        e.preventDefault();
        if (reload) {
            // Full page reload for cache clearance
            window.location.reload();
        } else {
            // Navigate to previous page
            navigate(-1);
        }
    };

    return (
        <PageLayout>
            <ErrorContainerStyled>
                <IconContainerStyled>{icon}</IconContainerStyled>
                <MessageStyled>
                    <h1>{title}</h1>
                    <p>{message}</p>
                    <a
                        href="#"
                        onClick={handleAction}
                        role="button"
                        aria-label={reload ? "Reload the page" : "Go back to the previous page"}
                    >
                        {reload ? "Try again" : "Back to previous page"}
                    </a>
                </MessageStyled>
            </ErrorContainerStyled>
        </PageLayout>
    );
};

export default ErrorPage;
