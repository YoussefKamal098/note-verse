import styled from "styled-components";

const SearchBarWrapperStyled = styled.div`
    width: 24rem;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
`;

const SearchBarContainerStyled = styled.div`
    display: flex;
    align-items: center;
    padding: 0 1em;
    background-color: var(--color-background-secondary);
    border: calc(var(--border-width) * 1.5) solid var(--color-background);
    border-radius: var(--border-radius);
    transition: 0.3s ease;
    overflow: hidden;

    &:hover .search-icon,
    &:focus-within .search-icon {
        color: var(--color-accent);
    }

    &:hover,
    &:focus-within {
        border-color: var(--color-accent);
    }
`;

const InputStyled = styled.input`
    width: 100%;
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

export { SearchBarWrapperStyled, SearchBarContainerStyled, InputStyled, IconWrapperStyled };