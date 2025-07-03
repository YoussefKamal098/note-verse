import React, {useEffect, useState} from "react";
import {HeightTransitionContainer} from "../animations/ContainerAnimation";
import {FadeInAnimatedText} from "../animations/TextAnimation";
import {
    CharacterCounterStyles,
    ErrorMessageStyles,
    FloatingLabelStyles,
    FooterStyles,
    LabelContainerStyles,
    TextAreaStyles
} from "./styles";


const FloatingLabelTextArea = ({
                                   label,
                                   minLength = 0,
                                   maxLength = 500,
                                   value = "",
                                   onChange,
                                   onError,
                                   ...props
                               }) => {
    const [focused, setFocused] = useState(false);
    const [error, setError] = useState(null);
    const charCount = value?.length || 0;

    const setErrorMessage = (value) => {
        if (value.length > maxLength) {
            setError(`Maximum ${maxLength} characters allowed`);
        } else if (value.length < minLength) {
            setError(`Minimum ${minLength} characters required`);
        } else {
            setError(null);
        }
    }

    useEffect(() => {
        setFocused(!!value);
        setErrorMessage(value);
    }, []);

    useEffect(() => {
        if (onError) {
            onError(error);
        }
    }, [error, onError]);


    const handleChange = (e) => {
        const newValue = e.target.value;

        // Validate length
        setErrorMessage(newValue);

        // Propagate change if valid or under max
        if (newValue.length <= maxLength) {
            onChange?.(e);
        }
    };

    return (
        <LabelContainerStyles>
            <TextAreaStyles
                {...props}
                value={value}
                onChange={handleChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(!!value)}
                $resize="none"
                $hasError={!!error}
                aria-invalid={!!error}
                maxLength={maxLength + 10}
            />

            <FloatingLabelStyles $focused={focused}>
                {label}
            </FloatingLabelStyles>


            <FooterStyles>
                <HeightTransitionContainer keyProp={error}>
                    {error && (
                        <ErrorMessageStyles>
                            <FadeInAnimatedText text={error}/>
                        </ErrorMessageStyles>
                    )}
                </HeightTransitionContainer>

                <CharacterCounterStyles $isExceeded={charCount > maxLength}>
                    {charCount}/{maxLength}
                </CharacterCounterStyles>
            </FooterStyles>


        </LabelContainerStyles>
    );
};

export default React.memo(FloatingLabelTextArea);
