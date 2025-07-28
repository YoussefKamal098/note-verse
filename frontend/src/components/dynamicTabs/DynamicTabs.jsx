import React, {useCallback, useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {AnimatePresence, motion} from 'framer-motion';
import {Tab, TabList, TabPanel, Tabs} from 'react-tabs';
import {TranslateTransitionContainer} from "../animations/ContainerAnimation";
import TabToolbar from "./TabToolbar";
import {TabBodyStyled, TabsListWrapperStyled, TabStyled, TitleWrapperStyled} from "./DynamicTabsStyles";
import 'react-tabs/style/react-tabs.css';

const tabVariants = {
    active: {
        opacity: 1,
        x: 0,
        transition: {type: 'spring', stiffness: 300, damping: 25}
    },
    inactive: {
        opacity: 0,
        x: '100%',
        transition: {duration: 0.2}
    }
};

function DynamicTabs({
                         tabs = [],
                         onTabChange = (tab) => (tab)
                     }) {
    const [tabIndex, setTabIndex] = useState(0);
    const tabRef = useRef(null);

    useEffect(() => {
        setTabIndex(0);
    }, [tabs])

    const handleTabChange = useCallback((index) => {
        setTabIndex(index);
        onTabChange(index);
    }, [onTabChange]);

    // Render Tab List
    const renderTabsList = () => {
        return tabs.map((tab, index) => (
            <Tab key={`tab-${index}`}>
                <TranslateTransitionContainer key={`tab-animation-${index}`}>
                    <TitleWrapperStyled>
                        <div className="tab-icon" aria-hidden="true"> {tab.icon}</div>
                        <span className="tab-title">{tab.title}</span>
                    </TitleWrapperStyled>
                </TranslateTransitionContainer>
            </Tab>
        ));
    };

    // Render Tab Content Body
    const renderTabsBody = () => {
        return tabs.map((tab, index) => (
            <TabPanel key={`tab-content-${index}`}>
                <TabStyled ref={tabRef}>
                    <AnimatePresence>
                        <motion.div
                            variants={tabVariants}
                            initial="inactive"
                            animate={tabIndex === index ? 'active' : 'inactive'}
                            className="tab"
                            role="region"
                            aria-live="polite"
                        >
                            <TabToolbar tabRef={tabRef} className="tab-toolbar"/>
                            <TabBodyStyled className="tab-body">
                                {tab.content}
                            </TabBodyStyled>

                        </motion.div>
                    </AnimatePresence>
                </TabStyled>
            </TabPanel>
        ));
    };

    return (
        <Tabs
            selectedIndex={tabIndex}
            onSelect={handleTabChange}
        >
            {tabs.length > 1 && (
                <TabsListWrapperStyled tabs_count={tabs.length}>
                    <TabList role="presentation">{renderTabsList()}</TabList>
                </TabsListWrapperStyled>
            )}

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
