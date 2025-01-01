import React from 'react';
import styled from 'styled-components';
import { RiPushpin2Fill, RiUnpinLine } from 'react-icons/ri';
import Spinner from './LoadingSpinnerButton';

const PinButtonStyled = styled.button`
    font-size: 1.3em;
    color: ${({ is_pinned }) => (is_pinned ? "var(--color-accent)" : "var(--color-placeholder)")};
    transition: 0.3s, color 0.3s;
    cursor: pointer;

    &:hover {
        color: var(--color-accent);
        transform: scale(1.2);
    }

    &:active {
        transform: scale(0.9);
    }
`;

const PinButton = ({ isPinned, togglePin, loading=false }) => {
    return (
        <Spinner loading={loading} color={"var(--color-accent)"} >
            <PinButtonStyled onClick={togglePin} is_pinned={isPinned ? "true" : undefined}>
                {isPinned ? <RiPushpin2Fill /> : <RiUnpinLine />}
            </PinButtonStyled>
        </Spinner>
    );
};

export default PinButton;
