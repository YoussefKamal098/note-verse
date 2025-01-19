import React from "react";
import {BiSolidMessageSquareAdd} from "react-icons/bi";
import styled from "styled-components";
import Tooltip from '../tooltip/Tooltip';

const StyledAddButton = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0.15em;
    font-size: 1.75em;
    border: calc(var(--border-width) / 1.5) solid var(--color-border-secondary);
    border-radius: calc(var(--border-radius) / 1.5);
    background: var(--color-background);
    box-shadow: var(--box-shadow-hoverable);
    color: var(--color-secondary);
    transition: 0.3s ease;
    cursor: pointer;

    &:hover {
        box-shadow: var(--box-shadow-hover);
        transform: scale(0.9);
    }

    &:active {
        transform: scale(1.1);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        box-shadow: none;
    }
`;

const AddButton = ({disable = true, onClick = () => ({}), title = ""}) => {
    return (
        <Tooltip title={title}>
            <StyledAddButton disabled={disable} onClick={onClick}>
                <BiSolidMessageSquareAdd className="icon"/>
            </StyledAddButton>
        </Tooltip>
    );
};

export default AddButton;
