import React, {useCallback, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import useOutsideClick from "../../hooks/useOutsideClick";
import useSelectKeyboardNavigation from "../../hooks/useSelectKeyboardNavigation";

import {
    CheckMarkStyles,
    ChevronIconStyles,
    OptionsListStyles,
    OptionStyles,
    OptionTextStyles,
    SelectButtonStyles,
    SelectContainerStyles,
    SelectedValueStyles,
} from './styles';

const Select = ({
                    options = [],
                    actions = [],
                    onOptionsChange,
                    onActionsChange,
                    defaultValue = ''
                }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(defaultValue);
    const [containerRect, setContainerRect] = useState({});
    const selectRef = useRef(null);
    const containerRef = useRef(null);
    const combinedItems = [...options, ...actions];

    useOutsideClick(selectRef, () => setIsOpen(false));

    const handleToggle = useCallback(() => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setContainerRect({
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height
            });
        }
        setIsOpen(prev => !prev);
    }, []);

    const handleSelect = useCallback((value) => {
        // Determine if the selected value is an option or action
        const isOption = options.some(opt => opt.value === value);

        if (isOption) {
            onOptionsChange?.(value);
        } else {
            onActionsChange?.(value);
        }

        setSelectedValue(value);
        setIsOpen(false);
    }, [options, onOptionsChange, onActionsChange]);

    const {highlightedIndex, setHighlightedIndex, handleKeyDown} = useSelectKeyboardNavigation(
        selectRef,
        combinedItems,
        isOpen,
        handleSelect,
        () => setIsOpen(false)
    );

    const onKeyDown = useCallback((e) => {
        if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
            e.preventDefault();
            handleToggle();
        }
    }, [handleToggle]);

    return (
        <SelectContainerStyles ref={selectRef}>
            <SelectButtonStyles
                ref={containerRef}
                onClick={handleToggle}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                onKeyDown={onKeyDown}
                tabIndex="0"
            >
                <SelectedValueStyles>
                    {combinedItems.find(opt => opt.value === selectedValue)?.label || 'Select...'}
                </SelectedValueStyles>
                <ChevronIconStyles $isOpen={isOpen} size={20}/>
            </SelectButtonStyles>

            <OptionsListStyles
                role="listbox"
                $isOpen={isOpen}
                $containerTop={containerRect.top}
                $containerLeft={containerRect.left}
                $containerWidth={containerRect.width}
                $containerHeight={containerRect.height}
                tabIndex="-1"
                onKeyDown={handleKeyDown}
            >
                {combinedItems.map((item, index) => {
                    const isAction = index >= options.length;
                    const isFirstAction = index === options.length;

                    return (
                        <OptionStyles
                            key={item.value}
                            role="option"
                            aria-selected={selectedValue === item.value}
                            $isHighlighted={highlightedIndex === index}
                            $isSelected={selectedValue === item.value}
                            $isAction={isAction}
                            $isFirstAction={isFirstAction}
                            onClick={() => handleSelect(item.value)}
                            tabIndex="-1"
                            onMouseEnter={() => setHighlightedIndex(index)}
                        >
                            <OptionTextStyles>{item.label}</OptionTextStyles>
                            {selectedValue === item.value && <CheckMarkStyles size={16}/>}
                        </OptionStyles>
                    );
                })}
            </OptionsListStyles>
        </SelectContainerStyles>
    );
};

// Prop Types
Select.propTypes = {
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        })
    ),
    actions: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        })
    ),
    onOptionsChange: PropTypes.func,
    onActionsChange: PropTypes.func,
    defaultValue: PropTypes.string,
};

export default React.memo(Select);
