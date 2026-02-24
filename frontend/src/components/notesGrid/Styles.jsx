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
        gap: 12px;
    }
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
