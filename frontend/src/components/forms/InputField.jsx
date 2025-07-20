import React, {useState} from "react";
import {MdVisibility, MdVisibilityOff} from "react-icons/md";
import {HeightTransitionContainer} from "../animations/ContainerAnimation";
import {InputContainerStyled, SensitiveInputStyled} from "./Styles";

const InputField = ({
                        field,
                        form,
                        Icon,
                        innerRef,
                        autoFocus = false,
                        type = "",
                        placeholder = "",
                        label = "",
                        isSensitive = false,
                        hoverColor = "var(--color-accent)"
                    }) => {
    const [isShow, setIsShow] = useState(!isSensitive);
    const {name} = field;
    const error = form.touched[name] && form.errors[name];

    const toggleDataVisibility = () => setIsShow(!isShow);

    return (
        <InputContainerStyled has_error={error} hover_color={hoverColor}>
            <label htmlFor={name}>{label}</label>
            <div className="input">
                {Icon && <div className="input__icon"><Icon/></div>}
                <SensitiveInputStyled hover_color={hoverColor}>
                    <input autoFocus={autoFocus} ref={innerRef} spellCheck={false} {...field}
                           type={!isShow ? "password" : type === "password" ? "text" : type} placeholder={placeholder}
                           id={name}/>
                    {isSensitive &&
                        <span className="eye" onClick={toggleDataVisibility}>{!isShow ? (<MdVisibilityOff/>) : (
                            <MdVisibility/>)}</span>}
                </SensitiveInputStyled>
            </div>

            <HeightTransitionContainer overflowHidden keyProp={error}>
                {error && <div className="error">{error}</div>}
            </HeightTransitionContainer>
        </InputContainerStyled>
    );
}

export default InputField;
