import React from "react";
import LoadingEffect from "@/components/common/LoadingEffect";
import {motion} from "framer-motion";

import styled from "styled-components";

export const LoadMoreWrapper = styled.div`
    display: flex;
    justify-content: center;
    padding: 1rem 0;
`;

export const LoadMoreButtonStyled = styled.button`
    min-width: 100px;
    height: 42px;
    border-radius: 999px;
    font-weight: 600;
    background: var(--color-background-secondary);
    color: var(--color-text);
    box-shadow: var(--box-shadow);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: background 0.25s ease;

    &:hover:not(:disabled) {
        background: var(--color-primary);
        color: #fff;
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.65;
    }
`;


const LoadMoreButton = ({onClick, loading = false, disabled = false, children}) => {
    return (
        <LoadMoreWrapper>
            <LoadMoreButtonStyled
                onClick={onClick}
                disabled={disabled || loading}
                whileTap={{scale: 0.96}}
                initial={{opacity: 0, y: 10}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.3}}
                as={motion.button}
            >
                {loading ? <LoadingEffect color="var(--color-primary)"/> : children}
            </LoadMoreButtonStyled>
        </LoadMoreWrapper>
    );
};

export default LoadMoreButton;
