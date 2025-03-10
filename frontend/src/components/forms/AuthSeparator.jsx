import React from "react";
import styled from 'styled-components';

// Styled components
const SeparatorContainer = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
    margin: 1.5rem 0;
`;

const Line = styled.div`
    flex: 1;
    height: 0.095em;
    border-radius: 25px;
    background-color: var(--color-background-secondary);
`;

const SeparatorText = styled.span`
    margin: 0 13px;
    color: var(--color-text);
    font-size: 0.9em;
    font-weight: 600;
`;


const AuthSeparator = () => {
    return (
        <SeparatorContainer>
            <Line/>
            <SeparatorText>OR</SeparatorText>
            <Line/>
        </SeparatorContainer>
    );
};

export default AuthSeparator;
