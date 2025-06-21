import styled from "styled-components";
import {CgClose} from "react-icons/cg";
import React from "react";

const CloseButtonStyles = styled(CgClose)`
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: transparent;
    border: none;
    font-size: 2rem;
    color: var(--color-text);
    padding: 0.25rem;
    transition: 0.3s ease;
    cursor: pointer;

    &:hover {
        color: var(--color-background);
        background-color: var(--color-danger);
    }
`;

const CloseButton = ({onClick, size = '2rem', ariaLabel = 'Close'}) => {
    return (
        <CloseButtonStyles
            onClick={onClick}
            style={{fontSize: size}}
            aria-label={ariaLabel}
        />
    );
};

export default CloseButton;