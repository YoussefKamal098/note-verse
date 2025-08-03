import styled from "styled-components";

export const Overlay = styled.div`
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1001;
`;

export const Modal = styled.div`
    background-color: var(--color-background-primary);
    color: var(--color-text);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow-darker);
    padding: 1.5em;
    width: 90vw;
    max-width: 450px;
`;

export const Header = styled.div`
    margin-bottom: 1em;
`;

export const Title = styled.h2`
    font-size: 1.75em;
    font-weight: bold;
    margin-bottom: 0.25em;
`;

export const Description = styled.p`
    font-size: 0.9em;
    font-weight: 600;
    color: var(--color-placeholder);
`;

export const Body = styled.div`
    margin-top: 1em;
`;

export const Instruction = styled.p`
    font-size: 0.85em;
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 0.5em;
`;

export const TextInput = styled.input`
    width: 100%;
    padding: 0.5em;
    font-weight: 600;
    border: 2px solid var(--color-border);
    border-radius: var(--border-radius);
    background-color: var(--color-background);
    color: var(--color-text);
    transition: border 0.2s ease;

    &:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: var(--box-shadow);
    }
`;

export const Footer = styled.div`
    margin-top: 1.5em;
    display: flex;
    justify-content: flex-end;
    gap: 0.75em;
`;
