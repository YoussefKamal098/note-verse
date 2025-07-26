import React, {useEffect} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import styled from 'styled-components';
import {FcGoogle} from "react-icons/fc";
import {MoonLoader} from 'react-spinners';
import Navbar from "@/components/navbar/Navbar";
import useRequestManager from '@/hooks/useRequestManager';
import authService from '@/api/authService';
import routesPaths from "@/constants/routesPaths";
import {API_CLIENT_ERROR_CODES} from "../api/apiClient";

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
    const {createAbortController} = useRequestManager();

    const from = location.state?.from?.pathname || routesPaths.HOME;

    const handleGoogleCallback = async () => {
        // Extract the authorization code and any error parameter from the callback URL
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');
        const errorParam = searchParams.get('error');

        // Clear sensitive params from URL
        window.history.replaceState({}, document.title, window.location.pathname);

        if (errorParam) {
            navigate(routesPaths.ERROR, {
                state: {
                    title: "Google Authentication Error",
                    message: `Google authentication failed due to the following error: ${errorParam}`
                }
            });
            return;
        }

        if (!code) {
            navigate(routesPaths.ERROR, {
                state: {
                    title: "Missing Authorization Code",
                    message: "No authorization code was provided in the callback from Google. " +
                        "This might indicate an error in the authentication flow or a misconfiguration in the redirect URI. " +
                        "Please ensure your authentication request is correct and try again."
                }
            });
            return;
        }

        const controller = createAbortController();

        try {
            await authService.handleGoogleCallback({code}, {signal: controller.signal});
            // Redirect to the home page after one second.
            setTimeout(() => {
                navigate(from, {replace: true});
            }, 1000);
        } catch (err) {
            if (err.code !== API_CLIENT_ERROR_CODES.ERR_CANCELED) {
                navigate(routesPaths.ERROR, {
                    state: {
                        title: "Google Authentication Failed",
                        message: `Google authentication encountered an error: ${err.message}`
                    }
                });
            }
        }
    }

    useEffect(() => {
        handleGoogleCallback();
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

