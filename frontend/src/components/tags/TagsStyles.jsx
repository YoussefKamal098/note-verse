import styled from "styled-components";

const TagStyled = styled.span`
    color: var(--color-text);
    box-shadow: var(--box-shadow);
    border-radius: 10px;
    border: 0.1rem solid var(--color-border-secondary);
    padding: 0.1em 0.4em;
    font-size: 0.7em;
    font-weight: 600;
    display: flex;
    align-items: center;
    transition: scale 0.3s;
    gap: 0.3em;

    span {
        font-size: 1.3em;
        font-weight: bold;
        color: var(--color-accent);
    }

    &:hover {
        scale: 1.1;
    }
`;

const TagsContainerStyled = styled.div`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    max-width: 25em;
    gap: 0.5em;
`;

export {TagStyled, TagsContainerStyled};
