import React, {useState} from 'react';
import {AnimatePresence} from 'framer-motion';

import {
    CollapsibleArrow,
    CollapsibleContainer,
    CollapsibleHeaderText,
    CollapsibleSectionHeader,
    CollapsibleSectionsContainer,
    CollapsibleSectionWrapper,
    CollapsibleThemeVariables,
} from './styles';


const CollapsibleSections = ({
                                 sections,
                                 renderHeaderText,
                                 renderContent,
                                 initialCollapsed = [],
                                 theme = "light"
                             }) => {
    const [collapsedIndices, setCollapsedIndices] = useState(initialCollapsed);

    const toggleSection = (index) => {
        setCollapsedIndices(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    return (
        <CollapsibleThemeVariables data-theme={theme}>
            <CollapsibleSectionsContainer>
                {sections.map((section, index) => {
                    const isCollapsed = collapsedIndices.includes(index);
                    const sectionKey = section.id || `section-${index}`;

                    return (
                        <CollapsibleSectionWrapper
                            key={sectionKey}
                            layout
                            transition={{duration: 0.2, ease: "easeInOut"}}
                        >
                            <CollapsibleSectionHeader onClick={() => toggleSection(index)}>
                                < CollapsibleHeaderText>
                                    {renderHeaderText(section, index, isCollapsed) || `Section ${index}`}
                                </ CollapsibleHeaderText>
                                < CollapsibleArrow $isOpen={isCollapsed}/>
                            </CollapsibleSectionHeader>

                            <AnimatePresence initial={false}>
                                {!isCollapsed && (
                                    <CollapsibleContainer
                                        initial={{height: 0, opacity: 0}}
                                        animate={{
                                            height: "auto",
                                            opacity: 1,
                                            transition: {
                                                height: {duration: 0.3},
                                                opacity: {duration: 0.1, delay: 0.15}
                                            }
                                        }}
                                        exit={{
                                            height: 0,
                                            opacity: 0,
                                            transition: {
                                                height: {duration: 0.2},
                                                opacity: {duration: 0.05}
                                            }
                                        }}
                                    >
                                        {renderContent ? renderContent(section, index) : section.content}
                                    </CollapsibleContainer>
                                )}
                            </AnimatePresence>
                        </CollapsibleSectionWrapper>
                    );
                })}
            </CollapsibleSectionsContainer>
        </CollapsibleThemeVariables>
    );
};

export default React.memo(CollapsibleSections);
