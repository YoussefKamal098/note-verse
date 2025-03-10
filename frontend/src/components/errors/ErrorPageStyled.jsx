import styled from "styled-components";

const ErrorContainerStyled = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    background-color: var(--color-background-primary);
    color: var(--color-text);
    gap: 2em;
`;

const IconContainerStyled = styled.div`
    font-size: 7em;
    color: var(--color-text);
`;

const MessageStyled = styled.div`
    font-size: 1.5em;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 0.5em;

    h1 {
        font-size: 1.5em;
    }

    p {
        font-size: 0.8em;
        max-width: 30em;
        color: var(--color-placeholder);
        font-weight: 500;
    }

    a {
        text-decoration: none;
        font-size: 0.6em;
        font-weight: 600;
        color: var(--color-accent);
        cursor: pointer;
        transition: 0.3s ease;

        &:hover {
            color: var(--color-primary);
        }
    }
`;

export {ErrorContainerStyled, IconContainerStyled, MessageStyled};
