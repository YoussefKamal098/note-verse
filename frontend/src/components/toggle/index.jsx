import React, {useCallback, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

// Constants
const TRANSITION_TIMING = '0.3s cubic-bezier(0.18, 0.89, 0.35, 1.15)';

// Styled Components
const ToggleContainer = styled.label`
    display: inline-flex;
    align-items: center;
    gap: 0.75em;
    cursor: ${({$disabled}) => $disabled ? 'not-allowed' : 'pointer'};
    opacity: ${({$disabled}) => $disabled ? '0.5' : '1'};
    user-select: none;
`;

const HiddenCheckbox = styled.input.attrs({type: 'checkbox'})`
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    margin: 0;
`;

const ToggleTrack = styled.div`
    position: relative;
    width: 4em;
    min-width: 4em;
    height: 2em;
    background-color: var(--color-background-primary);
    border: 2px solid var(--color-border-secondary);
    border-radius: 1.75em;
    transition: box-shadow ${TRANSITION_TIMING};
    box-shadow: var(--box-shadow-hoverable);
`;

const ToggleKnob = styled.div`
    position: absolute;
    height: 1.5em;
    width: ${({$active}) => ($active ? '3.375em' : '1.5em')};
    left: 0.25em;
    top: 50%;
    background-color: ${({$checked, $dangerState}) => getKnobColor($checked, $dangerState)};
    border-radius: ${({$active}) => ($active ? '100px' : '50%')};
    box-shadow: var(--box-shadow-hoverable);
    display: flex;
    align-items: center;
    justify-content: center;
    transform: ${({$checked, $active}) => getKnobTransform($checked, $active)};
    overflow: hidden;
    transition: 0.3s ease, transfrom ${TRANSITION_TIMING};

    &::before {
        content: ${({$checked}) => ($checked ? '"ON"' : '"OFF"')};
        position: absolute;
        color: var(--color-background);
        font-size: 0.7em;
        font-weight: bold;
    }
`;

const LabelContainer = styled.div`
    overflow: hidden;
    display: flex;
    align-items: center;
    gap: 0.5em;
    order: ${({$labelPosition}) => {
        return $labelPosition === 'left' ? -1 : 1;
    }};
`;

const LabelText = styled.span`
    text-wrap: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.9em;
    font-weight: 600;
    transition: color 0.2s ease;
`;

const IconWrapper = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25em;
`;

// Helper functions
const getKnobTransform = (checked, active) => {
    if (checked && active) return 'translateX(0) translateY(-50%)';
    if (checked) return 'translateX(1.875em) translateY(-50%)';
    return 'translateX(0) translateY(-50%)';
};

const getKnobColor = (checked, dangerState) => {
    if (dangerState === 'on') return `var(--color-${checked ? 'danger' : 'primary'})`;
    if (dangerState === 'off') return `var(--color-${checked ? 'accent' : 'danger'})`;
    return `var(--color-${checked ? 'accent' : 'primary'})`;
};

// Main Component
const Toggle = ({
                    checked,
                    onChange,
                    label = '',
                    disabled = false,
                    dangerState = 'none', // 'on' | 'off' | 'none'
                    labelPosition = 'left', // 'left' | 'right'
                    icon = null, // New icon prop
                    id,
                    'aria-label': ariaLabel,
                    'aria-labelledby': ariaLabelledBy,
                    'aria-describedby': ariaDescribedBy,
                    ...props
                }) => {
    const uniqueId = React.useId();
    const toggleId = id || uniqueId;
    const [active, setActive] = useState(false);

    const handlePointerDown = useCallback(() => setActive(true), []);
    const handlePointerUp = useCallback(() => setActive(false), []);

    useEffect(() => {
        window.addEventListener('pointerup', handlePointerUp);
        return () => {
            window.removeEventListener('pointerup', handlePointerUp);
        }
    }, []);

    return (
        <ToggleContainer
            htmlFor={toggleId}
            $disabled={disabled}
            onPointerDown={!disabled ? handlePointerDown : undefined}
        >
            <HiddenCheckbox
                id={toggleId}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                role="switch"
                aria-checked={checked}
                aria-label={ariaLabel || (typeof label === 'string' ? label : undefined)}
                aria-labelledby={ariaLabelledBy}
                aria-describedby={ariaDescribedBy}
                {...props}
            />

            {icon && <IconWrapper>{icon}</IconWrapper>}

            <ToggleTrack>
                <ToggleKnob
                    $checked={checked}
                    $active={active}
                    $dangerState={dangerState}
                    disabled={disabled}
                />
            </ToggleTrack>
            {label && (
                <LabelContainer $labelPosition={labelPosition}>
                    <LabelText id={`${toggleId}-label`} $labelPosition={labelPosition}>
                        {label}
                    </LabelText>
                </LabelContainer>
            )}
        </ToggleContainer>
    );
};

// PropTypes
Toggle.propTypes = {
    checked: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    label: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.node,
    ]),
    disabled: PropTypes.bool,
    dangerState: PropTypes.oneOf(['on', 'off', 'none']),
    labelPosition: PropTypes.oneOf(['left', 'right']),
    icon: PropTypes.node, // New prop for the icon
    id: PropTypes.string,
    'aria-label': PropTypes.string,
    'aria-labelledby': PropTypes.string,
    'aria-describedby': PropTypes.string,
};

export default React.memo(Toggle);
