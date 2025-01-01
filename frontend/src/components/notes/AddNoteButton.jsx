import React from "react";
import { FaPlus } from "react-icons/fa"
import styled from "styled-components";

const StyledAddButton = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 1.75em;
    height: 1.75em;
    bottom: 0.7em;
    right: 0.5em;
    font-size: 1.5em;
    border: calc(var(--border-width)) solid var(--color-border);
    border-radius: calc(var(--border-radius) / 1.5);
    background: var(--color-background);
    box-shadow: var(--box-shadow-hoverable);
    color: var(--color-accent);
    transition: 0.3s ease;
    cursor: pointer;

    &:hover {
        box-shadow: var(--box-shadow-hover);
        border-color: var(--color-accent);
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

const AddNoteButton = ({ disable, onClick }) => {
    return <StyledAddButton disabled={disable} onClick={onClick}> <FaPlus className="icon" /> </StyledAddButton>;
};

export default AddNoteButton;
