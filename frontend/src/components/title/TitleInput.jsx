import React, {useCallback, useEffect, useRef, useState} from "react";
import styled from "styled-components";
import useDebounce from "../../hooks/useDebounce";
import {useToastNotification} from "../../contexts/ToastNotificationsContext";
import noteValidationSchema from "../../validations/noteValidtion";

const InputWrapperStyled = styled.div`
    position: relative;
    width: 90%;
    margin: 0 auto;

    &::before {
        content: '';
        position: absolute;
        left: 0;
        bottom: -5px;
        width: 100%;
        height: calc(var(--border-width) / 1.5);
        background-color: var(--color-accent);
        opacity: 0;
        transform: scaleX(0);
        transition: opacity 1s ease, transform 0.5s;
    }

    &:focus-within::before {
        transition: opacity 0.5s, transform 0.3s ease;
        opacity: 1;
        transform: scaleX(1);
    }
`;

const TitleInputStyled = styled.textarea`
    width: 100%;
    padding: 0.3em;
    height: fit-content;
    resize: none;
    overflow: hidden;
    position: relative;
    font-size: 1.75em;
    font-weight: 600;
    color: var(--color-text);
    text-align: center;
    background: transparent;
    caret-color: var(--color-accent);

    &::placeholder {
        color: var(--color-placeholder);
    }

`;

const TitleInput = ({title, setTitle, disabled = false}) => {
    const {notify} = useToastNotification();
    const [value, setValue] = useState(title);
    const textAreaRef = useRef(null);
    const isValueFromInside = useRef(false);

    useEffect(() => {
        if (isValueFromInside.current) {
            isValueFromInside.current = false;
            return;
        }

        setValue(title);
    }, [title]);

    useEffect(() => {
        resizeTextArea();

        window.addEventListener("resize", resizeTextArea);
        return () => {
            window.removeEventListener("resize", resizeTextArea);
        };
    }, [title, value]);

    const resizeTextArea = () => {
        textAreaRef.current.style.height = 'auto';
        textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    };

    const handleTitleUpdate = useCallback((newValue) => {
        isValueFromInside.current = true;
        setTitle(newValue);
    }, [setTitle]);

    const debouncedTitleUpdate = useDebounce(handleTitleUpdate, 300);

    const onTitleChange = (e) => {
        const value = e.target.value;

        try {
            if (value.trim()) noteValidationSchema.title.validateSync(value);
        } catch (error) {
            notify.warn(error.message);
            return;
        }

        setValue(value);
    };

    const onKeyUpUp = () => {
        debouncedTitleUpdate(value);
    }

    return (
        <InputWrapperStyled>
            <TitleInputStyled
                spellCheck={false}
                rows={1}
                ref={textAreaRef}
                value={value}
                onChange={onTitleChange}
                onKeyUp={onKeyUpUp}
                placeholder="📝 Title your note!"
                disabled={disabled}
            />
        </InputWrapperStyled>
    );
}

export default React.memo(TitleInput);
