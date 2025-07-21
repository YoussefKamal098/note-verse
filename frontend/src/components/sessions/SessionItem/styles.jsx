import styled from "styled-components";

export const SessionCard = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 30px;
    padding: 5px 10px 20px;
    background-color: var(--color-background-primary);
    transition: all 0.2s ease;
    opacity: ${({$revoked}) => $revoked ? 0.6 : 1};

    &:not(:last-child) {
        border-bottom: 2px solid var(--color-border);
    }
`;

export const DeviceInfo = styled.div`
    font-size: 0.85em;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    font-weight: 600;
`;

export const DeviceIcon = styled.div`
    display: flex;
    font-size: 3.5em;
    color: var(--color-primary);
`;

export const SessionDetails = styled.div`
    font-size: 0.9em;
    font-weight: 600;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 15px;
`;

export const SessionHeader = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
`;

export const SessionRow = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`;

export const SessionMeta = styled.div`
    font-size: 0.85em;
    color: var(--color-placeholder);
`;

export const SessionDates = styled.div`
    display: flex;
    flex-direction: column;
    gap: 15px;
    font-size: 0.85em;
    color: var(--color-text);
`;

export const SessionAction = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 1rem;
`;

export const IconContainer = styled.div`
    font-size: 1.1em;
    color: var(--color-accent);
    display: flex;
    gap: 5px;
    align-items: center;
`;

export const LoadingRibbon = styled.div`
    width: 100px;
    display: inline-block;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8em;
    background: linear-gradient(
            90deg,
            var(--color-background-skeletonbase) 25%,
            var(--color-background-skeletonhighlight) 50%,
            var(--color-background-skeletonbase) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;

    @keyframes shimmer {
        0% {
            background-position: 200% 0;
        }
        100% {
            background-position: -200% 0;
        }
    }
`;
