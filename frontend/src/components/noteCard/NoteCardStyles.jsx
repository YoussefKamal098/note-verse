import styled from "styled-components";

const NoteCardsContainerStyled = styled.div`
    display: flex;
    font-size: 0.9em;
    flex-direction: column;
    border-top: var(--border-width) solid var(--color-border);
`;

const CardContainerStyled = styled.div`
    position: relative;
    display: flex;
    justify-content: space-between;
    background-color: ${({ index }) => index % 2 === 0 ? "var(--color-background)" : "var(--color-background-primary)"};
    padding: 1em 1em 0.5em 1em;
    transition: 0.3s ease;
    gap: 1em;
`;

const TitleStyled = styled.h2`
    font-size: 0.95em;
    font-weight: 600;
    overflow: hidden;
    text-wrap: nowrap;
    text-overflow: ellipsis;
    color: var(--color-secondary);
    margin-bottom: 0.5em;
    transition: 0.3s ease;
    cursor: pointer;

    &:hover {
        color: var(--color-accent);
    }
`;

const TagsContainerStyled = styled.div`
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 0.5em;
`;

const TagStyled = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    align-self: flex-start;
    gap: 0.25em;
    font-size: 0.7em;
    font-weight: 600;
    color: var(--color-placeholder);
    padding: 0.2em 0.6em;
    border-radius: calc(var(--border-radius) * 2);
    background-color: var(--color-background-secondary);

    span {
        color: var(--color-accent);
        font-size: 1.25em;
        font-weight: bold;
    }
`;

const CreatedAt = styled.span`
    font-size: 0.725em;
    font-weight: 600;
    color: var(--color-placeholder);
`;

export {
    NoteCardsContainerStyled,
    CardContainerStyled,
    TitleStyled,
    TagsContainerStyled,
    TagStyled,
    CreatedAt
};
