import React, {useCallback, useEffect, useRef, useState} from 'react';
import {animated, useSpring} from 'react-spring';
import {Tab, TabList, TabPanel, Tabs} from 'react-tabs';
import {useTheme} from "../../contexts/ThemeContext";
import TabToolbar from "./TabToolbar";
import {TabBodyStyled, TabsListWrapperStyled, TabStyled, TitleWrapperStyled} from "./DynamicTabsStyles";
import 'react-tabs/style/react-tabs.css';

function DynamicTabs({
                         tabs = [],
                         initialTabIndex = 0,
                         onTabChange = (tab) => (tab)
                     }) {
    const {theme} = useTheme();
    const [tabIndex, setTabIndex] = useState(initialTabIndex !== 0 ? initialTabIndex - 1 : initialTabIndex + 1);
    const [tabsCount, setTabsCount] = useState(tabs.length);
    const tabRef = useRef(null);

    useEffect(() => {
        setTabsCount(tabs.length);
        setTabIndex(initialTabIndex);
    }, [tabs, initialTabIndex]);

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
            <Tab key={`tab-title-${index}`}>
                <TitleWrapperStyled>
                    <div className="tab-title-icon"> {tab.icon} </div>
                    <div className="tab-title"> {tab.title} </div>
                </TitleWrapperStyled>
            </Tab>
        ));
    };

    // Render Tab Content Body
    const renderTabsBody = () => {
        return tabs.map((tab, index) => (
            <TabPanel key={`tab-${index}`}>
                <TabStyled ref={tabRef}>
                    <animated.div className="tap" style={tabAnimation(index)}>
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
        <div>
            <Tabs data-color-mode={theme} selectedIndex={tabIndex} onSelect={handleTabChange}>
                <TabsListWrapperStyled tabs_count={tabsCount}>
                    <TabList> {renderTabsList()} </TabList>
                </TabsListWrapperStyled>

                {renderTabsBody()}
            </Tabs>
        </div>
    );
}

export default DynamicTabs;
