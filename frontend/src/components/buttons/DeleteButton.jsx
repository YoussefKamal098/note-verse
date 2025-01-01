import React from 'react';
import styled from 'styled-components';
import { MdDeleteForever } from 'react-icons/md';
import Spinner from './LoadingSpinnerButton';

const DeleteButtonStyled = styled.button`
    background-color: transparent;
    font-size: 1.3em;
    color: var(--color-danger);
    transition: 0.3s, color 0.3s;
    position: relative;
    cursor: pointer;

    &:hover {
        color: var(--color-danger-hover);
        transform: scale(1.2);
    }

    &:active {
        transform: scale(0.9);
    }
`;

const DeleteButton = ({ onClick, loading = false }) => {
    return (
        <Spinner loading={loading} color="var(--color-danger)" >
            <DeleteButtonStyled onClick={onClick}>
                <MdDeleteForever />
            </DeleteButtonStyled>
        </Spinner>

    );
};

export default DeleteButton;
