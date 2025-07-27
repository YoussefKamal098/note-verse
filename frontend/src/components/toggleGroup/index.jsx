import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const ToggleGroupStyles = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.85em;
`

const ToggleButtonStyles = styled.div`
    display: flex;
    align-items: center;
    gap: 0.25em;
    padding: 0.9em 1.1em !important;
    background-color: var(--color-background);
    border: 2px solid var(--color-border);
    border-radius: 10px;
    cursor: pointer;
    font-size: 0.75em;
    font-weight: 600;
    color: var(--color-text);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;

    &:hover {
        background-color: var(--color-background-secondary);
    }

    &.active {
        background-color: var(--color-primary);
        border-color: transparent;
        color: var(--color-background);
    }
`

const ToggleIconsStyles = styled.div`
    display: inline-flex;
    font-size: 1.5em;
    color: var(--color-text);
    transition: all 0.3s ease;

    &.active {
        color: var(--color-background);
    }
`

const ToggleGroup = ({
                         options,
                         value,
                         onChange,
                         ariaLabel,
                         className = ''
                     }) => {
    const handleChange = (newValue) => {
        if (newValue !== value) {
            onChange(newValue);
        }
    };

    return (
        <ToggleGroupStyles
            className={className}
            role="group"
            aria-label={ariaLabel}
        >
            {options.map((option) => (
                <ToggleButtonStyles
                    key={option.value}
                    type="button"
                    className={`${value === option.value ? 'active' : ''}`}
                    onClick={() => handleChange(option.value)}
                    aria-pressed={value === option.value}
                    aria-label={option.name}
                >
                    {option.name}
                    {option.icon && (
                        <ToggleIconsStyles
                            className={`${value === option.value ? 'active' : ''}`}
                            aria-hidden="true"
                        >
                            {option.icon}
                        </ToggleIconsStyles>
                    )}
                </ToggleButtonStyles>
            ))}
        </ToggleGroupStyles>
    );
};

ToggleGroup.propTypes = {
    options: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            value: PropTypes.string.isRequired,
            icon: PropTypes.node
        })
    ).isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    name: PropTypes.string,
    ariaLabel: PropTypes.string.isRequired,
    className: PropTypes.string
};

export default React.memo(ToggleGroup);
