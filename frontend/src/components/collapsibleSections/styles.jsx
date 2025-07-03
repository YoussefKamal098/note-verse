import styled from 'styled-components';
import {motion} from 'framer-motion';
import {TiArrowSortedDown} from "react-icons/ti";

export const CollapsibleThemeVariables = styled.div`
    --collapsible-text-color: #24292e;
    --collapsible-border-color: #e1e4e8;
    --collapsible-header-bg: #f1f8ff;
    --collapsible-header-text: #0366d6;
    --collapsible-header-hover-bg: #e1e8f1;

    &[data-theme="dark"] {
        --collapsible-text-color: #bfcfdb;
        --collapsible-border-color: #30363d;
        --collapsible-header-bg: #1b1c1d;
        --collapsible-header-text: #429eee;
        --collapsible-header-hover-bg: #222527;
    }
`;

export const CollapsibleContainer = styled(motion.div)`
    overflow: hidden;
`;

export const CollapsibleSectionsContainer = styled.div`
    width: 100%;

    &:last-child {
        border-bottom: 1px solid var(--collapsible-border-color);
    }
`;

export const CollapsibleSectionWrapper = styled(motion.div)`
    border: 1px solid var(--collapsible-border-color);
    border-bottom: none;
    margin-bottom: 1px;
    overflow: hidden;
`;

export const CollapsibleSectionHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 20px !important;
    background: var(--collapsible-header-bg);
    border-bottom: 1px solid var(--collapsible-border-color);
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: var(--collapsible-header-hover-bg);
    }
`;

export const CollapsibleHeaderText = styled.div`
    font-size: 0.7em;
    font-weight: 600;
    padding: 10px 20px !important;
    background-color: var(--collapsible-header-bg);
    color: var(--collapsible-header-text);
    border-radius: 10px;
`;

export const CollapsibleArrow = styled(TiArrowSortedDown)`
    font-size: 1.1em;
    color: var(--collapsible-text-color);
    transition: transform 0.3s ease;
    transform: ${({$isOpen}) => $isOpen ? 'rotate(0deg)' : 'rotate(180deg)'};
`;
