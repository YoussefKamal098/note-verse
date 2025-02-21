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
    padding: 0 1em;
    background-color: var(--color-background-secondary);
    border: var(--border-width) solid var(--color-border);
    border-radius: var(--border-radius);
    transition: 0.3s ease;
    overflow: hidden;

    &:hover .search-icon,
    &:focus-within .search-icon {
        color: var(--color-accent);
    }
`;

const InputStyled = styled.input`
    width: 100%;
    color: var(--color-text);
    font-size: 1em;
    font-weight: 600;
    background: transparent;
    padding: 0.6rem 0.5em 0.6rem 0;

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

const IconWrapperStyled = styled.div`
    display: flex;
    align-items: center;
    cursor: pointer;
    gap: 0.1em;

    .close-icon {
        color: var(--color-placeholder);
        font-size: 1.5em;
        transition: color 0.3s ease;

        &:hover {
            color: var(--color-danger-hover);
        }
    }

    .search-icon {
        color: var(--color-placeholder);
        font-size: 1em;
        transition: color 0.3s ease;
    }
`;

export {
    SearchBarBoxStyled,
    SearchBarWrapperStyled,
    SearchBarContainerStyled,
    InputStyled,
    IconWrapperStyled
};
