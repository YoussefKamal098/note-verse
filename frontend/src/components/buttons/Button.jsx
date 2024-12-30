import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

const BUTTON_TYPES = {
    primary: {main: "var(--color-accent)", hover: "var(--color-accent-hover)" }, // Green
    danger: {main: "var(--color-danger)", hover: "var(--color-danger-hover)" }, // Red
    secondary: {main: "var(--color-primary)", hover: "var(--color-primary-hover)" } // Blue
};

const ButtonStyled = styled.button`
  background-color: ${(props) => BUTTON_TYPES[props.type].main || BUTTON_TYPES.primary.main};
  opacity: ${(props) => props.disabled ? 0.5 : 1};
    color: white;
    padding: 0.4em 0.6em;
    border-radius: calc(var(--border-radius) / 1.5);
    font-size: 1em;
    font-weight: 500;  
    cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--box-shadow-hoverable);
    gap: 0.5em;
    transition: 0.3s ease;

  &:hover {
      background-color: ${(props) => BUTTON_TYPES[props.type].hover || BUTTON_TYPES.primary.hover};
      box-shadow: var(--box-shadow-hover);
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
                    type = "primary",
                    disabled=false,
                    onClick = () => {},
                    icon: Icon=null,
                    children= "Click Me"
}) => {
    return (
        <ButtonStyled type={type} disabled={disabled} onClick={onClick}>
            {Icon && <Icon />}
            {children}
        </ButtonStyled>
    );
};

Button.propTypes = {
    type: PropTypes.oneOf(["primary", "danger", "secondary"]),
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
    children: PropTypes.node,
    icon: PropTypes.elementType,
};

export { ButtonsContainerStyled };
export default Button;
