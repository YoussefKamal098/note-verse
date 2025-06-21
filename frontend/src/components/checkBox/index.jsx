import React, {useCallback, useEffect, useState} from "react";
import PropTypes from "prop-types";
import {Check} from "react-feather";

import {CheckboxBoxStyles, CheckboxContainerStyles, CheckmarkStyles, HiddenInputStyles, LabelStyles} from "./styles";

const Checkbox = ({label, checked = false, onChange, color = 'var(--color-accent)', disabled = false}) => {
    const [isChecked, setIsChecked] = useState(checked);

    useEffect(() => {
        onChange?.(isChecked);
    }, [isChecked]);

    const handleCheck = useCallback((e) => {
        e.preventDefault();
        if (!disabled) {
            setIsChecked((prev) => !prev);
        }
    }, []);

    return (
        <CheckboxContainerStyles disabled={disabled}>
            <HiddenInputStyles
                type="checkbox"
                checked={isChecked}
                onChange={(e) => e.preventDefault()}
                aria-checked={isChecked}
                disabled={disabled}
            />
            <CheckboxBoxStyles onClick={handleCheck} $checked={isChecked} $color={color}
                               $disabled={disabled}>
                <CheckmarkStyles $checked={isChecked} $color={color}>
                    <Check size={14}/>
                </CheckmarkStyles>
            </CheckboxBoxStyles>
            {label && <LabelStyles onClick={handleCheck} $disabled={disabled}>{label}</LabelStyles>}
        </CheckboxContainerStyles>
    );
};

Checkbox.propTypes = {
    label: PropTypes.string,
    checked: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    color: PropTypes.string,
    disabled: PropTypes.bool
};

export default React.memo(Checkbox);
