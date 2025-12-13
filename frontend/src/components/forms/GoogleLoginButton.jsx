import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import {FcGoogle} from "react-icons/fc";
import {AnimatePresence, motion} from 'framer-motion';
import AuthService from "../../api/authService";
import LoadingEffect from "../common/LoadingEffect";

const ButtonContainerStyles = styled.button`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    padding: 8px 24px;
    margin: 15px auto;
    background: var(--color-background-secondary);
    border: 2px solid var(--color-border-secondary);
    border-radius: 10px;
    box-shadow: var(--box-shadow);
    font-family: 'Roboto', sans-serif;
    font-size: 1em;
    font-weight: 600;
    color: var(--color-text);
    cursor: pointer;
    transition: 0.3s ease;
    overflow: hidden;

    &:hover:not(:disabled) {
        color: var(--color-background-secondary);
        background-color: var(--color-text);
        border-color: transparent;
    }

    &:active:not(:disabled) {
        scale: 0.9;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const IconGoogleStyles = styled(FcGoogle)`
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75em;
`;

const TextContainerStyles = styled.span`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

// New animation variants for width transition
const textVariants = {
    initial: {
        opacity: 1,
        scale: 1,
        width: '100%',
        transition: {duration: 0.2}
    },
    exit: {
        opacity: 0,
        scale: 0,
        width: '0',
        transition: {duration: 0.2}
    }
};

const loaderVariants = {
    initial: {opacity: 0},
    animate: {
        opacity: 1,
        scale: 1,
        transition: {duration: 0.2}
    },
    exit: {
        opacity: 0,
        scale: 0,
        transition: {duration: 0.2}
    }
};

const GoogleButton = (
    {
        onClick = async () => ({}),
        disabled = false,
        setError = (message) => ({message}),
        onLoadingChange = (boolean) => ({boolean}),
        children
    }) => {
    const [loading, setLoading] = React.useState(false);

    const handleAuthInit = async () => {
        try {
            setLoading(true);
            onLoadingChange(true);
            await onClick();
            const result = await AuthService.initiateGoogleAuth();
            window.location.href = result.data.authUrl;
        } catch (error) {
            setLoading(false);
            onLoadingChange(false);
            setError(error.message || 'Failed to initiate Google authentication');
        }
    };

    return (
        <ButtonContainerStyles
            onClick={handleAuthInit}
            disabled={disabled || loading}
            aria-label="Sign in with Google"
        >
            <AnimatePresence initial={false}>
                {!loading ?
                    (<motion.div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "10px"
                            }}
                            key="google_login_text"
                            variants={textVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                        >
                            <IconGoogleStyles/>

                            <TextContainerStyles>
                                {children || "Continue with Google"}
                            </TextContainerStyles>
                        </motion.div>
                    ) :
                    (<motion.div
                        key="google_login_loader"
                        variants={loaderVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                    >
                        <LoadingEffect color="var(--color-accent)" loading={loading} size={25}/>
                    </motion.div>)}
            </AnimatePresence>
        </ButtonContainerStyles>
    );
};

GoogleButton.propTypes = {
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
    children: PropTypes.node,
    setError: PropTypes.func,
    onLoadingChange: PropTypes.func,
};

export default GoogleButton;
