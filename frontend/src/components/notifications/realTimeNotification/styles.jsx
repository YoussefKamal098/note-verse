import styled from 'styled-components';
import {motion} from 'framer-motion';
import {media} from '@/utils/mediaQueries';

export const BaseIconButton = styled(motion.button)`
    position: relative;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const BaseBadge = styled(motion.span)`
    position: absolute;
    width: 2.1em;
    height: 2.1em;
    font-size: 0.5em;
    top: -0.3em;
    right: -0.1em;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
`;

export const BaseNotificationItem = styled.div`
    display: flex;
    padding: 12px 16px;
    gap: 12px;
    cursor: pointer;
    position: relative;
    transition: all 0.3s;
`;

export const BaseNotificationIcon = styled.div`
    font-size: 0.85em;
    width: 4em;
    height: 4em;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;

export const BaseIconWrapper = styled.span`
    display: flex;
    color: var(--color-placeholder);
`;

export const NotificationContainer = styled.div`
    position: relative;
`;

export const BellButtonStyles = styled(BaseIconButton)`
    font-size: 1.5em;
    color: var(--color-placeholder);
    transition: 0.2s;

    &:hover {
        background: var(--color-background-secondary);
        color: var(--color-primary);
        scale: 0.8;
    }
`;

export const Badge = styled(BaseBadge)`
    background: var(--color-primary);
    color: var(--color-background-light);
`;

export const DropdownContainer = styled(motion.div)`
    position: absolute;
    background: var(--color-background-primary);
    border-radius: 10px;
    box-shadow: var(--box-shadow);
    display: flex;
    flex-direction: column;
    z-index: 1000;
    overflow: hidden;
    border: 1px solid var(--color-border-secondary);
    right: 0;
    bottom: -10px;
    translate: 0 100%;
    width: 80vw;
    max-width: 450px;
    height: 600px;
    max-height: 80vh;
    transform-origin: top right;
    transition: translate 0.3s;

    ${media.mobileL} {
        bottom: 0;
        translate: 0 0;
        width: 100%;
        height: 80%;
        border: none;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
    }
`;

export const DropdownHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
`;

export const DropdownTitle = styled.h4`
    font-size: 1.75em;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
`;

export const DropdownActions = styled.div`
    display: flex;
    align-items: center;
    gap: 5px
`;

export const NotificationItem = styled(BaseNotificationItem)`
        // border-left: ${({unread}) => unread ? '2px solid var(--color-primary)' : 'none'};
    background: ${({unread}) => unread ? 'var(--background-tertiary)' : 'transparent'};

    &:hover {
        background: var(--color-background-secondary);
    }
`;

export const NotificationIcon = styled(BaseNotificationIcon)`
    background: var(--color-background-primary);
    border: 1px solid var(--color-border);
    color: var(--color-primary);
`;

export const NotificationContent = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow: hidden;
`;

export const NotificationTitle = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 600;
    font-size: 1.1em;
    color: var(--color-text-light);
`;

export const NotificationDetails = styled.div`
    font-size: 0.85em;
    color: var(--color-text);
    line-height: 1.4;
`;

export const NotificationTime = styled.div`
    font-size: 0.75em;
    font-weight: 600;
    color: var(--color-placeholder);
`;

export const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    gap: 12px;
    color: var(--color-placeholder);
    text-align: center;
`;

export const Text = styled.div`
    font-size: 0.9em;
    font-weight: 600;
    color: var(--color-text);
`;

export const Link = styled.span`
    text-decoration: none;
    transition: color 0.3s;

    &:hover {
        color: var(--color-accent);
    }
`;

export const Highlight = styled.span`
    display: inline-block;
    border-radius: 4px;
    font-size: 1.1em;
    color: var(--color-primary);
`;

export const FlexRow = styled.div`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 5px;
`;

export const LargeIcon = styled(BaseIconWrapper)`
    font-size: 2.25em;
    color: var(--color-primary);
`;

export const SmallIcon = styled(BaseIconWrapper)`
    font-size: 1.2em;
`;

export const MediumIcon = styled(BaseIconWrapper)`
    font-size: 1.5em;
`;

export const AvatarWrapper = styled.div`
    position: relative;
    width: 3.75em;
    height: 3.75em;
    min-width: 3.75em;
    min-height: 3.75em;
    border-radius: 50%;
`;

export const EditBadge = styled.div`
    position: absolute;
    bottom: -3px;
    right: -3px;
    width: 1.75em;
    height: 1.75em;
    border-radius: 50%;
    background-color: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--color-background);

    svg {
        width: 0.6em;
        height: 0.6em;
        color: white;
    }
`;

export const ResponsiveDropdownContainer = styled(motion.div)`
    ${media.mobileL} {
        position: fixed;
        width: 100vw;
        height: 100vh;
        top: 0;
        left: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(0.1em);
        z-index: 10000;
    }
`;

export const DynamicMenuHeaderStyled = styled.div`
    top: 0;
    left: 0;
    width: 100%;
    padding: 1em;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--color-background);
    cursor: pointer;
    z-index: 10;

    &::after {
        position: absolute;
        content: '';
        width: 35px;
        height: 3px;
        border-radius: 50px;
        background-color: var(--color-placeholder);
    }
`

export const LoadingRibbon = styled.div`
    width: 100px;
    display: inline-block;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8em;
    margin-left: 8px;
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
