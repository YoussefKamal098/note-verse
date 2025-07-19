import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {motion} from 'framer-motion';
import ButtonBase from '@mui/material/ButtonBase';

const TabsContainer = styled.div`
    display: flex;
    position: relative;
    padding: 0 1.25em;
`;

const TabButton = styled(motion(ButtonBase)).attrs(() => ({
    // whileHover: {scale: 1.02},
    // whileTap: {scale: 0.98}
}))`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1em;
    padding: 15px 0 !important;
    border-radius: 5px 5px 0 0 !important;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.9em;
    font-weight: 600;
    color: ${({$active}) => $active ? 'var(--color-primary)' : 'var(--color-text)'};
    position: relative;
    text-align: center;
    max-width: 125px;
    min-width: 75px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.3s ease;
    z-index: 1;
    outline: none;

    &:focus-visible {
        box-shadow: var(--box-shadow);
        border: 2px solid var(--color-border-secondary);
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
    }

    &:hover {
        color: var(--color-primary);
    }

    &[aria-selected="true"] {
        color: var(--color-primary);
    }
`;

const TabIcon = styled.span`
    display: flex;
    font-size: 1em;
`;

const ActiveIndicator = styled(motion.div)`
    position: absolute;
    bottom: 0;
    height: 2px;
    border-radius: 25px;
    background: var(--color-primary);
    z-index: 0;
`;

const Tabs = ({tabs, containerStyles, tabStyles, activeTab, onTabChange, className, ariaLabel}) => {
    const tabRefs = useRef([]);
    const containerRef = useRef(null);
    const [indicatorStyle, setIndicatorStyle] = useState({left: 0, width: 0});

    useEffect(() => {
        const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
        const activeTabRef = tabRefs.current[activeIndex];

        if (activeTabRef) {
            const {offsetLeft, clientWidth} = activeTabRef;
            setIndicatorStyle({left: offsetLeft, width: clientWidth});
        }
    }, [activeTab, tabs]);

    const handleKeyDown = (event, tabId) => {
        switch (event.key) {
            case 'Enter':
            case ' ':
                event.preventDefault();
                onTabChange(tabId);
                break;
            case 'ArrowRight':
                event.preventDefault();
                moveFocus(1);
                break;
            case 'ArrowLeft':
                event.preventDefault();
                moveFocus(-1);
                break;
            case 'Home':
                event.preventDefault();
                moveFocusToEnd(true);
                break;
            case 'End':
                event.preventDefault();
                moveFocusToEnd(false);
                break;
            default:
                break;
        }
    };

    const moveFocus = (direction) => {
        const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
        const nextIndex = (currentIndex + direction + tabs.length) % tabs.length;
        const nextTab = tabs[nextIndex];

        if (nextTab) {
            onTabChange(nextTab.id);
            tabRefs.current[nextIndex]?.focus();
        }
    };

    const moveFocusToEnd = (isHome) => {
        const targetIndex = isHome ? 0 : tabs.length - 1;
        const targetTab = tabs[targetIndex];

        if (targetTab) {
            onTabChange(targetTab.id);
            tabRefs.current[targetIndex]?.focus();
        }
    };

    return (
        <div role="tablist" aria-label={ariaLabel || "Tabs navigation"}>
            <TabsContainer ref={containerRef} className={className} style={containerStyles}>
                {tabs.map((tab, index) => (
                    <TabButton
                        style={tabStyles}
                        key={tab.id}
                        $active={activeTab === tab.id}
                        onClick={() => onTabChange(tab.id)}
                        onKeyDown={(e) => handleKeyDown(e, tab.id)}
                        ref={el => (tabRefs.current[index] = el)}
                        role="tab"
                        id={`tab-${tab.id}`}
                        aria-selected={activeTab === tab.id}
                        aria-controls={`tabpanel-${tab.id}`}
                        tabIndex={activeTab === tab.id ? 0 : -1}
                    >
                        {tab.icon && <TabIcon aria-hidden="true">{tab.icon}</TabIcon>}
                        {tab.label}
                    </TabButton>
                ))}

                <ActiveIndicator
                    animate={indicatorStyle}
                    transition={{type: 'spring', damping: 20, stiffness: 300}}
                    style={{position: 'absolute'}}
                    aria-hidden="true"
                />
            </TabsContainer>
        </div>
    );
};

Tabs.propTypes = {
    tabs: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            icon: PropTypes.node
        })
    ).isRequired,
    activeTab: PropTypes.string.isRequired,
    onTabChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    ariaLabel: PropTypes.string
};

export default React.memo(Tabs);
