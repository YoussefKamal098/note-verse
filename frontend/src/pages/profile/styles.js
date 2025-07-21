import styled from "styled-components";

export const PageWrapper = styled.div`
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
`;

export const ProfileHeader = styled.h1`
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 2rem;
`;

export const TabsContainer = styled.div`
    scrollbar-width: none;
    width: 100%;
    overflow-y: auto;
`

export const TabContent = styled.div`
    margin-top: 2rem;
    position: relative;
`;

export const ProfileImageSection = styled.div`
    height: 200px;
    width: fit-content;
    display: flex;
    flex-direction: column;
    gap: 10px;
    justify-content: center;
    margin: 3rem 0;
`;

export const RemoveButtonWrapper = styled.div`
    font-size: 0.75em;
`;

export const SectionTitle = styled.h2`
    font-size: 1.2rem;
    font-weight: 600;
`;

export const InvalidTabContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`

export const Message = styled.p`
    text-align: center;
    font-size: 0.85em;
    font-weight: 600;
    color: var(--color-placeholder);
    margin-bottom: 1.5rem;
`;

export const BackButton = styled.span`
    font-size: 0.85em;
    font-weight: 600;
    color: var(--color-primary);
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
        color: var(--color-accent);
    }
`;
