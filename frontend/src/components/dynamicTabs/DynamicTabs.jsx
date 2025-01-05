import React, {useCallback, useEffect, useState} from 'react';
import {animated, useSpring} from 'react-spring';
import {Tab, TabList, TabPanel, Tabs} from 'react-tabs';
import {useTheme} from "../../contexts/ThemeContext";
import TabToolbar from "./TabToolbar";
import {TabBodyStyled, TabStyled, TabsWrapperStyled, TitleWrapperStyled} from "./DynamicTabsStyles";
import 'react-tabs/style/react-tabs.css';

function DynamicTabs({tabs}) {
    const {theme} = useTheme();
    const [tabIndex, setTabIndex] = useState(1);
    const [tabsCount, setTabsCount] = useState(0);

    useEffect(() => {
        setTabsCount(tabs.length);
        setTabIndex(0);
    }, []);

    const onTabChange = useCallback((index) => {
        setTabIndex(index);
    }, []);

    const tabAnimation = (index) => {
        return new useSpring({
            opacity: tabIndex === index ? 1 : 0,
            transform: tabIndex === index ? 'translateX(0)' : 'translateX(100%)',
            config: {tension: 250, friction: 20},
        });
    };

    return (
        <div>
            <Tabs data-color-mode={theme} selectedIndex={tabIndex} onSelect={onTabChange}>
                <TabsWrapperStyled tabs_count={tabsCount}>
                    <TabList>
                        {tabs.map((tab, index) => {
                            return (
                                <Tab
                                    key={`tab-title-${index}`}>
                                    <TitleWrapperStyled>
                                        <div className="tab-title-icon"> {tab.icon} </div>
                                        <div className="tab-title"> {tab.title} </div>
                                    </TitleWrapperStyled>
                                </Tab>
                            );
                        })}
                    </TabList>
                </TabsWrapperStyled>

                {tabs.map((tab, index) => (
                    <TabPanel key={`tab-${index}`}>
                        <TabStyled>
                            <animated.div className="tap" style={tabAnimation(index)}>
                                <TabToolbar className="tab-toolbar"/>
                                <TabBodyStyled className="tab-body">
                                    {tab.content}
                                </TabBodyStyled>
                            </animated.div>
                        </TabStyled>
                    </TabPanel>
                ))}
            </Tabs>
        </div>
    );
}

export default DynamicTabs;
