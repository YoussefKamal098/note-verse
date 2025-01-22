import React from 'react';
import styled, {keyframes} from 'styled-components';

const spin = keyframes`
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
`;

const SpinnerStyled = styled.div`
    position: absolute;
    height: calc(100% + 0.5em);
    width: auto;
    aspect-ratio: 1 / 1;
    top: 50%;
    left: 50%;
    translate: -50% -50%;
    border: var(--border-width) solid transparent;
    border-radius: 50%;
    animation: ${spin} 1s linear infinite;
    display: ${({loading}) => (loading ? 'block' : 'none')};
    cursor: ${({loading}) => (loading ? 'not-allowed' : 'pointer')};
    z-index: 1;
`;

const SpinnerWrapperStyled = styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Spinner = ({children, loading = false, color = 'var(--color-danger)'}) => {
    return (
        <SpinnerWrapperStyled>
            <SpinnerStyled
                loading={loading ? "true" : undefined}
                style={{borderTopColor: color}}>
            </SpinnerStyled>
            {children}
        </SpinnerWrapperStyled>
    );
};

export default Spinner;
