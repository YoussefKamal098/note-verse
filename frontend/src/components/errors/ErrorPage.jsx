import React from 'react';
import Navbar from "../navbar/Navbar";
import {ErrorContainerStyled, IconContainerStyled, MessageStyled} from "./ErrorPageStyled";

const ErrorPage = ({icon, title, message}) => {
    return (
        <div className="page">
            <Navbar showSearch={false}/>

            <div className="wrapper">
                <ErrorContainerStyled>
                    <IconContainerStyled> {icon} </IconContainerStyled>
                    <MessageStyled>
                        <h1>{title}</h1>
                        <p>{message}</p>
                        <a href="/">Go to Home</a>
                    </MessageStyled>
                </ErrorContainerStyled>
            </div>
        </div>
    );
};

export default ErrorPage;
