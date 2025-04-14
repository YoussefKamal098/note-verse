import React, {useCallback, useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {animated, useSpring} from 'react-spring';
import {Tab, TabList, TabPanel, Tabs} from 'react-tabs';
import {useTheme} from "../../contexts/ThemeContext";
import TabToolbar from "./TabToolbar";
import {TabBodyStyled, TabsListWrapperStyled, TabStyled, TitleWrapperStyled} from "./DynamicTabsStyles";
import 'react-tabs/style/react-tabs.css';

function DynamicTabs({
                         tabs = [],
                         onTabChange = (tab) => (tab)
                     }) {
    const {theme} = useTheme();
    const [tabIndex, setTabIndex] = useState(0);
    const [tabsCount, setTabsCount] = useState(tabs.length);
    const tabRef = useRef(null);

    useEffect(() => {
        setTabsCount(tabs.length);
    }, [tabs]);

    const handleTabChange = useCallback((index) => {
        setTabIndex(index);
        onTabChange(index);
    }, [onTabChange]);

    const tabAnimation = (index) => {
        return new useSpring({
            opacity: tabIndex === index ? 1 : 0,
            transform: tabIndex === index ? 'translateX(0)' : 'translateX(100%)',
            config: {tension: 250, friction: 20},
        });
    };

    // Render Tab List
    const renderTabsList = () => {
        return tabs.map((tab, index) => (
            <Tab key={`tab-${index}`}>
                <TitleWrapperStyled>
                    <div className="tab-icon" aria-hidden="true"> {tab.icon}</div>
                    <span className="tab-title">{tab.title}</span>
                </TitleWrapperStyled>
            </Tab>
        ));
    };

    // Render Tab Content Body
    const renderTabsBody = () => {
        return tabs.map((tab, index) => (
            <TabPanel key={`tab-content-${index}`}>
                <TabStyled ref={tabRef}>
                    <animated.div
                        className="tab"
                        style={tabAnimation(index)}
                        role="region"
                        aria-live="polite"
                    >
                        <TabToolbar tabRef={tabRef} className="tab-toolbar"/>
                        <TabBodyStyled className="tab-body">
                            {tab.content}
                        </TabBodyStyled>
                    </animated.div>
                </TabStyled>
            </TabPanel>
        ));
    };

    return (
        <Tabs
            data-color-mode={theme}
            selectedIndex={tabIndex}
            onSelect={handleTabChange}
        >
            <TabsListWrapperStyled tabs_count={tabsCount}>
                <TabList role="presentation">{renderTabsList()}</TabList>
            </TabsListWrapperStyled>

            {renderTabsBody()}
        </Tabs>
    );
}

DynamicTabs.propTypes = {
    tabs: PropTypes.arrayOf(
        PropTypes.shape({
            title: PropTypes.string.isRequired,
            icon: PropTypes.node,
            content: PropTypes.node.isRequired
        })
    ).isRequired,
    onTabChange: PropTypes.func
};

export default React.memo(DynamicTabs);
