import React, {useCallback, useEffect, useRef, useState} from 'react';
import styled from 'styled-components';

const Counter = ({
                     initialValue = 0,
                     unit = '',
                     min = 0,
                     max = 100,
                     step = 1,
                     onChange,
                     label = 'Value',
                     delayBeforeContinuous = 200, // 200 milliseconds delay before continuous changes
                     continuousInterval = 100      // How often to change during continuous press in millisecond
                 }) => {
    const [value, setValue] = useState(Math.min(Math.max(initialValue, min), max));
    const intervalRef = useRef(null);
    const timeoutRef = useRef(null);
    const isMouseDownRef = useRef(false);
    const actionRef = useRef(null); // 'increment' or 'decrement'

    // Clean up on unmount
    useEffect(() => {
        return () => {
            stopContinuousChange();
            clearTimeout(timeoutRef.current);
        };
    }, []);

    useEffect(() => {
        onChange(value);
    }, [value]);

    const changeValue = useCallback((newValue) => {
        const clampedValue = Math.min(Math.max(newValue, min), max);
        setValue(clampedValue);
        if (onChange) onChange(clampedValue);
        return clampedValue;
    }, [min, max, onChange]);

    const startContinuousChange = useCallback((action) => {
        actionRef.current = action;
        isMouseDownRef.current = true;

        // Set timeout for continuous changes
        timeoutRef.current = setTimeout(() => {
            if (!isMouseDownRef.current) return;

            // Start continuous changes
            intervalRef.current = setInterval(() => {
                setValue(prev => {
                    const newVal = actionRef.current === 'increment' ? prev + step : prev - step;
                    const clampedVal = Math.min(Math.max(newVal, min), max);

                    // Stop if we reach limit
                    if ((actionRef.current === 'increment' && clampedVal >= max) ||
                        (actionRef.current === 'decrement' && clampedVal <= min)) {
                        stopContinuousChange();
                    }

                    return clampedVal;
                });
            }, continuousInterval);
        }, delayBeforeContinuous);
    }, [value, step, min, max, delayBeforeContinuous, continuousInterval]);

    const stopContinuousChange = useCallback(() => {
        isMouseDownRef.current = false;
        clearTimeout(timeoutRef.current);
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        timeoutRef.current = null;
    }, []);

    const handleButtonClick = useCallback((action) => {
        // For touch devices or quick clicks
        const newValue = action === 'increment' ? value + step : value - step;
        changeValue(newValue);
    }, [value, step, changeValue]);

    const isMin = value <= min;
    const isMax = value >= max;

    return (
        <ContainerStyles>
            <LabelStyles>{label}</LabelStyles>
            <ControlsStyles>
                <ButtonStyles
                    onMouseDown={() => startContinuousChange('decrement')}
                    onMouseUp={stopContinuousChange}
                    onMouseLeave={stopContinuousChange}
                    onTouchStart={() => startContinuousChange('decrement')}
                    onTouchEnd={stopContinuousChange}
                    onClick={() => handleButtonClick('decrement')}
                    disabled={isMin}
                    aria-label={`Decrease ${label}`}
                >
                    −
                </ButtonStyles>
                <ValueDisplayStyles aria-live="polite">
                    {`${value}${unit}`}
                </ValueDisplayStyles>
                <ButtonStyles
                    onMouseDown={() => startContinuousChange('increment')}
                    onMouseUp={stopContinuousChange}
                    onMouseLeave={stopContinuousChange}
                    onTouchStart={() => startContinuousChange('increment')}
                    onTouchEnd={stopContinuousChange}
                    onClick={() => handleButtonClick('increment')}
                    disabled={isMax}
                    aria-label={`Increase ${label}`}
                >
                    +
                </ButtonStyles>
            </ControlsStyles>
        </ContainerStyles>
    );
};

// Styled components
const ContainerStyles = styled.div`
    font-size: 1em;
    display: flex;
    align-items: center;
    gap: 12px;
    width: fit-content;
`;

const LabelStyles = styled.span`
    font-weight: 600;
    font-size: 0.9em;
    color: var(--color-text);
`;

const ControlsStyles = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const ButtonStyles = styled.button`
    width: 1.5em;
    height: 1.5em;
    border-radius: 5px;
    background-color: var(--color-primary);
    box-shadow: var(--box-shadow-hover);
    color: var(--color-background-light);
    font-size: 1.1em;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    user-select: none;

    &:hover:not(:disabled) {
        background-color: var(--color-primary-hover);
    }

    &:disabled {
        background-color: var(--color-placeholder);
        cursor: not-allowed;
        opacity: 0.6;
    }

    &:focus {
        outline: 2px solid var(--color-border);
        outline-offset: 2px;
    }

    &:active:not(:disabled) {
        transform: scale(0.95);
    }
`;

const ValueDisplayStyles = styled.span`
    text-align: center;
    font-family: monospace;
    font-size: 0.9rem;
    font-weight: bold;
`;

export default React.memo(Counter);
