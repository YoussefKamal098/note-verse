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
                                   ...props
                               }) => {
    const [focused, setFocused] = useState(false);
    const [error, setError] = useState(null);
    const charCount = value?.length || 0;

    useEffect(() => {
        setFocused(!!value);
    }, []);

    const handleChange = (e) => {
        const newValue = e.target.value;

        // Validate length
        if (newValue.length > maxLength) {
            setError(`Maximum ${maxLength} characters allowed`);
        } else if (newValue.length < minLength) {
            setError(`Minimum ${minLength} characters required`);
        } else {
            setError(null);
        }

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
