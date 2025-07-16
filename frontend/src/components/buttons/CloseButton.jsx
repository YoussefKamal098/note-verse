import React from "react";

import styled from "styled-components";
import {CgClose} from "react-icons/cg";
import Tooltip from "@/components/tooltip/Tooltip"

const CloseButtonStyles = styled(CgClose)`
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: transparent;
    border: none;
    font-size: 2rem;
    color: ${({$color}) => $color};
    padding: 0.25rem;
    transition: 0.3s ease;
    cursor: pointer;

    &:hover {
        color: var(--color-background);
        background-color: ${({$color}) => $color};
    }
`;

const CloseButton = ({onClick, size = '2rem', color = "var(--color-danger)", ariaLabel = 'Close'}) => {
    return (
        <Tooltip title={ariaLabel}>
            <CloseButtonStyles
                $color={color}
                onClick={onClick}
                style={{fontSize: size}}
                aria-label={ariaLabel}
            />
        </Tooltip>
    );
};

export default CloseButton;
