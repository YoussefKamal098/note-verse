import styled from "styled-components";

export const UserCard = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
`;

export const AvatarContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 2.5em;
    height: 2.5em;
    font-size: 1em;
    font-weight: 600;
    flex-shrink: 0;
    color: var(--color-placeholder);
    border-radius: 50%;
    border: 0.1em solid var(--color-border);
    outline: ${({$isOnline}) => $isOnline ? "0.15em" : "0em"} solid var(--color-accent);
    box-shadow: ${({$isOnline}) => $isOnline ? 'var(--box-shadow)' : "none"};
    transition: outline-width 0.25s ease, outline-color 0.25s ease, box-shadow 0.25s ease;
    align-self: start;
`;

export const UserDetails = styled.div`
    font-weight: 600;
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

export const UserName = styled.span`
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.9375em;
    color: var(--color-text);
`;

export const MetaInfo = styled.span`
    display: flex;
    align-items: center;
    font-size: 0.7125em;
    color: var(--color-placeholder);
    opacity: 0.8;
    gap: 4px;
`;

export const NameHighlight = styled.span`
    color: var(--color-primary);
    font-size: 0.95em;
`;

