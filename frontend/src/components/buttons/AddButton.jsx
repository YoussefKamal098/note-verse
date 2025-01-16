import React from "react";
import {FaPlus} from "react-icons/fa"
import styled from "styled-components";

const StyledAddButton = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 1.75em;
    height: 1.75em;
    bottom: 0.7em;
    right: 0.5em;
    font-size: 1.4em;
    border: calc(var(--border-width) / 1.5) solid var(--color-border-secondary);
    border-radius: calc(var(--border-radius) / 1.5);
    background: var(--color-background);
    box-shadow: var(--box-shadow-hoverable);
    color: var(--color-secondary);
    transition: 0.3s ease;
    cursor: pointer;

    &:hover {
        color: var(--color-accent);
        box-shadow: var(--box-shadow-hover);
    }

    &:active {
        transform: scale(0.9);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        box-shadow: none;
    }
`;

const AddButton = ({disable, onClick}) => {
    return <StyledAddButton disabled={disable} onClick={onClick}> <FaPlus className="icon"/> </StyledAddButton>;
};

export default AddButton;
