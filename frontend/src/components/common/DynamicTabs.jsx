import { useSpring, animated } from 'react-spring';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import { useTheme } from "../../contexts/ThemeContext";
import 'react-tabs/style/react-tabs.css';
import '../../styles/customTabs.css';

function DynamicTabs({ tabsData, tabIndex, onTabChange }) {
    const { theme } = useTheme();

    const tabAnimation = (index) => {
        return new useSpring({
            opacity: tabIndex === index ? 1 : 0,
            transform: tabIndex === index ? 'translateX(0)' : 'translateX(100%)',
            config: { tension: 250, friction: 20 },
        });
    };

    return (
        <div>
            <Tabs data-color-mode={theme} selectedIndex={tabIndex} onSelect={onTabChange}>
                <TabList>
                    {tabsData.map((tabData, index) => (
                        <Tab key={index}>{tabData.title}</Tab>
                    ))}
                </TabList>

                {tabsData.map((tabData, index) => (
                    <TabPanel key={index}>
                        <animated.div style={tabAnimation(index)}>
                            {tabData.content}
                        </animated.div>
                    </TabPanel>
                ))}
            </Tabs>
        </div>
    );
}

export default DynamicTabs;

