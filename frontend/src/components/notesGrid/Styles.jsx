import styled from 'styled-components';

export const NoteCardsContainerStyles = styled.div`
    font-size: 0.9em;
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
    transition: 0.3s ease;

    @media (max-width: 600px) {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        padding: 16px;
        gap: 12px;
    }

    ${({loading}) => loading && `
        opacity: 0.5;
        pointer-events: none;
        cursor: not-allowed;
    `}
`;

export const CardStyles = styled.div`
    width: 100%;
    height: 280px;
    display: flex;
    flex-direction: column;
    transition: box-shadow 0.2s;
    background-color: var(--color-background-primary);
    color: var(--color-text);
    position: relative;
    border-radius: 10px;
    overflow: hidden;

    &:hover {
        box-shadow: var(--box-shadow-hover);
    }
`;

export const MarkdownContainerStyles = styled.div`
    position: relative;
    height: 100%;
    overflow: hidden;
    background-color: var(--color-background);
    padding: 12px;
    cursor: pointer;
    transition: scale 0.3s ease;

    &:hover {
        scale: 1.1;
    }

    img {
        border-radius: 4px;
        max-width: 100%;
        height: auto;
        display: block;
        margin: 0.5rem 0;
    }
`;

export const TagsWrapperStyles = styled.div`
    padding: 10px 5px;
    background-color: transparent;
    //border-top: 1px solid var(--color-border)
`

export const TagsContainerStyles = styled.div`
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    gap: 0.5em;
    overflow-x: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
        display: none;
    }

    &:hover {
        flex-wrap: wrap;
        overflow-y: auto;
    }
`;

export const TagStyles = styled.span`
    color: var(--color-text);
    box-shadow: var(--box-shadow);
    border-radius: 10px;
    border: 1px solid var(--color-background-secondary);
    background-color: var(--color-background);
    padding: 0.2em 0.6em;
    font-size: 0.75em;
    font-weight: 600;
    display: flex;
    align-items: center;
    transition: all 0.3s ease;
    gap: 0.3em;

    span {
        font-size: 1.3em;
        font-weight: bold;
        color: var(--color-accent);
    }

    &:hover {
        transform: scale(1.1);
        background-color: var(--color-background-secondary);
    }
`;

export const PinStatusContainerStyles = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.9rem;
    color: var(--color-secondary);

    svg {
        font-size: 1rem;
        color: ${props => props.$isPinned ? 'var(--color-accent)' : 'var(--color-secondary)'};
        transition: color 0.2s ease;
    }
`;
