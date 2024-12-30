import React from 'react';
import styled from 'styled-components';
import { MdDeleteForever} from 'react-icons/md';

const DeleteButtonStyled = styled.button`
    background-color: transparent;
    cursor: pointer;
    font-size: 1.5em;
    color: var(--color-danger);
    transition: transform 0.3s, color 0.3s;

    &:hover {
        color: var(--color-danger);
        transform: scale(1.2);
    }

    &:active {
        transform: scale(0.9);
    }
`;

const DeleteButton = ({ onClick }) => {
    return (
        <DeleteButtonStyled onClick={onClick}>
            <MdDeleteForever />
        </DeleteButtonStyled>
    );
};

export default DeleteButton;
