import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import {AnimatePresence, motion} from 'framer-motion';
import AuthService from "../../api/authService";
import {FcGoogle} from "react-icons/fc";
import LoadingEffect from "../common/LoadingEffect";

const ButtonContainer = styled.button`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    padding: 8px 24px;
    margin: 15px auto;
    background: var(--color-background-secondary);
    border: var(--border-width) solid var(--color-border-secondary);
    border-radius: var(--border-radius);
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

const IconContainer = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
`;

const TextContainer = styled.span`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

// New animation variants for width transition
const textVariants = {
    initial: {
        opacity: 1,
        width: "100%",
        transition: {duration: 0.2}
    },
    exit: {
        opacity: 0,
        width: 0,
        transition: {
            duration: 0.2,
            width: {duration: 0.15}
        }
    }
};

const loaderVariants = {
    initial: {opacity: 0, scale: 0},
    animate: {
        opacity: 1,
        scale: 1,
        transition: {duration: 0.2}
    },
    exit: {
        opacity: 0,
        scale: 0,
        transition: {duration: 0.5}
    }
};


const GoogleButton = ({onClick = async () => ({}), disabled = false, children}) => {
    const [loading, setLoading] = React.useState(false);

    const handleAuthInit = async () => {
        setLoading(true);
        await onClick();
        const result = await AuthService.initiateGoogleAuth();
        window.location.href = result.data.authUrl;
    };

    return (
        <ButtonContainer
            onClick={handleAuthInit}
            disabled={disabled || loading}
            aria-label="Sign in with Google"
        >
            <IconContainer>
                <FcGoogle/>
            </IconContainer>

            <TextContainer>
                <AnimatePresence initial={false} mode='wait'>
                    {!loading ? (
                        <motion.span
                            key="text"
                            style={{display: 'inline-block'}}
                            variants={textVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                        >
                            {children || "Continue with Google"}
                        </motion.span>
                    ) : (
                        <motion.div
                            key="loader"
                            variants={loaderVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                        >
                            <LoadingEffect color="var(--color-accent)" loading={loading} size={25}/>
                        </motion.div>
                    )}
                </AnimatePresence>
            </TextContainer>
        </ButtonContainer>
    );
};


GoogleButton.propTypes = {
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
    children: PropTypes.node,
};

export default GoogleButton;
