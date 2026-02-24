import styled from "styled-components";

const SearchBarBoxStyled = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    @media (max-width: 400px) {
        position: fixed;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100vw;
        max-width: 100vw;
        padding: 0.8em 1em;
        left: 0;
        bottom: 0;
        border-top: calc(var(--border-width) / 2) solid var(--color-border);
        background-color: var(--color-background);
        box-shadow: var(--box-shadow);
    }
`;

const SearchBarWrapperStyled = styled.div`
    max-width: 35rem;
    border-radius: var(--border-radius);
`;

const SearchBarContainerStyled = styled.div`
    display: flex;
    align-items: center;
    padding: 0 0.8em;
    background-color: var(--color-background-secondary);
    border-radius: var(--border-radius);
    transition: 0.25s ease;
    border: 2px solid transparent;

    &:focus-within {
        box-shadow: 0 0 0 2px rgba(0, 150, 255, 0.1);
    }
`;

const InputStyled = styled.input`
    width: 100%;
    color: var(--color-text);
    font-size: 1em;
    font-weight: 600;
    background: transparent;
    padding: 0.6rem 0.5em 0.6rem 0;
    caret-color: var(--color-text);

    &::placeholder {
        color: var(--color-placeholder);
        font-weight: 600;
        transition: 0.3s ease;
    }

    &:hover::placeholder,
    &:focus::placeholder {
        color: var(--color-accent);
    }
`;

const IconButtonStyled = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    padding: 0.4rem;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;

    svg {
        font-size: 1.1rem;
        color: var(--color-placeholder);
        transition: color 0.2s ease, transform 0.2s ease;
    }

    &:hover:not(:disabled) svg {
        color: var(--color-accent);
        transform: scale(1.1);
    }

    &:active:not(:disabled) {
        transform: scale(0.95);
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.4;
    }

    &.clear svg {
        font-size: 1.4rem;
    }

    &.clear:hover svg {
        color: var(--color-danger-hover);
    }
`;

export {
    IconButtonStyled,
    SearchBarBoxStyled,
    SearchBarWrapperStyled,
    SearchBarContainerStyled,
    InputStyled,
};
