import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

const BUTTON_TYPE = Object.freeze({
    SUCCESS: "success",
    INFO: "info",
    DANGER: "danger"
});

const BUTTON_PROPS = Object.freeze({
    [BUTTON_TYPE.SUCCESS]: {
        color: "var(--color-accent)"
    },
    [BUTTON_TYPE.INFO]: {
        color: "var(--color-primary)"
    },
    [BUTTON_TYPE.DANGER]: {
        color: "var(--color-danger)"
    }
});

const ButtonStyled = styled.button`
    opacity: ${(props) => props.disabled ? 0.5 : 1};
    color: ${(props) => BUTTON_PROPS[props.type].color};
    padding: 0.4em 0.5em;
    border-radius: calc(var(--border-radius) / 1.5);
    font-size: 1em;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
    border: var(--border-width) solid var(--color-border-secondary);
    box-shadow: var(--box-shadow);
    transition: 0.3s ease;
    gap: 0.2em;

    &:hover {
        background-color: ${(props) => BUTTON_PROPS[props.type].color};
        border-color: ${(props) => BUTTON_PROPS[props.type].color};
        box-shadow: var(--box-shadow-hover);
        color: var(--color-background);
    }

    &:active {
        scale: 0.85
    }
`;

const ButtonsContainerStyled = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5em;
`;

const Button = ({
                    type = BUTTON_TYPE.SUCCESS,
                    disabled = false,
                    onClick = () => ({}),
                    icon: Icon = null,
                    children = "Click Me"
                }) => {
    return (
        <ButtonStyled type={type} disabled={disabled} onClick={onClick}>
            {Icon && <Icon/>}
            {children}
        </ButtonStyled>
    );
};

Button.propTypes = {
    type: PropTypes.oneOf(Object.values(BUTTON_TYPE)),
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
    children: PropTypes.node,
    icon: PropTypes.elementType,
};

export {BUTTON_TYPE, ButtonsContainerStyled};
export default Button;
