import React, {useLayoutEffect, useState} from "react";
import './styles.css';

const CustomSlider = ({
                          min = 0,
                          max = 100,
                          step = 1,
                          defaultValue = 50,
                          onChange,
                          unit = "",
                          showLabel = true,
                          ...props
                      }) => {
    const [value, setValue] = useState(defaultValue);

    const handleChange = (e) => {
        setValue(e.target.value);
        onChange?.(e);
    };

    useLayoutEffect(() => {
        setValue(defaultValue);
    }, [defaultValue]);

    const percent = ((value - min) / (max - min)) * 100;

    return (
        <div className="slider-container">
            <input
                {...props}
                type="range"
                className="slider"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={handleChange}
                style={{
                    ...props.style,
                    '--gradient': `linear-gradient(to right, var(--color-primary) 0%, var(--color-accent) ${percent}%, var(--color-border) ${percent}%, var(--color-border) 100%)`,
                }}
            />
            {showLabel && <div className="slider-value">{`${value}${unit}`}</div>}
        </div>
    );
};

export default CustomSlider;
