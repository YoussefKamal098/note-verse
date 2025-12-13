import styled from "styled-components";
import {motion} from "framer-motion";

export const Wrapper = styled.div`
    position: relative;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    user-select: none;
`;

export const MainButton = styled(motion.button)`
    width: ${p => p.$size}px;
    height: ${p => p.$size}px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--color-background-primary);
    box-shadow: var(--box-shadow);
    cursor: pointer;
    outline: none;
    transition: border-color 0.2s ease;

    &:hover {
        border-color: var(--color-border-secondary);
    }
`;

export const Bubble = styled(motion.div)`
    background: var(--color-background-primary);
    padding: 0.4rem 0.9rem;
    border-radius: 2rem;
    box-shadow: var(--box-shadow-hoverable);
    display: flex;
    z-index: 9999;
    pointer-events: auto;
`;

export const IconsRow = styled(motion.div)`
    display: flex;
    gap: 0.25rem;
`;

export const IconWrap = styled(motion.div)`
    display: flex;
    cursor: pointer;
    transition: filter 0.15s ease;
    border-radius: 50%;
    padding: 4px;

    &:hover {
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }
`;
