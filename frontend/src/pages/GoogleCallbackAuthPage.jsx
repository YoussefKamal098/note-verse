import React, {useEffect} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import styled from 'styled-components';
import {FcGoogle} from "react-icons/fc";
import {MoonLoader} from 'react-spinners';
import useSingleExecution from '../hooks/useSingleExecution';
import Navbar from "../components/navbar/Navbar";
import authService from '../api/authService';
import RoutesPaths from "../constants/RoutesPaths";

const Container = styled.div`
    font-size: 1em;
    font-weight: 600;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 5em 1em 0;
    gap: 2em;
`;

const Message = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text);
    max-width: 30em;
    gap: 0.75em;
`;

const IconContainer = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3em;
`;


const GoogleCallbackAuthPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {executeOnce} = useSingleExecution();

    const handleGoogleCallback = async () => {
        // Extract the authorization code and any error parameter from the callback URL
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');
        const errorParam = searchParams.get('error');

        // Clear sensitive params from URL
        window.history.replaceState({}, document.title, window.location.pathname);

        if (errorParam) {
            navigate(RoutesPaths.ERROR, {
                state: {
                    title: "Google Authentication Error",
                    message: `Google authentication failed due to the following error: ${errorParam}`
                }
            });
            return;
        }

        if (!code) {
            navigate(RoutesPaths.ERROR, {
                state: {
                    title: "Missing Authorization Code",
                    message: "No authorization code was provided in the callback from Google. " +
                        "This might indicate an error in the authentication flow or a misconfiguration in the redirect URI. " +
                        "Please ensure your authentication request is correct and try again."
                }
            });
            return;
        }

        try {
            await authService.handleGoogleCallback({code});
            // Redirect to the home page after one second.
            setTimeout(() => {
                navigate(RoutesPaths.HOME);
            }, 1000);
        } catch (err) {
            navigate(RoutesPaths.ERROR, {
                state: {
                    title: "Google Authentication Failed",
                    message: `Google authentication encountered an error: ${err.message}`
                }
            });
        }
    }

    useEffect(() => {
        executeOnce(handleGoogleCallback);
    }, [location, navigate]);


    return (
        <div className="page">
            <Navbar/>

            <Container>
                <MoonLoader color="var(--color-accent)" loading={true} size={45}/>
                <Message>
                    <IconContainer>
                        <FcGoogle/>
                    </IconContainer>
                    Authenticating with Google. Please wait while we securely verify your credentials and
                    connect your account.
                </Message>
            </Container>
        </div>
    );
};

export default GoogleCallbackAuthPage;

