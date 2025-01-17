import React from 'react';
import styled from 'styled-components';
import Navbar from "../components/navbar/Navbar";
import {TbError404Off} from "react-icons/tb";

const NotFoundContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2em;
    background-color: var(--color-background-primary);
    color: var(--color-text);
`;

const IconContainer = styled.div`
    font-size: 10em;
    color: var(--color-text);
`;

const Message = styled.div`
    font-size: 1.5em;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 0.5em;

    h1 {
        font-size: 1.5em;
    }

    p {
        font-size: 0.8em;
        color: var(--color-placeholder);
        font-weight: 500;
    }

    a {
        font-size: 0.6em;
        font-weight: 600;
        color: var(--color-accent);
        cursor: pointer;
        transition: 0.3s ease;

        &:hover {
            color: var(--color-primary);
        }
    }

`;

const NotFoundPage = () => {
    return (
        <div className="page">
            <Navbar showSearch={false}/>

            <div className="wrapper">
                <NotFoundContainer>
                    <IconContainer> <TbError404Off/> </IconContainer>
                    <Message>
                        <h1>Page Not Found</h1>
                        <p>Sorry, but we can't find the page you are looking for...</p>
                        <a href="/home">Go to Home</a>
                    </Message>

                </NotFoundContainer>
            </div>
        </div>
    );
};

export default NotFoundPage;
