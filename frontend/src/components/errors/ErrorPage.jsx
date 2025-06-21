import React from 'react';
import {useNavigate} from "react-router-dom";
import Navbar from "../navbar/Navbar";
import {ErrorContainerStyled, IconContainerStyled, MessageStyled} from "./ErrorPageStyled";

const ErrorPage = ({icon, title, message, reload = false}) => {
    const navigate = useNavigate();

    const handleAction = (e) => {
        e.preventDefault();
        if (reload) {
            // Full page reload for cache clearance
            window.location.reload();
        } else {
            // Navigation to previous page
            navigate(-1);
        }
    };

    return (
        <div className="page">
            <Navbar/>

            <div className="wrapper">
                <ErrorContainerStyled>
                    <IconContainerStyled> {icon} </IconContainerStyled>
                    <MessageStyled>
                        <h1>{title}</h1>
                        <p>{message}</p>
                        <a
                            href="#"  // Valid href for accessibility
                            onClick={handleAction}
                            role="button"  // ARIA role for button behavior
                            aria-label={reload ? "Retry page load" : "Return to previous page"}
                        >
                            {reload ? "Try again" : "Go back"}
                        </a>
                    </MessageStyled>
                </ErrorContainerStyled>
            </div>
        </div>
    );
};

export default ErrorPage;
